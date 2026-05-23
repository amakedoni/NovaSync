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
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Input row: field + separator + model + mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 44,
          padding: '0 6px 0 18px',
          borderRadius: 'var(--radius-input)',
          background: 'rgba(60, 60, 64, 0.45)',
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
        <div style={{ width: '0.5px', height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0, margin: '0 2px' }} />
        <ModelSelector models={models} selected={model} onSelect={onModelSelect} />
        <ModeSelector selected={mode} onSelect={onModeSelect} />
      </div>

      {/* Hint */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
          Enter to send · Esc to close
        </span>
      </div>
    </div>
  );
}
