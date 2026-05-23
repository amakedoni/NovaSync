import { useState, useRef, useEffect, useCallback } from 'react';

interface Model {
  id: string;
  label: string;
}

interface Props {
  models: Model[];
  selected: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ models, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = models.find((m) => m.id === selected);

  const calcPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;
    // Dropdown min-width is 160px. If not enough space to the right, flip left.
    const needsLeftAlign = spaceRight < 170;
    // If not enough space below, open upward.
    const openUp = spaceBelow < 170;

    setDropStyle({
      position: 'fixed' as const,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
      ...(needsLeftAlign
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
      borderRadius: 14,
      padding: 4,
      minWidth: 160,
      zIndex: 9999,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-input)',
      boxShadow: 'var(--shadow-dropdown)',
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPosition();
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', handler);
    window.addEventListener('resize', calcPosition);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('resize', calcPosition);
    };
  }, [open, calcPosition]);

  const triggerBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--border-subtle)',
    background: 'var(--surface-hover)',
    color: 'var(--text-secondary)',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button ref={buttonRef} onClick={() => setOpen(!open)} style={triggerBtn}>
        {current?.label || selected}
        <svg width="7" height="7" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={dropStyle}>
          {models.map((model) => (
            <button key={model.id}
              onClick={() => { onSelect(model.id); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
                background: model.id === selected ? 'var(--surface-active)' : 'transparent',
                color: model.id === selected ? 'var(--accent)' : 'var(--text-primary)',
                fontFamily: 'inherit',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (model.id !== selected) e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (model.id !== selected) e.currentTarget.style.background = 'transparent';
              }}
            >
              {model.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
