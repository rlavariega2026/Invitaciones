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
      const isInvitationCache = key === 'lav_invitations_cache' || key === 'lav_rsvps_cache';
      const isQuotaError = error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      if (!isInvitationCache || !isQuotaError) throw error;
      console.warn('LAV: se omitió la caché local llena; el guardado remoto continúa.');
    }
  };
} catch (error) {
  console.warn('LAV: no fue posible instalar la protección de caché local.', error);
}

createRoot(document.getElementById('root')!).render(<App />);
