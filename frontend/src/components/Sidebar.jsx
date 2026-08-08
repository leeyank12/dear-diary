import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, LogOut, User, Menu, X, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../App';

export default function Sidebar({ isOpen = true, onToggle }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Floating Mobile / Top Bar Menu Toggle Button */}
      <button 
        onClick={onToggle}
        className="sidebar-toggle-btn"
        title="Toggle Menu (Move In & Out)"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar Component */}
      <aside 
        className={`sidebar-container ${isOpen ? 'open' : 'closed'} ${collapsed ? 'collapsed' : ''}`}
        style={styles.sidebar}
      >
        {/* Brand Header + Collapse Button */}
        <div style={styles.brandRow}>
          <div style={styles.brand}>
            <span style={styles.brandEmoji}>📔</span>
            {!collapsed && <h1 style={styles.brandTitle}>Dear Diary</h1>}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            style={styles.collapseToggleBtn}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <NavLink 
            to="/dashboard" 
            style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink 
            to="/entries" 
            style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}
            title="My Journal"
          >
            <BookOpen size={20} />
            {!collapsed && <span>My Journal</span>}
          </NavLink>
          <NavLink 
            to="/new-entry" 
            style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}
            title="Write Entry"
          >
            <PlusCircle size={20} />
            {!collapsed && <span>Write Entry</span>}
          </NavLink>
          <NavLink 
            to="/profile" 
            style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}
            title="Profile & Settings"
          >
            <User size={20} />
            {!collapsed && <span>Profile & Settings</span>}
          </NavLink>
          {user?.email?.toLowerCase() === 'leeyank08@gmail.com' && (
            <NavLink 
              to="/admin" 
              style={({isActive}) => ({...styles.navLink, ...(isActive ? styles.navLinkActive : {})})}
              title="Admin Panel"
            >
              <ShieldAlert size={20} />
              {!collapsed && <span>Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* User Footer */}
        <div style={styles.footer}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            {!collapsed && (
              <div style={styles.userText}>
                <div style={styles.userName}>{user?.name || 'User'}</div>
                <div style={styles.userEmail}>{user?.email || 'user@example.com'}</div>
              </div>
            )}
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Log Out">
            <LogOut size={18} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    backgroundColor: 'rgba(12, 14, 26, 0.88)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(217, 119, 6, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    gap: '1.5rem',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '0.25rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  brandEmoji: {
    fontSize: '1.6rem',
    filter: 'drop-shadow(0 0 10px rgba(217, 119, 6, 0.5))',
  },
  brandTitle: {
    fontSize: '1.35rem',
    background: 'linear-gradient(135deg, #f4e4c1 0%, #d97706 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  },
  collapseToggleBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    borderRadius: '6px',
    padding: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 0.85rem',
    borderRadius: '10px',
    color: '#9ca3af',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#f8fafc',
    backgroundColor: 'rgba(126, 34, 206, 0.25)',
    borderLeft: '3px solid #c084fc',
    boxShadow: '0 4px 20px rgba(126, 34, 206, 0.25)',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7e22ce 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#ffffff',
    fontSize: '0.95rem',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(126, 34, 206, 0.4)',
  },
  userText: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.72rem',
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
    padding: '0.6rem',
    borderRadius: '8px',
    background: 'rgba(190, 18, 60, 0.12)',
    border: '1px solid rgba(190, 18, 60, 0.25)',
    color: '#fb7185',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
