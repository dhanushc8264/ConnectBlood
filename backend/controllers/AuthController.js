const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const axios = require('axios');

//  GEOCODE
const geocode = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }

  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'LifeShare Blood Donation App'
        }
      }
    );

    if (response.data.length > 0) {
      res.json(response.data[0]);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }

  } catch (err) {
    res.status(500).json({
      message: 'Geocoding failed',
      error: err.message
    });
  }
};

//  REGISTER
const registerController = async (req, res) => {
  try {
    const { name, email, phone, password, blood_group, location } = req.body;

    if (!name || !email || !phone || !password || !blood_group || !location) {
      return res.status(400).send({ error: 'All fields are necessary' });
    }

    if (
      !location.address ||
      !location.coordinates ||
      !location.coordinates.latitude ||
      !location.coordinates.longitude
    ) {
      return res.status(400).send({
        error: 'Location must include address and coordinates (latitude/longitude)'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).send({
        message: "Already registered please login"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      blood_group,
      location: {
        address: location.address,
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude
        }
      }
    });

    await newUser.save();

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      newUser
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: 'Error in Registration',
      error: err.message
    });
  }
};

//  LOGIN
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "login credentials failed"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not registered"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "wrong login credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).send({
      success: true,
      message: "login success"
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Failed to login",
      error: err.message
    });
  }
};

//  UPDATE LOCATION
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude values required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          location: {
            latitude: lat,
            longitude: lng
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: updatedUser.location
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: err.message
    });
  }
};

//  EXPORT ALL FUNCTIONS
module.exports = {
  geocode,
  registerController,
  loginController,
  updateLocation
};
