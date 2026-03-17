import { Hono } from "hono";
import userRoutes from "./admin/user.js";
import balanceRoutes from "./admin/balance.js";
import overviewRoutes from "./admin/overview.js";

const router = new Hono();

router.route("/", userRoutes);
router.route("/", balanceRoutes);
router.route("/", overviewRoutes);

export default router;
