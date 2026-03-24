import { Hono } from "hono";
import axios from "axios";
import sharp from "sharp";
import { User } from "../../models/User.js";
import { TopupHistory, type ITopupHistory } from "../../models/TopupHistory.js";
import { auth, type AuthContext } from "../../middleware/auth.middleware.js";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = new Hono();

const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY;
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID;
const RECEIVE_PHONE = process.env.RECEIVE_PHONE;
const RECEIVE_ACCOUNT = process.env.RECEIVE_ACCOUNT;
const RECEIVE_NAME_TH = process.env.RECEIVE_NAME_TH;
const RECEIVE_NAME_EN = process.env.RECEIVE_NAME_EN;

router.get("/generate-qr/:amount", async (c) => {
  try {
    const amount = c.req.param("amount");

    if (!amount || parseFloat(amount) <= 0) {
      return c.json(
        {
          success: false,
          message: "จำนวนเงินไม่ถูกต้อง",
        },
        400,
      );
    }

    const phoneNumber = process.env.PHONE_NUMBER_RECEIVE;
    if (!phoneNumber) {
      return c.json(
        {
          success: false,
          message: "การตั้งค่าระบบไม่ถูกต้อง",
        },
        500,
      );
    }

    const qrCodeUrl = `https://promptpay.io/${phoneNumber}/${amount}`;

    try {
      // Fetch QR code image
      const qrResponse = await axios.get(qrCodeUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      // Get watermark path
      const watermarkPath = join(
        dirname(fileURLToPath(import.meta.url)),
        "../../../public/watermark.png",
      );

      const qrInfo = await sharp(qrResponse.data).metadata();

      const qrWidth = qrInfo.width || 300;
      const qrHeight = qrInfo.height || 300;

      const watermarkBuffer = await sharp(watermarkPath)
        .resize(qrWidth, qrHeight, { fit: "fill" }) // 👈 เต็ม 1:1
        .ensureAlpha()
        .toBuffer();

      const qrWithWatermark = await sharp(qrResponse.data)
        .composite([
          {
            input: watermarkBuffer,
            gravity: "center",
            blend: "over",
          },
        ])
        .png()
        .toBuffer();

      // Convert to base64
      const base64Image = qrWithWatermark.toString("base64");
      const dataUrl = `data:image/png;base64,${base64Image}`;

      return c.json({
        success: true,
        message: "สร้าง QR Code สำเร็จ",
        data: {
          qrCodeImage: dataUrl,
          amount: parseFloat(amount),
          phoneNumber: phoneNumber,
        },
      });
    } catch (imageError) {
      console.error("QR image processing error:", imageError);
      // Fallback to URL if image processing fails
      return c.json({
        success: true,
        message: "สร้าง QR Code สำเร็จ",
        data: {
          qrCodeUrl: qrCodeUrl,
          amount: parseFloat(amount),
          phoneNumber: phoneNumber,
        },
      });
    }
  } catch (error) {
    console.error("Generate QR error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้าง QR Code",
      },
      500,
    );
  }
});

const safeTrim = (val: any): string => {
  if (!val) return "";
  return String(val).trim();
};

const normalizeText = (val: string): string => {
  return safeTrim(val).toLowerCase().replace(/\s+/g, "");
};

const isValidSlipData = (data: any): boolean => {
  return (
    data &&
    typeof data.transRef === "string" &&
    typeof data.amount !== "undefined" &&
    data.sender &&
    data.receiver &&
    typeof data.receiver.displayName === "string" &&
    typeof data.receiver.name === "string"
  );
};

const RECEIVE_PHONE_CLEAN = safeTrim(RECEIVE_PHONE!);
const RECEIVE_ACCOUNT_CLEAN = safeTrim(RECEIVE_ACCOUNT!);
const RECEIVE_NAME_TH_CLEAN = normalizeText(RECEIVE_NAME_TH!);
const RECEIVE_NAME_EN_CLEAN = normalizeText(RECEIVE_NAME_EN!);

router.post("/verify-slip", auth, async (c: AuthContext) => {
  try {
    const body = await c.req.json();

    const qrcode = safeTrim(body.qrcode);
    const imageUrl = safeTrim(body.imageUrl);

    if (!qrcode && !imageUrl) {
      return c.json(
        {
          success: false,
          message: "ต้องระบุ qrcode หรือ imageUrl อย่างน้อย 1 รายการ",
          error_code: "MISSING_INPUT",
        },
        400,
      );
    }

    if (
      !SLIPOK_API_KEY ||
      !SLIPOK_BRANCH_ID ||
      !RECEIVE_PHONE ||
      !RECEIVE_ACCOUNT ||
      !RECEIVE_NAME_TH ||
      !RECEIVE_NAME_EN
    ) {
      console.error("Missing required environment variables for SlipOK API");
      return c.json(
        {
          success: false,
          message: "การตั้งค่าระบบไม่ถูกต้อง",
          error_code: "CONFIG_ERROR",
        },
        500,
      );
    }

    const requestBody: any = {
      log: true,
    };

    if (qrcode) {
      requestBody.data = qrcode;
    } else if (imageUrl) {
      requestBody.url = imageUrl;
    }

    const verifyResponse = await axios.post(
      `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`,
      requestBody,
      {
        headers: {
          "x-authorization": SLIPOK_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const slipData = verifyResponse.data;

    if (!slipData.success) {
      const errorCode = slipData.code?.toString();
      const errorMessages: Record<string, string> = {
        "1007": "ไม่พบ QR Code ในรูปภาพ",
        "1008": "QR Code ไม่ถูกต้อง",
        "1011": "QR Code หมดอายุ",
        "1012": "สลิปนี้ถูกใช้งานแล้ว",
        "1013": "จำนวนเงินไม่ตรงกัน",
        "1014": "บัญชีผู้รับเงินไม่ถูกต้อง",
      };

      return c.json(
        {
          success: false,
          message:
            errorMessages[errorCode || ""] ||
            slipData.message ||
            "ตรวจสอบสลิปไม่สำเร็จ",
          error_code: errorCode || "VERIFY_ERROR",
        },
        400,
      );
    }

    // Validate SlipOK response structure
    if (!isValidSlipData(slipData.data)) {
      console.error("Invalid SlipOK response format:", slipData);
      return c.json(
        {
          success: false,
          message: "ข้อมูลสลิปไม่ถูกต้อง",
          error_code: "INVALID_RESPONSE",
        },
        400,
      );
    }

    const amount = parseFloat(slipData.data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return c.json(
        {
          success: false,
          message: "จำนวนเงินไม่ถูกต้อง",
          error_code: "INVALID_AMOUNT",
        },
        400,
      );
    }

    const existingTransaction = await TopupHistory.findOne({
      transactionId: slipData.data.transRef,
    });

    if (existingTransaction) {
      return c.json(
        {
          success: false,
          message: "สลิปนี้ถูกใช้งานแล้ว",
          error_code: "DUPLICATE_SLIP",
        },
        400,
      );
    }

    const normalizeAccountNumber = (account: string): string => {
      return safeTrim(account).replace(/[^0-9]/g, "");
    };

    const receiverProxy = slipData.data.receiver?.proxy?.value || "";
    const receiverAccount = slipData.data.receiver?.account?.value || "";

    const normalizedProxy = normalizeAccountNumber(receiverProxy);
    const normalizedAccount = normalizeAccountNumber(receiverAccount);
    const normalizedReceivePhone = normalizeAccountNumber(RECEIVE_PHONE_CLEAN);
    const normalizedReceiveAccount = normalizeAccountNumber(
      RECEIVE_ACCOUNT_CLEAN,
    );

    const isPhoneMatch =
      normalizedProxy &&
      normalizedReceivePhone &&
      (normalizedProxy.includes(normalizedReceivePhone.slice(-4)) ||
        normalizedReceivePhone.includes(normalizedProxy.slice(-4)));

    const isAccountMatch =
      normalizedAccount &&
      normalizedReceiveAccount &&
      (normalizedAccount.includes(normalizedReceiveAccount.slice(-4)) ||
        normalizedReceiveAccount.includes(normalizedAccount.slice(-4)));

    if (!isPhoneMatch && !isAccountMatch) {
      return c.json(
        {
          success: false,
          message: "บัญชีผู้รับเงินไม่ถูกต้อง",
          error_code: "INVALID_RECEIVER",
        },
        400,
      );
    }

    const receiverDisplayName = normalizeText(
      slipData.data.receiver?.displayName,
    );

    const receiverName = normalizeText(slipData.data.receiver?.name);

    const isNameMatch =
      receiverDisplayName.includes(RECEIVE_NAME_TH_CLEAN) ||
      RECEIVE_NAME_TH_CLEAN.includes(receiverDisplayName) ||
      receiverDisplayName.includes(RECEIVE_NAME_EN_CLEAN) ||
      RECEIVE_NAME_EN_CLEAN.includes(receiverDisplayName) ||
      receiverName.includes(RECEIVE_NAME_TH_CLEAN) ||
      RECEIVE_NAME_TH_CLEAN.includes(receiverName) ||
      receiverName.includes(RECEIVE_NAME_EN_CLEAN) ||
      RECEIVE_NAME_EN_CLEAN.includes(receiverName);

    if (!isNameMatch) {
      return c.json(
        {
          success: false,
          message: "ชื่อผู้รับเงินไม่ถูกต้อง",
          error_code: "INVALID_RECEIVER_NAME",
        },
        400,
      );
    }

    const user = await User.findById(c.user?.id);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
          error_code: "USER_NOT_FOUND",
        },
        404,
      );
    }

    const pointsToAdd = Math.floor(amount);

    const topupHistory = new TopupHistory({
      userId: user._id,
      transactionId: slipData.data.transRef,
      amount: amount,
      sender: slipData.data.sender,
      receiver: slipData.data.receiver,
      transactionDate: new Date(slipData.data.transTimestamp),
      pointsAdded: pointsToAdd,
      status: "success",
      type: "slipok",
    });

    try {
      await topupHistory.save();
    } catch (historyError: any) {
      if (historyError.code === 11000) {
        return c.json(
          {
            success: false,
            message: "สลิปนี้ถูกใช้งานแล้ว",
            error_code: "DUPLICATE_SLIP",
          },
          400,
        );
      }
      throw historyError;
    }

    user.points += pointsToAdd;
    await user.save();

    return c.json({
      success: true,
      message: "ตรวจสอบสลิปสำเร็จ",
      data: {
        transactionId: slipData.data.transRef,
        amount: amount,
        pointsAdded: pointsToAdd,
        sender: slipData.data.sender,
        receiver: slipData.data.receiver,
        transactionDate: slipData.data.transTimestamp,
      },
    });
  } catch (error: any) {
    console.error("Slip verification error:", error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400) {
        return c.json(
          {
            success: false,
            message: errorData.message || "คำขอไม่ถูกต้อง",
            error_code: "BAD_REQUEST",
          },
          400,
        );
      }

      if (status === 401) {
        return c.json(
          {
            success: false,
            message: "API Key ไม่ถูกต้องหรือหมดอายุ",
            error_code: "UNAUTHORIZED",
          },
          401,
        );
      }

      if (status === 429) {
        return c.json(
          {
            success: false,
            message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            error_code: "RATE_LIMIT",
          },
          429,
        );
      }
    }

    if (error.code === "ECONNABORTED") {
      return c.json(
        {
          success: false,
          message: "การตรวจสอบสลิปใช้เวลานานเกินไป กรุณาลองใหม่",
          error_code: "TIMEOUT",
        },
        408,
      );
    }

    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
        error_code: "INTERNAL_ERROR",
      },
      500,
    );
  }
});

router.get("/history", auth, async (c: AuthContext) => {
  try {
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
    const topupHistory = await TopupHistory.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "username email");

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
