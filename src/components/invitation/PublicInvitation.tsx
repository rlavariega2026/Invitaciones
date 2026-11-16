import { useEffect, useState, type MouseEvent } from 'react';
import type { Invitation } from '../../types/invitation';
import { InvitationContainer } from './InvitationContainer';
import { OfflineIndicator } from '../pwa/OfflineIndicator';

const controls = 'a,button,input,select,textarea,form,label,summary,audio,video,iframe,[role="button"],[role="dialog"],[contenteditable],[tabindex],[data-lav-interactive]';

export function PublicInvitation({ invitation }: { invitation: Invitation }) {
  const [showInstall, setShowInstall] = useState(false);
  useEffect(() => {
    const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifest) return;
    const original = manifest.href;
    manifest.href = `${import.meta.env.BASE_URL}api/public/manifest?start=${encodeURIComponent(location.pathname + location.search)}`;
    return () => { manifest.href = original; };
  }, []);

  function requestFullscreen(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || !(event.target instanceof Element) || event.target.closest(controls)
        || document.fullscreenElement || window.matchMedia('(display-mode: standalone)').matches) return;
    const element = document.documentElement;
    if (!element.requestFullscreen || document.fullscreenEnabled === false) {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) setShowInstall(true);
      return;
    }
    void element.requestFullscreen().catch(() => {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) setShowInstall(true);
    });
  }

  return <main className="lav-public-invitation bg-[#FDFBF7]" onClick={requestFullscreen}>
    <InvitationContainer invitation={invitation} isEditor={false} />
    {invitation.hostingerPublish?.mode === 'demo' && <div className="lav-demo-mark" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}lav-digital.png`} alt="" />
      <strong>DEMO</strong>
      <span>Versión de demostración • LAV Digital MKT</span>
    </div>}
    {showInstall && <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-xl bg-white p-3 text-sm shadow-lg" data-lav-interactive>
      Para verla desde la pantalla de inicio, usa Compartir y selecciona Agregar a inicio.
      <button className="ml-2 underline" onClick={() => setShowInstall(false)}>Cerrar</button>
    </div>}
    <OfflineIndicator />
  </main>;
}
