import React, { useState, useEffect } from 'react';
import { Invitation, RSVPRecord } from './types/invitation';
import { api } from './services/api';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { InvitationEditor } from './components/editor/InvitationEditor';
import { InvitationContainer } from './components/invitation/InvitationContainer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { SaveTemplateModal } from './components/templates/SaveTemplateModal';
import { HostingerPublishModal } from './components/hostinger/HostingerPublishModal';
import { AccountPanel, Login } from './components/dashboard/Access';
import { PublicInvitation } from './components/invitation/PublicInvitation';
import { Account, sessionAction } from './services/session';
import { getDigitalPassUrl, getInvitationUrl } from './utils/invitationUrl';
import { createDigitalPassImage } from './utils/digitalPassImage';
import { ArrowLeft, Bookmark, Globe, Share2 } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor' | 'preview' | 'direct_guest' | 'digital_pass'>('dashboard');
  const [currentInvitation, setCurrentInvitation] = useState<Invitation | null>(null);
  const [digitalPassImage, setDigitalPassImage] = useState('');
  const [digitalPassError, setDigitalPassError] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Account | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [publicError, setPublicError] = useState('');
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setCurrentInvitation(null);
      setShowAccounts(false);
      setShowHostingerModal(false);
      setShowSaveTemplateModal(false);
      setViewMode('dashboard');
    };
    window.addEventListener('lav-session-expired', expire);
    return () => window.removeEventListener('lav-session-expired', expire);
  }, []);
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  useEffect(() => {
    // Check if the URL has a shared invitation query param or path
    // e.g. /?invitationId=inv-royal-champagne or /invitation/:id
    const params = new URLSearchParams(window.location.search);
    // QR codes issued before the dedicated pass page linked to the invitation URL
    // with passCode/guest parameters. Route those existing codes to their ticket.
    const qrPathCode = window.location.pathname.match(/\/Invitaciones\/QR\/([^/]+)\/?$/i)?.[1];
    const passCode = params.get('passCode') || (qrPathCode ? decodeURIComponent(qrPathCode) : null);
    if (passCode) {
      if (!window.location.pathname.startsWith('/Invitaciones/QR')) {
        window.location.replace(getDigitalPassUrl(passCode));
        return;
      }
      void loadDigitalPass(passCode);
      return;
    }
    const id = params.get('invitationId') || params.get('id') || '';
    const route = window.location.pathname.match(/^\/Invitaciones\/Invitacionespost\/(.*)/i)?.[1] || '';
    if (id || route) {
      void loadDirectInvitation(id, route);
    } else {
      void sessionAction('status').then(result => setUser(result.user)).catch(() => setUser(null)).finally(() => setLoading(false));
    }
  }, []);

  const loadDigitalPass = async (passCode: string) => {
    setLoading(true);
    setViewMode('digital_pass');
    setDigitalPassError('');
    try {
      const { pass, invitation } = await api.getDigitalPass(passCode);
      const completePass = {
        id: pass.id || passCode,
        invitationId: pass.invitationId || invitation.id || '',
        guestName: pass.guestName || 'Invitado',
        companionsCount: Number(pass.companionsCount) || 1,
        attendance: true,
        qrCode: pass.qrCode || passCode,
        checkedIn: Boolean(pass.checkedIn),
        checkedInCount: Number(pass.checkedInCount) || 0,
        createdAt: pass.createdAt || '',
      } as RSVPRecord;
      const completeInvitation = {
        ...invitation,
        id: invitation.id || completePass.invitationId,
        category: invitation.category || 'especiales',
        title: invitation.title || 'Invitación',
        names: invitation.names || '',
        sections: [],
      } as Invitation;
      if (pass.ticketImageUrl) {
        setDigitalPassImage(new URL(pass.ticketImageUrl, window.location.origin).toString());
      } else {
        const png = createDigitalPassImage(completeInvitation, completePass);
        const savedUrl = await api.saveDigitalPassImage(completePass.qrCode, png);
        setDigitalPassImage(new URL(savedUrl, window.location.origin).toString());
      }
    } catch (error) {
      setDigitalPassError(error instanceof Error ? error.message : 'No se pudo cargar el boleto digital.');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectInvitation = async (id: string, route: string) => {
    setViewMode('direct_guest');
    try {
      setCurrentInvitation(await api.getPublicInvitation(id, route));
    } catch (error) {
      setPublicError(error instanceof Error ? error.message : 'Invitación no disponible');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditor = (invitation: Invitation) => {
    setCurrentInvitation(invitation);
    setViewMode('editor');
  };

  const handlePreviewInvitation = async (id: string) => {
    const inv = await api.getInvitationById(id);
    if (inv) {
      setCurrentInvitation(inv);
      setViewMode('preview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <p className="text-xs font-serif text-stone-500 tracking-wider uppercase">
          Cargando experiencia...
        </p>
      </div>
    );
  }

  if (viewMode === 'digital_pass') {
    return (
      <main className="min-h-screen bg-[#171b2d] flex flex-col items-center justify-center p-4">
        {digitalPassError ? (
          <p role="alert" className="max-w-md rounded-2xl bg-white p-6 text-center text-stone-800">{digitalPassError}</p>
        ) : digitalPassImage ? (
          <>
            <a href={digitalPassImage} download className="block max-w-xl">
              <img src={digitalPassImage} alt="Boleto digital con el nombre del invitado y sus asientos" className="w-full rounded-2xl shadow-2xl" />
            </a>
            <a href={digitalPassImage} download className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900">Descargar boleto PNG</a>
          </>
        ) : null}
      </main>
    );
  }

  // 1. Direct Guest View (via shared link)
  if (viewMode === 'direct_guest') {
    return currentInvitation ? <PublicInvitation invitation={currentInvitation} /> :
      <main className="grid min-h-dvh place-items-center p-5"><p role="alert">{publicError}</p></main>;
  }

  if (!user) return <Login onLogin={setUser} />;

  // 2. Fullscreen Preview View (from Dashboard or Editor)
  if (viewMode === 'preview' && currentInvitation) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] relative">
        {/* Floating Top Control Bar (Never traps the user!) */}
        <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => setViewMode('editor')}
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#E8DEC8] text-xs font-semibold text-stone-800 hover:bg-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Editor</span>
          </button>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200 text-xs font-medium text-stone-700 hover:bg-white transition-all cursor-pointer"
              title="Guardar como plantilla propia"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#9C7A3C]" />
              <span className="hidden sm:inline">Guardar Plantilla</span>
            </button>

            <button
              onClick={() => setShowHostingerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/90 backdrop-blur-md shadow-md border border-purple-200 text-xs font-semibold text-purple-900 hover:bg-purple-100 transition-all cursor-pointer"
              title="Publicar en Hostinger"
            >
              <Globe className="w-3.5 h-3.5 text-purple-700" />
              <span>Publicar en Hostinger</span>
            </button>

            <button
              onClick={() => {
                if (currentInvitation.hostingerPublish?.publishStatus !== 'published') {
                  setShowHostingerModal(true);
                  return;
                }
                const url = currentInvitation.hostingerPublish?.publicUrl || getInvitationUrl(currentInvitation.id, {}, currentInvitation.hostingerPublish?.remoteSlug);
                navigator.clipboard.writeText(url);
                alert('¡Enlace de la invitación copiado al portapapeles!');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DFC48B] hover:bg-[#D5B676] text-stone-900 shadow-md text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>

        <InvitationContainer invitation={currentInvitation} isEditor={false} />
        <OfflineIndicator />

        {/* Hostinger Modal in Preview mode */}
        {showHostingerModal && (
          <HostingerPublishModal
            invitation={currentInvitation}
            isOpen={true}
            onClose={() => setShowHostingerModal(false)}
            onUpdateInvitation={(updated) => {
              setCurrentInvitation(updated);

            }}
          />
        )}

        {/* Save Template Modal in Preview mode */}
        {showSaveTemplateModal && (
          <SaveTemplateModal
            invitation={currentInvitation}
            isOpen={true}
            onClose={() => setShowSaveTemplateModal(false)}
            onSaved={async (name, cat, description) => {
              if (!currentInvitation) throw new Error('No hay una invitación activa para guardar como plantilla.');
              await api.saveTemplate(currentInvitation, name, cat as Invitation['category'], description);
            }}
          />
        )}
      </div>
    );
  }

  // 3. Visual Studio Editor View
  if (viewMode === 'editor' && currentInvitation) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <InvitationEditor
          initialInvitation={currentInvitation}
          onBack={() => setViewMode('dashboard')}
          onPreviewPublic={handlePreviewInvitation}
        />
        <OfflineIndicator />
      </div>
    );
  }

  // 4. Default: User Control Panel & 30-Template Catalog
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-stone-200 px-4 py-2 text-sm">
        <span>{user.name}</span>
        {user.role === 'superadmin' && <button className="underline" onClick={() => setShowAccounts(true)}>Administración de usuarios</button>}
        <button className="underline" onClick={async () => {
          try {
            await sessionAction('logout', {});
            window.dispatchEvent(new Event('lav-session-expired'));
          } catch (error) {
            window.alert(error instanceof Error ? error.message : 'No se pudo cerrar sesión');
          }
        }}>Cerrar sesión</button>
      </div>
      {showAccounts && user.role === 'superadmin' && <AccountPanel onClose={() => setShowAccounts(false)} />}
      <UserDashboard
        onOpenEditor={handleOpenEditor}
        onPreviewInvitation={handlePreviewInvitation}
        onOpenAdmin={() => { if (user.role === 'superadmin') setShowAccounts(true); }}
      />
      <OfflineIndicator />
    </div>
  );
}
