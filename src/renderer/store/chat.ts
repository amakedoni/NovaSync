import { create } from 'zustand';

export type ChatState = 'empty' | 'streaming' | 'done' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  state: ChatState;
  currentId: string | null;
  messages: Message[];
  model: string;
  errorMessage: string;
  conversations: Conversation[];

  mode: string;
  setMode: (mode: string) => void;

  setModel: (model: string) => void;
  addUserMessage: (content: string) => void;
  appendChunk: (chunk: string) => void;
  finishResponse: (fullText: string) => void;
  setError: (message: string) => void;
  reset: () => void;
  newConversation: () => void;
  loadConversation: (id: string) => void;
  setConversations: (convs: Conversation[]) => void;
  clearConversations: () => void;
  getTitle: () => string;
}

let msgId = 0;
function nextId(): string {
  return (++msgId).toString(36) + Date.now().toString(36);
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  state: 'empty',
  currentId: null,
  messages: [],
  model: 'deepseek-chat',
  mode: 'chat',
  errorMessage: '',
  conversations: [],

  setModel: (model) => set({ model }),
  setMode: (mode) => set({ mode }),

  addUserMessage: (content) => {
    const userMsg: Message = {
      id: nextId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, userMsg],
      state: 'streaming',
      errorMessage: '',
      currentId: s.currentId || nextId(),
    }));
  },

  appendChunk: (chunk) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      } else {
        msgs.push({
          id: nextId(),
          role: 'assistant',
          content: chunk,
          timestamp: Date.now(),
        });
      }
      return { messages: msgs, state: 'streaming' };
    });
  },

  finishResponse: (fullText) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: fullText };
      }
      return { messages: msgs, state: 'done' };
    });
  },

  // Allow clearing error by passing empty string (reverts to streaming state for retry)
  setError: (message) =>
    set({ errorMessage: message, state: message ? 'error' : 'streaming' }),

  reset: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '', mode: 'chat' }),

  newConversation: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '', mode: 'chat' }),

  loadConversation: (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    if (conv) {
      set({
        currentId: conv.id,
        messages: conv.messages,
        model: conv.model,
        state: 'done',
        errorMessage: '',
      });
    }
  },

  setConversations: (convs) => set({ conversations: convs }),
  clearConversations: () => set({ conversations: [] }),

  getTitle: () => {
    const msgs = get().messages;
    const firstUser = msgs.find((m) => m.role === 'user');
    if (!firstUser) return 'New Chat';
    return firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '...' : '');
  },
}));
