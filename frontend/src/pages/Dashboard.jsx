import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { BookOpen, Smile, Calendar, Heart, ShieldAlert, TrendingUp, Activity, Bell, Send, Clock, Plus, Trash2, Mail } from 'lucide-react';
import api from '../api';
import { useAuth, useToast } from '../App';

const MOOD_METADATA = {
  ecstatic: { emoji: '🤩', color: '#10b981', label: 'Ecstatic', score: 5 },
  happy: { emoji: '😊', color: '#34d399', label: 'Happy', score: 4 },
  neutral: { emoji: '😐', color: '#6366f1', label: 'Neutral', score: 3 },
  sad: { emoji: '😢', color: '#3b82f6', label: 'Sad', score: 2 },
  stressed: { emoji: '🤯', color: '#ef4444', label: 'Stressed', score: 1 },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Reminder State
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({ title: '', date: '', time: '09:00', type: 'event', recurring: false });
  const [addingReminder, setAddingReminder] = useState(false);

  // Fetch reminders
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const data = await api.reminders.getAll();
        setReminders(data);
      } catch (err) {
        console.error('Failed to load reminders', err);
      }
    };
    loadReminders();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.date) {
      showToast('Please enter a title and date.', 'error');
      return;
    }
    setAddingReminder(true);
    try {
      const created = await api.reminders.create(newReminder);
      setReminders(prev => [...prev, created]);
      setNewReminder({ title: '', date: '', time: '09:00', type: 'event', recurring: false });
      showToast(`Reminder "${created.title}" set for ${new Date(created.date).toLocaleDateString()}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create reminder.', 'error');
    } finally {
      setAddingReminder(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.reminders.delete(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      showToast('Reminder removed.');
    } catch (err) {
      showToast('Failed to delete reminder.', 'error');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await api.analytics.getDashboard();
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={styles.center}><h3>Analyzing your journal...</h3></div>;
  }

  if (!data || data.totalEntries === 0) {
    return (
      <div className="animated-fade-in" style={styles.emptyContainer}>
        <div className="glass-panel" style={styles.emptyCard}>
          <ShieldAlert size={48} color="#6366f1" />
          <h2 style={{ marginTop: '1rem', fontFamily: 'Outfit, sans-serif' }}>Your Journal is Empty</h2>
          <p style={{ color: '#9ca3af', margin: '0.5rem 0 1.5rem 0', fontSize: '0.95rem' }}>
            Write your first diary entry to unlock mood trajectory point plots and analytics!
          </p>
          <a href="/new-entry" className="btn">Write First Entry</a>
        </div>
      </div>
    );
  }

  // Formatting Pie Chart Data
  const pieData = data.moodDistribution.map(item => ({
    name: MOOD_METADATA[item.mood]?.label || item.mood,
    value: item.count,
    color: MOOD_METADATA[item.mood]?.color || '#9ca3af',
  }));

  // Point Plotting Data Transformation for Line / Scatter Trajectory
  const pointPlotData = data.weeklyTrend.map(item => {
    let topMood = 'neutral';
    let maxCount = 0;
    let totalScore = 0;
    let totalLogs = 0;

    if (item.moods && Array.isArray(item.moods)) {
      item.moods.forEach(m => {
        const score = MOOD_METADATA[m.mood]?.score || 3;
        totalScore += score * m.count;
        totalLogs += m.count;
        if (m.count > maxCount) {
          maxCount = m.count;
          topMood = m.mood;
        }
      });
    } else {
      Object.keys(MOOD_METADATA).forEach(m => {
        const cnt = item[m] || 0;
        if (cnt > 0) {
          totalScore += MOOD_METADATA[m].score * cnt;
          totalLogs += cnt;
          if (cnt > maxCount) {
            maxCount = cnt;
            topMood = m;
          }
        }
      });
    }

    const avgScore = totalLogs > 0 ? Number((totalScore / totalLogs).toFixed(1)) : 3;
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    return {
      date: formattedDate,
      rawDate: item.date,
      moodScore: avgScore,
      dominantMood: topMood,
      emoji: MOOD_METADATA[topMood]?.emoji || '😐',
      color: MOOD_METADATA[topMood]?.color || '#818cf8',
      logs: totalLogs
    };
  });

  // Custom Point Plot Tooltip
  const PointTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div style={styles.chartTooltip}>
          <p style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{pData.date}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{pData.emoji}</span>
            <span style={{ color: pData.color, fontWeight: 700, fontSize: '0.88rem' }}>
              Mood Score: {pData.moodScore} / 5
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            {pData.logs} journal entry logged
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Glowing Point Marker Node
  const RenderPointNode = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    return (
      <g key={`point-${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r={9} fill={payload.color} fillOpacity={0.25} stroke={payload.color} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill="#ffffff" />
      </g>
    );
  };

  // Stats Card Data Array
  const stats = [
    { title: 'Total Entries', value: data.totalEntries, icon: <BookOpen size={24} />, color: '#6366f1' },
    { 
      title: 'Common Mood', 
      value: MOOD_METADATA[data.mostCommonMood]?.label || data.mostCommonMood, 
      emoji: MOOD_METADATA[data.mostCommonMood]?.emoji || '😐',
      icon: <Smile size={24} />, 
      color: MOOD_METADATA[data.mostCommonMood]?.color || '#818cf8' 
    },
    { title: 'Weekly Logs', value: data.weeklyEntriesCount, icon: <Calendar size={24} />, color: '#10b981' },
    { title: 'Mood Variety', value: `${data.moodVarietyCount} / 5`, icon: <Heart size={24} />, color: '#f59e0b' },
  ];

  const getDominantMoodForDay = (dayData) => {
    if (dayData.moods && Array.isArray(dayData.moods)) {
      if (dayData.moods.length === 0) return 'none';
      const sorted = [...dayData.moods].sort((a, b) => b.count - a.count);
      return sorted[0].mood;
    } else {
      let dominant = 'none';
      let maxCount = 0;
      Object.keys(MOOD_METADATA).forEach(mood => {
        if (dayData[mood] > maxCount) {
          maxCount = dayData[mood];
          dominant = mood;
        }
      });
      return dominant;
    }
  };

  return (
    <div className="animated-fade-in" style={styles.container}>
      {/* Title Header with Serif Accent */}
      <header style={styles.header}>
        <h2 style={styles.pageTitle} className="font-diary-serif">Journal Analytics & Trajectory</h2>
        <p style={styles.pageSubtitle}>Visualize your daily mood points and personal reflections</p>
      </header>

      {/* Grid of 4 Stat Cards */}
      <section style={styles.statsGrid}>
        {stats.map((card, idx) => (
          <div key={idx} className="glass-panel glass-panel-hover" style={styles.statCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div style={styles.statContent}>
              <span style={styles.statTitle}>{card.title}</span>
              <div style={styles.statValueRow}>
                <span style={styles.statValue}>{card.value}</span>
                {card.emoji && <span style={styles.statEmoji}>{card.emoji}</span>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Analytics Point Plotting Grid */}
      <section style={styles.chartsGrid}>
        {/* Point Plot Trajectory Curve Chart */}
        <div className="glass-panel" style={styles.chartCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={styles.chartTitle}>
              <TrendingUp size={20} color="#818cf8" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Mood Point Trajectory
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
              Connected Plot
            </span>
          </div>

          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pointPlotData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pointGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip content={<PointTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="moodScore" 
                  stroke="#818cf8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#pointGradient)" 
                  dot={<RenderPointNode />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution Pie Chart */}
        <div className="glass-panel" style={styles.chartCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={styles.chartTitle}>
              <Activity size={20} color="#ec4899" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Mood Distribution
            </h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<PointTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 30-Day Mood Footprint Heatmap */}
      <section className="glass-panel" style={styles.heatmapCard}>
        <h3 style={styles.chartTitle}>30-Day Mood Footprint</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Daily emotional trajectory plot points over the past month
        </p>
        <div style={styles.heatmapGrid}>
          {data.monthlyTrend.map((dayData, idx) => {
            const mood = getDominantMoodForDay(dayData);
            const meta = MOOD_METADATA[mood];
            const dateObj = new Date(dayData.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            return (
              <div
                key={idx}
                className="heatmap-cell"
                title={`${dateStr} — Mood: ${meta ? meta.label : 'No Log'}`}
                style={{
                  backgroundColor: meta ? meta.color : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: meta ? `0 0 10px ${meta.color}40` : 'none',
                  border: `1px solid ${meta ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)'}`,
                }}
              />
            );
          })}
        </div>
        <div style={styles.heatmapLegend}>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Stressed / Low</span>
          {Object.keys(MOOD_METADATA).reverse().map(moodKey => (
            <div key={moodKey} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: MOOD_METADATA[moodKey].color }} />
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{MOOD_METADATA[moodKey].label}</span>
            </div>
          ))}
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Ecstatic / High</span>
        </div>
      </section>

      {/* Mood breakdown with Progress Bars */}
      <section style={{ marginTop: '1rem' }}>
        <div className="glass-panel" style={styles.tableCard}>
          <h3 style={styles.chartTitle}>Mood Breakdown Summary</h3>
          <div style={styles.tableContainer}>
            {Object.keys(MOOD_METADATA).map((moodKey) => {
              const meta = MOOD_METADATA[moodKey];
              const match = data.moodDistribution.find(d => d.mood === moodKey);
              const count = match ? match.count : 0;
              const percentage = data.totalEntries > 0 ? Math.round((count / data.totalEntries) * 100) : 0;

              return (
                <div key={moodKey} style={styles.progressRow}>
                  <div style={styles.progressLabelCol}>
                    <span style={styles.progressEmoji}>{meta.emoji}</span>
                    <span style={styles.progressLabel}>{meta.label}</span>
                  </div>
                  <div style={styles.progressBarWrapper}>
                    <div 
                      style={{ 
                        ...styles.progressBar, 
                        width: `${percentage}%`, 
                        backgroundColor: meta.color,
                        boxShadow: `0 0 10px ${meta.color}50` 
                      }} 
                    />
                  </div>
                  <div style={styles.progressValueCol}>
                    <span style={styles.progressCount}>{count} logs</span>
                    <span style={styles.progressPercent}>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      <section style={{ marginTop: '0.5rem' }}>
        {/* Event Reminders (Birthdays, Anniversaries, Events) */}
        <div className="reminder-card-vintage">
          <div className="reminder-header">
            <div className="reminder-icon">
              <Bell size={18} color="#f4e4c1" />
            </div>
            <span>Event & Birthday Reminders</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#5a3a28', marginBottom: '1rem', fontFamily: "'EB Garamond', serif", fontStyle: 'italic' }}>
            Set automated email reminders for important dates (birthdays, anniversaries, special events). Emails are sent automatically on the scheduled day.
          </p>

          {/* Small Form to Add Event Reminder */}
          <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="vintage-input"
                style={{ flex: '1 1 180px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="Event (e.g., Mom's Birthday)"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                required
              />
              <select
                className="vintage-input"
                style={{ width: '130px', padding: '0.45rem 0.5rem', fontSize: '0.85rem' }}
                value={newReminder.type}
                onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
              >
                <option value="birthday">🎂 Birthday</option>
                <option value="anniversary">💍 Anniversary</option>
                <option value="event">📅 Event</option>
                <option value="custom">📌 Custom</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="vintage-input"
                style={{ flex: '1 1 130px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                required
              />
              <input
                type="time"
                className="reminder-time-input"
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              />
              <button
                type="submit"
                disabled={addingReminder}
                className="btn-vintage"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
              >
                <Plus size={15} />
                <span>{addingReminder ? 'Saving...' : 'Add'}</span>
              </button>
            </div>
          </form>

          {/* List of Active Reminders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {reminders.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: '#8b6914', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>
                No event reminders scheduled yet. Add one above!
              </p>
            ) : (
              reminders.map(r => (
                <div key={r._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(244, 228, 193, 0.6)', border: '1px solid rgba(107, 58, 42, 0.2)',
                  borderRadius: '4px', padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: '#3c2415'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{r.type === 'birthday' ? '🎂' : r.type === 'anniversary' ? '💍' : r.type === 'custom' ? '📌' : '📅'}</span>
                    <strong style={{ fontFamily: "'EB Garamond', serif" }}>{r.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#8b6914' }}>
                      ({new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {r.time || '09:00'})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(r._id)}
                    style={{ background: 'none', border: 'none', color: '#8b2020', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                    title="Delete Reminder"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    color: '#9ca3af',
  },
  header: {
    marginBottom: '0.5rem',
  },
  pageTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
  },
  pageSubtitle: {
    color: '#9ca3af',
    fontSize: '0.95rem',
    marginTop: '0.25rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem',
    borderRadius: '16px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statTitle: {
    color: '#9ca3af',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 700,
    fontFamily: 'Outfit, sans-serif',
    lineHeight: '1.1',
  },
  statEmoji: {
    fontSize: '1.6rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '1.75rem',
    borderRadius: '20px',
  },
  chartTitle: {
    fontSize: '1.15rem',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 600,
    margin: 0,
  },
  chartTooltip: {
    background: 'rgba(12, 14, 28, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '0.85rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  },
  tableCard: {
    padding: '2rem',
    borderRadius: '20px',
  },
  heatmapCard: {
    padding: '2rem',
    borderRadius: '20px',
  },
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(15, 1fr)',
    gap: '0.5rem',
    maxWidth: '500px',
    margin: '0 auto 1.5rem auto',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  heatmapLegend: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  progressLabelCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '120px',
    flexShrink: 0,
  },
  progressEmoji: {
    fontSize: '1.25rem',
  },
  progressLabel: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  progressBarWrapper: {
    flexGrow: 1,
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
  },
  progressValueCol: {
    width: '120px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  progressCount: {
    color: '#9ca3af',
  },
  progressPercent: {
    fontWeight: 600,
  },
  emptyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
  },
  emptyCard: {
    maxWidth: '450px',
    width: '100%',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};
