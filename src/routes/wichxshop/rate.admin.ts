import { Hono } from "hono";
import {
  auth,
  authAdmin,
  type AuthContext,
} from "../../middleware/auth.middleware.js";
import {
  RateConfig,
  calculateProductPrice,
  initializeDefaultRates,
} from "./config.rate.js";

const router = new Hono();

router.get("/rates", auth, authAdmin, async (c: AuthContext) => {
  try {
    const rates = await RateConfig.find({}).sort({
      isGlobal: -1,
      createdAt: -1,
    });

    return c.json({
      success: true,
      message: "ดึงข้อมูลค่าธรรมเนียมสำเร็จ",
      data: {
        total_rates: rates.length,
        rates: rates.map((rate) => ({
          id: rate._id,
          productId: rate.productId,
          percentage: rate.percentage,
          fixedAmount: rate.fixedAmount,
          customPrice: rate.customPrice,
          isActive: rate.isActive,
          description: rate.description,
          isGlobal: rate.isGlobal,
          createdAt: rate.createdAt,
          updatedAt: rate.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Get rates error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลค่าธรรมเนียม",
      },
      500,
    );
  }
});

router.get("/rates/:productId", auth, authAdmin, async (c: AuthContext) => {
  try {
    const productId = c.req.param("productId");
    const rateConfig = await RateConfig.findOne({ productId });

    if (!rateConfig) {
      return c.json(
        {
          success: false,
          message: "ไม่พบการตั้งค่าค่าธรรมเนียมสำหรับสินค้านี้",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "ดึงข้อมูลค่าธรรมเนียมสำเร็จ",
      data: {
        id: rateConfig._id,
        productId: rateConfig.productId,
        percentage: rateConfig.percentage,
        fixedAmount: rateConfig.fixedAmount,
        customPrice: rateConfig.customPrice,
        isActive: rateConfig.isActive,
        description: rateConfig.description,
        isGlobal: rateConfig.isGlobal,
        createdAt: rateConfig.createdAt,
        updatedAt: rateConfig.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get rate config error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลค่าธรรมเนียม",
      },
      500,
    );
  }
});

router.get("/global-rate", auth, authAdmin, async (c: AuthContext) => {
  try {
    const globalConfig = await RateConfig.findOne({ isGlobal: true });

    if (!globalConfig) {
      return c.json(
        {
          success: false,
          message: "ไม่พบการตั้งค่าอัตราส่วนกลาง",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "ดึงข้อมูลอัตราส่วนกลางสำเร็จ",
      data: {
        id: globalConfig._id,
        percentage: globalConfig.percentage,
        fixedAmount: globalConfig.fixedAmount,
        customPrice: globalConfig.customPrice,
        isActive: globalConfig.isActive,
        description: globalConfig.description,
        createdAt: globalConfig.createdAt,
        updatedAt: globalConfig.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get global rate error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลอัตราส่วนกลาง",
      },
      500,
    );
  }
});

router.post("/rates", auth, authAdmin, async (c: AuthContext) => {
  try {
    const body = await c.req.json();
    const {
      productId,
      percentage,
      fixedAmount,
      customPrice,
      isActive,
      description,
      isGlobal,
      rateMultiplier,
    } = body;

    if (!isGlobal && !productId) {
      return c.json(
        {
          success: false,
          message: "กรุณาระบุ productId หรือตั้งค่าเป็นอัตราส่วนกลาง",
        },
        400,
      );
    }

    if (percentage !== undefined && (percentage < -100 || percentage > 1000)) {
      return c.json(
        {
          success: false,
          message: "percentage ต้องอยู่ระหว่าง -100 ถึง 1000",
        },
        400,
      );
    }

    if (fixedAmount !== undefined && (fixedAmount < 0 || fixedAmount > 10000)) {
      return c.json(
        {
          success: false,
          message: "fixedAmount ต้องอยู่ระหว่าง 0 ถึง 10000",
        },
        400,
      );
    }

    let convertedPercentage = percentage;
    let convertedFixedAmount = fixedAmount;

    if (
      rateMultiplier !== undefined &&
      percentage === undefined &&
      fixedAmount === undefined
    ) {
      convertedPercentage = (rateMultiplier - 1) * 100;
      convertedFixedAmount = 0;
    }

    const updateData: any = {
      ...(productId && { productId }),
      ...(convertedPercentage !== undefined && {
        percentage: convertedPercentage,
      }),
      ...(convertedFixedAmount !== undefined && {
        fixedAmount: convertedFixedAmount,
      }),
      ...(customPrice !== undefined && { customPrice }),
      ...(isActive !== undefined && { isActive }),
      ...(description !== undefined && { description }),
      isGlobal: isGlobal || false,
      rateMultiplier: null,
    };

    const query = isGlobal ? { isGlobal: true } : { productId };

    const rateConfig = await RateConfig.findOneAndUpdate(query, updateData, {
      upsert: true,
      new: true,
    });

    return c.json({
      success: true,
      message: isGlobal
        ? "บันทึกอัตราส่วนกลางสำเร็จ"
        : "บันทึกการตั้งค่าค่าธรรมเนียมสำเร็จ",
      data: {
        id: rateConfig._id,
        productId: rateConfig.productId,
        percentage: rateConfig.percentage,
        fixedAmount: rateConfig.fixedAmount,
        customPrice: rateConfig.customPrice,
        isActive: rateConfig.isActive,
        description: rateConfig.description,
        isGlobal: rateConfig.isGlobal,
        createdAt: rateConfig.createdAt,
        updatedAt: rateConfig.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Create/Update rate config error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าค่าธรรมเนียม",
      },
      500,
    );
  }
});

router.delete("/rates/:productId", auth, authAdmin, async (c: AuthContext) => {
  try {
    const productId = c.req.param("productId");
    const result = await RateConfig.findOneAndDelete({ productId });

    if (!result) {
      return c.json(
        {
          success: false,
          message: "ไม่พบการตั้งค่าค่าธรรมเนียมสำหรับสินค้านี้",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "ลบการตั้งค่าค่าธรรมเนียมสำเร็จ",
    });
  } catch (error: any) {
    console.error("Delete rate config error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบการตั้งค่าค่าธรรมเนียม",
      },
      500,
    );
  }
});

router.delete("/global-rate", auth, authAdmin, async (c: AuthContext) => {
  try {
    const result = await RateConfig.findOneAndDelete({ isGlobal: true });

    if (!result) {
      return c.json(
        {
          success: false,
          message: "ไม่พบการตั้งค่าอัตราส่วนกลาง",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "ลบอัตราส่วนกลางสำเร็จ",
    });
  } catch (error: any) {
    console.error("Delete global rate error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบอัตราส่วนกลาง",
      },
      500,
    );
  }
});

router.post("/rates/initialize", auth, authAdmin, async (c: AuthContext) => {
  try {
    await initializeDefaultRates();

    return c.json({
      success: true,
      message: "ตั้งค่าค่าธรรมเนียมเริ่มต้นสำเร็จ",
    });
  } catch (error: any) {
    console.error("Initialize rates error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตั้งค่าค่าธรรมเนียมเริ่มต้น",
      },
      500,
    );
  }
});

router.post("/rates/bulk", auth, authAdmin, async (c: AuthContext) => {
  try {
    const body = await c.req.json();
    const { rates } = body;

    if (!Array.isArray(rates) || rates.length === 0) {
      return c.json(
        {
          success: false,
          message: "กรุณาระบุรายการค่าธรรมเนียม",
        },
        400,
      );
    }

    const results = [];
    for (const rateData of rates) {
      const {
        productId,
        percentage,
        fixedAmount,
        customPrice,
        isActive,
        description,
        rateMultiplier,
      } = rateData;

      if (!productId) continue;

      let convertedPercentage = percentage;
      let convertedFixedAmount = fixedAmount;

      if (
        rateMultiplier !== undefined &&
        percentage === undefined &&
        fixedAmount === undefined
      ) {
        convertedPercentage = (rateMultiplier - 1) * 100;
        convertedFixedAmount = 0;
      }

      const updateData: any = {
        productId,
        ...(convertedPercentage !== undefined && {
          percentage: convertedPercentage,
        }),
        ...(convertedFixedAmount !== undefined && {
          fixedAmount: convertedFixedAmount,
        }),
        ...(customPrice !== undefined && { customPrice }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
        rateMultiplier: null,
      };

      const result = await RateConfig.findOneAndUpdate(
        { productId },
        updateData,
        { upsert: true, new: true },
      );

      results.push(result);
    }

    return c.json({
      success: true,
      message: "อัปเดตค่าธรรมเนียมจำนวนมากสำเร็จ",
      data: {
        updated_count: results.length,
        rates: results.map((rate) => ({
          productId: rate.productId,
          percentage: rate.percentage,
          fixedAmount: rate.fixedAmount,
          customPrice: rate.customPrice,
          isActive: rate.isActive,
          description: rate.description,
        })),
      },
    });
  } catch (error: any) {
    console.error("Bulk update rates error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตค่าธรรมเนียมจำนวนมาก",
      },
      500,
    );
  }
});

router.post("/calculate-price", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, originalPrice } = body;

    if (!productId || originalPrice === undefined) {
      return c.json(
        {
          success: false,
          message: "กรุณาระบุ productId และ originalPrice",
        },
        400,
      );
    }

    const finalPrice = await calculateProductPrice(
      Number(originalPrice),
      productId,
    );

    const specificConfig = await RateConfig.findOne({
      productId,
      isActive: true,
      isGlobal: false,
    });
    const globalConfig = await RateConfig.findOne({
      isGlobal: true,
      isActive: true,
    });

    return c.json({
      success: true,
      message: "คำนวณราคาสำเร็จ",
      data: {
        productId,
        originalPrice,
        finalPrice,
        specificConfig: specificConfig
          ? {
              percentage: specificConfig.percentage,
              fixedAmount: specificConfig.fixedAmount,
              customPrice: specificConfig.customPrice,
              isActive: specificConfig.isActive,
              description: specificConfig.description,
            }
          : null,
        globalConfig: globalConfig
          ? {
              percentage: globalConfig.percentage,
              fixedAmount: globalConfig.fixedAmount,
              customPrice: globalConfig.customPrice,
              isActive: globalConfig.isActive,
              description: globalConfig.description,
            }
          : null,
        savings: originalPrice - finalPrice,
        percentage:
          originalPrice > 0
            ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
            : 0,
        calculationType: "% + Fixed",
      },
    });
  } catch (error: any) {
    console.error("Calculate price error:", error);
    return c.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการคำนวณราคา",
      },
      500,
    );
  }
});

export default router;
