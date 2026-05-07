const express = require('express');

const {
  changePassword,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userProfile');

const protectedRoute = require('../middlewares/AuthMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

//  Get user profile
router.get('/profile', protectedRoute, getUserProfile);

//  Update user profile
router.put('/update', protectedRoute, updateUserProfile);

//  Change password
router.put('/change-password', protectedRoute, changePassword);

//  Upload profile picture (if needed later)
// router.post('/upload', protectedRoute, upload.single('profilePic'), uploadProfilePicture);

//  EXPORT
module.exports = router;
