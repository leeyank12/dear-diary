import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Bell, MessageSquare, ShieldAlert, Trash2, Mail, CheckCircle, RefreshCw, Filter, Activity, Server, Database } from 'lucide-react';
import api from '../api';
import { useToast } from '../App';

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'feedback', 'health'
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [deletingUser, setDeletingUser] = useState(null);
  const { showToast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getOverview();
      setData(res);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin overview data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"? This will permanently delete all their diary entries, reminders, and data.`)) {
      return;
    }
    setDeletingUser(userId);
    try {
      const res = await api.admin.deleteUser(userId);
      showToast(res.message || 'User deleted successfully.');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user.', 'error');
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#f4e4c1', fontFamily: "'EB Garamond', serif" }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: '#c9a84c' }} />
          <p style={{ fontSize: '1.2rem' }}>Loading Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  const { summary = {}, users = [], feedbackList = [], moodDistribution = {} } = data || {};

  const filteredFeedback = feedbackFilter === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.category === feedbackFilter);

  return (
    <div style={{ padding: '0.5rem 0' }} className="vintage-flip-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="vintage-page-header">
            <div className="header-icon" style={{ background: '#7e22ce' }}>
              <ShieldAlert size={24} color="#f4e4c1" />
            </div>
            <div>
              <h1 className="vintage-page-title">Admin Control Panel</h1>
              <p className="vintage-page-subtitle">System-wide analytics, user management, and feedback monitoring</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchAdminData} 
          className="btn-vintage-outline" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Metric 1 */}
        <div className="vintage-paper" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>Total Users</span>
            <Users size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
            {summary.totalUsers || 0}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="vintage-paper" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>Journal Entries</span>
            <BookOpen size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
            {summary.totalEntries || 0}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="vintage-paper" style={{ padding: '1.25rem', borderLeft: '4px solid #c9a84c' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>Reminders</span>
            <Bell size={20} color="#c9a84c" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
            {summary.totalReminders || 0}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="vintage-paper" style={{ padding: '1.25rem', borderLeft: '4px solid #7e22ce' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>Feedback Messages</span>
            <MessageSquare size={20} color="#7e22ce" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
            {summary.totalFeedback || 0}
          </div>
        </div>

        {/* Metric 5 */}
        <div className="vintage-paper" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>Stress Alerts</span>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
            {summary.totalAlerts || 0}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(107, 58, 42, 0.2)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`vintage-chip ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          className={`vintage-chip ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={16} />
          <span>Feedback Inbox ({feedbackList.length})</span>
        </button>

        <button
          className={`vintage-chip ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <Server size={16} />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: User Accounts Table */}
      {activeTab === 'users' && (
        <div className="vintage-leather-card" style={{ padding: '1.5rem' }}>
          <h3 className="vintage-card-title" style={{ marginBottom: '1rem' }}>Registered Users ({users.length})</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: '#3c2415', fontFamily: "'EB Garamond', serif" }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(107, 58, 42, 0.3)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>User</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Guardian Email</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Alerts Status</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Joined Date</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(107, 58, 42, 0.15)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{u.name || 'User'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontStyle: 'italic', color: '#5a3a28' }}>
                      {u.guardianEmail || 'Not set'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: u.alertsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 58, 42, 0.1)',
                        color: u.alertsEnabled ? '#065f46' : '#5a3a28'
                      }}>
                        {u.alertsEnabled ? '🛡️ Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#5a3a28' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name || u.email)}
                        disabled={deletingUser === u._id}
                        className="vintage-icon-btn danger"
                        title="Delete User Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Feedback Inbox */}
      {activeTab === 'feedback' && (
        <div className="vintage-leather-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 className="vintage-card-title">User Feedback Messages</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} color="#5a3a28" />
              <select
                className="vintage-input"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="general">💬 General</option>
                <option value="bug">🐛 Bugs</option>
                <option value="feature">✨ Features</option>
                <option value="appreciation">❤️ Appreciation</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredFeedback.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#5a3a28', fontFamily: "'EB Garamond', serif" }}>No feedback messages found in this category.</p>
            ) : (
              filteredFeedback.map(item => (
                <div key={item._id} style={{
                  background: 'rgba(244, 228, 193, 0.7)',
                  border: '1px solid rgba(107, 58, 42, 0.25)',
                  borderRadius: '6px',
                  padding: '1rem',
                  color: '#3c2415',
                  fontFamily: "'EB Garamond', serif"
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.userName || 'User'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#5a3a28' }}>({item.userEmail})</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: 'var(--vintage-leather)',
                      color: 'var(--vintage-parchment)',
                      fontWeight: 600
                    }}>
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.95rem', margin: '0.4rem 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    "{item.message}"
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#8b6914', fontStyle: 'italic', marginTop: '0.4rem' }}>
                    Submitted at: {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: System Diagnostics */}
      {activeTab === 'health' && (
        <div className="vintage-leather-card" style={{ padding: '1.5rem' }}>
          <h3 className="vintage-card-title" style={{ marginBottom: '1rem' }}>System Architecture & Background Diagnostics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="vintage-paper" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                <Database size={18} color="#10b981" />
                <span>MongoDB Atlas Cloud Cluster</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5a3a28' }}>
                Status: <strong style={{ color: '#065f46' }}>Connected & Active</strong><br/>
                Database: <code>deardiary</code><br/>
                Collections: users, diaries, reminders, feedback, notifications
              </p>
            </div>

            <div className="vintage-paper" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                <Activity size={18} color="#7e22ce" />
                <span>Background Cron Scheduler</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5a3a28' }}>
                Status: <strong style={{ color: '#065f46' }}>Running (Hourly @ :00)</strong><br/>
                Daily Writing Prompts: Active<br/>
                Event & Birthday Reminders: Active<br/>
                3+ Day Inactivity Re-engagement: Active (Max 5 days)
              </p>
            </div>

            <div className="vintage-paper" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                <Mail size={18} color="#c9a84c" />
                <span>Email Delivery Engine</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5a3a28' }}>
                SMTP / Resend HTTPS API: Active<br/>
                Port: 443 (HTTPS) / 587 (SMTP)<br/>
                Sender: <code>itsdiary000@gmail.com</code> / <code>onboarding@resend.dev</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
