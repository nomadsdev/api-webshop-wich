import { Hono } from "hono";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";
import { HiddenProduct } from "../../models/HiddenProduct.js";
import { connectDB } from "../../lib/mongodb.js";
import axios from "axios";

const router = new Hono();
const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

const fetchProductDetails = async (productId: string) => {
  try {
    const response = await axios.get(`${URL_API}/store/product/${productId}`, {
      headers: {
        "x-api-key": WICKXSHOP_API_KEY,
      },
    });

    if (response.data.success && response.data.data) {
      return {
        id: response.data.data.id || response.data.data.productId,
        name: response.data.data.name,
        price: response.data.data.price || response.data.data.productPrice,
        image: response.data.data.image,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

router.get(
  "/admin/hidden-products",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const { page = "1", limit = "10", search } = c.req.query();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let query: any = {};
      if (search) {
        query.$or = [
          { productId: { $regex: search, $options: "i" } },
          { productName: { $regex: search, $options: "i" } },
          { reason: { $regex: search, $options: "i" } },
        ];
      }

      const hiddenProducts = await HiddenProduct.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await HiddenProduct.countDocuments(query);

      const productsWithDetails = await Promise.all(
        hiddenProducts.map(async (hiddenProduct) => {
          const productDetails = await fetchProductDetails(
            hiddenProduct.productId,
          );
          return {
            ...hiddenProduct.toObject(),
            productDetails,
          };
        }),
      );

      return c.json({
        success: true,
        message: "ดึงข้อมูลสินค้าที่ซ่อนสำเร็จ",
        data: {
          hiddenProducts: productsWithDetails,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      console.error("Get hidden products error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่ซ่อน",
        },
        500,
      );
    }
  },
);

router.post(
  "/admin/hidden-products",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const { productIds, reason } = await c.req.json();

      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.length === 0
      ) {
        return c.json(
          {
            success: false,
            message: "กรุณาระบุ ID สินค้าอย่างน้อย 1 รายการ",
          },
          400,
        );
      }

      const existingHidden = await HiddenProduct.find({
        productId: { $in: productIds },
      });
      const existingProductIds = existingHidden.map((hp) => hp.productId);

      const newProductIds = productIds.filter(
        (id) => !existingProductIds.includes(id),
      );

      if (newProductIds.length === 0) {
        return c.json(
          {
            success: false,
            message: "สินค้าทั้งหมดถูกซ่อนอยู่แล้ว",
          },
          400,
        );
      }

      const productDetailsPromises = newProductIds.map(async (productId) => {
        const details = await fetchProductDetails(productId);
        return { productId, details };
      });

      const productDetailsResults = await Promise.all(productDetailsPromises);

      const validProducts = productDetailsResults.filter(
        ({ details }) => details !== null,
      );
      const invalidProductIds = productDetailsResults
        .filter(({ details }) => details === null)
        .map(({ productId }) => productId);

      if (validProducts.length === 0) {
        return c.json(
          {
            success: false,
            message: "ไม่พบสินค้าที่ระบุ",
          },
          404,
        );
      }

      const hiddenProductRecords = validProducts.map(
        ({ productId, details }) => ({
          productId,
          productName: details!.name,
          isHidden: true,
          hiddenBy: c.user?.id,
          reason: reason || "",
        }),
      );

      const savedHiddenProducts =
        await HiddenProduct.insertMany(hiddenProductRecords);

      return c.json({
        success: true,
        message: `ซ่อนสินค้า ${savedHiddenProducts.length} รายการสำเร็จ${invalidProductIds.length > 0 ? ` (ไม่พบสินค้า ${invalidProductIds.length} รายการ)` : ""}`,
        data: {
          hiddenProducts: savedHiddenProducts,
          invalidProductIds,
        },
      });
    } catch (error: any) {
      console.error("Add hidden products error:", error);
      if (error.code === 11000) {
        return c.json(
          {
            success: false,
            message: "บางสินค้าถูกซ่อนอยู่แล้ว",
          },
          400,
        );
      }
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการซ่อนสินค้า",
        },
        500,
      );
    }
  },
);

router.put(
  "/admin/hidden-products/:productId/toggle",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const productId = c.req.param("productId");

      const hiddenProduct = await HiddenProduct.findOne({ productId });
      if (!hiddenProduct) {
        return c.json(
          {
            success: false,
            message: "ไม่พบข้อมูลสินค้าที่ซ่อน",
          },
          404,
        );
      }

      hiddenProduct.isHidden = !hiddenProduct.isHidden;
      if (hiddenProduct.isHidden) {
        hiddenProduct.hiddenBy = c.user?.id;
        hiddenProduct.hiddenAt = new Date();
      }

      await hiddenProduct.save();

      const productDetails = productId
        ? await fetchProductDetails(productId)
        : null;

      return c.json({
        success: true,
        message: `${hiddenProduct.isHidden ? "ซ่อน" : "แสดง"}สินค้าสำเร็จ`,
        data: {
          ...hiddenProduct.toObject(),
          productDetails,
        },
      });
    } catch (error: any) {
      console.error("Toggle hidden product error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า",
        },
        500,
      );
    }
  },
);

router.delete(
  "/admin/hidden-products/:productId",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const productId = c.req.param("productId");

      const hiddenProduct = await HiddenProduct.findOneAndDelete({ productId });
      if (!hiddenProduct) {
        return c.json(
          {
            success: false,
            message: "ไม่พบข้อมูลสินค้าที่ซ่อน",
          },
          404,
        );
      }

      return c.json({
        success: true,
        message: "ลบการซ่อนสินค้าสำเร็จ",
        data: hiddenProduct,
      });
    } catch (error: any) {
      console.error("Remove hidden product error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการลบการซ่อนสินค้า",
        },
        500,
      );
    }
  },
);

router.get(
  "/admin/products-with-hidden-status",
  auth,
  authAdmin,
  async (c: AuthContext) => {
    try {
      const response = await axios.get(`${URL_API}/store/product`, {
        headers: {
          "x-api-key": WICKXSHOP_API_KEY,
        },
      });

      const productsData = response.data;
      if (!productsData.success || !productsData.data) {
        return c.json({
          success: true,
          message: "ดึงข้อมูลสินค้าสำเร็จ",
          data: {
            products: [],
          },
        });
      }

      const allProducts = Array.isArray(productsData.data)
        ? productsData.data
        : productsData.data.products || [];

      const hiddenProducts = await HiddenProduct.find({ isHidden: true });
      const hiddenProductIds = new Set(
        hiddenProducts.map((hp) => hp.productId),
      );

      const productsWithStatus = allProducts.map((product: any) => ({
        ...product,
        isHidden: hiddenProductIds.has(product.id || product.productId),
      }));

      return c.json({
        success: true,
        message: "ดึงข้อมูลสินค้าพร้อมสถานะการซ่อนสำเร็จ",
        data: {
          products: productsWithStatus,
        },
      });
    } catch (error: any) {
      console.error("Get products with hidden status error:", error);
      return c.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า",
        },
        500,
      );
    }
  },
);

export default router;
