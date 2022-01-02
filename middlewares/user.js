const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  let token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(new CustomError("Login first to access this page.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let user = await User.findById(decoded.id);
  if (!user) {
    return next(new CustomError("Invalid token", 400));
  }

  req.user = user;
  next();
});

exports.customRole = (...roles) => {
  return BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!roles.includes(user.role)) {
      return next(
        new CustomError("You do not have access to this resource", 400)
      );
    }
    next();
  });
};
