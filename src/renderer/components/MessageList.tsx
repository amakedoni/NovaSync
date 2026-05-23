import { useRef, useEffect } from 'react';
import { useChatStore, type Message } from '../store/chat';
import UserMessage from './UserMessage';
import NovaMessage from './NovaMessage';

export default function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const state = useChatStore((s) => s.state);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
    >
      {messages.map((msg: Message) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} content={msg.content} />
        ) : (
          <NovaMessage
            key={msg.id}
            content={msg.content}
            isStreaming={state === 'streaming' && msg === messages[messages.length - 1]}
          />
        )
      )}
    </div>
  );
}
