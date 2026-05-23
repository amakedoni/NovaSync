import { motion } from 'framer-motion';
import { useChatStore } from '../store/chat';

interface Props {
  onOpenHistory: () => void;
  onClose: () => void;
  onNewChat?: () => void;
}

const btnBase: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--surface-hover)',
  color: 'var(--text-tertiary)',
  transition: 'background 0.15s ease, opacity 0.15s ease',
  flexShrink: 0,
};

export default function Header({ onOpenHistory, onClose, onNewChat }: Props) {
  const state = useChatStore((s) => s.state);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      {/* Left: logo dot + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
          NovaSync
        </span>
        {state === 'streaming' && (
          <span style={{ color: 'var(--accent-strong)', fontSize: 10, fontWeight: 500, animation: 'pulse-text 2s ease-in-out infinite' }}>
            streaming
          </span>
        )}
        {state === 'error' && (
          <span style={{ color: 'var(--error)', fontSize: 10, fontWeight: 500 }}>
            error
          </span>
        )}
      </div>

      {/* Right: action buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        {onNewChat && (
          <button onClick={onNewChat} title="New chat" aria-label="New chat" style={btnBase}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button onClick={onOpenHistory} title="History" aria-label="History" style={btnBase}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={onClose} title="Close (Esc)" aria-label="Close" style={btnBase}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
