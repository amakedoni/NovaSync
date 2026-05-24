import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
  hasContent: boolean;
}

const btnBase: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 5,
  fontSize: 10,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 0.15s ease',
};

export default function ActionBar({ onCopy, onRetry, onFollowUp, hasContent }: Props) {
  const [copied, setCopied] = useState(false);
  const [followUp, setFollowUp] = useState('');

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const handleFollowUpSubmit = () => {
    const trimmed = followUp.trim();
    if (!trimmed) return;
    onFollowUp(trimmed);
    setFollowUp('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Copy button */}
      <button onClick={handleCopy} disabled={!hasContent} title="Copy last response"
        style={{
          ...btnBase, minWidth: 64, justifyContent: 'center',
          background: copied ? 'var(--success-bg)' : 'var(--surface-subtle)',
          color: copied ? 'var(--success)' : 'var(--text-tertiary)',
        }}>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Copied
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              Copy
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Retry button */}
      <button onClick={onRetry} title="Retry last query"
        style={{ ...btnBase, background: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; }}
      >
        Retry
      </button>

      {/* Follow-up input */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderRadius: 5,
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-input)',
      }}>
        <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && followUp.trim()) handleFollowUpSubmit(); }}
          placeholder="Follow up..."
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: 'var(--text-primary)', fontFamily: 'inherit', padding: 0 }} />
        <button onClick={handleFollowUpSubmit} disabled={!followUp.trim()} aria-label="Send follow-up"
          style={{
            width: 24, height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: followUp.trim() ? 'pointer' : 'default',
            background: followUp.trim() ? 'var(--accent)' : 'var(--surface-active)',
            opacity: followUp.trim() ? 1 : 0.35,
            color: followUp.trim() ? 'var(--bg-deep)' : 'var(--text-tertiary)',
            transition: 'all 0.2s ease',
          }}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
