const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Diary = require('../models/Diary');
const Reminder = require('../models/Reminder');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Admin Authorization Middleware (Strictly checks for admin email leeyank08@gmail.com)
const adminCheck = (req, res, next) => {
  const allowedAdmin = (process.env.ADMIN_EMAIL || 'leeyank08@gmail.com').toLowerCase();
  if (req.user && req.user.email && req.user.email.toLowerCase() === allowedAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access Denied: Admin privileges required.' });
};

// @desc    Get admin overview analytics & management lists
// @route   GET /api/admin/overview
// @access  Private (Admin Only)
router.get('/overview', protect, adminCheck, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEntries = await Diary.countDocuments();
    const totalReminders = await Reminder.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const totalAlerts = await Notification.countDocuments();

    // Get recent users
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(20);

    // Get recent feedback messages
    const feedbackList = await Feedback.find().sort({ createdAt: -1 }).limit(20);

    // Get recent diary entry mood breakdown for system-wide stats
    const moodCounts = await Diary.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } }
    ]);

    const moodDistribution = {
      ecstatic: 0,
      happy: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
    };

    moodCounts.forEach(m => {
      if (m._id && moodDistribution[m._id] !== undefined) {
        moodDistribution[m._id] = m.count;
      }
    });

    res.json({
      summary: {
        totalUsers,
        totalEntries,
        totalReminders,
        totalFeedback,
        totalAlerts,
      },
      moodDistribution,
      users,
      feedbackList,
    });
  } catch (err) {
    console.error('[ADMIN ROUTE ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch admin overview.' });
  }
});

// @desc    Delete user account (Admin function)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
router.delete('/users/:id', protect, adminCheck, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Diary.deleteMany({ user: userId });
    await Reminder.deleteMany({ user: userId });
    await Feedback.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });

    res.json({ message: 'User account and associated data removed successfully.' });
  } catch (err) {
    console.error('[ADMIN DELETE USER ERROR]', err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;
