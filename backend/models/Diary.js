const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add description content'],
      trim: true,
    },
    mood: {
      type: String,
      required: [true, 'Please select your mood'],
      enum: ['ecstatic', 'happy', 'neutral', 'sad', 'stressed'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search on title and description
DiarySchema.index({ title: 'text', description: 'text' });

// Add index on user and date for faster filtered queries
DiarySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Diary', DiarySchema);
