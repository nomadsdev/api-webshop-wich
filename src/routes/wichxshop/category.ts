import { Hono } from "hono";
import axios from "axios";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";
import { Category } from "../../models/Category.js";

const router = new Hono();
const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

router.get("/categories", async (c) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    return c.json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      data: categories,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      },
      500,
    );
  }
});


router.get("/categories/slug/:sub", async (c) => {
  try {
    const sub = c.req.param("sub");
    
    
    const categories = await Category.find({ isActive: true });
    
    
    const foundCategory = categories.find((category: any) => {
      const slug = category.title
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]/g, '')
        .replace(/\s+/g, '')
        .replace(/(\d+)/g, '')
        .trim();
      return slug === sub;
    });

    if (!foundCategory) {
      return c.json(
        {
          success: false,
          message: "ไม่พบหมวดหมู่",
        },
        404,
      );
    }

    
    let products = [];
    if (foundCategory.productIds.length > 0) {
      try {
        const res = await axios.get(`${URL_API}/store/product`, {
          headers: {
            "x-api-key": WICKXSHOP_API_KEY,
          },
        });

        const allProducts = res.data.success
          ? Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data.products || []
          : [];

        products = allProducts.filter((product: any) =>
          foundCategory.productIds.includes(product.id || product.productId),
        );
      } catch (apiError) {
        console.error("Error fetching products from Wichxshop API:", apiError);
      }
    }

    return c.json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      data: {
        ...foundCategory.toObject(),
        products,
      },
    });
  } catch (error: any) {
    console.error("Get category by slug error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      },
      500,
    );
  }
});

router.get("/categories/:id", async (c) => {
  try {
    const categoryId = c.req.param("id");
    const category = await Category.findById(categoryId);

    if (!category || !category.isActive) {
      return c.json(
        {
          success: false,
          message: "ไม่พบหมวดหมู่",
        },
        404,
      );
    }

    let products = [];
    if (category.productIds.length > 0) {
      try {
        const res = await axios.get(`${URL_API}/store/product`, {
          headers: {
            "x-api-key": WICKXSHOP_API_KEY,
          },
        });

        const allProducts = res.data.success
          ? Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data.products || []
          : [];

        products = allProducts.filter((product: any) =>
          category.productIds.includes(product.id || product.productId),
        );
      } catch (apiError) {
        console.error("Error fetching products from Wichxshop API:", apiError);
      }
    }

    return c.json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      data: {
        ...category.toObject(),
        products,
      },
    });
  } catch (error: any) {
    console.error("Get category error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      },
      500,
    );
  }
});

router.get("/admin/categories", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { page = "1", limit = "10", search } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { detail: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Category.countDocuments(query);

    return c.json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      data: {
        categories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Get admin categories error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      },
      500,
    );
  }
});

router.post("/admin/categories", auth, authAdmin, async (c: AuthContext) => {
  try {
    const { title, detail, imageUrl, productIds, order } = await c.req.json();

    if (!title || !detail || !imageUrl) {
      return c.json(
        {
          success: false,
          message: "กรุณาระบุชื่อ รายละเอียด และ URL รูปภาพ",
        },
        400,
      );
    }

    const existingCategory = await Category.findOne({ title });
    if (existingCategory) {
      return c.json(
        {
          success: false,
          message: "ชื่อหมวดหมู่นี้มีอยู่แล้ว",
        },
        400,
      );
    }

    const maxOrderCategory = await Category.findOne().sort({ order: -1 });
    const nextOrder =
      order !== undefined ? order : (maxOrderCategory?.order || 0) + 1;

    const newCategory = new Category({
      title,
      detail,
      imageUrl,
      productIds: productIds || [],
      order: nextOrder,
      isActive: true,
    });

    await newCategory.save();

    return c.json({
      success: true,
      message: "สร้างหมวดหมู่สำเร็จ",
      data: newCategory,
    });
  } catch (error: any) {
    console.error("Create category error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่",
      },
      500,
    );
  }
});

router.put("/admin/categories/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    const categoryId = c.req.param("id");
    const { title, detail, imageUrl, productIds, order, isActive } =
      await c.req.json();

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...(title !== undefined && { title }),
        ...(detail !== undefined && { detail }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(productIds !== undefined && { productIds }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true },
    );

    if (!category) {
      return c.json(
        {
          success: false,
          message: "ไม่พบหมวดหมู่",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "อัปเดตหมวดหมู่สำเร็จ",
      data: category,
    });
  } catch (error: any) {
    console.error("Update category error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่",
      },
      500,
    );
  }
});

router.delete(
  "/admin/categories/:id",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const categoryId = c.req.param("id");

      const category = await Category.findByIdAndDelete(categoryId);

      if (!category) {
        return c.json(
          {
            success: false,
            message: "ไม่พบหมวดหมู่",
          },
          404,
        );
      }

      return c.json({
        success: true,
        message: "ลบหมวดหมู่สำเร็จ",
        data: category,
      });
    } catch (error: any) {
      console.error("Delete category error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการลบหมวดหมู่",
        },
        500,
      );
    }
  },
);

router.put(
  "/admin/categories/reorder",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const { categories } = await c.req.json();

      if (!Array.isArray(categories)) {
        return c.json(
          {
            success: false,
            message: "ข้อมูลไม่ถูกต้อง",
          },
          400,
        );
      }

      const updatePromises = categories.map(
        ({ id, order }: { id: string; order: number }) =>
          Category.findByIdAndUpdate(id, { order }),
      );

      await Promise.all(updatePromises);

      return c.json({
        success: true,
        message: "จัดลำดับหมวดหมู่สำเร็จ",
      });
    } catch (error: any) {
      console.error("Reorder categories error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการจัดลำดับหมวดหมู่",
        },
        500,
      );
    }
  },
);

router.put(
  "/admin/categories/:id/toggle",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const categoryId = c.req.param("id");

      const category = await Category.findById(categoryId);
      if (!category) {
        return c.json(
          {
            success: false,
            message: "ไม่พบหมวดหมู่",
          },
          404,
        );
      }

      category.isActive = !category.isActive;
      await category.save();

      return c.json({
        success: true,
        message: `${category.isActive ? "เปิด" : "ปิด"}การแสดงหมวดหมู่สำเร็จ`,
        data: category,
      });
    } catch (error: any) {
      console.error("Toggle category error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่",
        },
        500,
      );
    }
  },
);

export default router;
