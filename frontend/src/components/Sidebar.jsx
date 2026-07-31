import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, LogOut, Info, User } from 'lucide-react';
import { useAuth } from '../App';
import { setAppMode } from '../api';

export default function Sidebar() {
  const { user, logout, demoMode } = useAuth();

  const handleToggleMode = () => {
    const nextMode = demoMode ? 'server' : 'demo';
    setAppMode(nextMode);
  };

  return (
    <aside style={styles.sidebar}>
      {/* Brand logo header */}
      <div style={styles.brand}>
        <span style={styles.brandEmoji}>📔</span>
        <h1 style={styles.brandTitle}>Dear Diary</h1>
      </div>

      {/* Mode Indicator / Toggle */}
      <div style={styles.modeCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Info size={14} color="#9ca3af" />
          <span style={styles.modeLabel}>App Mode:</span>
        </div>
        <div style={styles.badgeRow}>
          <span style={{
            ...styles.modeBadge,
            backgroundColor: demoMode ? 'rgba(52, 211, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            color: demoMode ? '#34d399' : '#818cf8',
            border: `1px solid ${demoMode ? 'rgba(52, 211, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
          }}>
            {demoMode ? 'Demo Mode' : 'Live API'}
          </span>
          <button onClick={handleToggleMode} style={styles.toggleBtn}>Switch</button>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <NavLink to="/dashboard" style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}>
          <LayoutDashboard size={18} /><span>Dashboard</span>
        </NavLink>
        <NavLink to="/entries" style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}>
          <BookOpen size={18} /><span>My Journal</span>
        </NavLink>
        <NavLink to="/new-entry" style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}>
          <PlusCircle size={18} /><span>Write Entry</span>
        </NavLink>
        <NavLink to="/profile" style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}>
          <User size={18} /><span>Profile & Settings</span>
        </NavLink>
      </nav>

      {/* User footer */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          <div style={styles.userText}>
            <div style={styles.userName}>{user?.name || 'User'}</div>
            <div style={styles.userEmail}>{user?.email || 'user@example.com'}</div>
          </div>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={16} /><span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    backgroundColor: 'rgba(12, 14, 26, 0.75)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem 1.25rem',
    gap: '1.75rem',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingLeft: '0.5rem',
  },
  brandEmoji: {
    fontSize: '1.75rem',
    filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
  },
  brandTitle: {
    fontSize: '1.4rem',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  modeLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
  },
  toggleBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f3f4f6',
    fontSize: '0.75rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    color: '#9ca3af',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#ffffff',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderLeft: '3px solid #818cf8',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#ffffff',
    fontSize: '1rem',
    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
  },
  userText: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.65rem',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
