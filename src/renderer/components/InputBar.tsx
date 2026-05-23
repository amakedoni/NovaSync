import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function InputBar({ value, onChange, onSubmit, disabled, autoFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 6px 6px 14px',
        borderRadius: 16,
        background: 'var(--bg-secondary)',
        border: `1px solid ${value ? 'var(--border-focus)' : 'var(--border-input)'}`,
        boxShadow: value ? '0 0 0 1px var(--accent-glow), var(--shadow-input)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && canSend) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={disabled ? 'Waiting for response...' : 'Ask anything...'}
        disabled={disabled}
        autoFocus={autoFocus}
        spellCheck={false}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: 13,
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
          padding: '2px 0',
        }}
      />

      <button
        onClick={onSubmit}
        disabled={!canSend}
        aria-label="Send"
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: 'none',
          cursor: canSend ? 'pointer' : 'default',
          background: canSend
            ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
            : 'var(--surface-hover)',
          boxShadow: canSend ? 'var(--shadow-button)' : 'none',
          opacity: canSend ? 1 : 0.4,
          color: '#fff',
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
