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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Setup</span>
      </div>

      {/* Provider tabs */}
      <div>
        <label
          style={{
            display: 'block', fontSize: 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: 6, color: 'var(--text-secondary)',
          }}
        >
          Provider
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setProvider(p.id); setError(''); }}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 12, fontSize: 10, fontWeight: 600,
                border: '0.5px solid',
                cursor: 'pointer', fontFamily: 'inherit',
                background: p.id === provider ? 'var(--surface-active)' : 'var(--surface-hover)',
                borderColor: p.id === provider ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: p.id === provider ? 'var(--accent)' : 'var(--text-tertiary)',
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
          style={{
            display: 'block', fontSize: 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: 6, color: 'var(--text-secondary)',
          }}
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
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 12, outline: 'none',
            background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border-input)'}`,
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}
        />
        {apiKey.length > 0 && !error && (
          <span style={{ display: 'block', textAlign: 'right', fontSize: 9, marginTop: 4, color: 'var(--text-tertiary)' }}>
            {apiKey.length} characters
          </span>
        )}
        {error && (
          <span style={{ display: 'block', textAlign: 'right', fontSize: 9, marginTop: 4, color: 'var(--error)' }}>
            {error}
          </span>
        )}
      </div>

      {/* Get key link */}
      <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Get a key at{' '}
        <button
          onClick={() => window.electronAPI?.openUrl(currentProvider.getUrl)}
          style={{
            background: 'transparent', border: 'none', padding: 0,
            textDecoration: 'underline', cursor: 'pointer', fontSize: 10,
            color: 'var(--accent)', fontFamily: 'inherit',
          }}
        >
          {currentProvider.label} &rarr;
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!apiKey.trim() || saving}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 20, fontSize: 13, fontWeight: 600,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
          boxShadow: '0 0 16px var(--accent-glow)',
          color: '#fff',
          opacity: !apiKey.trim() || saving ? 0.4 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save & Start'}
      </button>

      <span style={{ fontSize: 9, textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Key is stored locally, sent only to the provider's API.
      </span>
    </div>
  );
}
