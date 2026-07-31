import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out slightly before completion
    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
    }, 4700);

    // Call close callback after 5 seconds
    const closeTimeout = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(closeTimeout);
    };
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        ...styles.toast,
        ...(isFading ? styles.toastFadeOut : {}),
        backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.92)' : 'rgba(239, 68, 68, 0.92)',
        border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
        boxShadow: isSuccess ? '0 15px 35px rgba(16, 185, 129, 0.25)' : '0 15px 35px rgba(239, 68, 68, 0.25)'
      }}
    >
      <div style={styles.content}>
        {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span style={styles.message}>{message}</span>
      </div>
      <button onClick={() => { setIsFading(true); setTimeout(onClose, 200); }} style={styles.closeBtn}>
        <X size={16} />
      </button>

      {/* Premium ticking countdown progress bar */}
      <div style={{
        ...styles.progressBar,
        backgroundColor: isSuccess ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)',
      }} />
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed',
    bottom: '2.5rem',
    right: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    padding: '1rem 1.5rem',
    paddingBottom: '1.25rem', // Make room for progress bar
    borderRadius: '12px',
    color: '#ffffff',
    zIndex: 9999,
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    overflow: 'hidden',
  },
  toastFadeOut: {
    opacity: 0,
    transform: 'translateY(15px) scale(0.95)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  message: {
    lineHeight: '1.2',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    opacity: 0.7,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.1rem',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    width: '100%',
    animation: 'toastProgress 5s linear forwards',
    transformOrigin: 'left center',
  }
};

// Add standard keyframes dynamically
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateY(30px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toastProgress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
}
