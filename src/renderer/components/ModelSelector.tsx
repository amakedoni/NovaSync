import Dropdown from './Dropdown';

export interface Model {
  id: string;
  label: string;
}

interface Props {
  models: Model[];
  selected: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ models, selected, onSelect }: Props) {
  return <Dropdown items={models} selected={selected} onSelect={onSelect} side="left" />;
}
