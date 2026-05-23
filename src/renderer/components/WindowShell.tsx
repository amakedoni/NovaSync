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

  // ── Edge shimmer on morph ──
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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-window)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* ── Static glass layer (no animation, no transform — backdrop-filter works) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(28, 28, 30, 0.50) 0%, rgba(22, 22, 24, 0.50) 100%)',
          backdropFilter: 'blur(60px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(60px) saturate(1.5)',
          borderRadius: 'var(--radius-window)',
          border: '0.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Light spots ── */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(90,200,250,0.05) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: '20%', width: 120, height: 70,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
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

      {/* ── Content (above glass) ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}
