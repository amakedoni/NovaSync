interface Props {
  message: string;
  onRetry: () => void;
  onSettings?: () => void;
}

export default function ErrorState({ message, onRetry, onSettings }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
      {/* Error icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: '2px solid var(--accent)', color: 'var(--accent)',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3.5M8 11v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Something went wrong</span>
      {message && (
        <span style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
          {message}
        </span>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onSettings && (
          <button onClick={onSettings} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            border: 'none', background: 'var(--surface-subtle)', color: 'var(--text-tertiary)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Settings
          </button>
        )}
        <button onClick={onRetry} style={{
          padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: 'none', background: 'var(--accent)', color: 'var(--bg-deep)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Retry
        </button>
      </div>
    </div>
  );
}
