const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  //images
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("Please uploda the product images", 400));
  }

  for (let index = 0; index < req.files.photos.length; index++) {
    let result = await cloudinary.uploader.upload(
      req.files.photos[index].tempFilePath,
      {
        folder: "products",
      }
    );

    imageArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const productCount = await Product.countDocuments();

  let productObj = new WhereClause(Product.find(), req.query).search().filter();
  let products = await productObj.base;
  const filteredProductNumber = products.length;

  productObj.pager(resultPerPage);
  products = await productObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    productCount,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found", 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.comment = comment), (rev.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // calculate ratings
  product.ratings =
    product.reviews.reduce((sum, item) => item.rating + sum, 0) /
    product.reviews.length;

  await product.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const productId = req.query.id;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("product not found", 400));
  }

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (!alreadyReviewed) {
    return next(new CustomError("you have not reviewed the product yet.", 400));
  }

  product.reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );

  product.numberOfReviews -= 1;

  product.ratings =
    product.reviews.reduce((sum, item) => item.rating + sum, 0) /
    product.reviews.length;

  await product.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
    msg: "review deleted",
  });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new CustomError("product does not exist", 400));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  let product = Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found", 400));
  }

  if (req.files && req.files.photos !== "") {
    //destroy the images
    for (let index = 0; index < product.photos.length; index++) {
      let imageId = product.photos[index].id;

      const res = await cloudinary.uploader.destroy(imageId);
    }

    //upload the images
    let imageArray = [];

    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = imageArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found", 400));
  }

  console.log("product is", product);

  for (let index = 0; index < product.photos.length; index++) {
    let imageId = product.photos[index].id;

    await cloudinary.uploader.destroy(imageId);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    msg: "product was deleted",
  });
});
