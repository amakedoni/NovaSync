import ReactMarkdown from 'react-markdown';

interface Props {
  children: string;
}

/**
 * Shared Markdown renderer. Styling mirrors NovaMessage.
 */
export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: pChildren }) => (
          <p style={{ marginBottom: 8 }}>{pChildren}</p>
        ),
        code: ({ className, children: codeChildren, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                style={{
                  padding: '1px 6px', borderRadius: 4, fontSize: '0.9em',
                  background: 'rgba(90,200,250,0.08)',
                  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                }}
                {...props}
              >
                {codeChildren}
              </code>
            );
          }
          return (
            <pre
              style={{
                margin: '12px 0', padding: 14, borderRadius: 10, overflowX: 'auto',
                fontSize: 11, lineHeight: 1.5,
                background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)',
                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              }}
            >
              <code className={className} {...props}>
                {codeChildren}
              </code>
            </pre>
          );
        },
        a: ({ children: aChildren, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            {aChildren}
          </a>
        ),
        ul: ({ children: ulChildren }) => (
          <ul style={{ paddingLeft: 20, marginBottom: 8, listStyle: 'disc' }}>{ulChildren}</ul>
        ),
        ol: ({ children: olChildren }) => (
          <ol style={{ paddingLeft: 20, marginBottom: 8, listStyle: 'decimal' }}>{olChildren}</ol>
        ),
        li: ({ children: liChildren }) => (
          <li style={{ marginBottom: 4 }}>{liChildren}</li>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
