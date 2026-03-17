import { Hono } from "hono";
import bcrypt from "bcrypt";
import { connectDB } from "../lib/mongodb.js";
import { auth, type AuthContext } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { ChangeProfileHistory, type IChangeProfileHistory } from "../models/ChangeProfileHistory.js";

const router = new Hono();

// Helper function to record profile change history
const recordProfileChange = async (
  userId: string,
  fieldType: "username" | "email" | "phone" | "password",
  oldValue: string | undefined,
  newValue: string | undefined,
  changeType: "update" | "delete" | "add",
  status: "success" | "failed",
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    const history = new ChangeProfileHistory({
      userId,
      fieldType,
      oldValue,
      newValue,
      changeType,
      ipAddress,
      userAgent,
      status,
      errorMessage,
    });
    await history.save();
  } catch (error) {
    console.error("Failed to record profile change history:", error);
  }
};

// Get current user profile
router.get("/", auth, async (c: AuthContext) => {
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

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "ดึงข้อมูลโปรไฟล์สำเร็จ",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์",
      },
      500,
    );
  }
});

// Update username
router.put("/username", auth, async (c: AuthContext) => {
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

    const body = await c.req.json().catch(() => ({} as any));
    const { username, password } = body;

    if (!username || typeof username !== "string") {
      return c.json(
        {
          success: false,
          message: "username is required",
        },
        400,
      );
    }

    if (!password || typeof password !== "string") {
      return c.json(
        {
          success: false,
          message: "รหัสผ่านจำเป็นสำหรับการแก้ไขข้อมูล",
        },
        400,
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return c.json(
        {
          success: false,
          message: "username ต้องมีความยาวระหว่าง 3-20 ตัวอักษร",
        },
        400,
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "username",
        user.username,
        username,
        "update",
        "failed",
        "รหัสผ่านไม่ถูกต้อง",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        },
        401,
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "username",
        user.username,
        username,
        "update",
        "failed",
        "username นี้ถูกใช้งานแล้ว",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "username นี้ถูกใช้งานแล้ว",
        },
        400,
      );
    }

    const oldUsername = user.username;
    user.username = username;
    await user.save();

    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const userAgent = c.req.header("user-agent") || "unknown";
    
    await recordProfileChange(
      userId,
      "username",
      oldUsername,
      username,
      "update",
      "success",
      undefined,
      ipAddress,
      userAgent
    );

    return c.json({
      success: true,
      message: "แก้ไข username สำเร็จ",
      data: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Update username error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไข username",
      },
      500,
    );
  }
});

// Update email
router.put("/email", auth, async (c: AuthContext) => {
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

    const body = await c.req.json().catch(() => ({} as any));
    const { email, password } = body;

    if (!email || typeof email !== "string") {
      return c.json(
        {
          success: false,
          message: "email is required",
        },
        400,
      );
    }

    if (!password || typeof password !== "string") {
      return c.json(
        {
          success: false,
          message: "รหัสผ่านจำเป็นสำหรับการแก้ไขข้อมูล",
        },
        400,
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        {
          success: false,
          message: "รูปแบบ email ไม่ถูกต้อง",
        },
        400,
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "email",
        user.email,
        email,
        "update",
        "failed",
        "รหัสผ่านไม่ถูกต้อง",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        },
        401,
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "email",
        user.email,
        email,
        "update",
        "failed",
        "email นี้ถูกใช้งานแล้ว",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "email นี้ถูกใช้งานแล้ว",
        },
        400,
      );
    }

    const oldEmail = user.email;
    user.email = email;
    await user.save();

    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const userAgent = c.req.header("user-agent") || "unknown";
    
    await recordProfileChange(
      userId,
      "email",
      oldEmail,
      email,
      "update",
      "success",
      undefined,
      ipAddress,
      userAgent
    );

    return c.json({
      success: true,
      message: "แก้ไข email สำเร็จ",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update email error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไข email",
      },
      500,
    );
  }
});

// Update phone
router.put("/phone", auth, async (c: AuthContext) => {
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

    const body = await c.req.json().catch(() => ({} as any));
    const { phone, password } = body;

    if (!phone || typeof phone !== "string") {
      return c.json(
        {
          success: false,
          message: "phone is required",
        },
        400,
      );
    }

    if (!password || typeof password !== "string") {
      return c.json(
        {
          success: false,
          message: "รหัสผ่านจำเป็นสำหรับการแก้ไขข้อมูล",
        },
        400,
      );
    }

    // Validate phone format (Thai phone number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return c.json(
        {
          success: false,
          message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)",
        },
        400,
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        404,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "phone",
        user.phone,
        phone,
        "update",
        "failed",
        "รหัสผ่านไม่ถูกต้อง",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        },
        401,
      );
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      await recordProfileChange(
        userId,
        "phone",
        user.phone,
        phone,
        "update",
        "failed",
        "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว",
        ipAddress,
        userAgent
      );

      return c.json(
        {
          success: false,
          message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว",
        },
        400,
      );
    }

    const oldPhone = user.phone;
    user.phone = phone;
    await user.save();

    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const userAgent = c.req.header("user-agent") || "unknown";
    
    await recordProfileChange(
      userId,
      "phone",
      oldPhone,
      phone,
      "update",
      "success",
      undefined,
      ipAddress,
      userAgent
    );

    return c.json({
      success: true,
      message: "แก้ไขเบอร์โทรศัพท์สำเร็จ",
      data: {
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Update phone error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไขเบอร์โทรศัพท์",
      },
      500,
    );
  }
});

// Get profile change history
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

    const history = await ChangeProfileHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return c.json({
      success: true,
      message: "ดึงประวัติการเปลี่ยนแปลงโปรไฟล์สำเร็จ",
      data: {
        history: history.map((record: IChangeProfileHistory) => ({
          id: record._id,
          fieldType: record.fieldType,
          oldValue: record.oldValue,
          newValue: record.newValue,
          changeType: record.changeType,
          status: record.status,
          errorMessage: record.errorMessage,
          ipAddress: record.ipAddress,
          createdAt: record.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get profile history error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงประวัติการเปลี่ยนแปลง",
      },
      500,
    );
  }
});

export default router;