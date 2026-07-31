import React, { useEffect, useState } from 'react';
import { useAuth, useToast } from '../App';
import api from '../api';
import { User, ShieldAlert, Mail, Calendar, Sparkles, CheckCircle2, Bell, Clock } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [guardianPhone, setGuardianPhone] = useState(user?.guardianPhone || '');
  const [guardianEmail, setGuardianEmail] = useState(user?.guardianEmail || '');
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.split('T')[0] : '');
  const [alertsEnabled, setAlertsEnabled] = useState(!!user?.alertsEnabled);

  // Journal Reminders & Email Notification States
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:30');
  const [reminderFreq, setReminderFreq] = useState('daily'); // 'daily', 'weekdays', 'weekly'

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGuardianPhone(user.guardianPhone || '');
      setGuardianEmail(user.guardianEmail || '');
      if (user.birthday) {
        setBirthday(user.birthday.split('T')[0]);
      }
      setAlertsEnabled(!!user.alertsEnabled);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      name,
      email,
      guardianPhone,
      guardianEmail,
      birthday,
      alertsEnabled,
      reminderEnabled,
      reminderTime,
      reminderFreq
    };

    try {
      const updatedUser = await api.profile.update(payload);
      if (setUser) {
        setUser(updatedUser);
      }
      showToast('Profile, Reminders & Guardian Settings updated!', 'success');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast(err.message || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container animated-fade-in">
      {/* Header Royal Banner */}
      <div className="profile-hero-card glass-panel">
        <div className="profile-hero-content">
          <div className="avatar-large-glow">
            <span>{name?.charAt(0).toUpperCase() || 'U'}</span>
            <div className="avatar-sparkle">
              <Sparkles size={16} color="#d97706" />
            </div>
          </div>
          <div className="hero-text-details">
            <h1 className="hero-title">{name || 'Your Profile'}</h1>
            <p className="hero-subtitle">{email || 'Manage personal settings, reminders & stress alerts'}</p>
            <div className="hero-tags">
              <span className={`tag-badge ${alertsEnabled ? 'tag-active' : 'tag-inactive'}`}>
                <ShieldAlert size={13} />
                {alertsEnabled ? 'Guardian Alerts Active' : 'Guardian Alerts Paused'}
              </span>
              <span className="tag-badge tag-active">
                <Bell size={13} />
                {reminderEnabled ? `Daily Reminder at ${reminderTime}` : 'Reminders Off'}
              </span>
              <span className="tag-badge tag-secondary">
                <Mail size={13} />
                {email ? 'Email Verified' : 'No Email'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Grid Layout */}
      <form onSubmit={handleSubmit} className="profile-grid-split">
        {/* Left Column: Personal Information & Email Notification Reminders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card 1: Personal Details */}
          <div className="glass-panel profile-card-left">
            <div className="card-header-row">
              <div className="card-icon-badge icon-indigo">
                <User size={20} />
              </div>
              <div>
                <h3 className="card-heading">Personal Details</h3>
                <p className="card-subheading">Update your account information</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.morgan@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="birthday">Birthday</label>
              <input
                id="birthday"
                className="form-input"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Journal Reminders & Email Notifications */}
          <div className="glass-panel profile-card-left">
            <div className="card-header-row">
              <div className="card-icon-badge icon-coral">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="card-heading">Journal Reminders & Notifications</h3>
                <p className="card-subheading">Set scheduled email prompts to write your entry</p>
              </div>
            </div>

            {/* Enable Reminders Toggle Box */}
            <div className="toggle-card-box">
              <div className="toggle-text-side">
                <span className="toggle-title">Enable Writing Reminders</span>
                <span className="toggle-desc">Receive email prompts to reflect on your day automatically.</span>
              </div>
              <div 
                className={`toggle-switch-container ${reminderEnabled ? 'active' : ''}`}
                onClick={() => setReminderEnabled(!reminderEnabled)}
                role="button"
                tabIndex={0}
              >
                <div className="toggle-switch-track">
                  <div className={`toggle-switch-thumb ${reminderEnabled ? 'on' : ''}`}>
                    <Bell size={12} color={reminderEnabled ? '#0d9488' : '#64748b'} />
                  </div>
                </div>
              </div>
            </div>

            {reminderEnabled && (
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reminderTime">
                    <Clock size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Scheduled Time
                  </label>
                  <input
                    id="reminderTime"
                    className="form-input"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reminder Frequency</label>
                  <select
                    className="form-input"
                    value={reminderFreq}
                    onChange={(e) => setReminderFreq(e.target.value)}
                  >
                    <option value="daily">Everyday (Daily Evening Prompt)</option>
                    <option value="weekdays">Weekdays Only (Mon - Fri)</option>
                    <option value="weekly">Weekly (Every Sunday)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Guardian & Stress Alerts Card */}
        <div className="glass-panel profile-card-right">
          <div className="card-header-row">
            <div className="card-icon-badge icon-coral">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="card-heading">Guardian & Stress Alerts</h3>
              <p className="card-subheading">Automatic notification triggers when highly stressed</p>
            </div>
          </div>

          {/* Toggle Bar */}
          <div className="toggle-card-box">
            <div className="toggle-text-side">
              <span className="toggle-title">Enable Guardian Alerts</span>
              <span className="toggle-desc">
                Automatically notifies your trusted contact if consecutive high-stress entries are logged.
              </span>
            </div>
            <div 
              className={`toggle-switch-container ${alertsEnabled ? 'active' : ''}`}
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              role="button"
              tabIndex={0}
            >
              <div className="toggle-switch-track">
                <div className={`toggle-switch-thumb ${alertsEnabled ? 'on' : ''}`}>
                  <ShieldAlert size={12} color={alertsEnabled ? '#0d9488' : '#64748b'} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="guardianPhone">Guardian Phone Number</label>
            <input
              id="guardianPhone"
              className="form-input"
              type="tel"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="guardianEmail">Guardian Email</label>
            <input
              id="guardianEmail"
              className="form-input"
              type="email"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              placeholder="guardian@example.com"
            />
          </div>

          {/* Action Button & Status */}
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <button type="submit" className="btn btn-exotic" disabled={saving}>
              {saving ? (
                'Saving Profile...'
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  Saved Successfully!
                </>
              ) : (
                'Save All Settings'
              )}
            </button>

            {savedSuccess && (
              <div className="save-status">
                ✨ Your profile, reminder preferences & guardian settings have been saved cleanly.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
