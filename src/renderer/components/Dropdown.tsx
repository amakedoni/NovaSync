import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  items: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  side?: 'left' | 'right';
  variant?: 'default' | 'accent';
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

function Dropdown({ items, selected, onSelect, side = 'right', variant = 'default' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left?: number; right?: number; maxHeight: number }>({ top: 0, maxHeight: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setFocusIndex(Math.max(0, items.findIndex((i) => i.id === selected)));
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = Math.min(items.length * 32 + 8, 220);
      const spaceBelow = window.innerHeight - rect.bottom - 6;
      const spaceAbove = rect.top - 6;

      // Open upward if not enough space below and more space above
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      setMenuPos({
        top: openUpward ? rect.top - 6 : rect.bottom + 6,
        left: side === 'right' ? undefined : rect.left,
        right: side === 'right' ? window.innerWidth - rect.right : undefined,
        maxHeight: Math.min(openUpward ? spaceAbove : spaceBelow, 220),
      });
    }
    const handler = (e: MouseEvent) => {
      // ignore clicks on the trigger button itself (handled by its own onClick)
      if (triggerRef.current?.contains(e.target as Node)) return;
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
  const opensUpward = menuPos.top < (triggerRef.current?.getBoundingClientRect().bottom ?? 0);

  const isAccent = variant === 'accent';
  const triggerStyle: React.CSSProperties = useMemo(() => ({
    height: 26,
    padding: '0 8px',
    borderRadius: 'var(--radius-pill)',
    background: open ? 'var(--surface-active)' : 'var(--surface-subtle)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10,
    fontWeight: 500,
    color: isAccent ? 'var(--accent)' : (open ? 'var(--text-secondary)' : 'var(--text-tertiary)'),
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, color 0.15s ease',
    flexShrink: 0,
  }), [open, isAccent]);

  const menuStyle: React.CSSProperties = useMemo(() => ({
    position: 'fixed',
    top: menuPos.top,
    left: menuPos.left,
    right: menuPos.right,
    minWidth: 155,
    maxHeight: menuPos.maxHeight,
    overflowY: 'auto' as const,
    borderRadius: 8,
    padding: 4,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-input)',
    boxShadow: 'var(--shadow-dropdown)',
    zIndex: 9999,
  }), [menuPos]);

  const itemBase: React.CSSProperties = useMemo(() => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 11,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.1s ease, color 0.1s ease',
  }), []);

  const handleTriggerDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.97)';
  }, []);

  const handleTriggerUp = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  const handleTriggerHover = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) e.currentTarget.style.background = 'var(--surface-active)';
  }, [open]);

  const handleTriggerLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) e.currentTarget.style.background = 'var(--surface-hover)';
    e.currentTarget.style.transform = 'scale(1)';
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
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        style={triggerStyle}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Select: ${current?.label || selected}`}
        onMouseDown={handleTriggerDown}
        onMouseUp={handleTriggerUp}
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

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: opensUpward ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: opensUpward ? 2 : -2 }}
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
                        ? (isSelected ? 'rgba(77, 156, 248, 0.12)' : 'var(--surface-hover)')
                        : (isSelected ? 'var(--accent-subtle)' : 'transparent'),
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default memo(Dropdown);
