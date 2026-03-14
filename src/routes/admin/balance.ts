import axios from "axios";
import { Hono } from "hono";
import "dotenv/config";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

router.get("/balance", async (c) => {
  try {
    const res = await axios.get(`${URL_API}/balance`, {
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

export default router;