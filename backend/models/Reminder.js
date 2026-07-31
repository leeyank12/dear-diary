const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    default: '09:00',
  },
  type: {
    type: String,
    enum: ['birthday', 'anniversary', 'event', 'custom'],
    default: 'event',
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  recurring: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for efficient querying of upcoming reminders
reminderSchema.index({ user: 1, date: 1 });
reminderSchema.index({ date: 1, emailSent: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
