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
          title: e.query.slice(0, 60) + (e.query.length > 60 ? '...' : ''),
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
    if (!confirmClear) { setConfirmClear(true); return; }
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

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={shell}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="var(--accent)" strokeWidth="1.2" />
            <path d="M8 4.5V8l2.5 1.5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>History</span>
        </div>
        <button onClick={() => window.electronAPI?.closeHistory?.()} title="Close" aria-label="Close"
          style={{ width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--surface-hover)', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 12, background: 'var(--surface-hover)', border: '1px solid var(--border-input)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: 'var(--text-primary)', fontFamily: 'inherit', padding: 0 }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0 }}>
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 10px 8px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 20px', height: '100%' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
              <circle cx="12" cy="12" r="10" stroke="var(--text-tertiary)" strokeWidth="1.2" />
              <path d="M12 7v5l3 1.5" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{search ? 'No matches found' : 'No conversations yet'}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((conv) => (
              <button key={conv.id} onClick={() => handleSelect(conv.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px', borderRadius: 12,
                  background: conv.id === currentId ? 'var(--surface-active)' : 'transparent',
                  border: conv.id === currentId ? '1px solid var(--border-input)' : '1px solid transparent',
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                }}>
                {/* Title row — title + timestamp on same line */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{
                    color: 'var(--text-primary)', fontSize: 12, fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0,
                  }}>{conv.title}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 9, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatTime(conv.updatedAt)}</span>
                </div>
                {/* Preview row */}
                <span style={{
                  color: 'var(--text-tertiary)', fontSize: 10,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{conv.messages[0]?.content.slice(0, 70)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {conversations.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          <button onClick={handleClear} style={{
            padding: '4px 10px', borderRadius: 10, fontSize: 10, border: confirmClear ? '1px solid rgba(255,69,58,0.3)' : '1px solid transparent',
            background: confirmClear ? 'var(--error-bg)' : 'transparent', color: confirmClear ? 'var(--error)' : 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'inherit',
          }}>{confirmClear ? 'Confirm clear?' : 'Clear all'}</button>
        </div>
      )}
    </motion.div>
  );
}
