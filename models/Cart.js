const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    selectedColor: {
        type: String,
    },
    selectedRam: {
        type: String,
    },
    selectedVariant: {
        type: String,
    },
});

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [cartItemSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);