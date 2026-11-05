import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
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
  if (!isOpen) return null;

  const [customDomain, setCustomDomain] = useState(
    invitation.hostingerPublish?.customDomain || ''
  );
  const [remoteSlug, setRemoteSlug] = useState(
    invitation.title.toLowerCase().replace(/[^a-z0-9-]/g, '-') || invitation.id
  );
  const [remoteDirectory, setRemoteDirectory] = useState(
    invitation.hostingerPublish?.remoteDir || '/public_html/'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const domain = customDomain.trim().replace(/\/$/, '');
    const safeSlug = remoteSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const finalUrl = domain ? `${domain}/${safeSlug}` : undefined;

    onUpdateInvitation({
      ...invitation,
      hostingerPublish: {
        isConfigured: !!domain,
        customDomain: domain,
        remoteDir: remoteDirectory,
        publicUrl: finalUrl,
        lastPublishedAt: new Date().toISOString(),
        publishStatus: domain ? 'published' : 'idle',
      },
    });

    setIsSaving(false);
    setSaveMessage('Configuración de Hostinger guardada con éxito.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDownloadStandaloneHTML = () => {
    window.open(`/api/hostinger/export-html/${invitation.id}`, '_blank');
  };

  const handlePreviewLive = () => {
    const liveUrl = `${window.location.origin}/?invitationId=${invitation.id}`;
    window.open(liveUrl, '_blank');
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                Activa
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Tu invitación ya está publicada y accesible inmediatamente mediante enlace web o código QR.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePreviewLive}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Abrir Invitación Publicada</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/?invitationId=${invitation.id}`;
                  navigator.clipboard.writeText(url);
                  alert('¡Enlace de la invitación copiado al portapapeles!');
                }}
                className="py-2 px-4 rounded-xl bg-[#FAF5EB] hover:bg-[#F3EADB] border border-[#DFC48B] text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                Copiar Enlace
              </button>
            </div>
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

          {/* Opción 3: Configurar Dominio Hostinger (Opcional para después) */}
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-slate-900 text-xs">
                3. Conectar tu Dominio de Hostinger (Opcional)
              </span>
              <Server className="w-4 h-4 text-stone-400" />
            </div>
            <p className="text-[11px] text-stone-500">
              Si ya tienes un dominio propio en Hostinger (ej. <em>https://mi-evento.com</em>), ingrésalo aquí para vincular los enlaces y códigos QR.
            </p>

            <div>
              <label className="block font-medium text-slate-700 mb-1 text-[11px]">
                Tu Dominio Web en Hostinger (Opcional)
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="https://tudominio.com (o déjalo vacío por ahora)"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1 text-[11px]">
                Nombre de la Ruta / Archivo
              </label>
              <input
                type="text"
                value={remoteSlug}
                onChange={(e) => setRemoteSlug(e.target.value)}
                placeholder="boda-sofia-mateo"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
              />
            </div>

            {saveMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer"
            >
              Guardar Configuración de Dominio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
