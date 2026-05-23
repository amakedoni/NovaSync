import { useMemo } from 'react';
import GlassCanvasApp from './components/GlassCanvasApp';
import HistoryWindow from './components/HistoryWindow';

export default function App() {
  const isHistory = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('window') === 'history';
  }, []);

  if (isHistory) {
    return <HistoryWindow />;
  }

  return <GlassCanvasApp />;
}
