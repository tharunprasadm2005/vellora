const express = require("express");
const router = express.Router();
const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/:id", protect, removeFromWishlist);

module.exports = router;
