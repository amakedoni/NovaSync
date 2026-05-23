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

  const hasConversation = state !== 'empty';

  // IPC listeners — mount once
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const r0 = window.electronAPI?.onChatOpened?.(() => {
      setVisible(true);
      setQuery('');
    });
    if (r0) unsubs.push(r0);

    const r1 = window.electronAPI?.onResponseChunk?.((chunk: string) => {
      useChatStore.getState().appendChunk(chunk);
    });
    if (r1) unsubs.push(r1);

    const r2 = window.electronAPI?.onResponseDone?.((fullText: string) => {
      useChatStore.getState().finishResponse(fullText);
    });
    if (r2) unsubs.push(r2);

    const r3 = window.electronAPI?.onResponseError?.((err: string) => {
      useChatStore.getState().setError(err);
    });
    if (r3) unsubs.push(r3);

    const r4 = window.electronAPI?.onNeedApiKey?.(() => {
      setNeedsKey(true);
    });
    if (r4) unsubs.push(r4);

    const r5 = window.electronAPI?.onApiKeySaved?.(() => {
      setNeedsKey(false);
    });
    if (r5) unsubs.push(r5);

    const r6 = window.electronAPI?.onResponseReset?.(() => {
      useChatStore.getState().reset();
    });
    if (r6) unsubs.push(r6);

    // Signal that the renderer is ready
    window.electronAPI?.chatReady?.();

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        setTimeout(() => window.electronAPI?.hideChat?.(), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ---------- handlers ---------- */

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    setQuery('');
    window.electronAPI?.sendQuery({ query: trimmed, model });
  }, [query, addUserMessage, model]);

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      const base = query.trim();
      const prompt = base ? `${action.systemPrompt}\n\n${base}` : action.systemPrompt;
      addUserMessage(prompt);
      setQuery('');
      window.electronAPI?.sendQuery({ query: prompt, model });
    },
    [query, addUserMessage, model],
  );

  const handleRetry = useCallback(() => {
    const msgs = useChatStore.getState().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    useChatStore.getState().reset();
    window.electronAPI?.sendQuery({ query: lastUser.content, model });
  }, [model]);

  const handleCopy = useCallback(() => {
    const msgs = useChatStore.getState().messages;
    const lastAssistant = [...msgs].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    window.electronAPI?.copyToClipboard(lastAssistant.content);
  }, []);

  const handleFollowUp = useCallback(
    (text: string) => {
      addUserMessage(text);
      window.electronAPI?.sendQuery({ query: text, model });
    },
    [addUserMessage, model],
  );

  const handleOpenHistory = useCallback(() => {
    window.electronAPI?.openHistory?.();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => window.electronAPI?.hideChat?.(), 150);
  }, []);

  /* ---------- render ---------- */

  // No API key yet — show settings panel
  if (needsKey) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springTransition}
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-input)',
          borderRadius: 'var(--radius-window)',
          boxShadow: 'var(--shadow-window)',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SettingsView onSaved={() => setNeedsKey(false)} />
      </motion.div>
    );
  }

  // Normal chat window
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chat-bubble"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={springTransition}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-input)',
            borderRadius: 'var(--radius-window)',
            boxShadow: 'var(--shadow-window)',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ---------- Empty state ---------- */}
          {state === 'empty' && (
            <>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <InputBar
                  value={query}
                  onChange={setQuery}
                  onSubmit={handleSubmit}
                  autoFocus
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px 12px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <QuickActions onAction={handleQuickAction} />
                <ModelSelector models={MODELS} selected={model} onSelect={setModel} />
              </div>
            </>
          )}

          {/* ---------- Streaming / Done states ---------- */}
          {(state === 'streaming' || state === 'done') && hasConversation && (
            <>
              <Header onOpenHistory={handleOpenHistory} onClose={handleClose} />
              <MessageList />
              {state === 'streaming' && (
                <div
                  className="flex items-center justify-center py-1.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    generating...
                  </span>
                </div>
              )}
              {state === 'done' && (
                <ActionBar
                  onCopy={handleCopy}
                  onRetry={handleRetry}
                  onFollowUp={handleFollowUp}
                  hasContent={messages.length > 0}
                />
              )}
            </>
          )}

          {/* ---------- Error with prior conversation ---------- */}
          {state === 'error' && hasConversation && (
            <>
              <Header onOpenHistory={handleOpenHistory} onClose={handleClose} />
              <MessageList />
              <ErrorState message={errorMessage} onRetry={handleRetry} />
            </>
          )}

          {/* ---------- Error without prior conversation ---------- */}
          {state === 'error' && !hasConversation && (
            <>
              <Header onOpenHistory={handleOpenHistory} onClose={handleClose} />
              <ErrorState message={errorMessage} onRetry={handleRetry} />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
