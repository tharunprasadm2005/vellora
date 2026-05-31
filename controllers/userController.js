const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.address = req.body.address ?? user.address;
    user.city = req.body.city ?? user.city;
    user.state = req.body.state ?? user.state;
    user.postalCode = req.body.postalCode ?? user.postalCode;
    user.paymentMethod = req.body.paymentMethod ?? user.paymentMethod;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      postalCode: updatedUser.postalCode,
      paymentMethod: updatedUser.paymentMethod,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jwt = require("jsonwebtoken");

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      "secretkey", // we will move to .env later
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        paymentMethod: user.paymentMethod,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
