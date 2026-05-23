import { motion } from 'framer-motion';
import { useChatStore } from '../store/chat';

interface Props {
  onOpenHistory: () => void;
  onClose: () => void;
}

export default function Header({ onOpenHistory, onClose }: Props) {
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
        {/* Logo dot */}
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
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={onOpenHistory}
          aria-label="History"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px] transition-colors"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          H
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px] transition-colors"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
