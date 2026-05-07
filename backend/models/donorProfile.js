const mongoose = require('mongoose');

const DonorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability_status: {
    type: String,
    required: true
  },
  total_donations: {
    type: Number,
    default: 0
  },
  eligibility_date: {
    type: Date
  },
  badges: [
    {
      type: String
    }
  ]
}, { timestamps: true });

// ✅ EXPORT (CommonJS)
module.exports = mongoose.model('DonorProfile', DonorProfileSchema);
