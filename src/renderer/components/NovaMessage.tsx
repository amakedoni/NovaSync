import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  isStreaming: boolean;
}

export default function NovaMessage({ content, isStreaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', gap: 8 }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 10, fontWeight: 700,
        background: isStreaming
          ? 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(124,58,237,0.2))'
          : 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.1))',
        color: 'var(--accent)',
        boxShadow: isStreaming ? '0 0 8px var(--accent-glow)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        N
      </div>

      <div style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.6, wordBreak: 'break-word' }}>
        {content ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ marginBottom: 8, marginTop: 0 }}>{children}</p>,
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code style={{
                      padding: '1px 6px', borderRadius: 4, fontSize: '0.9em',
                      background: 'rgba(140,100,220,0.12)',
                      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                    }}>{children}</code>
                  );
                }
                return (
                  <pre style={{
                    margin: '12px 0', padding: '14px 16px', borderRadius: 10, overflowX: 'auto',
                    fontSize: 11, lineHeight: 1.5,
                    background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)',
                    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                  }}>
                    <code className={className}>{children}</code>
                  </pre>
                );
              },
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{children}</a>
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
      </div>
    </motion.div>
  );
}
