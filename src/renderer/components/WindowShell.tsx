import { type ReactNode, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
  onStateChange?: () => void;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function WindowShell({ children, visible, style }: Props) {
  const [shimmer, setShimmer] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  let rippleId = 0;

  // ── Edge shimmer on mount ──
  useEffect(() => {
    setShimmer(true);
    const t = setTimeout(() => setShimmer(false), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Light ripple on click ──
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
      transition={spring}
      onClick={handleClick}
      style={{
        // Glass surface — actual blur for liquid glass effect
        background: 'linear-gradient(135deg, rgba(38, 38, 40, 0.72) 0%, rgba(32, 32, 34, 0.75) 100%)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        border: '0.5px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 'var(--radius-window)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
        overflow: 'hidden',
        width: '100%',
        minHeight: '100%',
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

      {/* ── Light ripples ── */}
      {ripples.map((r) => (
        <div
          key={r.id}
          style={{
            position: 'absolute', left: r.x, top: r.y,
            width: 80, height: 80, marginLeft: -40, marginTop: -40,
            borderRadius: '50%', pointerEvents: 'none', zIndex: 5,
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
            animation: 'ripple-expand 0.6s ease-out forwards',
          }}
        />
      ))}

      {children}
    </motion.div>
  );
}
