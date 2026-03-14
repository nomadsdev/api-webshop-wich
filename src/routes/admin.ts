import { Hono } from "hono";
import userRoutes from "./admin/user.js";
import balanceRoutes from "./admin/balance.js";

const router = new Hono();

router.route("/", userRoutes);
router.route("/", balanceRoutes);

export default router;
