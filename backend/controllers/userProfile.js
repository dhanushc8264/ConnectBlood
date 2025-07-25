import User from "../models/userModel.js"
import bcrypt from 'bcrypt'
import s3 from "../utils/s3.js";

//getting User profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If a profile picture exists, generate signed URL
    if (user.profilePictureKey) {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.profilePictureKey,
        Expires: 60 * 5, // 5 minutes
      });

      user.profilePicture = signedUrl; // Attach the image URL to the user object
    }

    return res.status(200).json(user); // or { user } if you want to wrap
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


//update
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if provided
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.blood_group = req.body.blood_group || user.blood_group;
        user.location = req.body.location || user.location;
        user.health_status = req.body.health_status || user.health_status;
        user.last_donation_date = req.body.last_donation_date || user.last_donation_date;

        await user.save();
        res.json({ message: "Profile updated successfully",  user: user.toObject({ getters: true, versionKey: false }) });//excludes password
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

export const changePassword = async(req,res)=>{

    const {currentPassword , newPassword , confirmPassword} = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
    }

    try{
            
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword , user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword , salt)

        await user.save()

        res.json({message : "password changed succesfully"})
    }
    catch(err)
    {
        console.log("error",err)
        res.status(500).json({ message: "Error changing password" });
    }
}