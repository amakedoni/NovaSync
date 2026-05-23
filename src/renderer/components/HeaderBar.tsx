import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: 'idle' | 'streaming' | 'done' | 'error';
  modelLabel?: string;
  modeLabel?: string;
  onNewChat?: () => void;
  onOpenHistory: () => void;
  onClose: () => void;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

const btnBase: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--text-tertiary)',
  fontFamily: 'inherit',
  flexShrink: 0,
  transition: 'background 0.15s ease',
};

export default function HeaderBar({ state, modelLabel, modeLabel, onNewChat, onOpenHistory, onClose }: Props) {
  const showBranding = state !== 'idle';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showBranding ? 'space-between' : 'center',
        padding: showBranding ? '10px 18px' : '4px 16px 0',
        borderBottom: showBranding ? '0.5px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Drag handle (only when no branding) */}
      {!showBranding && (
        <div style={{ width: 24, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }} />
      )}

      {/* Branding (only in non-IDLE states) */}
      <AnimatePresence>
        {showBranding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {/* Dot indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ ...spring, duration: undefined }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                boxShadow: state === 'streaming'
                  ? '0 0 10px var(--accent-glow)'
                  : '0 0 6px rgba(90,200,250,0.2)',
                transition: 'box-shadow 0.3s ease',
              }}
            />
            {/* Name */}
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ ...spring, delay: 0.08, duration: undefined }}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
            >
              NovaSync
            </motion.span>
            {/* Mode badge */}
            {modeLabel && modeLabel !== 'Chat' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.12 }}
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: 'var(--accent)',
                  background: 'rgba(90,200,250,0.10)',
                  padding: '1px 6px',
                  borderRadius: 8,
                }}
              >
                {modeLabel}
              </motion.span>
            )}
            {/* Status: streaming */}
            {state === 'streaming' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.16 }}
                style={{ fontSize: 9, color: 'var(--accent)' }}
              >
                ● streaming
              </motion.span>
            )}
            {/* Model label */}
            {modelLabel && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: 9, color: 'var(--text-tertiary)' }}
              >
                {modelLabel}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons (only with branding) */}
      {showBranding && (
        <div style={{ display: 'flex', gap: 4 }}>
          {onNewChat && (
            <button onClick={onNewChat} title="New chat" aria-label="New chat" style={btnBase}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onOpenHistory} title="History" aria-label="History" style={btnBase}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
              <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onClose} title="Close (Esc)" aria-label="Close" style={btnBase}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
