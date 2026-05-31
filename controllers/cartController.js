const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res) => {
    try {
        const { productId, selectedColor, selectedRam, selectedVariant } = req.body;
        const quantity = Number(req.body.quantity) || 1;
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Please login first" });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product id is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let unitPrice = product.price || 0;

        const colorObj = product.colors?.find(c => c.color === selectedColor);
        if (colorObj?.price) unitPrice = colorObj.price;
        else if (colorObj?.priceModifier) unitPrice += colorObj.priceModifier;

        const ramObj = product.systemMemory?.find(m => m.ram === selectedRam);
        if (ramObj?.price) unitPrice = ramObj.price;
        else if (ramObj?.priceModifier) unitPrice += ramObj.priceModifier;

        const variantObj = product.variants?.find(v => v.variant === selectedVariant);
        if (variantObj?.price) unitPrice = variantObj.price;
        else if (variantObj?.priceModifier) unitPrice += variantObj.priceModifier;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId &&
                (item.selectedColor || "") === (selectedColor || "") &&
                (item.selectedRam || "") === (selectedRam || "") &&
                (item.selectedVariant || "") === (selectedVariant || "")
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = unitPrice;
        } else {
            cart.items.push({ 
                product: productId, 
                quantity,
                price: unitPrice,
                selectedColor,
                selectedRam,
                selectedVariant
            });
        }

        await cart.save();
        await cart.populate("items.product");

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.id
        );

        await cart.save();
        await cart.populate("items.product");

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity cannot be less than 1" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id.toString() === req.params.id
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate("items.product");
            res.json(cart);
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
