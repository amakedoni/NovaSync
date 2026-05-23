interface QuickAction {
  label: string;
  systemPrompt: string;
}

const ACTIONS: QuickAction[] = [
  { label: 'Explain', systemPrompt: 'Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs.' },
  { label: 'Summarize', systemPrompt: 'Summarize the following in 3 bullet points. Be extremely concise.' },
  { label: 'Translate', systemPrompt: "Translate the following text to English. If it's already in English, translate to Russian. Output only the translation." },
  { label: 'Fix Code', systemPrompt: 'Find and fix bugs in the following code. Show the corrected version. Explain each fix in one line.' },
];

interface Props {
  onAction: (action: QuickAction) => void;
}

const btnStyle: React.CSSProperties = {
  background: 'var(--surface-hover)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-subtle)',
  fontFamily: 'inherit',
  cursor: 'pointer',
  borderRadius: 20,
  padding: '5px 12px',
  fontSize: 10,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

export default function QuickActions({ onAction }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action)}
          className="quick-action-btn"
          style={btnStyle}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
