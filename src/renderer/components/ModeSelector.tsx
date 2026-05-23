import Dropdown from './Dropdown';

export interface Mode {
  id: string;
  label: string;
  systemPrompt: string;
}

const MODES: Mode[] = [
  { id: 'chat', label: 'Chat', systemPrompt: '' },
  { id: 'explain', label: 'Explain', systemPrompt: 'Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs.' },
  { id: 'summarize', label: 'Summarize', systemPrompt: 'Summarize the following in 3 bullet points. Be extremely concise.' },
  { id: 'translate', label: 'Translate', systemPrompt: "Translate the following text to English. If it's already in English, translate to Russian. Output only the translation." },
  { id: 'fix-code', label: 'Fix Code', systemPrompt: 'Find and fix bugs in the following code. Show the corrected version. Explain each fix in one line.' },
];

interface Props {
  selected: string;
  onSelect: (modeId: string) => void;
}

export default function ModeSelector({ selected, onSelect }: Props) {
  return <Dropdown items={MODES} selected={selected} onSelect={onSelect} />;
}

export { MODES };
