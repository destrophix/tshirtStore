const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide product name"],
    trim: true,
    maxlength: [120, "Product name should not be more than 120 characters."],
  },

  price: {
    type: Number,
    required: [true, "Please provide product price"],
    maxlength: [5, "Product price should not be more than 1000000"],
  },

  description: {
    type: String,
    required: [true, "Please provide product description"],
  },

  photo: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [
      true,
      "Please select product category from shortsleeves, longsleeves, sweatshirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "Please select product category only from shortsleeves, longsleeves, sweatshirts, hoodies",
    },
  },

  brand: {
    type: String,
    required: [true, "Please provide the brand of the product."],
  },

  stock: {
    type: Number,
    required: true,
  },

  rating: {
    type: Number,
    default: 0,
  },

  numberOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User object is required"],
      },
      name: {
        type: String,
        required: [true, "Name of reviewer is required"],
      },
      rating: {
        type: Number,
        required: [true, "Please provide the rating for the review"],
      },
      comment: {
        type: String,
        required: [true, "Please provide the comment"],
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
