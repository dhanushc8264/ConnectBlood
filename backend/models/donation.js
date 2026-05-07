const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
  donation_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'pending'
  }
  // ✅ Optional (keep if needed)
  // city: {
  //   type: String,
  //   required: true
  // }
}, { timestamps: true });

// ✅ EXPORT (CommonJS)
module.exports = mongoose.model('Donation', DonationSchema);
