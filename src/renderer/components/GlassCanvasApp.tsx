import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

// Refined spring — snappier, more premium feel
const morphSpring = { type: 'spring' as const, stiffness: 280, damping: 26 };

export default function GlassCanvasApp() {
  const [query, setQuery] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [visible, setVisible] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);

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
  const headerState = state === 'empty' ? 'idle' : state;
  const currentModelLabel = MODELS.find((m) => m.id === model)?.label || model;
  const currentModeLabel = MODES.find((m) => m.id === mode)?.label || 'Chat';

  // ── IPC ──
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const r0 = window.electronAPI?.onChatOpened?.(async () => {
      setVisible(true);
      setQuery('');
      try {
        const s = await window.electronAPI?.getSettings();
        if (s && s.autoReadClipboard) {
          const clip = await window.electronAPI?.readClipboard();
          if (clip) setQuery(clip.slice(0, 500));
        }
      } catch { /* ignore */ }
    });
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
    const r7 = window.electronAPI?.onUpdateReady?.(() => { setUpdateReady(true); });
    if (r7) unsubs.push(r7);
    window.electronAPI?.chatReady?.();
    return () => { unsubs.forEach((fn) => fn()); };
  }, []);

  // ── Window resize: IDLE compact, conversation fluid ──
  const prevStateRef = useRef(state);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    if (state === 'empty') {
      window.electronAPI?.resizeChat?.(520, 80);
      return;
    }

    if (prev === 'empty') {
      window.electronAPI?.resizeChat?.(520, 320);
    }
  }, [state]);

  // ── Grow window gradually as messages accumulate during streaming ──
  useEffect(() => {
    if (state !== 'streaming') return;

    const raf = requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (!root) return;
      const contentH = root.scrollHeight;
      const currentH = window.innerHeight;
      const maxH = Math.round(window.screen.availHeight * 0.75);

      if (contentH > currentH) {
        const stepH = Math.min(currentH + 40, contentH + 20, maxH);
        if (stepH > currentH + 10) {
          window.electronAPI?.resizeChat?.(520, stepH);
        }
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [messages, state]);

  // ── Final resize to fit all content when done ──
  useEffect(() => {
    if (state !== 'done' && state !== 'error') return;

    requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (!root) return;
      const contentH = root.scrollHeight;
      const maxH = Math.round(window.screen.availHeight * 0.75);
      window.electronAPI?.resizeChat?.(520, Math.min(contentH + 40, maxH));
    });
  }, [state]);

  // ── Hide on blur (click outside) ──
  useEffect(() => {
    const handleBlur = () => {
      setVisible(false);
      setTimeout(() => window.electronAPI?.hideChat?.(), 150);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

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
    return (
      <WindowShell visible={visible} streaming={false}>
        <SettingsView onSaved={() => setNeedsKey(false)} />
      </WindowShell>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <WindowShell visible={visible} streaming={state === 'streaming'}>
          <HeaderBar
            state={headerState}
            modelLabel={currentModelLabel}
            modeLabel={headerState !== 'idle' ? currentModeLabel : undefined}
            onNewChat={hasConversation ? newChat : undefined}
            onOpenHistory={() => window.electronAPI?.openHistory?.()}
            onOpenSettings={() => window.electronAPI?.openSettings?.()}
            onClose={close}
          />

          {/* Update banner */}
          {updateReady && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                margin: '0 16px', padding: '8px 14px', borderRadius: 6,
                background: 'var(--accent-subtle)', border: '1px solid rgba(232,120,74,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}>Update ready — restart to install</span>
              <button
                onClick={() => window.electronAPI?.installUpdate?.()}
                style={{
                  padding: '4px 14px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: 'var(--accent)', color: 'var(--bg-deep)',
                }}
              >
                Restart
              </button>
            </motion.div>
          )}

          {/* Content area */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {state === 'empty' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={morphSpring}
              >
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
              </motion.div>
            )}

            {(state === 'streaming' || state === 'done') && messages.length > 0 && (
              <motion.div
                key="conversation"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={morphSpring}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
              >
                <ConversationView
                  isThinking={isThinking}
                  onCopy={copy}
                  onRetry={retry}
                  onFollowUp={followUp}
                />
              </motion.div>
            )}

            {showError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={morphSpring}
              >
                <ErrorState message={errorMessage} onRetry={retry} onSettings={() => window.electronAPI?.openSettings?.()} />
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* Error with conversation — retry/new chat */}
          {showError && hasConversation && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8,
              padding: '10px 14px', borderTop: '1px solid var(--border-subtle)',
            }}>
              <button onClick={retry} style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: 'none', background: 'var(--accent)', color: 'var(--bg-deep)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Retry</button>
              <button onClick={newChat} style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                border: 'none', background: 'var(--surface-subtle)', color: 'var(--text-tertiary)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>New Chat</button>
            </div>
          )}
        </WindowShell>
      )}
    </AnimatePresence>
  );
}
