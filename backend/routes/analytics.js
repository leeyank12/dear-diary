const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Diary = require('../models/Diary');
const { protect } = require('../middleware/auth');

// Apply protection middleware to all analytics routes
router.use(protect);

// @desc    Get dashboard summary statistics & mood aggregation data
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Total entries count
    const totalEntries = await Diary.countDocuments({ user: userId });

    if (totalEntries === 0) {
      return res.json({
        totalEntries: 0,
        mostCommonMood: 'none',
        weeklyEntriesCount: 0,
        moodVarietyCount: 0,
        moodDistribution: [],
        weeklyTrend: [],
        monthlyTrend: [],
      });
    }

    // 2. Mood distribution (group by mood)
    const moodDistribution = await Diary.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $project: { mood: '$_id', count: 1, _id: 0 } },
    ]);

    // 3. Most common mood
    let mostCommonMood = 'neutral';
    if (moodDistribution.length > 0) {
      const sortedMoods = [...moodDistribution].sort((a, b) => b.count - a.count);
      mostCommonMood = sortedMoods[0].mood;
    }

    // 4. Mood variety count (number of unique moods logged)
    const moodVarietyCount = moodDistribution.length;

    // 5. Weekly entries count (entries in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyEntriesCount = await Diary.countDocuments({
      user: userId,
      date: { $gte: sevenDaysAgo },
    });

    // 6. Weekly mood trend over the last 7 days (grouped by formatted date and mood)
    const weeklyTrend = await Diary.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $project: {
          formattedDate: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          mood: 1,
        },
      },
      {
        $group: {
          _id: { date: '$formattedDate', mood: '$mood' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          moods: {
            $push: {
              mood: '$_id.mood',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          moods: 1,
          _id: 0,
        },
      },
    ]);

    // 7. Monthly mood trend over the last 30 days (grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyTrend = await Diary.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $project: {
          formattedDate: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          mood: 1,
        },
      },
      {
        $group: {
          _id: { date: '$formattedDate', mood: '$mood' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          moods: {
            $push: {
              mood: '$_id.mood',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          moods: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      totalEntries,
      mostCommonMood,
      weeklyEntriesCount,
      moodVarietyCount,
      moodDistribution,
      weeklyTrend,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
