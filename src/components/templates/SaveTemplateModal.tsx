import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { Bookmark, X, CheckCircle2, Sparkles } from 'lucide-react';

interface SaveTemplateModalProps {
  invitation: Invitation;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (templateName: string, category: string, description: string) => Promise<void>;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  invitation,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [templateName, setTemplateName] = useState(
    `${invitation.title || 'Mi Diseño'} (${new Date().toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })})`
  );
  const [category, setCategory] = useState(invitation.category || 'bodas');
  const [description, setDescription] = useState(
    `Diseño personalizado de ${invitation.names || 'mi evento'}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || isSaving) return;

    setIsSaving(true);
    setError('');
    try {
      await onSaved(templateName.trim(), category, description.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la plantilla en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#FDFBF7] shadow-2xl border border-[#E8DEC8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4DA] bg-white/70">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#9C7A3C]" />
            <h3 className="text-base font-serif font-bold text-slate-800">
              Guardar en Mis Plantillas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <p className="text-[11px] text-stone-500">
            Asigna un nombre a este diseño para reutilizarlo como plantilla cuando desees:
          </p>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nombre de la Plantilla / Diseño *
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ej. Mi Boda Azul Rey con Mariposas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
            >
              <option value="bodas">Bodas & Galas</option>
              <option value="xv_anos">XV Años</option>
              <option value="graduaciones">Graduaciones</option>
              <option value="cumpleanos">Cumpleaños</option>
              <option value="infantiles">Infantiles & Cuentos</option>
              <option value="especiales">Eventos Especiales</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve nota sobre la temática y colores"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
            />
          </div>

          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">{error}</div>}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Diseño guardado exitosamente en Mis Plantillas!</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || success}
              className="flex-1 py-2.5 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Guardar Plantilla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
