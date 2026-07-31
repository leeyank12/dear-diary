const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// GET all reminders for current user
router.get('/', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id })
      .sort({ date: 1 })
      .limit(50);
    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new reminder
router.post('/', protect, async (req, res) => {
  try {
    const { title, date, time, type, recurring } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      title,
      date: new Date(date),
      time: time || '09:00',
      type: type || 'event',
      recurring: !!recurring,
    });

    res.status(201).json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a reminder
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
