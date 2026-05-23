import ChatBubble from './components/ChatBubble';
import HistoryWindow from './components/HistoryWindow';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isHistory = params.get('window') === 'history';

  if (isHistory) {
    return <HistoryWindow />;
  }

  return <ChatBubble />;
}
