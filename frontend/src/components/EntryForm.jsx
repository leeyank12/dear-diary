import React, { useState } from 'react';
import { Save, Calendar, Feather } from 'lucide-react';

const MOODS = [
  { value: 'ecstatic', emoji: '🤩', label: 'Ecstatic' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'stressed', emoji: '🤯', label: 'Stressed' },
];

export default function EntryForm({ initialData = {}, onSubmit, submitLabel = 'Save Entry', isSubmitting = false }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [mood, setMood] = useState(initialData.mood || '');
  const [fontStyle, setFontStyle] = useState('handwriting'); // 'handwriting', 'serif', 'sans'
  const [date, setDate] = useState(
    initialData.date 
      ? new Date(initialData.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Title is required';
    if (!description.trim()) tempErrors.description = 'Please write some thoughts';
    if (!mood) tempErrors.mood = 'Please select a mood';
    if (!date) tempErrors.date = 'Please select a date';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ title, description, mood, date: new Date(date).toISOString() });
    }
  };

  const getFontClass = () => {
    if (fontStyle === 'handwriting') return 'font-vintage-script';
    if (fontStyle === 'serif') return 'font-vintage-serif';
    return '';
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Quill Toolbar — Writing Style Selector */}
      <div className="quill-toolbar">
        <span className="toolbar-label">
          <Feather size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Writing Style:
        </span>
        <div style={styles.fontToggleGroup}>
          <button
            type="button"
            onClick={() => setFontStyle('handwriting')}
            className={`quill-font-btn ${fontStyle === 'handwriting' ? 'active' : ''}`}
            style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.05rem' }}
          >
            Handwritten
          </button>
          <button
            type="button"
            onClick={() => setFontStyle('serif')}
            className={`quill-font-btn ${fontStyle === 'serif' ? 'active' : ''}`}
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Classic Book
          </button>
          <button
            type="button"
            onClick={() => setFontStyle('sans')}
            className={`quill-font-btn ${fontStyle === 'sans' ? 'active' : ''}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Modern
          </button>
        </div>
      </div>

      {/* 1. Title Input */}
      <div style={styles.formGroup}>
        <label className="vintage-label" htmlFor="title">Journal Entry Title</label>
        <input
          id="title"
          type="text"
          className={`vintage-input ${getFontClass()}`}
          placeholder="Dear Diary, today..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span style={styles.errorText}>{errors.title}</span>}
      </div>

      {/* 2. Date Input */}
      <div style={styles.formGroup}>
        <label className="vintage-label" htmlFor="date">Date</label>
        <div style={styles.dateWrapper}>
          <Calendar size={18} style={styles.calendarIcon} />
          <input
            id="date"
            type="date"
            className="vintage-input"
            style={{ paddingLeft: '2.5rem' }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {errors.date && <span style={styles.errorText}>{errors.date}</span>}
      </div>

      {/* 3. Wax Seal Mood Picker */}
      <div style={styles.formGroup}>
        <label className="vintage-label">How are you feeling?</label>
        <div style={styles.moodGrid}>
          {MOODS.map((item) => {
            const isSelected = mood === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMood(item.value)}
                className={`vintage-mood-btn ${isSelected ? 'selected' : ''}`}
                style={isSelected ? { borderColor: `var(--color-${item.value})`, boxShadow: `0 0 12px var(--color-${item.value})30` } : {}}
              >
                <div className={`wax-seal wax-seal-${item.value}`} style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
                  {item.emoji}
                </div>
                <span className="mood-text">{item.label}</span>
              </button>
            );
          })}
        </div>
        {errors.mood && <span style={styles.errorText}>{errors.mood}</span>}
      </div>

      {/* 4. Vintage Parchment Ruled Textarea */}
      <div style={styles.formGroup}>
        <label className="vintage-label" htmlFor="description">Thoughts & Personal Notes</label>
        <div className="vintage-paper vintage-ruled" style={{ borderRadius: '6px', overflow: 'hidden', padding: '0' }}>
          <textarea
            id="description"
            className={`vintage-textarea ${getFontClass()}`}
            style={styles.notebookTextarea}
            placeholder="Pour your heart onto these aged pages..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {errors.description && <span style={styles.errorText}>{errors.description}</span>}
      </div>

      {/* 5. Vintage Submit Button */}
      <button type="submit" disabled={isSubmitting} className="btn-vintage" style={styles.submitBtn}>
        <Save size={18} />
        <span>{isSubmitting ? 'Sealing Entry...' : submitLabel}</span>
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'relative',
    zIndex: 1,
  },
  formGroup: {
    marginBottom: '1.2rem',
  },
  fontToggleGroup: {
    display: 'flex',
    gap: '0.4rem',
  },
  dateWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  calendarIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#5a3a28',
    pointerEvents: 'none',
    opacity: 0.6,
  },
  moodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  notebookTextarea: {
    minHeight: '220px',
    resize: 'vertical',
    lineHeight: '28px',
    paddingLeft: '56px',
    paddingTop: '14px',
    paddingRight: '16px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: '1rem',
    color: 'var(--vintage-ink)',
  },
  errorText: {
    color: '#8b2020',
    fontSize: '0.8rem',
    marginTop: '0.35rem',
    display: 'block',
    fontFamily: "'EB Garamond', serif",
    fontStyle: 'italic',
  },
  submitBtn: {
    marginTop: '0.5rem',
    alignSelf: 'flex-start',
  },
};
