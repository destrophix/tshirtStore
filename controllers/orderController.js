const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("orer id is invalid", 400));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInUserOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) {
    return next(new CustomError("order id is invalid", 400));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return next(new CustomError("orer id is invalid", 400));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOneOrder = BigPromise(async (req, res, next) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("orer id is invalid", 400));
  }

  if (order.orderStatus === "delivered") {
    return next(new CustomError("order is already delivered", 401));
  }

  order.orderStatus = orderStatus;

  await order.orderItems.forEach(async (item) => {
    await updateProductStock(item.product, item.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("order id is invalid", 400));
  }

  await order.remove();

  res.status(200).json({
    success: true,
    msg: "order deleted",
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock -= quantity;
  await product.save();
}
