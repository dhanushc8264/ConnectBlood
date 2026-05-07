const express = require('express');

const upload = require('../middlewares/uploadMiddleware');
const { handleProfileUpload } = require('../controllers/uploadController');
const protectedRoute = require('../middlewares/AuthMiddleware');

const router = express.Router();

// ✅ Upload profile image
router.post(
  '/upload-profile',
  protectedRoute,
  upload.single('avatar'),
  handleProfileUpload
);

// ✅ EXPORT
module.exports = router;
