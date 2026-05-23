import { useRef, useEffect, useState, useCallback } from 'react';
import { useChatStore, type Message } from '../store/chat';
import UserMessage from './UserMessage';
import NovaMessage from './NovaMessage';

interface Props {
  isThinking: boolean;
}

export default function MessageList({ isThinking }: Props) {
  const messages = useChatStore((s) => s.messages);
  const state = useChatStore((s) => s.state);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }, []);

  const handleScroll = useCallback(() => {
    setAutoScroll(isNearBottom());
  }, [isNearBottom]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Always scroll to bottom when user submits (new conversation turn)
  useEffect(() => {
    if (state === 'streaming' && messages.length > 0 && messages[messages.length - 1]?.role === 'user') {
      setAutoScroll(true);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [state, messages]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3"
    >
      {messages.map((msg: Message) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
        ) : (
          <NovaMessage
            key={msg.id}
            content={msg.content}
            isStreaming={state === 'streaming' && msg === messages[messages.length - 1] && !isThinking}
          />
        )
      )}
    </div>
  );
}
