const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const s3 = require('../utils/s3');

// ✅ GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ✅ Generate signed URL (skip in test)
    if (process.env.NODE_ENV !== 'test' && user.profilePictureKey) {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.profilePictureKey,
        Expires: 60 * 5
      });

      user.profilePicture = signedUrl;
    }

    return res.status(200).json(user);

  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ✅ UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ✅ update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.blood_group = req.body.blood_group || user.blood_group;
    user.location = req.body.location || user.location;
    user.health_status = req.body.health_status || user.health_status;
    user.last_donation_date =
      req.body.last_donation_date || user.last_donation_date;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toObject({
        getters: true,
        versionKey: false
      })
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating profile"
    });
  }
};

// ✅ CHANGE PASSWORD
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "New passwords do not match"
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({
      message: "Error changing password"
    });
  }
};

// ✅ EXPORT EVERYTHING
module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword
};
