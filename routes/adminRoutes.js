const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  getOrders,
  updateOrderStatus,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminController");

router.route("/orders").get(protect, admin, getOrders);
router.route("/orders/:id/status").put(protect, admin, updateOrderStatus);

router.route("/products/:id")
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
