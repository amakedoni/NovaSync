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

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mx-2 my-2 rounded-2xl border"
      style={{
        background: 'var(--surface-hover)',
        borderColor: value ? 'var(--border-focus)' : 'var(--border-input)',
        boxShadow: value ? 'var(--shadow-input)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !disabled && value.trim()) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={disabled ? 'Waiting for response...' : 'Ask anything...'}
        disabled={disabled}
        autoFocus={autoFocus}
        spellCheck={false}
        className="flex-1 bg-transparent border-none outline-none text-sm"
        style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
      />

      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-all"
        style={{
          background: value.trim() && !disabled
            ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
            : 'rgba(140,100,220,0.12)',
          boxShadow: value.trim() && !disabled ? 'var(--shadow-button)' : 'none',
          opacity: value.trim() && !disabled ? 1 : 0.4,
          color: '#fff',
          fontSize: '14px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
