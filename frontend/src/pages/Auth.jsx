import React, { useState } from 'react';
import { useAuth } from '../App';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, demoMode } = useAuth();

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setIsSubmitting(true);
    let success = false;
    
    if (isLogin) {
      success = await login({ email, password });
    } else {
      success = await register({ name, email, password });
    }
    
    setIsSubmitting(false);
    if (success) {
      const target = sessionStorage.getItem('redirect_after_auth') || '/dashboard';
      sessionStorage.removeItem('redirect_after_auth');
      navigate(target);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    if (isLogin) {
      await login({ email: 'demo_user@example.com', password: 'password123' });
    } else {
      await register({ name: 'Demo User', email: 'demo_user@example.com', password: 'password123' });
    }
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoEmoji}>📔</span>
          <h2 style={styles.title}>Dear Diary</h2>
          <p style={styles.subtitle}>
            {isLogin 
              ? 'Log in to track your mood and archive your thoughts' 
              : 'Create an account to start your mindful journaling journey'}
          </p>
        </div>

        {demoMode && (
          <div style={styles.demoBanner}>
            <span style={{ fontWeight: 600 }}>💡 Demo Mode Active:</span>
            <span style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>You can sign in instantly with mock credentials, and 30 days of data will be pre-seeded in your browser.</span>
            <button onClick={handleDemoSignIn} style={styles.demoBtn}>
              Instant Guest Sign-In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass">Password</label>
            <input
              id="auth-pass"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn" style={styles.submitBtn}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{isSubmitting ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}</span>
          </button>
        </form>

        <div style={styles.toggleFooter}>
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
            {isLogin ? 'Register Here' : 'Log In Here'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0a0b10',
    padding: '1.5rem',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '2.5rem 2rem',
    borderRadius: '24px',
    animation: 'fadeIn 0.5s ease-out forwards',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoEmoji: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'Outfit, sans-serif',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  demoBanner: {
    background: 'rgba(52, 211, 153, 0.08)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    color: '#34d399',
    fontSize: '0.85rem',
  },
  demoBtn: {
    marginTop: '0.75rem',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'opacity 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    marginTop: '0.5rem',
  },
  toggleFooter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.85rem',
    padding: 0,
    textDecoration: 'underline',
  },
};
