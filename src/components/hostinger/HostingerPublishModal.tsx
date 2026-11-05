import React, { useEffect, useState } from 'react';
import { Invitation } from '../../types/invitation';
import { api } from '../../services/api';
import { getInvitationUrl } from '../../utils/invitationUrl';
import {
  Globe,
  X,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Server,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Eye,
} from 'lucide-react';

interface HostingerPublishModalProps {
  invitation: Invitation;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInvitation: (updated: Invitation) => void;
}

export const HostingerPublishModal: React.FC<HostingerPublishModalProps> = ({
  invitation,
  isOpen,
  onClose,
  onUpdateInvitation,
}) => {
  const [remoteSlug, setRemoteSlug] = useState(
    invitation.title.toLowerCase().replace(/[^a-z0-9-]/g, '-') || invitation.id
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setRemoteSlug(invitation.hostingerPublish?.remoteSlug || invitation.title.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || invitation.id);
  }, [invitation.id, invitation.title, invitation.hostingerPublish?.remoteSlug]);

  if (!isOpen) return null;

  const isPublished = invitation.hostingerPublish?.isConfigured === true
    && invitation.hostingerPublish?.publishStatus === 'published';
  const publicUrl = getInvitationUrl(invitation.id, {}, remoteSlug);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    const safeSlug = remoteSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || invitation.id;
    const nextPublicUrl = getInvitationUrl(invitation.id, {}, safeSlug);

    const updatedInvitation: Invitation = {
      ...invitation,
      hostingerPublish: {
        isConfigured: true,
        customDomain: 'https://lavdigitalagency.com',
        remoteDir: '/public_html/Invitaciones/Invitacionespost/',
        remoteSlug: safeSlug,
        publicUrl: nextPublicUrl,
        publishStatus: 'published',
      },
    };
    try {
      const savedInvitation = await api.saveInvitationChecked(updatedInvitation);
      setRemoteSlug(safeSlug);
      onUpdateInvitation(savedInvitation);
      setSaveMessage(`Invitación publicada correctamente: ${nextPublicUrl}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la configuración en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadStandaloneHTML = () => {
    window.open(`${import.meta.env.BASE_URL}api/hostinger/export-html/${invitation.id}`, '_blank');
  };

  const handlePreviewLive = () => {
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#FDFBF7] shadow-2xl border border-[#E8DEC8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4DA] bg-white/70">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#9C7A3C]" />
            <div>
              <h3 className="text-base font-serif font-bold text-slate-800">
                Publicación & Exportación Web
              </h3>
              <p className="text-[11px] text-stone-500">
                Descarga tu paquete para Hostinger o visualiza el enlace público
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Opción Inmediata 1: Ver Invitación Publicada Online */}
          <div className="p-4 rounded-2xl bg-white border border-[#DFC48B] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-slate-900 text-sm">
                1. Ver Invitación Publicada (Online Inmediato)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                {isPublished ? 'Publicada' : 'Pendiente de publicar'}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Publícala en la ruta fija de Hostinger. El enlace permanecerá visible aquí para abrirlo o copiarlo.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleSaveConfig()}
                disabled={isSaving}
                className="flex-1 py-2 px-3 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] disabled:opacity-60 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Publicando…' : isPublished ? 'Publicar cambios' : 'Publicar invitación'}</span>
              </button>
              {isPublished && <>
                <button type="button" onClick={handlePreviewLive} className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer">
                  <Eye className="inline w-3.5 h-3.5 mr-1" />Abrir
                </button>
                <button type="button" onClick={() => { void navigator.clipboard.writeText(publicUrl); }} className="py-2 px-3 rounded-xl bg-[#FAF5EB] hover:bg-[#F3EADB] border border-[#DFC48B] text-slate-900 font-semibold text-xs transition-colors cursor-pointer">
                  Copiar enlace
                </button>
              </>}
            </div>
            {isPublished && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
              <label htmlFor="published-invitation-url" className="block text-[10px] font-semibold text-emerald-900 mb-1">Enlace público de la invitación</label>
              <input id="published-invitation-url" readOnly value={publicUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1.5 font-mono text-[10px] text-slate-800" />
            </div>}
          </div>

          {/* Opción 2: Descargar Paquete HTML para Hostinger */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-slate-900 text-sm">
                2. Descargar Paquete para Hostinger (cPanel / File Manager)
              </span>
              <Download className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Descarga el archivo HTML autónomo completo con estilos y fotos listos. Podrás subirlo directamente a la carpeta <strong>public_html/</strong> de tu cuenta de Hostinger cuando lo desees, sin necesidad de configurar contraseñas ahora.
            </p>
            <button
              type="button"
              onClick={handleDownloadStandaloneHTML}
              className="w-full py-2.5 px-4 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo HTML para Hostinger</span>
            </button>
          </div>

          {/* Opción 3: Ruta fija de publicación */}
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-slate-900 text-xs">
                3. Ruta fija de publicación
              </span>
              <Server className="w-4 h-4 text-stone-400" />
            </div>
            <p className="text-[11px] text-stone-500">
              Todas las invitaciones se publican en el dominio y carpeta de Hostinger ya configurados.
            </p>

            <div>
              <label className="block font-medium text-slate-700 mb-1 text-[11px]">Dominio y carpeta de publicación</label>
              <div className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-[10px] text-slate-700">https://lavdigitalagency.com/Invitaciones/Invitacionespost/</div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1 text-[11px]">
                Nombre de la Ruta / Archivo
              </label>
              <input
                type="text"
                value={remoteSlug}
                onChange={(e) => setRemoteSlug(e.target.value)}
                placeholder="nombre-de-la-invitacion"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
              />
            </div>

            {saveMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}
            {saveError && (
              <div role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer"
            >
              {isSaving ? 'Publicando…' : 'Guardar Configuración de Dominio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
