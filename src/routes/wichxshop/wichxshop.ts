import { Hono } from "hono";
import claimRoutes from "./claim.js";
import otpRoutes from "./otp.netflix.js";

const router = new Hono();

router.route("/", claimRoutes);
router.route("/", otpRoutes);

export default router;