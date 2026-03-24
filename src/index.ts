import { serve } from "@hono/node-server";
import { Hono } from "hono";
import authRoutes from "./routes/auth.js";
import topupRoutes from "./routes/topup.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/wichxshop/product.js";
import statusRoutes from "./routes/status.js";
import profileRoutes from "./routes/profile.js";
import imageSlideRoutes from "./routes/imageslide.js";
import notifyRoutes from "./routes/notify.js";
import AdminConfigRateRoutes from "./routes/wichxshop/rate.admin.js";
import wichxshopRoutes from "./routes/wichxshop/wichxshop.js";

import { corsMiddleware } from "./middleware/cors.js";
import { connectDB } from "./lib/mongodb.js";

const app = new Hono();

app.use("/*", corsMiddleware);

app.route("/api/v1/product", productRoutes);
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/topup", topupRoutes);
app.route("/api/v1/status", statusRoutes);
app.route("/api/v1/profile", profileRoutes);
app.route("/api/v1", adminRoutes);
app.route("/api/v1/imageslides", imageSlideRoutes);
app.route("/api/v1/notify", notifyRoutes);
app.route("/api/v1/wichxshop/admin", AdminConfigRateRoutes);
app.route("/api/v1/services", wichxshopRoutes);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    serve(
      {
        fetch: app.fetch,
        port: Number(process.env.PORT) || 5000,
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
      },
    );
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
