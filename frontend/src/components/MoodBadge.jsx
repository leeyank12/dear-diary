import React from 'react';

const MOODS_METADATA = {
  ecstatic: { emoji: '🤩', label: 'Ecstatic', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  happy: { emoji: '😊', label: 'Happy', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
  neutral: { emoji: '😐', label: 'Neutral', bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  sad: { emoji: '😢', label: 'Sad', bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  stressed: { emoji: '🤯', label: 'Stressed', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function MoodBadge({ mood }) {
  const meta = MOODS_METADATA[mood] || MOODS_METADATA.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border}`,
        textTransform: 'capitalize',
        width: 'fit-content'
      }}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
