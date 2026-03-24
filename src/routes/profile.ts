import { Hono } from "hono";
import bcrypt from "bcrypt";
import { auth, type AuthContext } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import {
  ChangeProfileHistory,
  type IChangeProfileHistory,
} from "../models/ChangeProfileHistory.js";

const router = new Hono();

const recordProfileChange = async (
  userId: string,
  fieldType: "username" | "email" | "password",
  oldValue: string | undefined,
  newValue: string | undefined,
  changeType: "update" | "delete" | "add",
  status: "success" | "failed",
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string,
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

router.get("/", auth, async (c: AuthContext) => {
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

router.put("/username", auth, async (c: AuthContext) => {
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

    const body = await c.req.json().catch(() => ({}) as any);
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";
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
        userAgent,
      );

      return c.json(
        {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        },
        401,
      );
    }

    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      const ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";
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
        userAgent,
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

    const ipAddress =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
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
      userAgent,
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

router.put("/email", auth, async (c: AuthContext) => {
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

    const body = await c.req.json().catch(() => ({}) as any);
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";
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
        userAgent,
      );

      return c.json(
        {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        },
        401,
      );
    }

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      const ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";
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
        userAgent,
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

    const ipAddress =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
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
      userAgent,
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

router.get("/history", auth, async (c: AuthContext) => {
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
