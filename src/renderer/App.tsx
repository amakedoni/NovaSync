import { useMemo } from 'react';
import ChatBubble from './components/ChatBubble';
import HistoryWindow from './components/HistoryWindow';

export default function App() {
  const isHistory = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('window') === 'history';
  }, []);

  if (isHistory) {
    return <HistoryWindow />;
  }

  return <ChatBubble />;
}
