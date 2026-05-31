const express = require("express");
const { placeOrder, getMyOrders } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Place order
router.post("/", protect, placeOrder);

// Get my orders
router.get("/", protect, getMyOrders);

module.exports = router;