import ReactMarkdown from 'react-markdown';

interface Props {
  children: string;
}

/**
 * Shared Markdown renderer used by both overlay (history previews)
 * and widget (response body). Styling mirrors NovaMessage.
 */
export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: pChildren }) => <p className="mb-2 last:mb-0">{pChildren}</p>,
        code: ({ className, children: codeChildren, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="px-1 py-0.5 rounded text-[0.9em]"
                style={{
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
              className="my-3 p-3.5 rounded-lg overflow-x-auto text-[11px] leading-relaxed"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-subtle)',
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
        ul: ({ children: ulChildren }) => <ul className="pl-5 mb-2 list-disc">{ulChildren}</ul>,
        ol: ({ children: olChildren }) => <ol className="pl-5 mb-2 list-decimal">{olChildren}</ol>,
        li: ({ children: liChildren }) => <li className="mb-1">{liChildren}</li>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
