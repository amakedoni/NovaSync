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

  // Load history from main process on mount
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
    window.electronAPI?.clearHistory().then(() => {
      clearConversations();
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
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>History</span>
        <button
          onClick={() => window.electronAPI?.closeHistory?.()}
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px]"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          ×
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
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-subtle)',
                opacity: 0.5,
              }}
            >
              H
            </div>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {search ? 'No matches' : 'No conversations yet'}
            </span>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className="text-left px-3 py-2.5 rounded-xl border-none cursor-pointer transition-colors"
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
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
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
            {conversations.length} conversations
          </span>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-xl text-[9px] border-none cursor-pointer transition-colors"
            style={{
              background: 'var(--error-bg)',
              border: '1px solid rgba(255,130,130,0.1)',
              color: 'var(--text-tertiary)',
              fontFamily: 'inherit',
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}
