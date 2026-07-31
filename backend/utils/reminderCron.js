const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendEmail, createEmailTemplate } = require('./mailer');

/**
 * Checks for reminders due today and sends email notifications.
 * Runs automatically via cron — no manual trigger needed.
 */
async function processReminders() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    // Find reminders due today that haven't been sent yet
    // Match reminders whose time hour matches (within the same hour window)
    const dueReminders = await Reminder.find({
      date: { $gte: todayStart, $lte: todayEnd },
      emailSent: false,
    }).populate('user', 'name email');

    // Filter by time — send if the reminder time hour matches current hour
    const readyReminders = dueReminders.filter(r => {
      const [rHour] = (r.time || '09:00').split(':');
      return rHour === currentHour;
    });

    if (readyReminders.length === 0) return;

    console.log(`[REMINDER CRON] Found ${readyReminders.length} reminder(s) to send at ${currentTime}`);

    for (const reminder of readyReminders) {
      const user = reminder.user;
      if (!user || !user.email) continue;

      const eventDate = new Date(reminder.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const typeEmojis = {
        birthday: '🎂',
        anniversary: '💍',
        event: '📅',
        custom: '📌',
      };

      const emoji = typeEmojis[reminder.type] || '📅';

      const htmlContent = createEmailTemplate({
        title: `${emoji} Reminder: ${reminder.title}`,
        greeting: user.name || 'Friend',
        badgeText: `${reminder.type.toUpperCase()} REMINDER`,
        bodyContent: `
          <p>This is your scheduled reminder from <strong>Dear Diary</strong>.</p>
          <p style="font-size: 18px; font-weight: 700; color: #ffffff;">
            ${emoji} ${reminder.title}
          </p>
          <p style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #7e22ce; padding: 12px 16px; border-radius: 6px; color: #e9d5ff;">
            <strong>Date:</strong> ${eventDate}<br/>
            <strong>Type:</strong> ${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
          </p>
          <p>Don't forget to mark this special moment in your journal!</p>
        `,
        actionText: 'Open Dear Diary',
        actionUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });

      const result = await sendEmail({
        to: user.email,
        subject: `[Dear Diary] ${emoji} Reminder: ${reminder.title}`,
        html: htmlContent,
      });

      if (result.success) {
        // Mark as sent
        reminder.emailSent = true;

        // If recurring (e.g., birthday), schedule for next year
        if (reminder.recurring) {
          const nextDate = new Date(reminder.date);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          reminder.date = nextDate;
          reminder.emailSent = false;
        }

        await reminder.save();
        console.log(`[REMINDER SENT] "${reminder.title}" → ${user.email}`);
      } else {
        console.error(`[REMINDER FAILED] "${reminder.title}" → ${user.email}:`, result.error);
      }
    }
  } catch (err) {
    console.error('[REMINDER CRON ERROR]', err);
  }
}

/**
 * Start the reminder cron job.
 * Runs every hour at minute 0 to check for due reminders.
 */
function startReminderCron() {
  // Run every hour at :00 — checks if any reminders are due this hour
  cron.schedule('0 * * * *', () => {
    console.log(`[REMINDER CRON] Checking for due reminders at ${new Date().toLocaleTimeString()}`);
    processReminders();
  });

  console.log('[REMINDER CRON] Scheduled — checks every hour for due event reminders.');

  // Also run once on startup to catch any missed reminders
  setTimeout(() => {
    console.log('[REMINDER CRON] Initial check on startup...');
    processReminders();
  }, 5000);
}

module.exports = { startReminderCron, processReminders };
