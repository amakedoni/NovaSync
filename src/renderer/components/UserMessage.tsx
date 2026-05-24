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

const msgSpring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export default function UserMessage({ content, timestamp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...msgSpring, duration: undefined }}
      layout
      style={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <div style={{
          padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
          background: 'var(--surface-hover)',
          color: 'var(--text-primary)',
          borderRadius: '10px 10px 2px 10px',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 9, padding: '0 4px' }}>
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
