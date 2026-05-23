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

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2.5"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {/* Copy button — fixed width to prevent layout shift */}
      <button
        onClick={handleCopy}
        disabled={!hasContent}
        title="Copy last response"
        className="px-3 py-1.5 rounded-2xl text-[10px] font-medium flex items-center gap-1.5 border-none cursor-pointer transition-all"
        style={{
          background: copied ? 'rgba(52,211,153,0.1)' : 'var(--surface-hover)',
          color: copied ? 'var(--success)' : 'var(--text-secondary)',
          border: `1px solid ${copied ? 'rgba(52,211,153,0.2)' : 'var(--border-subtle)'}`,
          fontFamily: 'inherit',
          minWidth: '62px',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Copy
          </>
        )}
      </button>

      <button
        onClick={onRetry}
        title="Retry last query"
        className="px-3 py-1.5 rounded-2xl text-[10px] font-medium border-none cursor-pointer transition-all"
        style={{
          background: 'var(--surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Retry
      </button>

      {/* Follow-up input — min-width prevents crush */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl"
        style={{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-input)',
          flex: 1,
          minWidth: 0,
        }}
      >
        <input
          type="text"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && followUp.trim()) handleFollowUpSubmit();
          }}
          placeholder="Follow up..."
          className="flex-1 bg-transparent border-none outline-none text-[11px] min-w-0"
          style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
        />
        <button
          onClick={handleFollowUpSubmit}
          disabled={!followUp.trim()}
          aria-label="Send follow-up"
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 text-[10px] transition-all"
          style={{
            background: followUp.trim()
              ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
              : 'rgba(140,100,220,0.12)',
            boxShadow: followUp.trim() ? 'var(--shadow-button)' : 'none',
            color: '#fff',
            opacity: followUp.trim() ? 1 : 0.4,
            fontFamily: 'inherit',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
