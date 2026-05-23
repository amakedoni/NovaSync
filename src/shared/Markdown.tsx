import ReactMarkdown from 'react-markdown';

interface Props {
  children: string;
}

/**
 * Shared Markdown renderer used by both overlay (history previews)
 * and widget (response body).
 */
export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown
      components={{
        code: ({ className, children: codeChildren, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  fontSize: '0.9em',
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
                margin: '12px 0',
                padding: '14px 16px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.35)',
                overflow: 'auto',
              }}
            >
              <code className={className} {...props}>
                {codeChildren}
              </code>
            </pre>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
