const Wishlist = require("../models/Wishlist");

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                items: [],
            });
        }

        const itemIndex = wishlist.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            return res.json(wishlist);
        } else {
            wishlist.items.push({ product: productId });
        }

        await wishlist.save();
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id })
            .populate("items.product");
            
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (wishlist) {
            wishlist.items = wishlist.items.filter(
                (item) => item.product.toString() !== req.params.id
            );
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
