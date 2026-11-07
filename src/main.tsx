import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Never let an oversized local invitation cache interrupt editing.
// Invitations are persisted by the PHP API; this browser cache is optional.
try {
  const storageSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key: string, value: string): void {
    try {
      storageSetItem.call(this, key, value);
    } catch (error) {
      const isOptionalLAVCache = key === 'lav_invitations_cache' || key === 'lav_rsvps_cache';
      if (!isOptionalLAVCache) throw error;
      // These keys are disposable caches, never the saved invitation itself.
      // Suppress any browser storage failure for them so editing cannot be interrupted.
      console.warn('LAV: caché local omitida; el guardado remoto continúa.', error);
    }
  };
} catch (error) {
  console.warn('LAV: no fue posible instalar la protección de caché local.', error);
}

createRoot(document.getElementById('root')!).render(<App />);
