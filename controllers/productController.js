const Product = require("../models/Product");

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      brand,
      category,
      description,
      specs,
      rating,
      numReviews,
      reviews,
      image,
      countInStock,
    } = req.body;

    const product = await Product.create({
      name,
      price,
      brand,
      category,
      description,
      specs,
      rating,
      numReviews,
      reviews,
      image,
      countInStock,
    });


    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (product) {
      const similarProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
      })
      .limit(5)
      .select('_id name price mrp image images discountPercent')
      .lean();

      product.similarProducts = similarProducts;

      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Product Review
exports.addProductReview = async (req, res) => {
  try {
    const { title, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = {
        title,
        rating: Number(rating),
        comment,
        reviewer: req.user.name || "User",
        verified: true,
        timeAgo: "Just now"
      };

      if (!product.customerReviews) {
        product.customerReviews = [];
      }
      product.customerReviews.unshift(review);

      product.numReviews = product.customerReviews.length;
      product.rating = product.customerReviews.reduce((acc, item) => item.rating + acc, 0) / product.customerReviews.length;

      // Round to 1 decimal place
      product.rating = Math.round(product.rating * 10) / 10;

      await product.save();

      res.status(201).json({ message: "Review added", review, name: req.user.name });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
