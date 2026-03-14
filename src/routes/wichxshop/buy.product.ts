import { Hono } from "hono";
import axios from "axios";
import { connectDB } from "../../lib/mongodb.js";
import { auth, type AuthContext } from "../../middleware/auth.middleware.js";
import { User } from "../../models/User.js";
import {
  OrderHistory,
  type IOrderHistory,
} from "../../models/OrderHistory.js";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

type WichxshopBuyResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    key?: string;
    productId?: string;
    productName?: string;
    productPrice?: number;
  };
};

const getProductUnitPrice = async (productId: string) => {
  const res = await axios.get(`${URL_API}/store/product/${productId}`, {
    headers: {
      "x-api-key": WICKXSHOP_API_KEY,
    },
    timeout: 30000,
  });

  const data = res.data;
  const product = data?.data ?? data;
  const price =
    product?.productPrice ??
    product?.price ??
    product?.data?.productPrice ??
    product?.data?.price;

  const name =
    product?.productName ??
    product?.name ??
    product?.data?.productName ??
    product?.data?.name;

  return {
    price: typeof price === "number" ? price : Number(price),
    name: typeof name === "string" ? name : undefined,
  };
};

router.post("/buy", auth, async (c: AuthContext) => {
  await connectDB();

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

  const body = await c.req.json().catch(() => ({} as any));
  const productId = body?.productId;
  const quantity = Number(body?.quantity ?? 1);

  if (!productId || typeof productId !== "string") {
    return c.json(
      {
        success: false,
        message: "productId is required",
      },
      400,
    );
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return c.json(
      {
        success: false,
        message: "quantity must be a positive number",
      },
      400,
    );
  }

  let unitPrice = 0;
  let productName: string | undefined;

  try {
    const productInfo = await getProductUnitPrice(productId);
    unitPrice = productInfo.price;
    productName = productInfo.name;
  } catch (error: any) {
    const message = error?.response?.data?.message || "ไม่สามารถดึงข้อมูลสินค้าได้";
    return c.json(
      {
        success: false,
        message,
      },
      error?.response?.status || 500,
    );
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return c.json(
      {
        success: false,
        message: "ไม่สามารถคำนวณราคาสินค้าได้",
      },
      500,
    );
  }

  const totalPrice = unitPrice * quantity;
  const pointsToDeduct = Math.ceil(totalPrice);

  const userBefore = await User.findById(userId).select("points");
  if (!userBefore) {
    return c.json(
      {
        success: false,
        message: "ไม่พบผู้ใช้งาน",
      },
      404,
    );
  }

  const pointsBefore = userBefore.points;

  const orderHistory = new OrderHistory({
    userId: userBefore._id,
    provider: "wichxshop",
    productId,
    productName,
    productPrice: unitPrice,
    quantity,
    totalPrice,
    pointsBefore,
    pointsDeducted: pointsToDeduct,
    status: "pending",
    requestPayload: {
      productId,
      quantity,
    },
  });

  await orderHistory.save();

  const userAfterDeduct = await User.findOneAndUpdate(
    { _id: userId, points: { $gte: pointsToDeduct } },
    { $inc: { points: -pointsToDeduct } },
    { new: true },
  ).select("points");

  if (!userAfterDeduct) {
    await OrderHistory.findByIdAndUpdate(orderHistory._id, {
      status: "failed",
      errorCode: "INSUFFICIENT_POINTS",
      errorMessage: "พ้อยไม่เพียงพอ",
      pointsAfter: pointsBefore,
    });

    return c.json(
      {
        success: false,
        message: "พ้อยไม่เพียงพอ",
      },
      400,
    );
  }

  let buyResponse: WichxshopBuyResponse | undefined;

  try {
    const res = await axios.post<WichxshopBuyResponse>(
      `${URL_API}/store/buy`,
      {
        productId,
        quantity,
      },
      {
        headers: {
          "x-api-key": WICKXSHOP_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );

    buyResponse = res.data;

    if (!buyResponse?.success) {
      throw new Error(buyResponse?.message || "ซื้อสินค้าไม่สำเร็จ");
    }

    const externalOrderId = buyResponse?.data?.id;
    const keys = buyResponse?.data?.key;
    const productPrice = buyResponse?.data?.productPrice;
    const finalUnitPrice =
      typeof productPrice === "number" && productPrice > 0 ? productPrice : unitPrice;
    const finalTotalPrice = finalUnitPrice * quantity;

    await OrderHistory.findByIdAndUpdate(orderHistory._id, {
      status: "success",
      externalOrderId,
      keys,
      productName: buyResponse?.data?.productName ?? productName,
      productPrice: finalUnitPrice,
      totalPrice: finalTotalPrice,
      pointsAfter: userAfterDeduct.points,
      responsePayload: buyResponse,
    });

    return c.json({
      success: true,
      message: buyResponse?.message || "ซื้อสินค้าสำเร็จ",
      data: buyResponse?.data,
      meta: {
        points_before: pointsBefore,
        points_deducted: pointsToDeduct,
        points_after: userAfterDeduct.points,
        order_history_id: orderHistory._id,
      },
    });
  } catch (error: any) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.message;
    const message = apiMessage || error?.message || "เกิดข้อผิดพลาดในการซื้อสินค้า";

    const refundedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: pointsToDeduct } },
      { new: true },
    ).select("points");

    await OrderHistory.findByIdAndUpdate(orderHistory._id, {
      status: "failed",
      errorCode: status ? String(status) : "BUY_FAILED",
      errorMessage: message,
      pointsAfter: refundedUser?.points ?? pointsBefore,
      responsePayload: error?.response?.data ?? buyResponse,
    });

    return c.json(
      {
        success: false,
        message,
      },
      status || 500,
    );
  }
});

router.get("/history", auth, async (c: AuthContext) => {
  try {
    await connectDB();

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

    const history = await OrderHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return c.json({
      success: true,
      message: "ดึงประวัติการสั่งซื้อสำเร็จ",
      data: {
        total_transactions: history.length,
        history: history.map((record: IOrderHistory) => ({
          id: record._id,
          provider: record.provider,
          status: record.status,
          externalOrderId: record.externalOrderId,
          productId: record.productId,
          productName: record.productName,
          productPrice: record.productPrice,
          quantity: record.quantity,
          totalPrice: record.totalPrice,
          keys: record.keys,
          pointsBefore: record.pointsBefore,
          pointsDeducted: record.pointsDeducted,
          pointsAfter: record.pointsAfter,
          errorCode: record.errorCode,
          errorMessage: record.errorMessage,
          createdAt: record.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get order history error:", error);
    return c.json(
      {
        success: false,
        message: "ดึงประวัติการสั่งซื้อล้มเหลว",
      },
      500,
    );
  }
});

export default router;