import { Hono } from "hono";
import verifySlipRouter from "./topup/verifyslip.js";
import trueMoneyGiftRouter from "./topup/truemoney.gift.js";
import couponRouter from "./topup/coupon.js";

const router = new Hono();

router.route("/verifyslip", verifySlipRouter);
router.route("/truemoney", trueMoneyGiftRouter);
router.route("/coupon", couponRouter);

export default router;
