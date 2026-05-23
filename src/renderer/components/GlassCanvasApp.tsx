import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat';
import { MODES } from './ModeSelector';
import WindowShell from './WindowShell';
import HeaderBar from './HeaderBar';
import IdleView from './IdleView';
import ConversationView from './ConversationView';
import ErrorState from './ErrorState';
import SettingsView from './SettingsView';

const MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek V3' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

export default function GlassCanvasApp() {
  const [query, setQuery] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [visible, setVisible] = useState(true);

  const state = useChatStore((s) => s.state);
  const model = useChatStore((s) => s.model);
  const mode = useChatStore((s) => s.mode);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const messages = useChatStore((s) => s.messages);
  const setModel = useChatStore((s) => s.setModel);
  const setMode = useChatStore((s) => s.setMode);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const reset = useChatStore((s) => s.reset);

  const hasConversation = state !== 'empty';
  const isThinking = state === 'streaming' && messages.length > 0 && messages[messages.length - 1]?.role === 'user';
  const showError = state === 'error';

  // Map chat states to HeaderBar states
  const headerState = state === 'empty' ? 'idle' : state;

  // ── IPC ──
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const r0 = window.electronAPI?.onChatOpened?.(() => { setVisible(true); setQuery(''); });
    if (r0) unsubs.push(r0);
    const r1 = window.electronAPI?.onResponseChunk?.((chunk: string) => { useChatStore.getState().appendChunk(chunk); });
    if (r1) unsubs.push(r1);
    const r2 = window.electronAPI?.onResponseDone?.((fullText: string) => { useChatStore.getState().finishResponse(fullText); });
    if (r2) unsubs.push(r2);
    const r3 = window.electronAPI?.onResponseError?.((err: string) => { useChatStore.getState().setError(err); });
    if (r3) unsubs.push(r3);
    const r4 = window.electronAPI?.onNeedApiKey?.(() => { setNeedsKey(true); });
    if (r4) unsubs.push(r4);
    const r5 = window.electronAPI?.onApiKeySaved?.(() => { setNeedsKey(false); });
    if (r5) unsubs.push(r5);
    const r6 = window.electronAPI?.onResponseReset?.(() => { useChatStore.getState().reset(); });
    if (r6) unsubs.push(r6);
    window.electronAPI?.chatReady?.();
    return () => { unsubs.forEach((fn) => fn()); };
  }, []);

  // ── Resize window on state change ──
  useEffect(() => {
    if (state === 'empty') {
      window.electronAPI?.resizeChat?.(480, 90);
    } else {
      window.electronAPI?.resizeChat?.(480, 520);
    }
  }, [state]);

  // ── Keyboard ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Handlers ──
  const submit = useCallback(() => {
    const t = query.trim(); if (!t) return;
    const selectedMode = MODES.find((m) => m.id === mode);
    const prompt = selectedMode?.systemPrompt ? `${selectedMode.systemPrompt}\n\n${t}` : t;
    addUserMessage(prompt); setQuery('');
    window.electronAPI?.sendQuery({ query: prompt, model });
  }, [query, addUserMessage, model, mode]);

  const retry = useCallback(() => {
    const u = [...useChatStore.getState().messages].reverse().find((m) => m.role === 'user');
    if (!u) return;
    useChatStore.getState().setError('');
    window.electronAPI?.sendQuery({ query: u.content, model });
  }, [model]);

  const copy = useCallback(() => {
    const a = [...useChatStore.getState().messages].reverse().find((m) => m.role === 'assistant');
    if (a) window.electronAPI?.copyToClipboard(a.content);
  }, []);

  const followUp = useCallback((text: string) => {
    addUserMessage(text);
    window.electronAPI?.sendQuery({ query: text, model });
  }, [addUserMessage, model]);

  const close = useCallback(() => { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }, []);
  const newChat = useCallback(() => { reset(); setQuery(''); }, [reset]);

  // ── API key setup ──
  if (needsKey) {
    return <SettingsView onSaved={() => setNeedsKey(false)} />;
  }

  return (
    <AnimatePresence>
      {visible && (
        <WindowShell visible={visible}>
          <HeaderBar
            state={headerState}
            onNewChat={hasConversation ? newChat : undefined}
            onOpenHistory={() => window.electronAPI?.openHistory?.()}
            onClose={close}
          />

          {/* IDLE state */}
          {state === 'empty' && (
            <IdleView
              query={query}
              onQueryChange={setQuery}
              onSubmit={submit}
              models={MODELS}
              model={model}
              onModelSelect={setModel}
              mode={mode}
              onModeSelect={setMode}
            />
          )}

          {/* Conversation (STREAMING + DONE) */}
          {(state === 'streaming' || state === 'done') && messages.length > 0 && (
            <ConversationView
              isThinking={isThinking}
              onCopy={copy}
              onRetry={retry}
              onFollowUp={followUp}
            />
          )}

          {/* Error */}
          {showError && (
            <ErrorState message={errorMessage} onRetry={retry} />
          )}

          {/* Error with conversation — retry/new chat buttons */}
          {showError && hasConversation && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8,
              padding: '10px 12px', borderTop: '0.5px solid var(--border-subtle)',
            }}>
              <button onClick={retry} style={{
                padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: '0.5px solid rgba(90,200,250,0.2)', background: 'var(--surface-active)',
                color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
              }}>Retry</button>
              <button onClick={newChat} style={{
                padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                border: '0.5px solid var(--border-subtle)', background: 'var(--surface-hover)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
              }}>New Chat</button>
            </div>
          )}
        </WindowShell>
      )}
    </AnimatePresence>
  );
}
