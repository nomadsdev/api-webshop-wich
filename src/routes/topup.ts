import { Hono } from "hono";
import { connectDB } from "../lib/mongodb.js";
import verifySlipRouter from "./topup/verifyslip.js";
import trueMoneyGiftRouter from "./topup/truemoney.gift.js";
import couponRouter from "./topup/coupon.js";

const router = new Hono();

router.route("/verifyslip", verifySlipRouter);
router.route("/truemoney", trueMoneyGiftRouter);
router.route("/coupon", couponRouter);

export default router;