import { Hono } from "hono";
import axios from "axios";
import { connectDB } from "../../lib/mongodb.js";
import { User } from "../../models/User.js";
import { TopupHistory, type ITopupHistory } from "../../models/TopupHistory.js";
import { auth, type AuthContext } from "../../middleware/auth.middleware.js";
import "dotenv/config";

const API_KEY_GAFIWSHOP = process.env.API_KEY_GAFIWSHOP;
const PHONE_NUMBER_RECEIVE = process.env.PHONE_NUMBER_RECEIVE;
const URL_API_VERIFY_SLIP = "https://gafiwshop.xyz/api/check_slip";

const router = new Hono();

router.post("/verify-slip", auth, async (c: AuthContext) => {
  try {
    await connectDB();

    const { qrcode } = await c.req.json();

    if (!qrcode) {
      return c.json(
        {
          status: "error",
          msg: "QR Code ไม่ถูกต้อง",
          error_code: 400001,
        },
        400,
      );
    }

    if (!API_KEY_GAFIWSHOP || !PHONE_NUMBER_RECEIVE) {
      console.error(
        "Missing environment variables: API_KEY_GAFIWSHOP or PHONE_NUMBER_RECEIVE",
      );
      return c.json(
        {
          status: "error",
          msg: "การตั้งค่าระบบไม่ถูกต้อง",
          error_code: 500001,
        },
        500,
      );
    }

    const verifyResponse = await axios.post(
      URL_API_VERIFY_SLIP,
      {
        keyapi: API_KEY_GAFIWSHOP,
        qrcode: qrcode,
        accountType: "02001",
        accountNumber: PHONE_NUMBER_RECEIVE,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const slipData = verifyResponse.data;

    if (slipData.status !== "success") {
      return c.json(
        {
          success: false,
          message: slipData.msg || "ตรวจสอบสลิปไม่สำเร็จ",
          error_code: slipData.error_code,
        },
        400,
      );
    }

    const slipAmount = parseFloat(slipData.slip_data.amount);

    const pointsToAdd = Math.floor(slipAmount);

    const user = await User.findById(c.user?.id);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    const topupHistory = new TopupHistory({
      userId: user._id,
      transactionId: slipData.slip_data.transactionId,
      amount: slipAmount,
      sender: slipData.slip_data.sender,
      receiver: slipData.slip_data.receiver,
      transactionDate: new Date(slipData.slip_data.date),
      pointsAdded: pointsToAdd,
      status: "success",
      type: "bank_slip",
    });

    try {
      await topupHistory.save();
    } catch (historyError: any) {
      if (historyError.code === 11000) {
        return c.json(
          {
            success: false,
            message: "สลิปนี้ถูกใช้งานแล้ว",
            error_code: "200501",
          },
          400,
        );
      }
      throw historyError;
    }

    user.points += pointsToAdd;
    await user.save();

    const slipRemaining = 999;

    return c.json({
      status: "success",
      msg: `ตรวจสอบสลิปสำเร็จ (เหลือสลิป: ${slipRemaining})`,
      slip_remaining: slipRemaining,
      slip_data: {
        transactionId: slipData.slip_data.transactionId,
        amount: slipData.slip_data.amount,
        sender: slipData.slip_data.sender,
        receiver: slipData.slip_data.receiver,
        date: slipData.slip_data.date,
      },
    });
  } catch (error: any) {
    console.error("Slip verification error:", error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400 && errorData.error_code) {
        return c.json(
          {
            success: false,
            message: errorData.msg || "ตรวจสอบสลิปไม่สำเร็จ",
            error_code: errorData.error_code,
          },
          400,
        );
      }

      if (status === 401) {
        return c.json(
          {
            success: false,
            message: "API Key ไม่ถูกต้องหรือหมดอายุ",
          },
          401,
        );
      }

      if (status === 200 && errorData.error_code) {
        if (errorData.error_code === "200404") {
          return c.json(
            {
              success: false,
              message: "ไม่พบข้อมูลสลิปในระบบธนาคาร",
            },
            400,
          );
        }

        if (errorData.error_code === "200500") {
          return c.json(
            {
              success: false,
              message: "สลิปเสีย/สลิปปลอม",
            },
            400,
          );
        }

        if (errorData.error_code === "200501") {
          return c.json(
            {
              success: false,
              message: "สลิปนี้ถูกใช้งานแล้ว",
            },
            400,
          );
        }
      }
    }

    if (error.code === "ECONNABORTED") {
      return c.json(
        {
          success: false,
          message: "การตรวจสอบสลิปใช้เวลานานเกินไป กรุณาลองใหม่",
        },
        408,
      );
    }

    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
      },
      500,
    );
  }
});

router.get("/history", auth, async (c: AuthContext) => {
  try {
    await connectDB();

    const user = await User.findById(c.user?.id);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    const topupHistory = await TopupHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return c.json({
      success: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: {
        current_points: user.points,
        total_transactions: topupHistory.length,
        history: topupHistory.map((record: ITopupHistory) => ({
          transactionId: record.transactionId,
          amount: record.amount,
          sender: record.sender,
          receiver: record.receiver,
          transactionDate: record.transactionDate,
          pointsAdded: record.pointsAdded,
          status: record.status,
          createdAt: record.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    return c.json(
      {
        success: false,
        message: "ดึงข้อมูลประวัติการเติมเงินล้มเหลว",
      },
      500,
    );
  }
});

router.get("/admin/history", async (c) => {
  try {
    await connectDB();
    
    const topupHistory = await TopupHistory.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'username email');
    
    return c.json({
      success: true,
      message: "ดึงประวัติการเติมเงินทั้งหมดสำเร็จ",
      data: {
        total_transactions: topupHistory.length,
        history: topupHistory.map((record: ITopupHistory) => ({
          transactionId: record.transactionId,
          amount: record.amount,
          sender: record.sender,
          receiver: record.receiver,
          transactionDate: record.transactionDate,
          pointsAdded: record.pointsAdded,
          status: record.status,
          type: record.type,
          createdAt: record.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get all history error:", error);
    return c.json(
      {
        success: false,
        message: "ดึงข้อมูลประวัติการเติมเงินทั้งหมดล้มเหลว",
      },
      500,
    );
  }
});

export default router;
