import { motion } from 'framer-motion';

interface Props {
  content: string;
  timestamp: number;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function UserMessage({ content, timestamp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] flex flex-col items-end gap-0.5">
        <div
          className="px-3.5 py-2 text-xs leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.20), rgba(124,58,237,0.12))',
            color: 'var(--text-primary)',
            borderRadius: '16px 16px 4px 16px',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </div>
        <span className="text-[9px] px-1" style={{ color: 'var(--text-tertiary)' }}>
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
