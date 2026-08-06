import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import AnimatedBackground from './components/AnimatedBackground';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DiaryList from './pages/DiaryList';
import NewEntry from './pages/NewEntry';
import Profile from './pages/Profile';
import api from './api';

const AuthContext = createContext(null);
const ToastContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);

function ProtectedContent({ user, sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  if (!user) {
    if (location.pathname && location.pathname !== '/auth') {
      sessionStorage.setItem('redirect_after_auth', location.pathname);
    }
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entries" element={<DiaryList />} />
          <Route path="/new-entry" element={<NewEntry />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dear_diary_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('dear_diary_user') && !!localStorage.getItem('dear_diary_token'));
  const [slowServerWarning, setSlowServerWarning] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast(null);

  useEffect(() => {
    let warnTimer = setTimeout(() => {
      if (loading) setSlowServerWarning(true);
    }, 3000);

    const fetchUser = async () => {
      const token = localStorage.getItem('dear_diary_token');
      if (token) {
        try {
          const userData = await api.auth.getMe();
          setUser(userData);
          localStorage.setItem('dear_diary_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session expired or authentication failed.');
          localStorage.removeItem('dear_diary_token');
          localStorage.removeItem('dear_diary_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(warnTimer);
    };

    fetchUser();
    return () => clearTimeout(warnTimer);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('dear_diary_token', data.token);
      localStorage.setItem('dear_diary_user', JSON.stringify(data));
      setUser(data);
      showToast(`Welcome back, ${data.name || 'Friend'}!`);
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('dear_diary_token', data.token);
      localStorage.setItem('dear_diary_user', JSON.stringify(data));
      setUser(data);
      showToast(`Account created successfully! Welcome, ${data.name}.`);
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('dear_diary_token');
    localStorage.removeItem('dear_diary_user');
    setUser(null);
    showToast('Logged out successfully.');
  };

  if (loading && !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#090a12',
        color: '#f4e4c1',
        fontFamily: "'EB Garamond', serif",
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>📔</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.04em', color: '#f4e4c1' }}>
          Opening Dear Diary...
        </div>
        {slowServerWarning && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#c9a84c', fontStyle: 'italic', maxWidth: '320px' }}>
            ⚡ Waking up backend server on Render... This takes just a moment on cold starts!
          </p>
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      <ToastContext.Provider value={{ showToast }}>
        <AnimatedBackground>
          <BrowserRouter>
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
            
            <Routes>
              {/* Public auth route */}
              <Route 
                path="/auth" 
                element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
              />

              {/* Protected routes wrapped in Sidebar */}
              <Route
                path="/*"
                element={<ProtectedContent user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
              />
            </Routes>
          </BrowserRouter>
        </AnimatedBackground>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
