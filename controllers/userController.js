const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !name || !password || !req.files) {
    return next(
      new CustomError("Name, email, password and photo are required.", 400)
    );
  }

  let result;
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Email and Password are mandatory", 400));
  }

  //get user from db.
  const user = await User.findOne({ email }).select("+password");

  //user is not found (email does not exist)
  if (!user) {
    return next(new CustomError("You are not registered", 400));
  }

  //password check
  const isPasswordCorrect = await user.IsValidatedPassword(password);

  //password do not match
  if (!isPasswordCorrect) {
    return next(new CustomError("Email or password does not exist.", 400));
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    msg: "logout successful",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Please provide your email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("No user exist with given email", 400));
  }

  const forgotPasswordToken = user.getPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotPasswordToken}`;

  const msg = `Copy & paste this link in your address bar and hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "tshirtStore - Password reset mail",
      msg,
    });

    res.status(200).json({
      status: "success",
      msg: "Instruction for changing your passoword has been sent to your registered email",
      email: user.email,
    });
  } catch (err) {
    (user.forgotPasswordToken = undefined),
      (user.forgotPasswordExpiry = undefined);
    await user.save({ validateBeforeSave: false });

    return next(new CustomError(err.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  let user = await User.findOne({
    forgotPasswordToken: encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid token or token expired", 400));
  }

  if (
    !req.body.password ||
    !req.body.confirmPassword ||
    req.body.password !== req.body.confirmPassword
  ) {
    return next(
      new CustomError("password and confirmPassword do not match", 400)
    );
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  let user = await User.findById({ _id: userId }).select("+password");

  const IsOldPasswordCorrect = user.IsValidatedPassword(req.body.oldPassword);

  if (!IsOldPasswordCorrect) {
    return next(new CustomError("Incorrect old password", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findById(req.user.id);

  if (req.files && req.files.photo !== "") {
    const imageId = user.photo.id;

    const resp = await cloudinary.uploader.destroy(imageId);
    let file = req.files.photo;

    let result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  } else {
    newData.photo = user.photo;
    console.log("inside");
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findById(req.user.id);

  //files not updated

  const updatedUser = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  const imageId = user.photo.id;

  await cloudinary.uploader.destroy(imageId);

  await User.deleteOne({ _id: user._id });
  // user.remove()

  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    users,
  });
});
