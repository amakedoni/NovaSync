import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from './AppIcon';

interface Props {
  state: 'idle' | 'streaming' | 'done' | 'error';
  modelLabel?: string;
  modeLabel?: string;
  onNewChat?: () => void;
  onOpenHistory: () => void;
  onOpenSettings?: () => void;
  onClose: () => void;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 26 };

const btnBase: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--text-faint)',
  fontFamily: 'inherit',
  flexShrink: 0,
  transition: 'background 0.15s ease, color 0.15s ease',
  WebkitAppRegion: 'no-drag',
} as React.CSSProperties;

export default function HeaderBar({ state, modelLabel, modeLabel, onNewChat, onOpenHistory, onOpenSettings, onClose }: Props) {
  const showBranding = state !== 'idle';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showBranding ? 'space-between' : 'center',
        padding: showBranding ? '10px 16px' : '2px 16px 0',
        borderBottom: showBranding ? '1px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        minHeight: showBranding ? 46 : 10,
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      {/* Drag handle — idle only */}
      {!showBranding && (
        <div style={{ width: 22, height: 3, borderRadius: 2, background: 'var(--surface-active)' }} />
      )}

      {/* Branding */}
      <AnimatePresence>
        {showBranding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={spring}
            >
              <AppIcon size={34} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ ...spring, delay: 0.06 }}
              style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
            >
              NovaSync
            </motion.span>
            {modeLabel && modeLabel !== 'Chat' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.08 }}
                style={{
                  fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)',
                  background: 'var(--surface-subtle)', padding: '2px 7px', borderRadius: 3,
                }}
              >
                {modeLabel}
              </motion.span>
            )}
            {state === 'streaming' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--accent-cold)', fontWeight: 500 }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-cold)',
                  animation: 'breathe-cursor 1.5s ease-in-out infinite',
                }} />
                streaming
              </motion.span>
            )}
            {modelLabel && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.14 }}
                style={{ fontSize: 9, color: 'var(--text-muted)' }}
              >
                {modelLabel}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {showBranding && (
        <div style={{ display: 'flex', gap: 2 }}>
          {onNewChat && (
            <button onClick={onNewChat} title="New chat" aria-label="New chat" style={btnBase}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onOpenHistory} title="History" aria-label="History" style={btnBase}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {onOpenSettings && (
            <button onClick={onOpenSettings} title="Settings" aria-label="Settings" style={btnBase}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3.05 3.05l1.06 1.06M9.9 9.9l1.06 1.06M3.05 10.95l1.06-1.06M9.9 4.1l1.06-1.06" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onClose} title="Close (Esc)" aria-label="Close" style={btnBase}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
