const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "Electronics",
      trim: true,
    },
    description: {
      type: String,
    },
    specs: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    customerReviews: [
      {
        title: { type: String },
        comment: { type: String },
        rating: { type: Number },
        reviewer: { type: String },
        verified: { type: Boolean, default: true },
        timeAgo: { type: String, default: "Just now" },
      }
    ],
    image: {
      type: String,
    },
    countInStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("Product", productSchema);
