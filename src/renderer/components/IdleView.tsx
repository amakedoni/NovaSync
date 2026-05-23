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
          border: '0.5px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <InputBar
          value={query}
          onChange={onQueryChange}
          onSubmit={onSubmit}
          autoFocus
          placeholder="Ask anything..."
        />
        <div style={{ width: '0.5px', height: 18, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <ModelSelector models={models} selected={model} onSelect={onModelSelect} />
        <ModeSelector selected={mode} onSelect={onModeSelect} />
      </div>

      {/* Hint */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.18)' }}>
          Enter to send · Esc to close
        </span>
      </div>
    </div>
  );
}
