const express = require("express");
const {
  addProduct,
  getProducts,
  getProductById,
  addProductReview,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add product (protected)
router.post("/", protect, addProduct);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Add product review
router.post("/:id/reviews", protect, addProductReview);

module.exports = router;