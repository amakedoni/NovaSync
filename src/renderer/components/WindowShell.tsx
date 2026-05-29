import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  streaming?: boolean;
  style?: React.CSSProperties;
}

const spring = { type: 'spring' as const, stiffness: 320, damping: 24 };

export default function WindowShell({ children, visible, streaming, style }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ ...spring, duration: undefined }}
      style={{
        transformOrigin: 'bottom right',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-window)',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-window)',
        boxShadow: streaming
          ? 'var(--shadow-window), 0 0 0 1px var(--accent-cold-glow)'
          : 'var(--shadow-window)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
