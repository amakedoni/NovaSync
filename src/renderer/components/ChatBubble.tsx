import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat';
import Header from './Header';
import MessageList from './MessageList';
import InputBar from './InputBar';
import ErrorState from './ErrorState';
import QuickActions from '../overlay/components/QuickActions';
import ModelSelector from '../overlay/components/ModelSelector';
import ActionBar from '../widget/components/ActionBar';
import SettingsView from './SettingsView';

const MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek V3' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

interface QuickAction {
  label: string;
  systemPrompt: string;
}

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 };

export default function ChatBubble() {
  const [query, setQuery] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [visible, setVisible] = useState(true);

  const state = useChatStore((s) => s.state);
  const model = useChatStore((s) => s.model);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const messages = useChatStore((s) => s.messages);
  const setModel = useChatStore((s) => s.setModel);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const reset = useChatStore((s) => s.reset);

  const hasConversation = state !== 'empty';
  const isThinking = state === 'streaming' && messages.length > 0 && messages[messages.length - 1]?.role === 'user';

  const showMessageList = (state === 'streaming' || state === 'done') && messages.length > 0;
  const showActionBar = state === 'done' && messages.length > 0;
  const showError = state === 'error';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    setQuery('');
    window.electronAPI?.sendQuery({ query: trimmed, model });
  }, [query, addUserMessage, model]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    const base = query.trim();
    const prompt = base ? `${action.systemPrompt}\n\n${base}` : action.systemPrompt;
    addUserMessage(prompt);
    setQuery('');
    window.electronAPI?.sendQuery({ query: prompt, model });
  }, [query, addUserMessage, model]);

  const handleRetry = useCallback(() => {
    const msgs = useChatStore.getState().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    useChatStore.getState().setError('');
    window.electronAPI?.sendQuery({ query: lastUser.content, model });
  }, [model]);

  const handleCopy = useCallback(() => {
    const msgs = useChatStore.getState().messages;
    const lastAssistant = [...msgs].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    window.electronAPI?.copyToClipboard(lastAssistant.content);
  }, []);

  const handleFollowUp = useCallback((text: string) => {
    addUserMessage(text);
    window.electronAPI?.sendQuery({ query: text, model });
  }, [addUserMessage, model]);

  const handleClose = useCallback(() => { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }, []);
  const handleNewChat = useCallback(() => { reset(); setQuery(''); }, [reset]);

  // ── API key setup ──
  if (needsKey) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springTransition}
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-input)', borderRadius: 'var(--radius-window)', boxShadow: 'var(--shadow-window)', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <SettingsView onSaved={() => setNeedsKey(false)} />
      </motion.div>
    );
  }

  // ── Main shell ──
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={springTransition}
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-input)', borderRadius: 'var(--radius-window)', boxShadow: 'var(--shadow-window)', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
        >

          {/* ═══ HEADER ═══ */}
          <Header
            onOpenHistory={() => window.electronAPI?.openHistory?.()}
            onClose={handleClose}
            onNewChat={hasConversation ? handleNewChat : undefined}
          />

          {/* ═══ CONTENT (flex-1, NO overflow here — children handle their own scroll) ═══ */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

            {/* Empty state */}
            {state === 'empty' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 20px' }}>
                {/* Logo */}
                <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.08))', border: '1px solid rgba(167,139,250,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="var(--accent)" strokeWidth="1.5" />
                    <path d="M8 12l3 3 5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>NovaSync</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <QuickActions onAction={handleQuickAction} />
                  <ModelSelector models={MODELS} selected={model} onSelect={setModel} />
                </div>
              </div>
            )}

            {/* Message list (scrollable) */}
            {showMessageList && <MessageList isThinking={isThinking} />}

            {/* Thinking dots */}
            {isThinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 10px' }}>
                <div style={{ width: 22, height: 22, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.1))', color: 'var(--accent)', fontSize: 10, fontWeight: 700 }}>N</div>
                <div className="loading-dots"><span /><span /><span /></div>
              </div>
            )}

            {/* Error */}
            {showError && <ErrorState message={errorMessage} onRetry={handleRetry} />}
          </div>

          {/* ═══ BOTTOM BAR ═══ */}
          {/* Empty state: InputBar */}
          {state === 'empty' && (
            <div style={{ padding: '4px 12px 12px', borderTop: '1px solid var(--border-subtle)' }}>
              <InputBar value={query} onChange={setQuery} onSubmit={handleSubmit} autoFocus />
            </div>
          )}

          {/* Streaming: generating text + disabled InputBar */}
          {state === 'streaming' && !isThinking && (
            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 2px' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>generating...</span>
              </div>
              <div style={{ padding: '0 8px 8px' }}>
                <InputBar value={query} onChange={setQuery} onSubmit={handleSubmit} disabled />
              </div>
            </div>
          )}

          {/* Thinking state: just disabled InputBar */}
          {state === 'streaming' && isThinking && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '4px 8px 8px' }}>
              <InputBar value={query} onChange={setQuery} onSubmit={handleSubmit} disabled />
            </div>
          )}

          {/* Done: ActionBar */}
          {showActionBar && (
            <ActionBar onCopy={handleCopy} onRetry={handleRetry} onFollowUp={handleFollowUp} hasContent={messages.some((m) => m.role === 'assistant')} />
          )}

          {/* Error with conversation */}
          {showError && hasConversation && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={handleRetry} style={{ padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid rgba(167,139,250,0.25)', background: 'var(--surface-active)', color: 'var(--accent)', fontFamily: 'inherit', cursor: 'pointer' }}>Retry</button>
              <button onClick={handleNewChat} style={{ padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1px solid var(--border-subtle)', background: 'var(--surface-hover)', color: 'var(--text-secondary)', fontFamily: 'inherit', cursor: 'pointer' }}>New Chat</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
