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
      className="flex gap-2"
    >
      {/* Avatar */}
      <div
        className="w-[22px] h-[22px] rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{
          background: isStreaming
            ? 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(124,58,237,0.2))'
            : 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.1))',
          color: 'var(--accent)',
          boxShadow: isStreaming ? '0 0 8px var(--accent-glow)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        N
      </div>

      {/* Content */}
      <div
        className="flex-1 min-w-0"
        style={{
          color: 'var(--text-primary)',
          fontSize: '12px',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {content ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="px-1 py-0.5 rounded text-[0.9em]"
                      style={{
                        background: 'rgba(140,100,220,0.12)',
                        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                      }}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre
                    className="my-3 p-3.5 rounded-lg overflow-x-auto text-[11px] leading-relaxed"
                    style={{
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                    }}
                  >
                    <code className={className}>{children}</code>
                  </pre>
                );
              },
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="pl-5 mb-2 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="pl-5 mb-2 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
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
