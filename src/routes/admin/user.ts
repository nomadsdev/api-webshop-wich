import { Hono } from "hono";
import { User } from "../../models/User.js";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";

const router = new Hono();

router.get("/admin/users", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { search, role, page = "1", limit = "10" } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role !== undefined) {
      query.role = parseInt(role);
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return c.json({
      status: "success",
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      },
      500,
    );
  }
});

router.put("/admin/users/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    const userId = c.req.param("id");
    const { role, points } = await c.req.json();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(role !== undefined && { role: parseInt(role) }),
        ...(points !== undefined && { points: parseInt(points) }),
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบผู้ใช้",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
      data: user,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้",
      },
      500,
    );
  }
});

router.delete("/admin/users/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    const userId = c.req.param("id");

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบผู้ใช้",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "ลบผู้ใช้สำเร็จ",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการลบผู้ใช้",
      },
      500,
    );
  }
});

export default router;
