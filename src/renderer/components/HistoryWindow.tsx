import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useChatStore, type Conversation } from '../store/chat';

export default function HistoryWindow() {
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const loadConversation = useChatStore((s) => s.loadConversation);
  const clearConversations = useChatStore((s) => s.clearConversations);
  const currentId = useChatStore((s) => s.currentId);
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    window.electronAPI?.getHistory().then((entries: any[]) => {
      if (entries && entries.length > 0) {
        const convs: Conversation[] = entries.map((e: any) => ({
          id: e.id,
          title: e.query.slice(0, 50) + (e.query.length > 50 ? '...' : ''),
          messages: [
            { id: e.id + '-u', role: 'user' as const, content: e.query, timestamp: e.timestamp },
            { id: e.id + '-a', role: 'assistant' as const, content: e.response, timestamp: e.timestamp },
          ],
          model: e.model,
          createdAt: e.timestamp,
          updatedAt: e.timestamp,
        }));
        setConversations(convs);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const handleSelect = (id: string) => {
    loadConversation(id);
    window.electronAPI?.closeHistory?.();
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    window.electronAPI?.clearHistory().then(() => {
      clearConversations();
      setConfirmClear(false);
    });
  };

  const formatTime = (ts: number): string => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col h-full"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-input)',
        borderRadius: 'var(--radius-window)',
        boxShadow: 'var(--shadow-window)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="var(--accent)" strokeWidth="1.2" />
            <path d="M8 4.5V8l2.5 1.5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>History</span>
        </div>
        <button
          onClick={() => window.electronAPI?.closeHistory?.()}
          title="Close"
          aria-label="Close history"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)' }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3.5 py-2.5">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-input)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent border-none outline-none text-[11px]"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="w-4 h-4 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" opacity="0.4">
              <circle cx="12" cy="12" r="10" stroke="var(--text-tertiary)" strokeWidth="1.2" />
              <path d="M12 7v5l3 1.5" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {search ? 'No matches found' : 'No conversations yet'}
            </span>
            {!search && (
              <span className="text-[10px] text-center max-w-[180px]" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>
                Start a chat in the main window and it will appear here.
              </span>
            )}
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className="text-left px-3 py-2.5 rounded-xl border-none cursor-pointer transition-colors hover:opacity-90"
              style={{
                background: conv.id === currentId ? 'var(--surface-active)' : 'transparent',
                border: conv.id === currentId ? '1px solid var(--border-input)' : '1px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              <div
                className="text-xs font-semibold mb-0.5 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {conv.title}
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-[10px] truncate max-w-[70%]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {conv.messages[0]?.content.slice(0, 60)}
                </span>
                <span className="text-[9px] flex-shrink-0 ml-2" style={{ color: 'var(--text-tertiary)' }}>
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div
          className="flex justify-between items-center px-3.5 py-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-xl text-[9px] border-none cursor-pointer transition-all"
            style={{
              background: confirmClear ? 'var(--error-bg)' : 'transparent',
              border: confirmClear ? '1px solid rgba(255,130,130,0.3)' : '1px solid transparent',
              color: confirmClear ? 'var(--error)' : 'var(--text-tertiary)',
              fontFamily: 'inherit',
            }}
          >
            {confirmClear ? 'Confirm clear?' : 'Clear all'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
