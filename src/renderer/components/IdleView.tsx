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
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
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

      {/* Input */}
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
  );
}
