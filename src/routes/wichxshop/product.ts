import axios from "axios";
import { Hono } from "hono";
import "dotenv/config";

import buyProductRoutes from "./buy.product.js";
import rateAdminRoutes from "./rate.admin.js";
import { calculateProductPrice, RateConfig } from "./config.rate.js";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

router.get("/products", async (c) => {
  try {
    const res = await axios.get(`${URL_API}/store/product`, {
      headers: {
        "x-api-key": WICKXSHOP_API_KEY,
      },
    });

    const productsData = res.data;
    if (productsData.success && productsData.data) {
      const products = Array.isArray(productsData.data)
        ? productsData.data
        : productsData.data.products || [];

      const productsWithRates = await Promise.all(
        products.map(async (product: any) => {
          const originalPrice = product.price || product.productPrice || 0;
          const finalPrice = await calculateProductPrice(
            originalPrice,
            product.id || product.productId,
          );

          const specificConfig = await RateConfig.findOne({
            productId: product.id || product.productId,
            isActive: true,
            isGlobal: false,
          });
          const globalConfig = await RateConfig.findOne({
            isGlobal: true,
            isActive: true,
          });

          return {
            ...product,
            originalPrice,
            price: finalPrice,
            rateConfig: specificConfig
              ? {
                  percentage: specificConfig.percentage,
                  fixedAmount: specificConfig.fixedAmount,
                  customPrice: specificConfig.customPrice,
                  isActive: specificConfig.isActive,
                  description: specificConfig.description,
                }
              : globalConfig
                ? {
                    percentage: globalConfig.percentage,
                    fixedAmount: globalConfig.fixedAmount,
                    customPrice: globalConfig.customPrice,
                    isActive: globalConfig.isActive,
                    description: globalConfig.description,
                  }
                : null,
          };
        }),
      );

      if (Array.isArray(productsData.data)) {
        productsData.data = productsWithRates;
      } else if (productsData.data?.products) {
        productsData.data.products = productsWithRates;
      }
    }

    return c.json(productsData);
  } catch (error: any) {
    if (error.response) {
      return c.json(
        {
          success: false,
          message: error.response.data?.message || "API Error",
        },
        error.response.status,
      );
    }

    return c.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
});

router.get("/products/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const res = await axios.get(`${URL_API}/store/product/${id}`, {
      headers: {
        "x-api-key": WICKXSHOP_API_KEY,
      },
    });

    const productData = res.data;
    if (productData.success && productData.data) {
      const product = productData.data;
      const originalPrice = product.price || product.productPrice || 0;
      const finalPrice = await calculateProductPrice(
        originalPrice,
        product.id || product.productId,
      );

      const specificConfig = await RateConfig.findOne({
        productId: product.id || product.productId,
        isActive: true,
        isGlobal: false,
      });
      const globalConfig = await RateConfig.findOne({
        isGlobal: true,
        isActive: true,
      });

      productData.data = {
        ...product,
        originalPrice,
        price: finalPrice,
        rateConfig: specificConfig
          ? {
              percentage: specificConfig.percentage,
              fixedAmount: specificConfig.fixedAmount,
              customPrice: specificConfig.customPrice,
              isActive: specificConfig.isActive,
              description: specificConfig.description,
            }
          : globalConfig
            ? {
                percentage: globalConfig.percentage,
                fixedAmount: globalConfig.fixedAmount,
                customPrice: globalConfig.customPrice,
                isActive: globalConfig.isActive,
                description: globalConfig.description,
              }
            : null,
      };
    }

    return c.json(productData);
  } catch (error: any) {
    if (error.response) {
      return c.json(
        {
          success: false,
          message: error.response.data?.message || "API Error",
        },
        error.response.status,
      );
    }

    return c.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      500,
    );
  }
});

router.route("/", buyProductRoutes);
router.route("/", rateAdminRoutes);

export default router;
