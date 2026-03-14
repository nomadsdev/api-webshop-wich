import axios from "axios";
import { Hono } from "hono";
import "dotenv/config";

const router = new Hono();

const WICKXSHOP_API_KEY = process.env.WICKXSHOP_API_KEY;
const URL_API = "https://wichxshop.com/api/v1";

router.get("/netflix-otp", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json(
        {
          success: false,
          message: "email is required",
        },
        400,
      );
    }

    const res = await axios.get(`${URL_API}/tools/netflix-otp`, {
      headers: {
        "x-api-key": WICKXSHOP_API_KEY,
      },
      params: {
        email,
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