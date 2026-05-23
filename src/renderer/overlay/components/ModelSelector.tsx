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
  const [dropUp, setDropUp] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = models.find((m) => m.id === selected);

  const checkPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Need ~160px for the dropdown. If not enough space below, open up.
      setDropUp(spaceBelow < 160);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    checkPosition();
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open, checkPosition]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 cursor-pointer border-none transition-all duration-150"
        style={{
          background: 'var(--surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'inherit',
        }}
      >
        {current?.label || selected}
        <svg
          width="7" height="7" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            [dropUp ? 'bottom' : 'top']: 'calc(100% + 6px)',
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 14,
            padding: 4,
            minWidth: 160,
            zIndex: 50,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-input)',
            boxShadow: 'var(--shadow-dropdown)',
          }}
        >
          {models.map((model) => (
            <button
              key={model.id}
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
