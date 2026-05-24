import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
  shimmerKey?: number;
}

const spring = { type: 'spring' as const, stiffness: 260, damping: 26 };

export default function WindowShell({ children, visible, style }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
      transition={{ ...spring, duration: undefined }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-window)',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-input)',
        boxShadow: 'var(--shadow-window)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
