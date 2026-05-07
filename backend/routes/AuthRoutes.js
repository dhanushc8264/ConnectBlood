const express = require('express');

const protectedRoute = require('../middlewares/AuthMiddleware');
const {
  registerController,
  loginController,
  updateLocation,
  geocode
} = require('../controllers/AuthController');
const User = require('../models/userModel');

const router = express.Router();

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/profile', protectedRoute, (req, res) => {
  res.json({ success: true, message: "User authenticated", user: req.user });
});

router.get('/getUserById/:id', protectedRoute, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/check', protectedRoute, (req, res) => {
  console.log("Authenticated user:", req.user);
  res.status(200).json({ success: true, user: req.user });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

router.patch('/update-location', protectedRoute, updateLocation);

router.get('/geocode', geocode);

// ✅ IMPORTANT EXPORT
module.exports = router;
