import React, { useEffect, useState } from 'react';
import { Search, Eye, Edit2, Trash2, X, ChevronLeft, ChevronRight, Calendar, BookOpen, Feather } from 'lucide-react';
import api from '../api';
import EntryForm from '../components/EntryForm';
import { useToast } from '../App';

const MOOD_FILTERS = [
  { value: '', label: 'All Moods', emoji: '🔍' },
  { value: 'ecstatic', label: 'Ecstatic', emoji: '🤩' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'stressed', label: 'Stressed', emoji: '🤯' },
];

export default function DiaryList() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filters State
  const [search, setSearch] = useState('');
  const [mood, setMood] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [useHandwriting, setUseHandwriting] = useState(false);

  // Modal States
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await api.diary.getAll({
        search,
        mood,
        startDate,
        endDate,
        page,
        limit: 6,
      });
      setEntries(data.entries);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch diary entries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [search, mood, startDate, endDate, page]);

  useEffect(() => {
    setPage(1);
  }, [search, mood, startDate, endDate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to burn this diary page forever?')) {
      try {
        await api.diary.delete(id);
        showToast('Entry removed from the journal.');
        fetchEntries();
      } catch (err) {
        showToast('Failed to delete entry.', 'error');
      }
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.diary.update(editingEntry._id, formData);
      showToast('Entry updated and resealed.');
      setEditingEntry(null);
      fetchEntries();
    } catch (err) {
      showToast('Failed to update entry.', 'error');
    }
  };

  const formatDate = (isoString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animated-fade-in" style={styles.container}>
      {/* Header with Font Preference Switch */}
      <header style={styles.headerRow}>
        <div className="vintage-page-header">
          <div className="header-icon">
            <BookOpen size={22} color="#f4e4c1" />
          </div>
          <div>
            <h2 className="vintage-page-title">My Personal Journal</h2>
            <p className="vintage-page-subtitle">Turn through the pages of your emotional journey</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUseHandwriting(!useHandwriting)}
          className={`btn-vintage-outline`}
          style={{ fontSize: '0.82rem' }}
        >
          <Feather size={15} />
          <span>{useHandwriting ? 'Font: Handwritten' : 'Font: Classic'}</span>
        </button>
      </header>

      {/* Vintage Search & Filters Bar */}
      <div className="vintage-search-bar" style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            className="vintage-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search diary titles or memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.datesRow}>
          <div style={styles.dateInputWrapper}>
            <span style={styles.dateLabel}>From:</span>
            <input
              type="date"
              className="vintage-input"
              style={styles.dateField}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={styles.dateInputWrapper}>
            <span style={styles.dateLabel}>To:</span>
            <input
              type="date"
              className="vintage-input"
              style={styles.dateField}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Vintage Mood Filter Chips */}
      <div style={styles.moodChipsRow}>
        {MOOD_FILTERS.map((chip) => {
          const isSelected = mood === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setMood(chip.value)}
              className={`vintage-chip ${isSelected ? 'active' : ''}`}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Entries Display */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <h3 style={{ fontFamily: "'EB Garamond', serif", color: '#5a3a28' }}>Opening diary pages...</h3>
        </div>
      ) : entries.length === 0 ? (
        <div className="vintage-paper" style={styles.emptyContainer}>
          <p style={{ color: '#5a3a28', fontFamily: "'EB Garamond', serif", fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
            No diary pages found matching your search.
          </p>
        </div>
      ) : (
        <>
          {/* Leather-Bound Vintage Cards Grid */}
          <div style={styles.grid}>
            {entries.map((entry, idx) => (
              <div 
                key={entry._id} 
                className="vintage-leather-card vintage-flip-in"
                style={{
                  ...styles.card,
                  animationDelay: `${idx * 0.08}s`
                }}
              >
                {/* Wax Seal + Date Header */}
                <div style={styles.cardHeader}>
                  <div className={`wax-seal wax-seal-${entry.mood}`} style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>
                    {MOOD_FILTERS.find(m => m.value === entry.mood)?.emoji || '😐'}
                  </div>
                  <span className="vintage-date-badge">{formatDate(entry.date)}</span>
                </div>
                <h3 
                  className={`vintage-card-title ${useHandwriting ? 'font-vintage-script' : 'font-vintage-serif'}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {entry.title}
                </h3>
                <p 
                  className={`vintage-card-snippet ${useHandwriting ? 'font-vintage-script' : ''}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {entry.description.length > 130 
                    ? `${entry.description.substring(0, 130)}...` 
                    : entry.description}
                </p>
                <div style={styles.cardFooter}>
                  <button onClick={() => setSelectedEntry(entry)} className="vintage-icon-btn" title="Read Page">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => setEditingEntry(entry)} className="vintage-icon-btn" title="Edit Page">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(entry._id)} className="vintage-icon-btn danger" title="Delete Page">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vintage Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="vintage-pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="btn-vintage-outline"
              >
                <ChevronLeft size={16} />
                <span>Prev Page</span>
              </button>
              <span className="page-text">
                Page <strong>{page}</strong> of {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} 
                disabled={page === pagination.totalPages}
                className="btn-vintage-outline"
              >
                <span>Next Page</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* VINTAGE DIARY DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedEntry && (
        <div className="vintage-modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div 
            className="vintage-paper vintage-ruled vintage-flip-in" 
            style={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedEntry(null)} style={styles.modalCloseBtn}>
              <X size={20} />
            </button>
            <div style={styles.modalHeader}>
              <div className={`wax-seal wax-seal-${selectedEntry.mood}`}>
                {MOOD_FILTERS.find(m => m.value === selectedEntry.mood)?.emoji || '😐'}
              </div>
              <div style={styles.modalDate}>
                <Calendar size={14} />
                <span>{formatDate(selectedEntry.date)}</span>
              </div>
            </div>
            <h2 
              className={`ink-title ${useHandwriting ? 'font-vintage-script' : 'font-vintage-serif'}`}
              style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}
            >
              {selectedEntry.title}
            </h2>
            <div className="vintage-divider" />
            <div style={styles.modalBody}>
              {selectedEntry.description.split('\n').map((para, i) => (
                <p 
                  key={i} 
                  className={useHandwriting ? 'font-vintage-script' : 'font-vintage-serif'} 
                  style={styles.modalParagraph}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VINTAGE EDIT MODAL */}
      {/* ============================================================== */}
      {editingEntry && (
        <div className="vintage-modal-overlay" onClick={() => setEditingEntry(null)}>
          <div 
            className="vintage-paper vintage-flip-in" 
            style={{ ...styles.modalContent, maxWidth: '620px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setEditingEntry(null)} style={styles.modalCloseBtn}>
              <X size={20} />
            </button>
            <h2 className="ink-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Edit Journal Page
            </h2>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <EntryForm 
                initialData={editingEntry} 
                onSubmit={handleEditSubmit} 
                submitLabel="Save Changes" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    minWidth: '260px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#5a3a28',
    pointerEvents: 'none',
    opacity: 0.5,
  },
  datesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  dateInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dateLabel: {
    fontSize: '0.82rem',
    color: '#5a3a28',
    fontWeight: 600,
    fontFamily: "'EB Garamond', serif",
    fontStyle: 'italic',
  },
  dateField: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    width: '140px',
  },
  moodChipsRow: {
    display: 'flex',
    gap: '0.65rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '230px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
    position: 'relative',
    zIndex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid rgba(107, 58, 42, 0.12)',
    paddingTop: '0.75rem',
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem',
    color: '#5a3a28',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '4rem',
    borderRadius: '6px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '580px',
    maxHeight: '85vh',
    overflowY: 'auto',
    padding: '2.5rem 2.2rem',
    borderRadius: '6px',
    position: 'relative',
    boxShadow: '0 25px 60px rgba(60, 36, 21, 0.5)',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'none',
    border: 'none',
    color: '#5a3a28',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '50%',
    transition: 'background 0.2s',
    zIndex: 10,
    opacity: 0.6,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    position: 'relative',
    zIndex: 1,
  },
  modalDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: '#5a3a28',
    fontFamily: "'EB Garamond', serif",
    fontStyle: 'italic',
    opacity: 0.7,
  },
  modalBody: {
    color: '#3c2415',
    fontSize: '1.05rem',
    lineHeight: '1.7',
    position: 'relative',
    zIndex: 1,
    fontFamily: "'EB Garamond', serif",
  },
  modalParagraph: {
    marginBottom: '1rem',
  },
};
