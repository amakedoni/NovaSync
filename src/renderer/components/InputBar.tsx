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
      className="flex items-center gap-2 px-3 py-2 mx-4 my-2 rounded-2xl border"
      style={{
        background: 'var(--surface-hover)',
        borderColor: value ? 'var(--border-focus)' : 'var(--border-input)',
        boxShadow: value ? 'var(--shadow-input)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Search icon */}
      <svg
        width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="var(--text-tertiary)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: value ? 1 : 0.6, transition: 'opacity 0.15s' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

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
        placeholder="Ask anything..."
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
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
        style={{
          background: value.trim()
            ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
            : 'rgba(140,100,220,0.12)',
          boxShadow: value.trim() ? 'var(--shadow-button)' : 'none',
          opacity: value.trim() ? 1 : 0.4,
          transition: 'all 0.15s ease',
          color: '#fff',
          fontSize: '12px',
        }}
      >
        →
      </button>
    </div>
  );
}
