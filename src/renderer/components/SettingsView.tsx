import { useState } from 'react';

interface Props {
  onSaved: () => void;
}

const PROVIDERS = [
  { id: 'deepseek', label: 'DeepSeek', getUrl: 'https://platform.deepseek.com/api_keys', keyPrefix: 'sk-' },
  { id: 'openai', label: 'OpenAI', getUrl: 'https://platform.openai.com/api-keys', keyPrefix: 'sk-proj-' },
  { id: 'anthropic', label: 'Anthropic', getUrl: 'https://console.anthropic.com/settings/keys', keyPrefix: 'sk-ant-' },
];

export default function SettingsView({ onSaved }: Props) {
  const [provider, setProvider] = useState('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSave = async () => {
    const key = apiKey.trim();
    if (!key) return;

    // Check prefix matches
    if (!key.startsWith(currentProvider.keyPrefix)) {
      setError(`Key should start with "${currentProvider.keyPrefix}"`);
      return;
    }

    if (key.length < 20) {
      setError('Key seems too short. Please check it.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await window.electronAPI?.saveApiKey(provider, key);
    } catch {
      setError('Failed to save. Try again.');
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3.5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Setup</span>
      </div>

      {/* Provider tabs */}
      <div>
        <label
          className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Provider
        </label>
        <div className="flex gap-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setProvider(p.id); setError(''); }}
              className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold border cursor-pointer transition-all"
              style={{
                background: p.id === provider ? 'var(--surface-active)' : 'var(--surface-hover)',
                borderColor: p.id === provider ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: p.id === provider ? 'var(--accent)' : 'var(--text-tertiary)',
                fontFamily: 'inherit',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Key input */}
      <div>
        <label
          className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={currentProvider.keyPrefix + '...'}
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border-input)'}`,
            color: 'var(--text-primary)',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}
        />
        {apiKey.length > 0 && !error && (
          <span className="block text-right text-[9px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {apiKey.length} characters
          </span>
        )}
        {error && (
          <span className="block text-right text-[9px] mt-1" style={{ color: 'var(--error)' }}>
            {error}
          </span>
        )}
      </div>

      {/* Get key link */}
      <div className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
        Get a key at{' '}
        <button
          onClick={() => window.electronAPI?.openUrl(currentProvider.getUrl)}
          className="bg-transparent border-none p-0 underline cursor-pointer text-[10px]"
          style={{ color: 'var(--accent)', fontFamily: 'inherit' }}
        >
          {currentProvider.label} →
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!apiKey.trim() || saving}
        className="w-full py-2.5 rounded-2xl text-[13px] font-semibold border-none cursor-pointer transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
          boxShadow: '0 0 16px var(--accent-glow)',
          color: '#fff',
          fontFamily: 'inherit',
          opacity: !apiKey.trim() || saving ? 0.4 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save & Start'}
      </button>

      <span className="text-[9px] text-center" style={{ color: 'var(--text-tertiary)' }}>
        Key is stored locally, sent only to the provider's API.
      </span>
    </div>
  );
}
