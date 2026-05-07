import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import axios from 'axios'

export const geocode = async(req,res)=>{
     // Geocoding functionality remains the same
  const {address} = req.query;
  if (!address) return res.status(400).json({ message: 'Address is required' });

  try{
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'LifeShare Blood Donation App'
      }
    });

    if (response.data.length > 0) {
      res.json(response.data[0]);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  }catch(err){
    res.status(500).json({ message: 'Geocoding failed', error: err.message });
  }

}

export const registerController = async(req,res) => {
  try {
      const {name, email, phoneNumber, password, blood_group, location} = req.body

      // Check if all required fields are present
      if(!name || !email || !phoneNumber || !password || !blood_group || !location) {
          return res.send({error: 'All fields are necessary'})
      }
      
      // Validate that location has the required structure
      if(!location.address || !location.coordinates || 
         !location.coordinates.latitude || !location.coordinates.longitude) {
          return res.send({error: 'Location must include address and coordinates (latitude/longitude)'})
      }

      // Validate phoneNumber
      if (!phoneNumber || phoneNumber.length === 0) {
        return res.status(400).send({
          success: false,
          message: 'Phone number is required',
        });
      }

      const existingUser = await User.findOne({email})

      if(existingUser) {
          return res.status(200).send({
              message: "Already registered please login"
          })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create new user with the location object format
      const newUser = new User({
          name, 
          email, 
          phoneNumber, 
          password: hashedPassword, 
          blood_group, 
          location: {
              address: location.address,
              coordinates: {
                  latitude: location.coordinates.latitude,
                  longitude: location.coordinates.longitude
              }
          }
      })

      await newUser.save()

      res.status(201).send({
          success: true,
          message: "User registered successfully",
          newUser
      })
  }
  catch(err) {
      console.log(err)
      res.status(500).send({
          success: false,
          message: 'Error in Registration',
          error: err.message
      })
  }
}

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "login credentials failed"
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not registered"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "wrong login credentials"
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    // Set token in an HttpOnly cookie
    res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
});

    return res.status(201).send({
      success: true,
      message: "login success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({
      success: false,
      message: "Failed to login",
      error: err.message
    })
  }
}

export const updateLocation = async(req,res)=>{
  try {
    const {latitude, longitude} = req.body;
    
    // Convert to numbers and validate
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid latitude and longitude values required" 
      });
    }
    
    // Log debug info
    console.log("Update request for user:", req.user._id);
    console.log("Location data:", {lat, lng});
    
    // Use _id not id, and ensure path matches your schema
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'location': {
            latitude: lat,
            longitude: lng
          }
        }
      },
      {new: true}
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log("Updated user:", updatedUser._id);
    console.log("New location:", updatedUser.location);
    
    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: updatedUser.location,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      }
    });
  }
  catch(err) {
    console.error("Location update error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update location", 
      error: err.message 
    });
  }
}