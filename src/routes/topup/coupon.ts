import { Hono } from "hono";
import { Coupon } from "../../models/Coupon.js";
import { TopupHistory } from "../../models/TopupHistory.js";
import { User } from "../../models/User.js";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";

const router = new Hono();

router.post("/redeem", auth, async (c) => {
  try {
    const { code } = await c.req.json();
    const userId = (c as AuthContext).user?.id;

    if (!code) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุโค้ดคูปอง",
        },
        400,
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      status: "active",
    });

    if (!coupon) {
      return c.json(
        {
          status: "error",
          message: "คูปองไม่ถูกต้องหรือหมดอายุ",
        },
        400,
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      await Coupon.findByIdAndUpdate(coupon._id, { status: "expired" });
      return c.json(
        {
          status: "error",
          message: "คูปองหมดอายุ",
        },
        400,
      );
    }

    if (coupon.usageType === "single" && coupon.usedBy.length > 0) {
      return c.json(
        {
          status: "error",
          message: "คูปองนี้ถูกใช้งานแล้ว",
        },
        400,
      );
    }

    if (
      coupon.usageType === "multi" &&
      coupon.currentUsage >= (coupon.maxUsage || 0)
    ) {
      await Coupon.findByIdAndUpdate(coupon._id, { status: "expired" });
      return c.json(
        {
          status: "error",
          message: "คูปองนี้ถูกใช้ครบแล้ว",
        },
        400,
      );
    }

    if (coupon.usedBy.includes(userId as any)) {
      return c.json(
        {
          status: "error",
          message: "คุณได้ใช้คูปองนี้ไปแล้ว",
        },
        400,
      );
    }

    const transactionId = `COUPON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const topupHistory = new TopupHistory({
      userId,
      transactionId,
      amount: coupon.amount,
      sender: "COUPON",
      receiver: userId as string,
      transactionDate: new Date(),
      pointsAdded: coupon.amount,
      status: "success",
      type: "coupon",
    });

    await topupHistory.save();

    await Coupon.findByIdAndUpdate(coupon._id, {
      $push: { usedBy: userId as any },
      $inc: { currentUsage: 1 },
      ...(coupon.usageType === "single" && { status: "used" }),
      ...(coupon.usageType === "multi" &&
        coupon.currentUsage + 1 >= (coupon.maxUsage || 0) && {
          status: "expired",
        }),
    });

    const user = await User.findById(userId);
    if (user) {
      user.points += coupon.amount;
      await user.save();
    }

    return c.json({
      status: "success",
      message: `ใช้คูปองสำเร็จ! เติมเงิน ${coupon.amount} บาท`,
      data: {
        amount: coupon.amount,
        transactionId,
      },
    });
  } catch (error: any) {
    console.error("Coupon redemption error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการใช้คูปอง",
      },
      500,
    );
  }
});

router.get("/admin/coupons", auth, authAdmin, async (c) => {
  try {
    const coupons = await Coupon.find()
      .populate("usedBy", "username email")
      .sort({ createdAt: -1 });

    return c.json({
      status: "success",
      data: coupons,
    });
  } catch (error: any) {
    console.error("Get coupons error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลคูปอง",
      },
      500,
    );
  }
});

router.post("/admin/coupons", auth, authAdmin, async (c) => {
  try {
    const { code, amount, usageType, maxUsage, expiresAt } = await c.req.json();

    if (!code || !amount) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุโค้ดและจำนวนเงิน",
        },
        400,
      );
    }

    if (usageType === "multi" && !maxUsage) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุจำนวนครั้งที่ใช้ได้สูงสุด",
        },
        400,
      );
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return c.json(
        {
          status: "error",
          message: "โค้ดคูปองนี้มีอยู่แล้ว",
        },
        400,
      );
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      amount,
      usageType,
      maxUsage: usageType === "multi" ? maxUsage : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await coupon.save();

    return c.json({
      status: "success",
      message: "สร้างคูปองสำเร็จ",
      data: coupon,
    });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการสร้างคูปอง",
      },
      500,
    );
  }
});

router.put("/admin/coupons/:id", auth, authAdmin, async (c) => {
  try {
    const couponId = c.req.param("id");
    const { status } = await c.req.json();

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { status },
      { new: true },
    );

    if (!coupon) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบคูปอง",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "อัปเดตสถานะคูปองสำเร็จ",
      data: coupon,
    });
  } catch (error: any) {
    console.error("Update coupon error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการอัปเดตคูปอง",
      },
      500,
    );
  }
});

router.delete("/admin/coupons/:id", auth, authAdmin, async (c) => {
  try {
    const couponId = c.req.param("id");

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบคูปอง",
        },
        404,
      );
    }

    
    if (coupon.status === "active" && coupon.usedBy.length > 0) {
      return c.json(
        {
          status: "error",
          message: "ไม่สามารถลบคูปองที่ถูกใช้แล้วได้",
        },
        400,
      );
    }

    await Coupon.findByIdAndDelete(couponId);

    return c.json({
      status: "success",
      message: "ลบคูปองสำเร็จ",
      data: coupon,
    });
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการลบคูปอง",
      },
      500,
    );
  }
});

router.put("/admin/coupons/:id/edit", auth, authAdmin, async (c) => {
  try {
    const couponId = c.req.param("id");
    const { code, amount, usageType, maxUsage, expiresAt, status } =
      await c.req.json();

    if (!code || !amount) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุโค้ดและจำนวนเงิน",
        },
        400,
      );
    }

    if (usageType === "multi" && !maxUsage) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุจำนวนครั้งที่ใช้ได้สูงสุด",
        },
        400,
      );
    }

    
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
      _id: { $ne: couponId },
    });
    if (existingCoupon) {
      return c.json(
        {
          status: "error",
          message: "โค้ดคูปองนี้มีอยู่แล้ว",
        },
        400,
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        code: code.toUpperCase(),
        amount,
        usageType,
        maxUsage: usageType === "multi" ? maxUsage : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status: status || "active",
      },
      { new: true },
    ).populate("usedBy", "username email");

    if (!coupon) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบคูปอง",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "อัปเดตคูปองสำเร็จ",
      data: coupon,
    });
  } catch (error: any) {
    console.error("Edit coupon error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการอัปเดตคูปอง",
      },
      500,
    );
  }
});

export default router;
