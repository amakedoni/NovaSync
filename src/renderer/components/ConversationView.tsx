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
          borderTop: '0.5px solid var(--border-subtle)',
          padding: '8px 18px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>generating...</span>
        </div>
      )}

      {/* Thinking disabled input */}
      {state === 'streaming' && isThinking && (
        <div style={{
          borderTop: '0.5px solid var(--border-subtle)',
          padding: '8px 18px 10px',
        }}>
          <div style={{
            height: 38,
            borderRadius: 22,
            background: 'rgba(60, 60, 64, 0.35)',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Waiting for response...</span>
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
