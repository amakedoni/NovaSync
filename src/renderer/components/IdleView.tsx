import { useState, useEffect } from 'react';
import ModelSelector, { type Model } from './ModelSelector';
import ModeSelector from './ModeSelector';
import InputBar from './InputBar';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  models: Model[];
  model: string;
  onModelSelect: (id: string) => void;
  mode: string;
  onModeSelect: (id: string) => void;
}

export default function IdleView({
  query, onQueryChange, onSubmit,
  models, model, onModelSelect,
  mode, onModeSelect,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [clipText, setClipText] = useState('');

  useEffect(() => {
    window.electronAPI?.readClipboard().then((t) => t && setClipText(t.slice(0, 200)));
  }, []);

  const handlePaste = () => {
    if (clipText) {
      const combined = query ? `${query}\n\n${clipText}` : clipText;
      onQueryChange(combined.slice(0, 2000));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '4px 18px 2px',
        position: 'relative',
        zIndex: 1,
        gap: 4,
      }}
    >
      {/* Input row: field + separator + model + mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 40,
          width: '100%',
          padding: '0 5px 0 16px',
          borderRadius: 'var(--radius-input)',
          background: 'rgba(60, 60, 64, 0.40)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: focused ? '0.5px solid var(--border-focus)' : '0.5px solid rgba(255, 255, 255, 0.12)',
          transition: 'border-color 0.2s ease',
        }}
      >
        <InputBar
          value={query}
          onChange={onQueryChange}
          onSubmit={onSubmit}
          autoFocus
          placeholder="Ask anything..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {clipText && (
          <button
            onClick={handlePaste}
            title="Paste from clipboard"
            aria-label="Paste from clipboard"
            style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '0.5px solid var(--border-subtle)',
              background: 'var(--surface-hover)',
              color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 11,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="4" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 12V3a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <div style={{ width: '0.5px', height: 18, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <ModelSelector models={models} selected={model} onSelect={onModelSelect} />
        <ModeSelector selected={mode} onSelect={onModeSelect} />
      </div>

      {/* Hint */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 8, color: 'var(--text-tertiary)' }}>
          Enter to send · Esc to close{clipText ? ' · 📋 to paste' : ''}
        </span>
      </div>
    </div>
  );
}
