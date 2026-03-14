import axios from "axios";
import { Hono } from "hono";
import "dotenv/config";

import buyProductRoutes from "./buy.product.js";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

// This route only handles products functionality
router.get("/products", async (c) => {
  try {
    const res = await axios.get(`${URL_API}/store/product`, {
      headers: {
        "x-api-key": WICKXSHOP_API_KEY,
      },
    });

    return c.json(res.data);
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

    return c.json(res.data);
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

export default router;