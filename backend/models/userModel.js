const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  blood_group: {
    type: String,
    required: true
  },

  // ✅ Profile Picture
  profilePicture: {
    type: String,
    default: null
  },
  profilePictureKey: {
    type: String,
    default: null
  },

  // ✅ Location
  location: {
    type: {
      latitude: {
        type: Number,
        default: 0
      },
      longitude: {
        type: Number,
        default: 0
      }
    },
    default: {
      latitude: 0,
      longitude: 0
    }
  },

  is_active: {
    type: Boolean,
    default: true
  },
  last_donation_date: {
    type: Date,
    default: null
  },
  health_status: {
    type: String,
    default: ''
  }

}, { timestamps: true });

// ✅ EXPORT (CommonJS)
module.exports = mongoose.model('User', UserSchema);
