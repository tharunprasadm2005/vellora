const mongoose = require("mongoose");

const wishlistItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
});

const wishlistSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [wishlistItemSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
