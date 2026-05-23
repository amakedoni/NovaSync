import { motion } from 'framer-motion';

interface Props {
  content: string;
}

export default function UserMessage({ content }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div
        className="max-w-[85%] px-3.5 py-2 text-xs leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.20), rgba(124,58,237,0.12))',
          color: 'var(--text-primary)',
          borderRadius: '16px 16px 4px 16px',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </div>
    </motion.div>
  );
}
