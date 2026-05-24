import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Tab = 'general' | 'models' | 'keys';

interface Settings {
  hotkey: string;
  defaultModel: string;
  launchOnStartup: boolean;
  autoReadClipboard: boolean;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'models', label: 'Models' },
  { id: 'keys', label: 'API Keys' },
];

const MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek V3' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

const PROVIDERS = [
  { id: 'deepseek', label: 'DeepSeek', getUrl: 'https://platform.deepseek.com/api_keys', keyPrefix: 'sk-' },
  { id: 'openai', label: 'OpenAI', getUrl: 'https://platform.openai.com/api-keys', keyPrefix: 'sk-proj-' },
  { id: 'anthropic', label: 'Anthropic', getUrl: 'https://console.anthropic.com/settings/keys', keyPrefix: 'sk-ant-' },
];

const shell: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-input)',
  borderRadius: 'var(--radius-window)',
  boxShadow: 'var(--shadow-window)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  background: active ? 'var(--surface-active)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-tertiary)',
  transition: 'background 0.15s ease, color 0.15s ease',
});

const fieldset: React.CSSProperties = {
  background: 'var(--surface-hover)',
  borderRadius: 14,
  padding: '14px 16px',
  border: '1px solid var(--border-subtle)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary)',
  marginBottom: 8,
};

const toggleTrack = (on: boolean): React.CSSProperties => ({
  width: 40,
  height: 24,
  borderRadius: 12,
  background: on ? 'var(--accent)' : 'var(--bg-tertiary)',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  border: 'none',
  padding: 0,
});

const toggleKnob = (on: boolean): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: '#fff',
  position: 'absolute',
  top: 2,
  left: on ? 18 : 2,
  transition: 'left 0.2s ease',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
});

export default function SettingsPanel() {
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<Settings>({
    hotkey: 'Alt+Space',
    defaultModel: 'deepseek-chat',
    launchOnStartup: false,
    autoReadClipboard: false,
  });
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [keyErrors, setKeyErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await window.electronAPI?.getSettings();
      if (s) setSettings({ hotkey: s.hotkey as string, defaultModel: (s.defaultModel as string) || 'deepseek-chat', launchOnStartup: Boolean(s.launchOnStartup), autoReadClipboard: Boolean(s.autoReadClipboard) });
      const keys = await window.electronAPI?.getApiKeys();
      if (keys) setApiKeys(keys);
      setLoaded(true);
    })();
  }, []);

  const handleToggle = async (key: 'launchOnStartup' | 'autoReadClipboard') => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await window.electronAPI?.saveSettings(next as unknown as Record<string, unknown>);
  };

  const handleDefaultModel = async (model: string) => {
    const next = { ...settings, defaultModel: model };
    setSettings(next);
    await window.electronAPI?.saveSettings(next as unknown as Record<string, unknown>);
  };

  const handleKeyInput = (provider: string, value: string) => {
    setKeyInputs((prev) => ({ ...prev, [provider]: value }));
    setKeyErrors((prev) => ({ ...prev, [provider]: '' }));
  };

  const handleSaveKey = async (provider: string) => {
    const p = PROVIDERS.find((x) => x.id === provider)!;
    const key = (keyInputs[provider] || '').trim();
    if (!key) return;

    if (!key.startsWith(p.keyPrefix)) {
      setKeyErrors((prev) => ({ ...prev, [provider]: `Key should start with "${p.keyPrefix}"` }));
      return;
    }
    if (key.length < 20) {
      setKeyErrors((prev) => ({ ...prev, [provider]: 'Key seems too short' }));
      return;
    }

    setSaving(true);
    await window.electronAPI?.saveApiKey(provider, key);
    setApiKeys((prev) => ({ ...prev, [provider]: key.slice(0, 6) + '...' + key.slice(-4) }));
    setKeyInputs((prev) => ({ ...prev, [provider]: '' }));
    setSaving(false);
  };

  const hasAnyKey = Object.values(apiKeys).some((k) => k);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={shell}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="var(--accent)" strokeWidth="1.5" />
          </svg>
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>Settings</span>
        </div>
        <button onClick={() => window.electronAPI?.closeSettings?.()} title="Close" aria-label="Close"
          style={{ width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--surface-hover)', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 14px 6px' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={tabBtn(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 14px 14px' }}>
        {!loaded && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 11 }}>Loading...</div>
        )}

        {/* ── General tab ── */}
        {loaded && tab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Hotkey */}
            <div style={fieldset}>
              <label style={labelStyle}>Global Hotkey</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <code style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: 'var(--bg-tertiary)', color: 'var(--accent)',
                  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                  border: '1px solid var(--border-subtle)',
                }}>
                  {settings.hotkey}
                </code>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  Toggle overlay from anywhere
                </span>
              </div>
            </div>

            {/* Auto-startup */}
            <div style={fieldset}>
              <label style={labelStyle}>Launch on Startup</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Start NovaSync when you log in
                </span>
                <button onClick={() => handleToggle('launchOnStartup')} style={toggleTrack(settings.launchOnStartup)} aria-label="Toggle launch on startup" role="switch" aria-checked={settings.launchOnStartup}>
                  <div style={toggleKnob(settings.launchOnStartup)} />
                </button>
              </div>
            </div>

            {/* Auto-read clipboard */}
            <div style={fieldset}>
              <label style={labelStyle}>Auto-paste Clipboard</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Auto-insert selected text when overlay opens
                </span>
                <button onClick={() => handleToggle('autoReadClipboard')} style={toggleTrack(settings.autoReadClipboard)} aria-label="Toggle auto-read clipboard" role="switch" aria-checked={settings.autoReadClipboard}>
                  <div style={toggleKnob(settings.autoReadClipboard)} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Models tab ── */}
        {loaded && tab === 'models' && (
          <div style={fieldset}>
            <label style={labelStyle}>Default Model</label>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 10 }}>
              Used when you haven't selected a model in the overlay
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleDefaultModel(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 12, fontSize: 12,
                    fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${m.id === settings.defaultModel ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                    background: m.id === settings.defaultModel ? 'var(--surface-active)' : 'transparent',
                    color: m.id === settings.defaultModel ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: m.id === settings.defaultModel ? 600 : 400,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: m.id === settings.defaultModel ? 'var(--accent)' : 'var(--bg-tertiary)', transition: 'background 0.2s ease' }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── API Keys tab ── */}
        {loaded && tab === 'keys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PROVIDERS.map((p) => {
              const saved = apiKeys[p.id];
              const inputVal = keyInputs[p.id] ?? '';
              const err = keyErrors[p.id];
              return (
                <div key={p.id} style={fieldset}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>{p.label}</label>
                  {saved ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--success)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                        {saved}
                      </span>
                      <button
                        onClick={() => setApiKeys((prev) => ({ ...prev, [p.id]: '' }))}
                        style={{
                          fontSize: 10, padding: '3px 10px', borderRadius: 8,
                          border: '1px solid var(--border-subtle)', background: 'var(--surface-hover)',
                          color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input
                          type="password"
                          value={inputVal}
                          onChange={(e) => handleKeyInput(p.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveKey(p.id)}
                          placeholder={p.keyPrefix + '...'}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: 10, fontSize: 11, outline: 'none',
                            background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)',
                            border: `1px solid ${err ? 'var(--error)' : 'var(--border-input)'}`,
                            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                          }}
                        />
                        <button
                          onClick={() => handleSaveKey(p.id)}
                          disabled={!inputVal.trim() || saving}
                          style={{
                            padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            background: 'var(--accent)', color: '#fff',
                            opacity: !inputVal.trim() || saving ? 0.4 : 1,
                          }}
                        >
                          Save
                        </button>
                      </div>
                      {err && (
                        <span style={{ display: 'block', textAlign: 'right', fontSize: 9, marginTop: 4, color: 'var(--error)' }}>
                          {err}
                        </span>
                      )}
                    </>
                  )}
                  <div style={{ fontSize: 9, marginTop: 6, color: 'var(--text-tertiary)' }}>
                    Get key at{' '}
                    <button
                      onClick={() => window.electronAPI?.openUrl(p.getUrl)}
                      style={{ background: 'transparent', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: 9, color: 'var(--accent)', fontFamily: 'inherit' }}
                    >
                      {p.label} &rarr;
                    </button>
                  </div>
                </div>
              );
            })}

            {!hasAnyKey && (
              <div style={{
                marginTop: 8, padding: '12px 14px', borderRadius: 12,
                background: 'var(--error-bg)', border: '1px solid rgba(255,69,58,0.15)',
              }}>
                <span style={{ fontSize: 10, color: 'var(--error)' }}>
                  No API keys configured. Add at least one to use NovaSync.
                </span>
              </div>
            )}

            <span style={{ fontSize: 9, textAlign: 'center', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Keys are stored locally, sent only to each provider's API.
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
