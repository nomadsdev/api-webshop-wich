import { Hono } from "hono";
import axios from "axios";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";
import { OrderHistory, type IOrderHistory } from "../../models/OrderHistory.js";
import { ClaimHistory, type IClaimHistory } from "../../models/ClaimHistory.js";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

type WichxshopClaimResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    claimStatus?: string;
    claimReason?: string;
    [key: string]: any;
  };
};


router.post("/claim", auth, async (c: AuthContext) => {
  const userId = c.user?.id;
  if (!userId) {
    return c.json(
      {
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      },
      401,
    );
  }

  if (!WICKXSHOP_API_KEY) {
    return c.json(
      {
        success: false,
        message: "การตั้งค่าระบบไม่ถูกต้อง",
      },
      500,
    );
  }

  const body = await c.req.json().catch(() => ({}) as any);
  const orderId = body?.orderId;
  const reason = body?.reason;

  
  if (!orderId || typeof orderId !== "string") {
    return c.json(
      {
        success: false,
        message: "orderId is required",
      },
      400,
    );
  }

  if (!reason || typeof reason !== "string") {
    return c.json(
      {
        success: false,
        message: "reason is required",
      },
      400,
    );
  }

  if (reason.length > 300) {
    return c.json(
      {
        success: false,
        message: "reason must not exceed 300 characters",
      },
      400,
    );
  }

  try {
    
    const order = await OrderHistory.findOne({
      _id: orderId,
      userId,
      provider: "wichxshop",
      status: "success",
    });

    if (!order) {
      return c.json(
        {
          success: false,
          message: "ไม่พบออร์เดอร์ที่ต้องการเคลม",
        },
        404,
      );
    }

    
    const existingClaim = await ClaimHistory.findOne({
      orderId: order._id,
      userId,
    });

    if (existingClaim) {
      return c.json(
        {
          success: false,
          message: "ออร์เดอร์นี้มีคำขอเคลมอยู่แล้ว",
        },
        400,
      );
    }

    
    if (!order.externalOrderId) {
      return c.json(
        {
          success: false,
          message: "ไม่พบรหัสออร์เดอร์ภายนอก",
        },
        400,
      );
    }

    
    const claimRecord = new ClaimHistory({
      userId,
      orderId: order._id,
      externalOrderId: order.externalOrderId,
      provider: "wichxshop",
      claimReason: reason,
      claimStatus: "PENDING",
      requestPayload: {
        orderId,
        reason,
      },
    });

    await claimRecord.save();

    
    let apiResponse: WichxshopClaimResponse | undefined;

    try {
      const res = await axios.post<WichxshopClaimResponse>(
        `${URL_API}/store/claim/${order.externalOrderId}`,
        {
          reason,
        },
        {
          headers: {
            "x-api-key": WICKXSHOP_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      apiResponse = res.data;

      
      await ClaimHistory.findByIdAndUpdate(claimRecord._id, {
        responsePayload: apiResponse,
        claimStatus: apiResponse?.data?.claimStatus || "PENDING",
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;
      const message =
        apiMessage || error?.message || "เกิดข้อผิดพลาดในการส่งคำขอเคลม";

      
      await ClaimHistory.findByIdAndUpdate(claimRecord._id, {
        claimStatus: "REJECTED",
        errorMessage: message,
        errorCode: status ? String(status) : "CLAIM_FAILED",
        responsePayload: error?.response?.data,
      });

      return c.json(
        {
          success: false,
          message,
        },
        status || 500,
      );
    }

    return c.json({
      success: true,
      message: apiResponse?.message || "ส่งคำขอเคลมสำเร็จ",
      data: {
        claimId: claimRecord._id,
        orderId: order._id,
        externalOrderId: order.externalOrderId,
        claimStatus: apiResponse?.data?.claimStatus || "PENDING",
        claimReason: reason,
        createdAt: claimRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Claim submission error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งคำขอเคลม",
      },
      500,
    );
  }
});


router.get("/claim/history", auth, async (c: AuthContext) => {
  try {
    const userId = c.user?.id;
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้",
        },
        401,
      );
    }

    const claims = await ClaimHistory.find({ userId })
      .populate("orderId", "productName productPrice totalPrice createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return c.json({
      success: true,
      message: "ดึงประวัติการเคลมสำเร็จ",
      data: {
        total_claims: claims.length,
        claims: claims.map((claim: IClaimHistory & { orderId?: any }) => ({
          id: claim._id,
          orderId: claim.orderId,
          externalOrderId: claim.externalOrderId,
          claimReason: claim.claimReason,
          claimStatus: claim.claimStatus,
          adminResponse: claim.adminResponse,
          resolvedAt: claim.resolvedAt,
          orderInfo: claim.orderId
            ? {
                productName: claim.orderId.productName,
                productPrice: claim.orderId.productPrice,
                totalPrice: claim.orderId.totalPrice,
                orderDate: claim.orderId.createdAt,
              }
            : null,
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get claim history error:", error);
    return c.json(
      {
        success: false,
        message: "ดึงประวัติการเคลมล้มเหลว",
      },
      500,
    );
  }
});


router.get("/claim/admin/history", authAdmin, async (c: AuthContext) => {
  try {
    const claims = await ClaimHistory.find({})
      .populate("userId", "username email")
      .populate("orderId", "productName productPrice totalPrice createdAt")
      .sort({ createdAt: -1 })
      .limit(100);

    return c.json({
      success: true,
      message: "ดึงประวัติการเคลมทั้งหมดสำเร็จ",
      data: {
        total_claims: claims.length,
        claims: claims.map(
          (claim: IClaimHistory & { userId?: any; orderId?: any }) => ({
            id: claim._id,
            userId: claim.userId
              ? {
                  id: claim.userId._id,
                  username: claim.userId.username,
                  email: claim.userId.email,
                }
              : null,
            orderId: claim.orderId,
            externalOrderId: claim.externalOrderId,
            claimReason: claim.claimReason,
            claimStatus: claim.claimStatus,
            adminResponse: claim.adminResponse,
            resolvedAt: claim.resolvedAt,
            orderInfo: claim.orderId
              ? {
                  productName: claim.orderId.productName,
                  productPrice: claim.orderId.productPrice,
                  totalPrice: claim.orderId.totalPrice,
                  orderDate: claim.orderId.createdAt,
                }
              : null,
            createdAt: claim.createdAt,
            updatedAt: claim.updatedAt,
          }),
        ),
      },
    });
  } catch (error) {
    console.error("Get admin claim history error:", error);
    return c.json(
      {
        success: false,
        message: "ดึงประวัติการเคลมทั้งหมดล้มเหลว",
      },
      500,
    );
  }
});


router.put("/claim/admin/:claimId", authAdmin, async (c: AuthContext) => {
  try {
    const claimId = c.req.param("claimId");
    const body = await c.req.json().catch(() => ({}) as any);
    const { claimStatus, adminResponse } = body;

    if (!claimId) {
      return c.json(
        {
          success: false,
          message: "claimId is required",
        },
        400,
      );
    }

    if (
      !claimStatus ||
      !["PENDING", "APPROVED", "REJECTED", "RESOLVED"].includes(claimStatus)
    ) {
      return c.json(
        {
          success: false,
          message: "Invalid claimStatus",
        },
        400,
      );
    }

    const updateData: any = {
      claimStatus,
      updatedAt: new Date(),
    };

    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }

    if (["APPROVED", "REJECTED", "RESOLVED"].includes(claimStatus)) {
      updateData.resolvedAt = new Date();
    }

    const claim = await ClaimHistory.findByIdAndUpdate(claimId, updateData, {
      new: true,
    })
      .populate("userId", "username email")
      .populate("orderId", "productName productPrice totalPrice");

    if (!claim) {
      return c.json(
        {
          success: false,
          message: "ไม่พบคำขอเคลม",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "อัปเดตสถานะคำขอเคลมสำเร็จ",
      data: {
        id: claim._id,
        claimStatus: claim.claimStatus,
        adminResponse: claim.adminResponse,
        resolvedAt: claim.resolvedAt,
        updatedAt: claim.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update claim status error:", error);
    return c.json(
      {
        success: false,
        message: "อัปเดตสถานะคำขอเคลมล้มเหลว",
      },
      500,
    );
  }
});

export default router;
