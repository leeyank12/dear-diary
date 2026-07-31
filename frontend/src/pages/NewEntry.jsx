import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntryForm from '../components/EntryForm';
import api from '../api';
import { useToast } from '../App';
import { PenTool } from 'lucide-react';

export default function NewEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await api.diary.create(formData);
      showToast('New diary entry sealed and saved!');
      navigate('/entries');
    } catch (err) {
      console.error(err);
      showToast('Failed to save journal entry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animated-fade-in" style={styles.container}>
      {/* Vintage Page Header */}
      <header>
        <div className="vintage-page-header">
          <div className="header-icon">
            <PenTool size={22} color="#f4e4c1" />
          </div>
          <div>
            <h2 className="vintage-page-title">Write Journal Entry</h2>
            <p className="vintage-page-subtitle">Pour your thoughts and feelings onto the page</p>
          </div>
        </div>
      </header>

      {/* Vintage Parchment Writing Card */}
      <div className="vintage-paper" style={styles.formCard}>
        {/* Decorative corner flourish */}
        <div style={styles.cornerFlourish}>✦</div>
        <div style={styles.cornerFlourishBottom}>✦</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <EntryForm onSubmit={handleSubmit} submitLabel="Seal & Save Entry" isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  formCard: {
    padding: '2.5rem 2rem',
    borderRadius: '6px',
    position: 'relative',
  },
  cornerFlourish: {
    position: 'absolute',
    top: '12px',
    left: '14px',
    fontSize: '1.2rem',
    color: 'rgba(139, 105, 20, 0.3)',
    fontFamily: 'serif',
    zIndex: 1,
    pointerEvents: 'none',
  },
  cornerFlourishBottom: {
    position: 'absolute',
    bottom: '12px',
    right: '14px',
    fontSize: '1.2rem',
    color: 'rgba(139, 105, 20, 0.3)',
    fontFamily: 'serif',
    zIndex: 1,
    pointerEvents: 'none',
    transform: 'rotate(180deg)',
  },
};
