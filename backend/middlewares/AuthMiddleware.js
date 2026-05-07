const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protectedRoute = async (req, res, next) => {
  try {
    // ✅ Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    next();

  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: err.message
    });
  }
};

// ✅ EXPORT
module.exports = protectedRoute;
