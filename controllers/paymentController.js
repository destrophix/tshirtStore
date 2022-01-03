const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const Razorpay = require("razorpay");
const BigPromise = require("../middlewares/bigPromise");

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    //optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    razorpay_key: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  let instance = new Razorpay({
    key_id: RAZORPAY_API_KEY,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  let options = {
    amount: req.body.amount * 100,
    currency: "INR",
  };

  const myOrder = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    myOrder,
  });
});
