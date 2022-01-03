const express = require("express");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

const {
  sendRazorpayKey,
  sendStripeKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey);

//payment processing
router
  .route("/captureRazorpayPayment")
  .post(isLoggedIn, captureRazorpayPayment);
router.route("/captureStripePayment").post(isLoggedIn, captureStripePayment);

module.exports = router;
