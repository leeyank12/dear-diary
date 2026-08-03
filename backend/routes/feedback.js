const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, createEmailTemplate } = require('../utils/mailer');

// @desc    Submit feedback & email it to admin using configured SMTP
// @route   POST /api/feedback
// @access  Private / Public
router.post('/', async (req, res) => {
  try {
    const { message, category = 'general', userEmail: bodyEmail, userName: bodyName } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Feedback message cannot be empty.' });
    }

    let userId = null;
    let userName = bodyName || 'Valued User';
    let userEmail = bodyEmail || 'user@example.com';

    // If request contains Bearer auth token, attach real user details
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id;
          userName = user.name || bodyName || userName;
          userEmail = user.email || bodyEmail || userEmail;
        }
      } catch (e) {
        // Token optional or invalid; proceed with body email
      }
    }

    // 1. Save feedback to MongoDB Atlas
    const newFeedback = await Feedback.create({
      user: userId,
      userName,
      userEmail,
      category,
      message,
    });

    // 2. Send email via SMTP / Resend to app admin (ADMIN_EMAIL / SMTP_USER / fallback)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'itsdiary000@gmail.com';
    
    const categoryLabels = {
      general: '💬 General Feedback',
      bug: '🐛 Bug Report',
      feature: '✨ Feature Suggestion',
      appreciation: '❤️ Appreciation / Praise',
    };

    const categoryText = categoryLabels[category] || '💬 General Feedback';

    const htmlContent = createEmailTemplate({
      title: `New Feedback Received (${category.toUpperCase()})`,
      greeting: 'Dear Diary Admin',
      badgeText: 'USER FEEDBACK SYSTEM',
      bodyContent: `
        <p>You received new feedback from a user on <strong>Dear Diary</strong>.</p>
        <div style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #7e22ce; padding: 14px 18px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 700; color: #f4e4c1;">${categoryText}</p>
          <p style="margin: 0; font-size: 15px; color: #ffffff; white-space: pre-wrap;">"${message}"</p>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 12px;">
          <strong>From:</strong> ${userName} (&lt;${userEmail}&gt;)<br/>
          <strong>Submitted At:</strong> ${new Date().toLocaleString()}
        </p>
      `,
      actionText: 'View Dashboard',
      actionUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });

    // 2. Respond immediately to user UI (Non-blocking response)
    res.status(201).json({
      message: 'Thank you! Your feedback has been sent directly to our team via email.',
      feedback: newFeedback,
    });

    // 3. Dispatch SMTP email to admin inbox in background
    sendEmail({
      to: adminEmail,
      subject: `[Dear Diary Feedback] ${categoryText} from ${userName}`,
      html: htmlContent,
    }).then(mailResult => {
      console.log(`[FEEDBACK] Email dispatch to ${adminEmail}: ${mailResult.success ? 'SUCCESS' : 'FAILED'}`);
    }).catch(err => {
      console.error('[FEEDBACK EMAIL ERROR]', err);
    });
  } catch (err) {
    console.error('[FEEDBACK ROUTE ERROR]', err);
    res.status(500).json({ message: 'Failed to process feedback.' });
  }
});

module.exports = router;
