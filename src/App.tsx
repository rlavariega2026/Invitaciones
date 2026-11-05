import React, { useState, useEffect } from 'react';
import { Invitation } from './types/invitation';
import { api } from './services/api';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { InvitationEditor } from './components/editor/InvitationEditor';
import { InvitationContainer } from './components/invitation/InvitationContainer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { SaveTemplateModal } from './components/templates/SaveTemplateModal';
import { HostingerPublishModal } from './components/hostinger/HostingerPublishModal';
import { TEMPLATES_CATALOG, buildInvitationFromTemplate } from './data/templates';
import { ArrowLeft, Bookmark, Globe, Share2 } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor' | 'preview' | 'direct_guest'>('dashboard');
  const [currentInvitation, setCurrentInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  useEffect(() => {
    // Check if the URL has a shared invitation query param or path
    // e.g. /?invitationId=inv-royal-champagne or /invitation/:id
    const params = new URLSearchParams(window.location.search);
    const invitationIdParam = params.get('invitationId') || params.get('id');

    if (invitationIdParam) {
      loadDirectInvitation(invitationIdParam);
    } else {
      setLoading(false);
    }
  }, []);

  const loadDirectInvitation = async (id: string) => {
    setLoading(true);
    try {
      const inv = await api.getInvitationById(id);
      if (inv) {
        setCurrentInvitation(inv);
        setViewMode('direct_guest');
      } else {
        // Fallback to first template
        const fallback = buildInvitationFromTemplate(TEMPLATES_CATALOG[0], id);
        setCurrentInvitation(fallback);
        setViewMode('direct_guest');
      }
    } catch (err) {
      console.error(err);
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DFC48B] via-[#EAE6F8] to-[#FCEFEF] flex items-center justify-center animate-pulse border border-[#DFC48B]/40 shadow-sm">
          <span className="font-serif font-black text-slate-800 text-sm">LAV</span>
        </div>
        <p className="text-xs font-serif text-stone-500 mt-4 tracking-wider uppercase">
          Cargando experiencia de gala...
        </p>
      </div>
    );
  }

  // 1. Direct Guest View (via shared link)
  if (viewMode === 'direct_guest' && currentInvitation) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <InvitationContainer invitation={currentInvitation} isEditor={false} />
        <OfflineIndicator />
      </div>
    );
  }

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
                const url = `${window.location.origin}/?invitationId=${currentInvitation.id}`;
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
              api.saveInvitation(updated);
            }}
          />
        )}

        {/* Save Template Modal in Preview mode */}
        {showSaveTemplateModal && (
          <SaveTemplateModal
            invitation={currentInvitation}
            isOpen={true}
            onClose={() => setShowSaveTemplateModal(false)}
            onSaved={(name, cat) => {
              const updated = {
                ...currentInvitation,
                title: name,
                category: cat as any,
              };
              setCurrentInvitation(updated);
              api.saveInvitation(updated);
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
          onPreviewPublic={() => setViewMode('preview')}
        />
        <OfflineIndicator />
      </div>
    );
  }

  // 4. Default: User Control Panel & 30-Template Catalog
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <UserDashboard
        onOpenEditor={handleOpenEditor}
        onPreviewInvitation={handlePreviewInvitation}
        onOpenAdmin={() => {}}
      />
      <OfflineIndicator />
    </div>
  );
}
