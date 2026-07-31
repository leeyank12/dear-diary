// testSeedAtlas.js - Seed sample test data directly into MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Diary = require('./models/Diary');
const Reminder = require('./models/Reminder');

async function seedAtlas() {
  try {
    console.log('Connecting to MongoDB Atlas Cloud Database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // 1. Create or update sample test user
    const email = 'testuser@deardiary.app';
    const passwordHash = await bcrypt.hash('password123', 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Alex Morgan',
        email: email,
        password: passwordHash,
        guardianEmail: 'itsdiary000@gmail.com',
        alertsEnabled: true,
      });
      console.log('✅ Created test user account: testuser@deardiary.app');
    } else {
      user.password = passwordHash;
      user.guardianEmail = 'itsdiary000@gmail.com';
      user.alertsEnabled = true;
      await user.save();
      console.log('✅ Updated test user account: testuser@deardiary.app');
    }

    // 2. Clear old test entries for this user and insert fresh sample entries
    await Diary.deleteMany({ user: user._id });

    const sampleEntries = [
      {
        title: '🌟 Incredible Breakthrough Project!',
        description: 'Successfully deployed the Dear Diary app with full MongoDB Atlas cloud database support. The vintage paper aesthetic looks stunning and all systems are running smoothly!',
        mood: 'ecstatic',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        user: user._id,
      },
      {
        title: '☕ Quiet Afternoon & Coffee',
        description: 'Had a wonderful cup of hot cocoa while writing down thoughts on vintage ruled parchment paper. Feeling calm, focused, and relaxed.',
        mood: 'happy',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        user: user._id,
      },
      {
        title: '📋 Routine Mid-week Review',
        description: 'Caught up on emails, completed household chores, and organized my weekly journal schedule. Uneventful but productive day.',
        mood: 'neutral',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        user: user._id,
      },
      {
        title: '🤯 Heavy Workload & Tight Deadlines',
        description: 'Felt overwhelmed with multiple pending tasks and long study sessions today. Need to practice deep breathing and get more restful sleep.',
        mood: 'stressed',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        user: user._id,
      },
      {
        title: '🤯 Another High Stress Day',
        description: 'Too many meetings back-to-back. Logging this high stress entry to reflect and monitor my emotional well-being.',
        mood: 'stressed',
        date: new Date(), // Today
        user: user._id,
      },
    ];

    const inserted = await Diary.insertMany(sampleEntries);
    console.log(`✅ Inserted ${inserted.length} sample journal entries into MongoDB Atlas!`);

    // 3. Insert sample event reminder
    await Reminder.deleteMany({ user: user._id });
    const sampleReminder = await Reminder.create({
      user: user._id,
      title: "🎂 Mom's Birthday Celebration",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      time: '18:00',
      type: 'birthday',
      recurring: true,
    });
    console.log(`✅ Created sample birthday reminder: "${sampleReminder.title}"!`);

    console.log('\n🎉 ALL SAMPLE DATA SUCCESSFULLY SEEDED INTO MONGODB ATLAS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seedAtlas();
