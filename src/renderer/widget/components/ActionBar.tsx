import { useState, useCallback } from 'react';

interface Props {
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
  hasContent: boolean;
}

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

  const btnBase: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 500,
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderTop: '1px solid var(--border-subtle)' }}>
      <button onClick={handleCopy} disabled={!hasContent} title="Copy last response"
        style={{
          ...btnBase,
          minWidth: 62, justifyContent: 'center',
          background: copied ? 'rgba(52,211,153,0.1)' : 'var(--surface-hover)',
          color: copied ? 'var(--success)' : 'var(--text-secondary)',
          borderColor: copied ? 'rgba(52,211,153,0.2)' : 'var(--border-subtle)',
        }}>
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Copy
          </>
        )}
      </button>

      <button onClick={onRetry} title="Retry last query"
        style={{ ...btnBase, background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
        Retry
      </button>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: 'var(--surface-hover)', border: '1px solid var(--border-input)' }}>
        <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && followUp.trim()) handleFollowUpSubmit(); }}
          placeholder="Follow up..."
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: 'var(--text-primary)', fontFamily: 'inherit', padding: 0 }} />
        <button onClick={handleFollowUpSubmit} disabled={!followUp.trim()} aria-label="Send follow-up"
          style={{
            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: followUp.trim() ? 'pointer' : 'default',
            background: followUp.trim() ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))' : 'rgba(140,100,220,0.12)',
            boxShadow: followUp.trim() ? 'var(--shadow-button)' : 'none', opacity: followUp.trim() ? 1 : 0.4, color: '#fff',
          }}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
