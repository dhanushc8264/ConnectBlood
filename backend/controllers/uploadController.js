const s3 = require('../utils/s3');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

// ✅ UPLOAD PROFILE
const handleProfileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded or invalid file type"
      });
    }

    const fileName = `profile-pics/${uuidv4()}-${req.file.originalname}`;

    // ✅ Upload to S3
    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();

    // ✅ Generate signed URL
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Expires: 60 * 5
    });

    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID not provided" });
    }

    await User.findByIdAndUpdate(userId, {
      profilePicture: signedUrl,
      profilePictureKey: fileName
    });

    return res.status(200).json({
      message: "Upload successful",
      s3Key: fileName,
      signedUrl
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      message: "Failed to upload",
      error: err.message
    });
  }
};

// ✅ GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Refresh signed URL
    if (user.profilePictureKey) {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.profilePictureKey,
        Expires: 60 * 5
      });

      user.profilePicture = signedUrl;
    }

    res.status(200).json({ user });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message
    });
  }
};

// ✅ EXPORT
module.exports = {
  handleProfileUpload,
  getUserProfile
};
