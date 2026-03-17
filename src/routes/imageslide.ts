import { Hono } from "hono";
import { ImageSlide } from "../models/ImageSlide.js";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../middleware/auth.middleware.js";

const router = new Hono();

router.get("/", async (c) => {
  try {
    const slides = await ImageSlide.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    return c.json({
      status: "success",
      message: "ดึงข้อมูลรูปภาพสำเร็จ",
      data: slides,
    });
  } catch (error: any) {
    console.error("Get imageslides error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ",
      },
      500,
    );
  }
});

router.get("/admin", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { page = "1", limit = "10", search } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { imageUrl: { $regex: search, $options: "i" } },
        { link: { $regex: search, $options: "i" } },
      ];
    }

    const slides = await ImageSlide.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ImageSlide.countDocuments(query);

    return c.json({
      status: "success",
      message: "ดึงข้อมูลรูปภาพสำเร็จ",
      data: {
        slides,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Get admin imageslides error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ",
      },
      500,
    );
  }
});

router.post("/admin", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { title, imageUrl, link, order } = await c.req.json();

    if (!title || !imageUrl) {
      return c.json(
        {
          status: "error",
          message: "กรุณากรอกชื่อและ URL ของรูปภาพ",
        },
        400,
      );
    }

    const maxOrderSlide = await ImageSlide.findOne().sort({ order: -1 });
    const nextOrder =
      order !== undefined ? order : (maxOrderSlide?.order || 0) + 1;

    const newSlide = new ImageSlide({
      title,
      imageUrl,
      link,
      order: nextOrder,
      isActive: true,
    });

    await newSlide.save();

    return c.json({
      status: "success",
      message: "สร้างรูปภาพสำเร็จ",
      data: newSlide,
    });
  } catch (error: any) {
    console.error("Create imageslide error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการสร้างรูปภาพ",
      },
      500,
    );
  }
});

router.put("/admin/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    const slideId = c.req.param("id");
    const { title, imageUrl, link, order, isActive } = await c.req.json();

    const slide = await ImageSlide.findByIdAndUpdate(
      slideId,
      {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true },
    );

    if (!slide) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบรูปภาพ",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "อัปเดตรูปภาพสำเร็จ",
      data: slide,
    });
  } catch (error: any) {
    console.error("Update imageslide error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการอัปเดตรูปภาพ",
      },
      500,
    );
  }
});

router.delete("/admin/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    const slideId = c.req.param("id");

    const slide = await ImageSlide.findByIdAndDelete(slideId);

    if (!slide) {
      return c.json(
        {
          status: "error",
          message: "ไม่พบรูปภาพ",
        },
        404,
      );
    }

    return c.json({
      status: "success",
      message: "ลบรูปภาพสำเร็จ",
    });
  } catch (error: any) {
    console.error("Delete imageslide error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการลบรูปภาพ",
      },
      500,
    );
  }
});

router.put("/admin/reorder", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { slides } = await c.req.json();

    if (!Array.isArray(slides)) {
      return c.json(
        {
          status: "error",
          message: "ข้อมูลไม่ถูกต้อง",
        },
        400,
      );
    }

    const updatePromises = slides.map(
      ({ id, order }: { id: string; order: number }) =>
        ImageSlide.findByIdAndUpdate(id, { order }),
    );

    await Promise.all(updatePromises);

    return c.json({
      status: "success",
      message: "จัดลำดับรูปภาพสำเร็จ",
    });
  } catch (error: any) {
    console.error("Reorder imageslides error:", error);
    return c.json(
      {
        status: "error",
        message: "เกิดข้อผิดพลาดในการจัดลำดับรูปภาพ",
      },
      500,
    );
  }
});

export default router;
