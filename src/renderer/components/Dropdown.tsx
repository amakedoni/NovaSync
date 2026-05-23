import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  items: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  side?: 'left' | 'right';
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

function Dropdown({ items, selected, onSelect, side = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setFocusIndex(Math.max(0, items.findIndex((i) => i.id === selected)));
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Home':
          e.preventDefault();
          setFocusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (items[focusIndex]) {
            onSelect(items[focusIndex].id);
            setOpen(false);
          }
          break;
      }
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [open, items, selected, onSelect, focusIndex]);

  const current = items.find((i) => i.id === selected);

  const triggerStyle: React.CSSProperties = useMemo(() => ({
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
  }), [open]);

  const menuStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    top: 'calc(100% + 6px)',
    ...(side === 'right' ? { right: 0 } : { left: 0 }),
    minWidth: 155,
    borderRadius: 14,
    padding: 4,
    background: 'rgba(44, 44, 46, 0.96)',
    border: '0.5px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset',
    backdropFilter: 'blur(20px)',
    zIndex: 9999,
  }), [side]);

  const itemBase: React.CSSProperties = useMemo(() => ({
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
  }), []);

  const handleTriggerHover = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) e.currentTarget.style.background = 'var(--surface-active)';
  }, [open]);

  const handleTriggerLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) e.currentTarget.style.background = 'var(--surface-hover)';
  }, [open]);

  const handleItemMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--surface-hover)';
  }, []);

  const handleItemMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  const handleItemMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.97)';
  }, []);

  const handleItemMouseUp = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={triggerStyle}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Select: ${current?.label || selected}`}
        onMouseEnter={handleTriggerHover}
        onMouseLeave={handleTriggerLeave}
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
            transition={spring}
            style={menuStyle}
            role="listbox"
            aria-label={`${current?.label || selected} options`}
          >
            {items.map((item, idx) => {
              const isSelected = item.id === selected;
              const isFocused = idx === focusIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); setOpen(false); }}
                  role="option"
                  aria-selected={isSelected}
                  style={{
                    ...itemBase,
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    background: isFocused
                      ? (isSelected ? 'rgba(90, 200, 250, 0.12)' : 'var(--surface-hover)')
                      : (isSelected ? 'rgba(90, 200, 250, 0.08)' : 'transparent'),
                  }}
                  onMouseEnter={isSelected ? undefined : handleItemMouseEnter}
                  onMouseLeave={handleItemMouseLeave}
                  onMouseDown={handleItemMouseDown}
                  onMouseUp={handleItemMouseUp}
                >
                  <span style={{ display: 'inline-block', width: 10, textAlign: 'center', marginRight: 6 }}>
                    {isSelected && (
                      <span style={{
                        display: 'inline-block',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        boxShadow: '0 0 4px var(--accent-glow)',
                        verticalAlign: 'middle',
                      }} />
                    )}
                  </span>
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

export default memo(Dropdown);
