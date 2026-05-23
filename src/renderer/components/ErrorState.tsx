interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: 'var(--error-bg)', border: '1px solid rgba(255,130,130,0.2)', color: 'var(--error)',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3.5M8 11v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Something went wrong</span>
      {message && (
        <span style={{ color: 'var(--text-tertiary)', fontSize: 11, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
          {message}
        </span>
      )}
      <button onClick={onRetry} style={{
        marginTop: 4, padding: '8px 18px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid rgba(167,139,250,0.25)',
        background: 'var(--surface-active)', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Retry
      </button>
    </div>
  );
}
