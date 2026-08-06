const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { sendEmail, createEmailTemplate } = require('../utils/mailer');

// GET current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE current user profile
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, profilePicture, guardianPhone, guardianEmail, birthday, email, alertsEnabled, reminderEnabled, reminderTime, reminderFreq } = req.body;

    if (name !== undefined) user.name = name;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (guardianPhone !== undefined) user.guardianPhone = guardianPhone;
    if (guardianEmail !== undefined) user.guardianEmail = guardianEmail;
    if (birthday !== undefined) user.birthday = birthday;
    if (email !== undefined) user.email = email;
    if (alertsEnabled !== undefined) user.alertsEnabled = alertsEnabled;
    if (reminderEnabled !== undefined) user.reminderEnabled = reminderEnabled;
    if (reminderTime !== undefined) user.reminderTime = reminderTime;
    if (reminderFreq !== undefined) user.reminderFreq = reminderFreq;

    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SEND TEST REMINDER EMAIL
router.post('/send-test-email', protect, async (req, res) => {
  try {
    const { targetEmail, reminderTime } = req.body;
    const recipient = targetEmail || req.user.email;
    const timeDisplay = reminderTime || '08:30 PM';

    const htmlContent = createEmailTemplate({
      title: '📔 Time to Write in Your Journal!',
      greeting: req.user.name || 'Friend',
      badgeText: 'JOURNAL WRITING REMINDER',
      bodyContent: `
        <p>This is your scheduled gentle reminder to take a moment for yourself today.</p>
        <p>Reflecting on your thoughts, emotions, and daily highlights helps clear your mind and track your emotional growth over time.</p>
        <p style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #7e22ce; padding: 12px 16px; border-radius: 6px; color: #e9d5ff;">
          <em>"Your journal is a safe, quiet space reserved just for you."</em>
        </p>
        <p style="font-size: 13px; color: #9ca3af;">Scheduled reminder set for: <strong>${timeDisplay}</strong></p>
      `,
      actionText: 'Write Today\'s Journal Entry',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/new-entry`
    });

    const result = await sendEmail({
      to: recipient,
      subject: `[Dear Diary] Gentle Journaling Reminder for ${req.user.name || 'today'}`,
      html: htmlContent
    });

    if (result.success) {
      res.json({
        message: `Email reminder sent to ${recipient}`,
        previewUrl: result.previewUrl || null
      });
    } else {
      res.status(500).json({ message: result.error || 'Failed to send email' });
    }
  } catch (err) {
    console.error('Error sending test reminder email:', err);
    res.status(500).json({ message: 'Server error sending email' });
  }
});

// SEND TEST GUARDIAN ALERT EMAIL (for testing stress alert delivery)
router.post('/test-guardian-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetEmail = req.body.targetEmail || user.guardianEmail || user.email;

    if (!targetEmail) {
      return res.status(400).json({ message: 'No guardian or user email configured.' });
    }

    const htmlContent = createEmailTemplate({
      title: '⚠️ Guardian Stress Alert — TEST',
      greeting: 'Guardian / Trusted Contact',
      badgeText: 'TEST ALERT — STRESS MONITOR',
      bodyContent: `
        <p>This is a <strong>test notification</strong> from <strong>Dear Diary</strong>.</p>
        <p><strong>${user.name || 'User'}</strong> has triggered a test of the Guardian Stress Alert system to verify email delivery is working correctly.</p>
        <p style="background: rgba(190, 18, 60, 0.15); border-left: 3px solid #be123c; padding: 12px 16px; border-radius: 6px; color: #fecdd3;">
          "This is NOT a real alert — just a delivery test. No action is needed."
        </p>
        <p style="font-size: 13px; color: #9ca3af;">When a real stress alert triggers (${process.env.STRESS_THRESHOLD || 3}+ stressed entries in 7 days), an email like this will be sent automatically.</p>
      `,
      actionText: 'Open Dear Diary',
      actionUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });

    const result = await sendEmail({
      to: targetEmail,
      subject: `[Dear Diary TEST] Guardian Stress Alert for ${user.name || user.email}`,
      html: htmlContent,
    });

    if (result.success) {
      res.json({ message: `Test guardian alert sent to ${targetEmail}` });
    } else {
      res.status(500).json({ message: result.error || 'Failed to send test guardian email' });
    }
  } catch (err) {
    console.error('Error sending test guardian email:', err);
    res.status(500).json({ message: 'Server error sending email' });
  }
});

module.exports = router;
