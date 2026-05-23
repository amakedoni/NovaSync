import { motion } from 'framer-motion';
import { useChatStore } from '../store/chat';

interface Props {
  onOpenHistory: () => void;
  onClose: () => void;
  onNewChat?: () => void;
}

export default function Header({ onOpenHistory, onClose, onNewChat }: Props) {
  const state = useChatStore((s) => s.state);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          NovaSync
        </span>
        {state === 'streaming' && (
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--accent-strong)', animation: 'pulse-text 2s ease-in-out infinite' }}
          >
            streaming
          </span>
        )}
        {state === 'error' && (
          <span className="text-[10px] font-medium" style={{ color: 'var(--error)' }}>
            error
          </span>
        )}
      </div>

      <div className="flex gap-1.5">
        {onNewChat && (
          <button
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
            className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)' }}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          onClick={onOpenHistory}
          title="History"
          aria-label="History"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors hover:opacity-80"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors hover:opacity-80"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)' }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
