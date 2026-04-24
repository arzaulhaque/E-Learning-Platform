const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * @desc  Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields.
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email and password",
    });
  }

  try {
    // Prevent duplicate accounts.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    }

    // Create the user — password hashing is handled by the pre-save hook.
    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Authenticate a user and return a JWT
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields.
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  try {
    // Explicitly select password because the schema hides it by default.
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };
