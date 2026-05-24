import { useChatStore } from '../store/chat';
import MessageList from './MessageList';
import ActionBar from './ActionBar';

interface Props {
  isThinking: boolean;
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
}

export default function ConversationView({ isThinking, onCopy, onRetry, onFollowUp }: Props) {
  const state = useChatStore((s) => s.state);
  const messages = useChatStore((s) => s.messages);
  const hasAssistantContent = messages.some((m) => m.role === 'assistant');

  return (
    <>
      {/* Messages area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <MessageList isThinking={isThinking} />
      </div>

      {/* Generating indicator */}
      {state === 'streaming' && !isThinking && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 18px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>generating...</span>
        </div>
      )}

      {/* Thinking disabled input */}
      {state === 'streaming' && isThinking && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 18px 10px',
        }}>
          <div style={{
            height: 38,
            borderRadius: 6,
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-input)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Waiting for response...</span>
          </div>
        </div>
      )}

      {/* Action bar (DONE) */}
      {state === 'done' && messages.length > 0 && (
        <ActionBar onCopy={onCopy} onRetry={onRetry} onFollowUp={onFollowUp} hasContent={hasAssistantContent} />
      )}
    </>
  );
}
