import { useMemo } from 'react';
import GlassCanvasApp from './components/GlassCanvasApp';
import HistoryWindow from './components/HistoryWindow';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const windowType = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('window');
  }, []);

  if (windowType === 'history') {
    return <HistoryWindow />;
  }

  if (windowType === 'settings') {
    return <SettingsPanel />;
  }

  return <GlassCanvasApp />;
}
