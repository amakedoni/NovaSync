import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  items: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  side?: 'left' | 'right';
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

export default function Dropdown({ items, selected, onSelect, side = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  const current = items.find((i) => i.id === selected);

  const triggerStyle: React.CSSProperties = {
    height: 30,
    padding: '0 10px',
    borderRadius: 'var(--radius-pill)',
    background: open ? 'var(--surface-active)' : 'var(--surface-hover)',
    border: '0.5px solid var(--border-input)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    flexShrink: 0,
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 36,
    ...(side === 'right' ? { right: 0 } : { left: 0 }),
    minWidth: 155,
    borderRadius: 14,
    padding: 4,
    background: 'rgba(44, 44, 46, 0.96)',
    border: '0.5px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset',
    backdropFilter: 'blur(20px)',
    zIndex: 9999,
  };

  const itemBase: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    borderRadius: 10,
    fontSize: 11,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.1s ease, color 0.1s ease',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={triggerStyle}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = 'var(--surface-active)';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'var(--surface-hover)';
        }}
      >
        {current?.label || selected}
        <motion.svg
          width="7" height="7" viewBox="0 0 10 10" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -2 }}
            transition={{ ...spring, duration: undefined }}
            style={menuStyle}
          >
            {items.map((item) => {
              const isSelected = item.id === selected;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); setOpen(false); }}
                  style={{
                    ...itemBase,
                    background: isSelected ? 'rgba(90, 200, 250, 0.08)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.97)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isSelected && (
                    <span style={{
                      display: 'inline-block',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      boxShadow: '0 0 4px var(--accent-glow)',
                      marginRight: 6,
                    }} />
                  )}
                  {!isSelected && <span style={{ display: 'inline-block', width: 4, height: 4, marginRight: 6, opacity: 0 }} />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
