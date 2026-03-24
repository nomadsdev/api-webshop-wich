import { Hono } from "hono";
import { HiddenProduct } from "../../models/HiddenProduct.js";

const router = new Hono();

router.get("/hidden-product/check/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");

    if (!productId) {
      return c.json(
        {
          success: false,
          message: "กรุณาระบุ ID สินค้า",
        },
        400,
      );
    }

    const hiddenProduct = await HiddenProduct.findOne({
      productId,
      isHidden: true,
    });

    return c.json({
      success: true,
      message: "ตรวจสอบสถานะสินค้าสำเร็จ",
      data: {
        isHidden: !!hiddenProduct,
        hiddenInfo: hiddenProduct
          ? {
              productId: hiddenProduct.productId,
              productName: hiddenProduct.productName,
              hiddenAt: hiddenProduct.hiddenAt,
              reason: hiddenProduct.reason,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Check hidden product error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะสินค้า",
      },
      500,
    );
  }
});

// Get all hidden product IDs (for filtering)
router.get("/hidden-product/ids", async (c) => {
  try {
    const hiddenProducts = await HiddenProduct.find(
      { isHidden: true },
      { productId: 1, _id: 0 },
    );

    const hiddenProductIds = hiddenProducts.map((hp) => hp.productId);

    return c.json({
      success: true,
      message: "ดึงข้อมูล ID สินค้าที่ซ่อนสำเร็จ",
      data: {
        hiddenProductIds,
      },
    });
  } catch (error: any) {
    console.error("Get hidden product IDs error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่ซ่อน",
      },
      500,
    );
  }
});

export default router;
