const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    default: 'Anonymous User',
  },
  userEmail: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'bug', 'feature', 'appreciation'],
    default: 'general',
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
