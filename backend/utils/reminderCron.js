const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Diary = require('../models/Diary');
const { sendEmail, createEmailTemplate } = require('./mailer');

/**
 * Helper to get normalized HH string from time format (e.g. "20:30" -> 20, "9:00" -> 9, "09:00" -> 9)
 */
function parseHour(timeStr) {
  if (!timeStr) return 20; // default 8 PM
  const parts = String(timeStr).trim().split(':');
  const hour = parseInt(parts[0], 10);
  return isNaN(hour) ? 20 : hour;
}

/**
 * 1. Process Daily Journal Writing Reminders (User Profile Settings)
 * Checks users who have reminderEnabled = true and whose scheduled time hour matches current hour.
 */
async function processDailyJournalReminders() {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Mon, ..., 6 = Sat

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find all users with reminders enabled
    const users = await User.find({
      $or: [
        { reminderEnabled: true },
        { reminderEnabled: { $exists: false } } // Default to true if field missing
      ]
    });

    if (!users || users.length === 0) return;

    for (const user of users) {
      if (!user.email) continue;

      // Check if reminder was already sent today
      if (user.lastDailyReminderSent) {
        const lastSent = new Date(user.lastDailyReminderSent);
        const lastSentStart = new Date(lastSent.getFullYear(), lastSent.getMonth(), lastSent.getDate());
        if (lastSentStart.getTime() === todayStart.getTime()) {
          // Already sent today
          continue;
        }
      }

      // Check scheduled hour
      const scheduledHour = parseHour(user.reminderTime || '20:30');
      if (scheduledHour !== currentHour) {
        continue;
      }

      // Check frequency (daily, weekdays, weekly)
      const freq = (user.reminderFreq || 'daily').toLowerCase();
      if (freq === 'weekdays' && (currentDayOfWeek === 0 || currentDayOfWeek === 6)) {
        // Skip weekend if set to weekdays only
        continue;
      }
      if (freq === 'weekly' && currentDayOfWeek !== 0) {
        // Skip non-Sundays if set to weekly
        continue;
      }

      console.log(`[DAILY DIARY CRON] Sending daily writing prompt to ${user.email} (${user.name || 'User'})`);

      const htmlContent = createEmailTemplate({
        title: '📔 Time for Your Daily Reflections!',
        greeting: user.name || 'Friend',
        badgeText: 'DAILY JOURNAL REMINDER',
        bodyContent: `
          <p>This is your gentle scheduled reminder from <strong>Dear Diary</strong> to take a quiet moment for yourself today.</p>
          <p>Reflecting on your experiences, thoughts, and emotions helps clear your mind and track your mood journey over time.</p>
          <div style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #7e22ce; padding: 14px 18px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; font-size: 15px; color: #f4e4c1; font-style: italic;">
              "Journaling is the voice of the soul on paper."
            </p>
          </div>
          <p>Write today's entry while the memories are fresh!</p>
        `,
        actionText: 'Open Dear Diary',
        actionUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });

      const result = await sendEmail({
        to: user.email,
        subject: `📔 Dear Diary — Time to write your daily reflections!`,
        html: htmlContent,
      });

      if (result.success) {
        user.lastDailyReminderSent = new Date();
        await user.save();
        console.log(`[DAILY DIARY SENT] Prompt delivered to ${user.email}`);
      } else {
        console.error(`[DAILY DIARY FAILED] Delivery to ${user.email}:`, result.error);
      }
    }
  } catch (err) {
    console.error('[DAILY DIARY CRON ERROR]', err);
  }
}

/**
 * 2. Process Specific Event & Birthday Reminders (Reminder Collection)
 * Checks scheduled birthday, anniversary, and custom event reminders.
 */
async function processEventReminders() {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // 1-day margin for timezones
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

    // Find unsent event reminders
    const dueReminders = await Reminder.find({
      date: { $gte: todayStart, $lte: todayEnd },
      emailSent: false,
    }).populate('user', 'name email');

    if (!dueReminders || dueReminders.length === 0) return;

    for (const reminder of dueReminders) {
      const user = reminder.user;
      if (!user || !user.email) continue;

      const rHour = parseHour(reminder.time || '09:00');
      if (rHour !== currentHour) continue;

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
        badgeText: `${(reminder.type || 'EVENT').toUpperCase()} REMINDER`,
        bodyContent: `
          <p>This is your scheduled event reminder from <strong>Dear Diary</strong>.</p>
          <p style="font-size: 18px; font-weight: 700; color: #ffffff;">
            ${emoji} ${reminder.title}
          </p>
          <p style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #7e22ce; padding: 12px 16px; border-radius: 6px; color: #e9d5ff;">
            <strong>Date:</strong> ${eventDate}<br/>
            <strong>Type:</strong> ${reminder.type ? reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1) : 'Event'}
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
        reminder.emailSent = true;

        // If recurring (e.g. birthday), schedule for next year
        if (reminder.recurring || reminder.type === 'birthday') {
          const nextDate = new Date(reminder.date);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          reminder.date = nextDate;
          reminder.emailSent = false;
        }

        await reminder.save();
        console.log(`[EVENT REMINDER SENT] "${reminder.title}" → ${user.email}`);
      } else {
        console.error(`[EVENT REMINDER FAILED] "${reminder.title}" → ${user.email}:`, result.error);
      }
    }
  } catch (err) {
    console.error('[EVENT REMINDER CRON ERROR]', err);
  }
}

/**
 * 3. Process Inactive User Detection (3+ Days Without Journal Entry)
 * Checks for users who haven't logged a diary entry in 3 or more days and sends a "We miss you!" email.
 */
async function processInactiveUserReminders() {
  try {
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await User.find({
      $or: [
        { reminderEnabled: true },
        { reminderEnabled: { $exists: false } }
      ]
    });

    if (!users || users.length === 0) return;

    for (const user of users) {
      if (!user.email) continue;

      // Avoid spamming: do not send more than one inactivity email per 7 days
      if (user.lastInactivityEmailSent) {
        const lastSent = new Date(user.lastInactivityEmailSent);
        if (lastSent > sevenDaysAgo) continue;
      }

      // Check user's most recent diary entry
      const latestEntry = await Diary.findOne({ user: user._id }).sort({ date: -1 });

      let daysInactive = 3;
      if (latestEntry && latestEntry.date) {
        const diffMs = now.getTime() - new Date(latestEntry.date).getTime();
        daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      } else if (user.createdAt) {
        const diffMs = now.getTime() - new Date(user.createdAt).getTime();
        daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      // If user has been inactive for 3 or more days
      if (daysInactive >= 3) {
        console.log(`[INACTIVITY CRON] User ${user.email} inactive for ${daysInactive} days. Sending 'We Miss You' re-engagement email.`);

        const htmlContent = createEmailTemplate({
          title: `✨ We Miss You, ${user.name || 'Friend'}!`,
          greeting: user.name || 'Friend',
          badgeText: 'JOURNAL RE-ENGAGEMENT',
          bodyContent: `
            <p>It's been <strong>${daysInactive} days</strong> since your last entry in <strong>Dear Diary</strong>.</p>
            <p>Life gets busy, but taking just 2 minutes to record your thoughts, emotions, and daily highlights brings clarity and peace of mind.</p>
            <div style="background: rgba(126, 34, 206, 0.15); border-left: 3px solid #d97706; padding: 14px 18px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-size: 15px; color: #fef3c7; font-style: italic;">
                "Your journal is a safe, quiet space ready to listen whenever you need a moment of reflection."
              </p>
            </div>
            <p>How have you been feeling lately? Tap below to jump straight to your journal.</p>
          `,
          actionText: 'Write Today\'s Entry',
          actionUrl: process.env.CLIENT_URL || 'http://localhost:5173',
        });

        const result = await sendEmail({
          to: user.email,
          subject: `✨ We miss you! Your diary is waiting for your story...`,
          html: htmlContent,
        });

        if (result.success) {
          user.lastInactivityEmailSent = new Date();
          await user.save();
          console.log(`[INACTIVITY EMAIL SENT] Re-engagement prompt delivered to ${user.email}`);
        } else {
          console.error(`[INACTIVITY EMAIL FAILED] Delivery to ${user.email}:`, result.error);
        }
      }
    }
  } catch (err) {
    console.error('[INACTIVITY CRON ERROR]', err);
  }
}

/**
 * Combined process function for all reminders & inactivity checks
 */
async function processReminders() {
  await processDailyJournalReminders();
  await processEventReminders();
  await processInactiveUserReminders();
}

/**
 * Start the reminder cron job.
 * Runs every hour at minute 0 (and also runs a check on server startup).
 */
function startReminderCron() {
  // Run every hour at minute :00
  cron.schedule('0 * * * *', () => {
    console.log(`[REMINDER CRON] Hourly check running at ${new Date().toLocaleTimeString()}...`);
    processReminders();
  });

  console.log('[REMINDER CRON] Scheduled — checks every hour for daily writing prompts, event reminders, and inactive users.');

  // Run initial check on startup after 5s
  setTimeout(() => {
    console.log('[REMINDER CRON] Initial check on server startup...');
    processReminders();
  }, 5000);
}

module.exports = { 
  startReminderCron, 
  processReminders, 
  processDailyJournalReminders, 
  processEventReminders,
  processInactiveUserReminders
};
