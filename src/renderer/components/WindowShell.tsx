import { type ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
  shimmerKey?: number;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

export default function WindowShell({ children, visible, style, shimmerKey }: Props) {
  const [shimmer, setShimmer] = useState(false);

  // ── Edge shimmer on morph (shimmerKey change = state transition) ──
  useEffect(() => {
    setShimmer(true);
    const t = setTimeout(() => setShimmer(false), 600);
    return () => clearTimeout(t);
  }, [shimmerKey]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
      transition={spring}
      style={{
        // Liquid glass — medium frost 55%, blur 20px, glow border
        background: 'linear-gradient(135deg, rgba(38, 38, 40, 0.55) 0%, rgba(32, 32, 34, 0.55) 100%)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        border: '0.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-window)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
        willChange: 'transform, opacity',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
    >
      {/* ── Subtle light spots ── */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(90,200,250,0.05) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: '20%', width: 120, height: 70,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }} />

      {/* ── Edge shimmer ── */}
      {shimmer && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
          borderRadius: 'var(--radius-window)', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            animation: 'shimmer-sweep 0.5s ease-out forwards',
          }} />
        </div>
      )}

      {children}
    </motion.div>
  );
}
