import axios from 'axios';

// Export real backend server API layer directly
export const isDemoMode = () => false;
export const setAppMode = () => {};

// ==========================================
// AXIOS REAL BACKEND LAYER
// ==========================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dear_diary_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dear_diary_token');
      localStorage.removeItem('dear_diary_user');
      // Redirect to auth page if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

const serverApi = {
  auth: {
    register: async (userData) => {
      const res = await axiosInstance.post('/auth/register', userData);
      return res.data;
    },
    login: async (credentials) => {
      const res = await axiosInstance.post('/auth/login', credentials);
      return res.data;
    },
    getMe: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data;
    },
  },
  diary: {
    getAll: async (params) => {
      const res = await axiosInstance.get('/diary', { params });
      return res.data;
    },
    getOne: async (id) => {
      const res = await axiosInstance.get(`/diary/${id}`);
      return res.data;
    },
    create: async (data) => {
      const res = await axiosInstance.post('/diary', data);
      return res.data;
    },
    update: async (id, data) => {
      const res = await axiosInstance.put(`/diary/${id}`, data);
      return res.data;
    },
    delete: async (id) => {
      const res = await axiosInstance.delete(`/diary/${id}`);
      return res.data;
    },
  },
  analytics: {
    getDashboard: async () => {
      const res = await axiosInstance.get('/analytics/dashboard');
      return res.data;
    },
  },
  profile: {
    getMe: async () => {
      const res = await axiosInstance.get('/profile/me');
      return res.data;
    },
    update: async (data) => {
      const res = await axiosInstance.put('/profile/me', data);
      return res.data;
    },
    sendTestEmail: async (data) => {
      const res = await axiosInstance.post('/profile/send-test-email', data);
      return res.data;
    },
    testGuardianEmail: async (data) => {
      const res = await axiosInstance.post('/profile/test-guardian-email', data);
      return res.data;
    },
  },
  reminders: {
    getAll: async () => {
      const res = await axiosInstance.get('/reminders');
      return res.data;
    },
    create: async (data) => {
      const res = await axiosInstance.post('/reminders', data);
      return res.data;
    },
    delete: async (id) => {
      const res = await axiosInstance.delete(`/reminders/${id}`);
      return res.data;
    },
  },
};

// ==========================================
// 2. LOCALSTORAGE MOCK DATABASE LAYER
// ==========================================
const seedMockData = () => {
  const existingEntries = localStorage.getItem('dear_diary_mock_entries');
  if (existingEntries) return;

  const mockEntries = [];
  const moods = ['ecstatic', 'happy', 'neutral', 'sad', 'stressed'];
  const titles = {
    ecstatic: ['Incredible breakthrough!', 'Surprise party!', 'Best day ever', 'Aced my presentation'],
    happy: ['Chilled afternoon', 'Coffee with a friend', 'Productive workflow', 'Nice walk in the park'],
    neutral: ['Ordinary Wednesday', 'Laundry and errands', 'Read a few chapters', 'Quiet evening'],
    sad: ['Felt a bit lonely', 'Missed my family', 'Rainy gloomy day', 'Tired and unmotivated'],
    stressed: ['Too many deadlines', 'Long traffic jam', 'Tense meeting today', 'Overwhelmed with chores'],
  };
  const descriptions = {
    ecstatic: 'Everything clicked today! The code compiles, the client is thrilled, and I went for a celebratory run. Feel like I can conquer the world!',
    happy: 'Had a wonderful conversations and enjoyed a delicious meal. Spent some time coding and it was relaxing. Small wins add up.',
    neutral: 'Nothing major happened. Completed my daily routines, cleaned the kitchen, and caught up on emails. Peaceful, but uneventful.',
    sad: 'Felt slow and a bit isolated today. Had a hard time focusing on tasks. Hoping tomorrow brings more energy and connection.',
    stressed: 'My calendar was packed and it felt like there was not enough hours in the day. Need to practice deep breathing and get some rest.',
  };

  // Seed 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Weighted selection (more happy/neutral than stressed/sad)
    const seedVal = Math.random();
    let mood = 'happy';
    if (seedVal < 0.15) mood = 'ecstatic';
    else if (seedVal < 0.5) mood = 'happy';
    else if (seedVal < 0.75) mood = 'neutral';
    else if (seedVal < 0.9) mood = 'stressed';
    else mood = 'sad';

    const moodTitles = titles[mood];
    const title = moodTitles[Math.floor(Math.random() * moodTitles.length)];
    const description = descriptions[mood];

    mockEntries.push({
      _id: `mock_entry_${Date.now()}_${i}`,
      title,
      description,
      mood,
      date: date.toISOString(),
      user: 'mock_user_id',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  localStorage.setItem('dear_diary_mock_entries', JSON.stringify(mockEntries));
};

const getLocalEntries = () => {
  seedMockData();
  return JSON.parse(localStorage.getItem('dear_diary_mock_entries') || '[]');
};

const saveLocalEntries = (entries) => {
  localStorage.setItem('dear_diary_mock_entries', JSON.stringify(entries));
};

const mockApi = {
  profile: {
    getMe: async () => {
      const user = localStorage.getItem('dear_diary_user');
      if (!user) throw new Error('Not authenticated');
      return JSON.parse(user);
    },
    update: async (data) => {
      const stored = localStorage.getItem('dear_diary_user');
      if (!stored) throw new Error('Not authenticated');
      const user = JSON.parse(stored);
      const updated = { ...user, ...data };
      localStorage.setItem('dear_diary_user', JSON.stringify(updated));
      return updated;
    },
    sendTestEmail: async (data) => {
      return { message: `Simulated test email sent to ${data.targetEmail || 'user'}` };
    },
    testGuardianEmail: async () => {
      return { message: 'Simulated guardian alert test email sent.' };
    },
  },
  reminders: {
    getAll: async () => {
      const stored = localStorage.getItem('dear_diary_reminders');
      return stored ? JSON.parse(stored) : [];
    },
    create: async (data) => {
      const stored = localStorage.getItem('dear_diary_reminders');
      const reminders = stored ? JSON.parse(stored) : [];
      const newReminder = {
        _id: `mock_reminder_${Date.now()}`,
        ...data,
        date: data.date || new Date().toISOString(),
        emailSent: false,
        createdAt: new Date().toISOString(),
      };
      reminders.push(newReminder);
      localStorage.setItem('dear_diary_reminders', JSON.stringify(reminders));
      return newReminder;
    },
    delete: async (id) => {
      const stored = localStorage.getItem('dear_diary_reminders');
      let reminders = stored ? JSON.parse(stored) : [];
      reminders = reminders.filter(r => r._id !== id);
      localStorage.setItem('dear_diary_reminders', JSON.stringify(reminders));
      return { message: 'Reminder deleted' };
    },
  },
  diary: {
    getAll: async ({ search, mood, startDate, endDate, page = 1, limit = 9 }) => {
      let entries = getLocalEntries();

      // Search keyword filter
      if (search) {
        const query = search.toLowerCase();
        entries = entries.filter(
          (e) => e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query)
        );
      }

      // Mood filter
      if (mood) {
        entries = entries.filter((e) => e.mood === mood);
      }

      // Date range filter
      if (startDate || endDate) {
        entries = entries.filter((e) => {
          const entryDate = new Date(e.date);
          if (startDate && entryDate < new Date(startDate)) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (entryDate > end) return false;
          }
          return true;
        });
      }

      // Sort Date Descending
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const total = entries.length;
      const skip = (page - 1) * limit;
      const paginatedEntries = entries.slice(skip, skip + limit);

      return {
        entries: paginatedEntries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    getOne: async (id) => {
      const entries = getLocalEntries();
      const entry = entries.find((e) => e._id === id);
      if (!entry) throw new Error('Entry not found');
      return entry;
    },
    create: async (data) => {
      const entries = getLocalEntries();
      const newEntry = {
        _id: `mock_entry_${Date.now()}`,
        ...data,
        date: data.date || new Date().toISOString(),
        user: 'mock_user_id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      entries.unshift(newEntry);
      saveLocalEntries(entries);
      return newEntry;
    },
    update: async (id, data) => {
      const entries = getLocalEntries();
      const index = entries.findIndex((e) => e._id === id);
      if (index === -1) throw new Error('Entry not found');

      entries[index] = {
        ...entries[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveLocalEntries(entries);
      return entries[index];
    },
    delete: async (id) => {
      let entries = getLocalEntries();
      entries = entries.filter((e) => e._id !== id);
      saveLocalEntries(entries);
      return { message: 'Diary entry removed successfully' };
    },
  },
  analytics: {
    getDashboard: async () => {
      const entries = getLocalEntries();
      const totalEntries = entries.length;

      if (totalEntries === 0) {
        return {
          totalEntries: 0,
          mostCommonMood: 'none',
          weeklyEntriesCount: 0,
          moodVarietyCount: 0,
          moodDistribution: [],
          weeklyTrend: [],
          monthlyTrend: [],
        };
      }

      // Mood Distribution
      const moodCounts = {};
      entries.forEach((e) => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      const moodDistribution = Object.keys(moodCounts).map((mood) => ({
        mood,
        count: moodCounts[mood],
      }));

      // Most Common Mood
      const sortedMoods = [...moodDistribution].sort((a, b) => b.count - a.count);
      const mostCommonMood = sortedMoods[0] ? sortedMoods[0].mood : 'neutral';

      // Unique mood variety
      const moodVarietyCount = moodDistribution.length;

      // Weekly count
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyEntriesCount = entries.filter((e) => new Date(e.date) >= sevenDaysAgo).length;

      // Trends (Weekly & Monthly)
      const getTrendData = (days) => {
        const trend = {};
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          trend[dateStr] = { date: dateStr, ecstatic: 0, happy: 0, neutral: 0, sad: 0, stressed: 0 };
        }

        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - days);

        entries.forEach((e) => {
          const entryDate = new Date(e.date);
          if (entryDate >= limitDate) {
            const dateStr = e.date.split('T')[0];
            if (trend[dateStr]) {
              trend[dateStr][e.mood] = (trend[dateStr][e.mood] || 0) + 1;
            }
          }
        });

        return Object.values(trend).sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      const weeklyTrend = getTrendData(7);
      const monthlyTrend = getTrendData(30);

      return {
        totalEntries,
        mostCommonMood,
        weeklyEntriesCount,
        moodVarietyCount,
        moodDistribution,
        weeklyTrend,
        monthlyTrend,
      };
    },
  },
};

const api = serverApi;
export default api;
