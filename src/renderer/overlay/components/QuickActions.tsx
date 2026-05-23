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

export default function QuickActions({ onAction }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action)}
          className="px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer border-none transition-all duration-150"
          style={{
            background: 'var(--surface-hover)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-active)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
