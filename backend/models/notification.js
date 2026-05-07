const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  read_at: {
    type: Date
  }
}, { timestamps: true });

// ✅ EXPORT (CommonJS)
module.exports = mongoose.model('Notification', NotificationSchema);
