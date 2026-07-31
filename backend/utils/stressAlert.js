const User = require('../models/User');
const Diary = require('../models/Diary');
const Notification = require('../models/Notification');
const { sendEmail, createEmailTemplate } = require('./mailer');

/**
 * Evaluates stress levels for users who have alerts enabled.
 * If consecutive/excessive stress entries are found in the last 7 days, creates a notification
 * and sends an email alert to the guardian email/user.
 */
async function checkStressLevels() {
  try {
    const threshold = parseInt(process.env.STRESS_THRESHOLD || '3', 10);
    const users = await User.find({ alertsEnabled: true });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const user of users) {
      const stressedEntries = await Diary.countDocuments({
        user: user._id,
        mood: 'stressed',
        date: { $gte: sevenDaysAgo }
      });

      if (stressedEntries >= threshold) {
        const msg = `Guardian Alert: ${user.name || 'User'} has logged ${stressedEntries} high-stress diary entries in the past 7 days.`;
        
        console.log(`[STRESS ALERT TRIGGERED] User: ${user.email} | Count: ${stressedEntries}`);

        // Record notification document in DB
        await Notification.create({
          user: user._id,
          type: 'stress',
          message: msg
        });

        // Target recipient: Guardian email if set, otherwise user's own email
        const targetEmail = user.guardianEmail || user.email;

        if (targetEmail) {
          const htmlContent = createEmailTemplate({
            title: '⚠️ Guardian Stress Alert Triggered',
            greeting: 'Guardian / Trusted Contact',
            badgeText: 'STRESS LEVEL MONITOR',
            bodyContent: `
              <p>This is an automated wellness notification from <strong>Dear Diary</strong>.</p>
              <p><strong>${user.name || 'Your ward'}</strong> has recorded <strong>${stressedEntries} high-stress journal entries</strong> over the past 7 days, exceeding your set alert threshold (${threshold}).</p>
              <p style="background: rgba(190, 18, 60, 0.15); border-left: 3px solid #be123c; padding: 12px 16px; border-radius: 6px; color: #fecdd3;">
                "We recommend reaching out to check in on them and offer support."
              </p>
            `,
            actionText: 'Open Dear Diary',
            actionUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          });

          await sendEmail({
            to: targetEmail,
            subject: `[Dear Diary Alert] Stress monitoring alert for ${user.name || user.email}`,
            html: htmlContent
          });
        }
      }
    }
  } catch (err) {
    console.error('Error executing stress level check:', err);
  }
}

module.exports = { checkStressLevels };
