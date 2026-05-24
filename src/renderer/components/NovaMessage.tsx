import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  isStreaming: boolean;
}

const msgSpring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export default function NovaMessage({ content, isStreaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...msgSpring, duration: undefined }}
      layout
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
    >
      {/* Nova icon */}
      <div style={{
        width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 10, fontWeight: 700,
        background: 'var(--bg-deep)',
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
      }}>
        N
      </div>

      {/* Message body */}
      <motion.div
        layout
        style={{
          flex: 1, minWidth: 0, color: 'var(--text-secondary)', fontSize: 13,
          lineHeight: 1.65, wordBreak: 'break-word',
        }}
      >
        {content ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ marginBottom: 8, marginTop: 0 }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>,
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code style={{
                      padding: '1px 5px', borderRadius: 3, fontSize: '0.9em',
                      background: 'var(--surface-subtle)', color: 'var(--text-secondary)',
                    }}>{children}</code>
                  );
                }
                return (
                  <pre style={{
                    margin: '12px 0', padding: '14px 16px', borderRadius: 6, overflowX: 'auto',
                    fontSize: 11, lineHeight: 1.55,
                    background: 'var(--surface-subtle)', border: '1px solid var(--border-input)',
                  }}>
                    <code className={className}>{children}</code>
                  </pre>
                );
              },
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid var(--accent-subtle)' }}>{children}</a>
              ),
              ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            }}
          >
            {content}
          </ReactMarkdown>
        ) : null}

        {isStreaming && <span className="streaming-cursor" />}
      </motion.div>
    </motion.div>
  );
}
