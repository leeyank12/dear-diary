const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendEmail, createEmailTemplate } = require('../utils/mailer');

// Apply protection middleware to all diary routes
router.use(protect);

// @desc    Get all diary entries for logged-in user with filtering & pagination
// @route   GET /api/diary
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, mood, startDate, endDate, page = 1, limit = 9 } = req.query;
    
    // Construct query object
    const query = { user: req.user.id };

    // Search query (using text search index or regex fallback)
    if (search) {
      query.$text = { $search: search };
    }

    // Mood filtering
    if (mood) {
      query.mood = mood;
    }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end of day for the endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Pagination setup
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch entries
    const entries = await Diary.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skipIndex);

    // Get total count for pagination metadata
    const total = await Diary.countDocuments(query);

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single diary entry
// @route   GET /api/diary/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const entry = await Diary.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new diary entry
// @route   POST /api/diary
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, mood, date } = req.body;

    if (!title || !description || !mood) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const entry = new Diary({
      title,
      description,
      mood,
      date: date || new Date(),
      user: req.user.id,
    });

    const savedEntry = await entry.save();
    res.status(201).json(savedEntry);

    // Non-blocking stress level check after creating entry
    if (savedEntry.mood === 'stressed') {
      checkUserStress(req.user.id).catch(err => 
        console.error('[STRESS CHECK] Error:', err)
      );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update diary entry
// @route   PUT /api/diary/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, description, mood, date } = req.body;

    let entry = await Diary.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    // Update fields
    entry.title = title || entry.title;
    entry.description = description || entry.description;
    entry.mood = mood || entry.mood;
    entry.date = date || entry.date;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete diary entry
// @route   DELETE /api/diary/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Diary.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    res.json({ message: 'Diary entry removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check stress levels for a specific user after diary entry creation
async function checkUserStress(userId) {
  try {
    const threshold = parseInt(process.env.STRESS_THRESHOLD || '3', 10);
    const user = await User.findById(userId);
    
    if (!user || !user.alertsEnabled) {
      console.log('[STRESS CHECK] Alerts not enabled for user, skipping.');
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stressedCount = await Diary.countDocuments({
      user: userId,
      mood: 'stressed',
      date: { $gte: sevenDaysAgo }
    });

    console.log(`[STRESS CHECK] User: ${user.email} | Stressed entries (7d): ${stressedCount} | Threshold: ${threshold}`);

    if (stressedCount >= threshold) {
      // Check if we already sent an alert in the last 24 hours to avoid spamming
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const recentAlert = await Notification.findOne({
        user: userId,
        type: 'stress',
        createdAt: { $gte: oneDayAgo }
      });

      if (recentAlert) {
        console.log('[STRESS CHECK] Alert already sent in last 24h, skipping.');
        return;
      }

      const msg = `Guardian Alert: ${user.name || 'User'} has logged ${stressedCount} high-stress diary entries in the past 7 days.`;
      console.log(`[STRESS ALERT TRIGGERED] ${msg}`);

      // Save notification to DB
      await Notification.create({
        user: userId,
        type: 'stress',
        message: msg
      });

      // Send email to guardian or user
      const targetEmail = user.guardianEmail || user.email;
      if (targetEmail) {
        const htmlContent = createEmailTemplate({
          title: '⚠️ Guardian Stress Alert Triggered',
          greeting: 'Guardian / Trusted Contact',
          badgeText: 'STRESS LEVEL MONITOR',
          bodyContent: `
            <p>This is an automated wellness notification from <strong>Dear Diary</strong>.</p>
            <p><strong>${user.name || 'Your ward'}</strong> has recorded <strong>${stressedCount} high-stress journal entries</strong> over the past 7 days, exceeding the alert threshold (${threshold}).</p>
            <p style="background: rgba(190, 18, 60, 0.15); border-left: 3px solid #be123c; padding: 12px 16px; border-radius: 6px; color: #fecdd3;">
              "We recommend reaching out to check in on them and offer support."
            </p>
          `,
          actionText: 'Open Dear Diary',
          actionUrl: process.env.CLIENT_URL || 'http://localhost:5173'
        });

        const result = await sendEmail({
          to: targetEmail,
          subject: `[Dear Diary Alert] Stress monitoring alert for ${user.name || user.email}`,
          html: htmlContent
        });
        
        console.log(`[STRESS ALERT EMAIL] Sent to ${targetEmail}:`, result.success ? 'SUCCESS' : 'FAILED');
      }
    }
  } catch (err) {
    console.error('[STRESS CHECK ERROR]', err);
  }
}

module.exports = router;
