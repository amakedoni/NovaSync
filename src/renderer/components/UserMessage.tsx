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
      layout
      style={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <div style={{
          padding: '8px 14px', fontSize: 12, lineHeight: 1.6,
          background: 'linear-gradient(135deg, rgba(90,200,250,0.12), rgba(90,200,250,0.05))',
          border: '0.5px solid rgba(90,200,250,0.08)',
          color: 'var(--text-primary)', borderRadius: '16px 16px 4px 16px', wordBreak: 'break-word',
        }}>
          {content}
        </div>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '0 4px' }}>
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
