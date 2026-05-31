const express = require("express");
const router = express.Router();
const {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/:id", protect, removeFromCart);
router.put("/:id", protect, updateCartItem);

module.exports = router;