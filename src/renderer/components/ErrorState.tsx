interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
        style={{
          background: 'var(--error-bg)',
          border: '1px solid rgba(255,130,130,0.2)',
          color: 'var(--error)',
        }}
      >
        !
      </div>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </span>
      <span className="text-[11px] text-center max-w-[220px]" style={{ color: 'var(--text-tertiary)' }}>
        {message}
      </span>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-2xl text-[11px] font-semibold border-none cursor-pointer transition-all"
        style={{
          background: 'var(--surface-active)',
          border: '1px solid rgba(167,139,250,0.25)',
          color: 'var(--accent)',
          fontFamily: 'inherit',
        }}
      >
        Retry
      </button>
    </div>
  );
}
