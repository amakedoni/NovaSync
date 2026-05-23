import { motion } from 'framer-motion';

interface Props {
  content: string;
  isStreaming?: boolean;
}

export default function NovaMessage({ content, isStreaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start"
    >
      <div
        className="max-w-[85%] px-3.5 py-2 text-xs leading-relaxed"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-primary)',
          borderRadius: '16px 16px 16px 4px',
          wordBreak: 'break-word',
        }}
      >
        {content}
        {isStreaming && <span className="ml-0.5 animate-pulse">|</span>}
      </div>
    </motion.div>
  );
}
