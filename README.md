# Dear Diary — Mood Tracker and Notes Application

A full-stack web application built on the MERN stack (MongoDB, Express, React, Node.js) with a premium dark-themed glassmorphism user interface. Users can track their daily emotional mood, write detailed diary reflections, search logs, and visualize trends through dynamic analytical charts.

---

## 🚀 Key Features

* **Visual Mood Picker**: Rate your daily mood with visual emojis (Ecstatic, Happy, Neutral, Sad, Stressed).
* **Mindful Journaling**: Keep detailed title and description notes for every day.
* **Interactive Analytics**: Stat cards, Recharts-powered pie and bar trend graphs, and mood progress tables.
* **Smart Filter & Search**: Query records via keyword search, mood filter chips, and precise date range inputs.
* **Authentication**: Password hashing with `bcrypt` and session authorization via JSON Web Tokens (`JWT`).
* **Zero-Setup Demo Fallback**: Automatically falls back to a complete browser `localStorage` mock database preloaded with 30 days of mock diary entries if no backend is running! Toggle between backend API and demo mode at any time inside the Sidebar.

---

## 📁 Repository Structure

```text
dear-diary/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database config (mongoose)
│   ├── middleware/           # Protect routes JWT middleware
│   ├── models/               # MongoDB models (User & Diary schemas)
│   ├── routes/               # API endpoints (auth, diary, analytics)
│   ├── .env.example          # Sample environment configurations
│   ├── package.json          # Backend dependencies
│   └── server.js             # API server entry point
├── frontend/                 # React SPA (Vite runner)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Custom React widgets (Sidebar, Form, Toast, etc.)
│   │   ├── pages/            # View pages (Auth, Dashboard, DiaryList, NewEntry)
│   │   ├── api.js            # Unified server API + LocalStorage fallback layer
│   │   ├── App.jsx           # Global routes & contexts
│   │   ├── index.css         # Custom dark-glass visual theme stylesheet
│   │   └── index.jsx         # React application entry point
│   ├── index.html            # SPA template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite compilation configuration
├── package.json              # Root concurrent tasks coordinator
└── README.md                 # Project user manual
```

---

## 🛠️ Quick Start Instructions

Follow these steps to run the application locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) (v16+) installed.

### 1. Installation

From the root directory (`dear-diary`), run the helper script to download dependencies for both the backend and frontend folders:

```bash
npm run install-all
```

### 2. Configure Environment Variables

1. Navigate to the `backend` directory.
2. Duplicate the `.env.example` file and rename it to `.env`.
3. Open `.env` and fill in your settings:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_custom_jwt_security_secret
CLIENT_URL=http://localhost:5173
```
*Note: A default development fallback `.env` file pointing to a local MongoDB instance `mongodb://localhost:27017/deardiary` is already configured for you.*

### 3. Running the Application

To launch both the Node.js backend server and Vite frontend client concurrently:

From the root `dear-diary` directory, run:

```bash
npm run dev
```

* **Frontend URL**: [http://localhost:5173](http://localhost:5173)
* **Backend API URL**: [http://localhost:5000](http://localhost:5000)

---

## 💡 Running without MongoDB (Demo Mode)

If you don't have MongoDB installed or running locally, **do not worry!**
The React app will automatically fall back to **Demo Mode** on the frontend, which handles registration, logins, and diary entries client-side using `localStorage`. 

Upon first load, it will automatically populate your screen with **30 days of randomized journal data** so you can view all charts and filtering mechanisms instantly. You can switch modes inside the sidebar menu!
