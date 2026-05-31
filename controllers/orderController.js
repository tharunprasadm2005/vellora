const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponDiscount = 0 } = req.body;

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Please provide delivery details and payment method",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price || item.product.price || 0,
      selectedColor: item.selectedColor,
      selectedRam: item.selectedRam,
      selectedVariant: item.selectedVariant,
    }));

    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + (item.price || item.product.price || 0) * item.quantity,
      0
    );

    // --- UPDATED LOGIC ---
    // Set taxPrice to 0 to satisfy Mongoose 'required' validation
    const taxPrice = 0; 
    const shippingPrice = itemsPrice > 999 || itemsPrice === 0 ? 0 : 99;
    const totalPrice = itemsPrice + taxPrice + shippingPrice - couponDiscount;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      itemsPrice,
      taxPrice, // Added back as 0
      shippingPrice,
      couponDiscount,
      totalPrice, // Now effectively itemsPrice + shippingPrice - couponDiscount
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};