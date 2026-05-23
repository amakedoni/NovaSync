import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

export default function WindowShell({ children, visible, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
      transition={spring}
      style={{
        // Glass surface
        background: 'linear-gradient(135deg, rgba(38, 38, 40, 0.75) 0%, rgba(32, 32, 34, 0.78) 100%)',
        border: '0.5px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 'var(--radius-window)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
    >
      {/* Subtle light spots */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,200,250,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: '20%',
        width: 120,
        height: 70,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {children}
    </motion.div>
  );
}
