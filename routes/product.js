const express = require("express");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const { testProduct } = require("../controllers/productController");

router.route("/product").get(testProduct);

module.exports = router;
