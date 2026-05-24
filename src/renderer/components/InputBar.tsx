import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function InputBar({ value, onChange, onSubmit, disabled, autoFocus, placeholder = 'Ask anything...', onFocus, onBlur }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
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
      placeholder={disabled ? 'Waiting for response...' : placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      spellCheck={false}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: 13,
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
        padding: 0,
      }}
    />
  );
}
