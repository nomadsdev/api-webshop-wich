import { Hono } from "hono";
import axios from "axios";
import { User } from "../../models/User.js";
import { TopupHistory } from "../../models/TopupHistory.js";
import { auth, type AuthContext } from "../../middleware/auth.middleware.js";
import "dotenv/config";

const PHONE_NUMBER_RECEIVE = process.env.PHONE_NUMBER_RECEIVE;
const URL_API_VERIFY_TRUEMONEY =
  "https://truemoneyapi.vercel.app/api/truewallet";

const router = new Hono();

router.post("/verify-gift", auth, async (c: AuthContext) => {
  try {
    const { gift_link } = await c.req.json();

    if (!gift_link) {
      return c.json(
        {
          status: "error",
          message: "กรุณาระบุลิงก์ซองของขวัญ",
          error_code: 400001,
        },
        400,
      );
    }

    
    if (!gift_link.includes("gift.truemoney.com")) {
      return c.json(
        {
          status: "error",
          message: "ลิงก์ซองของขวัญไม่ถูกต้อง",
          error_code: 400002,
        },
        400,
      );
    }

    if (!PHONE_NUMBER_RECEIVE) {
      console.error("Missing environment variable: PHONE_NUMBER_RECEIVE");
      return c.json(
        {
          status: "error",
          message: "การตั้งค่าระบบไม่ถูกต้อง",
          error_code: 500001,
        },
        500,
      );
    }

    
    const verifyResponse = await axios.post(
      URL_API_VERIFY_TRUEMONEY,
      {
        phone: PHONE_NUMBER_RECEIVE,
        gift_link: gift_link,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const giftData = verifyResponse.data;

    if (giftData.status !== "success") {
      return c.json(
        {
          success: false,
          message: giftData.message || "ตรวจสอบซองของขวัญไม่สำเร็จ",
          error_code: giftData.status,
        },
        400,
      );
    }

    const giftAmount = parseFloat(giftData.amount);
    const pointsToAdd = Math.floor(giftAmount);

    
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
      transactionId: `TM_${Date.now()}`, 
      amount: giftAmount,
      sender: giftData.owner_profile || "Unknown",
      receiver: giftData.redeemer_profile || PHONE_NUMBER_RECEIVE,
      transactionDate: new Date(giftData.time),
      pointsAdded: pointsToAdd,
      status: "success",
      type: "truemoney_gift", 
    });

    try {
      await topupHistory.save();
    } catch (historyError: any) {
      if (historyError.code === 11000) {
        return c.json(
          {
            success: false,
            message: "ซองของขวัญนี้ถูกใช้งานแล้ว",
            error_code: "DUPLICATE_TRANSACTION",
          },
          400,
        );
      }
      throw historyError;
    }

    
    user.points += pointsToAdd;
    await user.save();

    return c.json({
      status: "success",
      message: `รับซองของขวัญสำเร็จ! เติมเงิน ${giftAmount} บาท`,
      data: {
        amount: giftAmount,
        points_added: pointsToAdd,
        owner_profile: giftData.owner_profile,
        redeemer_profile: giftData.redeemer_profile,
        transaction_time: giftData.time,
        current_points: user.points,
      },
    });
  } catch (error: any) {
    console.error("TrueMoney gift verification error:", error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400 && errorData.status === "error") {
        
        let errorMessage = errorData.message;

        switch (errorData.status) {
          case "VOUCHER_OUT_OF_STOCK":
            errorMessage = "ซองของขวัญนี้ถูกรับไปหมดแล้ว";
            break;
          case "VOUCHER_EXPIRED":
            errorMessage = "ซองของขวัญหมดอายุ (เกิน 72 ชั่วโมง)";
            break;
          case "VOUCHER_NOT_FOUND":
            errorMessage = "ไม่พบซองของขวัญ หรือลิงก์ผิด";
            break;
          case "TARGET_USER_NOT_FOUND":
            errorMessage = "เบอร์โทรศัพท์ผู้รับไม่ถูกต้อง";
            break;
        }

        return c.json(
          {
            success: false,
            message: errorMessage,
            error_code: errorData.status,
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
    }

    if (error.code === "ECONNABORTED") {
      return c.json(
        {
          success: false,
          message: "การตรวจสอบซองของขวัญใช้เวลานานเกินไป กรุณาลองใหม่",
        },
        408,
      );
    }

    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบซองของขวัญ",
      },
      500,
    );
  }
});

export default router;
