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
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: 26,
        height: 26,
        background: 'var(--accent)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bg-deep)',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}>
        N
      </div>

      {/* Input row — bordered container */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 42,
        padding: '0 8px 0 14px',
        borderRadius: 10,
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-input)',
      }}>
        <InputBar
          value={query}
          onChange={onQueryChange}
          onSubmit={onSubmit}
          autoFocus
          placeholder="Ask anything..."
        />

        {/* Model pill */}
        <ModelSelector models={models} selected={model} onSelect={onModelSelect} />

        {/* Mode pill */}
        <ModeSelector selected={mode} onSelect={onModeSelect} />
      </div>
    </div>
  );
}
