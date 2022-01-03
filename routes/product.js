const express = require("express");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const {
  addProduct,
  getAllProduct,
  getOneProduct,
  adminGetAllProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productController");

//user routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getOnlyReviewsForOneProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/products")
  .post(isLoggedIn, customRole("admin"), adminGetAllProduct);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteProduct);

module.exports = router;
