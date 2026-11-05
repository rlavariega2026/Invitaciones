import React, { useState } from 'react';
import { PhotoConfig, PhotoShape, PhotoFilter, PhotoAdjustments } from '../../types/invitation';
import {
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Sliders,
  Crop,
  Sparkles,
  Undo2,
  Check,
  Upload,
} from 'lucide-react';

interface PhotoEditorModalProps {
  photo: PhotoConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PhotoConfig) => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'shapes' | 'filters' | 'adjust' | 'crop'>('shapes');
  const [currentUrl, setCurrentUrl] = useState(photo.url);
  const [shape, setShape] = useState<PhotoShape>(photo.shape);
  const [filter, setFilter] = useState<PhotoFilter>(photo.filter);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    ...photo.adjustments,
  });

  const shapesList: Array<{ id: PhotoShape; label: string; iconClass: string }> = [
    { id: 'fade_bottom_gradient', label: 'Degradado Inferior', iconClass: 'rounded-none bg-gradient-to-b from-stone-400 to-transparent' },
    { id: 'heart_ornamental_roses', label: 'Corazón con Rosas (i2)', iconClass: 'rounded-full border-2 border-rose-400' },
    { id: 'arch_with_bottom_roses', label: 'Arco con Flores (i2)', iconClass: 'rounded-t-full border-b-2 border-pink-400' },
    { id: 'gold_wreath_circular', label: 'Corona Laurel Oro (i40)', iconClass: 'rounded-full border-2 border-[#DFC48B]' },
    { id: 'organic_pebble', label: 'Piedra de Playa (i33)', iconClass: 'rounded-[40%_60%_70%_30%]' },
    { id: 'quilted_gold_crest', label: 'Corona Real (i3)', iconClass: 'rounded-2xl border-2 border-[#DFC48B]' },
    { id: 'gold_geometric_box', label: 'Marco Octagonal Oro', iconClass: 'border-2 border-[#DFC48B]' },
    { id: 'arch', label: 'Arco Romano', iconClass: 'rounded-t-full' },
    { id: 'oval', label: 'Óvalo Clásico', iconClass: 'rounded-[50%]' },
    { id: 'heart', label: 'Corazón Romántico', iconClass: 'mask-heart' },
    { id: 'diamond', label: 'Diamante', iconClass: 'rotate-45 scale-75' },
    { id: 'circle', label: 'Círculo Perfecto', iconClass: 'rounded-full' },
    { id: 'polaroid', label: 'Estilo Polaroid', iconClass: 'border-b-8 border-white shadow-md' },
    { id: 'paper_edge', label: 'Borde Artesanal', iconClass: 'rounded-lg border border-dashed' },
    { id: 'gold_frame', label: 'Marco Dorado', iconClass: 'border-4 border-[#DFC48B]' },
    { id: 'floral_frame', label: 'Marco Floral', iconClass: 'border-4 border-[#C7BDDF] rounded-2xl' },
    { id: 'geometric_frame', label: 'Geométrico', iconClass: 'border-2 border-slate-700' },
    { id: 'rectangle', label: 'Rectangular', iconClass: 'rounded-none' },
    { id: 'square', label: 'Cuadrado', iconClass: 'rounded-lg' },
  ];

  const filtersList: Array<{ id: PhotoFilter; label: string }> = [
    { id: 'none', label: 'Original' },
    { id: 'warm', label: 'Cálido (Golden Hour)' },
    { id: 'cool', label: 'Frío Nórdico' },
    { id: 'cinematic', label: 'Cinematográfico' },
    { id: 'vintage', label: 'Vintage Nostalgia' },
    { id: 'bw', label: 'Blanco & Negro Elegante' },
    { id: 'golden', label: 'Dorado Real' },
    { id: 'matte', label: 'Mate Terciopelo' },
    { id: 'soft', label: 'Enfoque Suave' },
    { id: 'high_contrast', label: 'Alto Contraste' },
    { id: 'portrait', label: 'Retrato Fino' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setShape('arch');
    setFilter('none');
    setAdjustments({
      zoom: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      panX: 0,
      panY: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      opacity: 100,
      vignette: 0,
      sepia: 0,
      grayscale: 0,
    });
  };

  const handleSave = () => {
    onSave({
      ...photo,
      url: currentUrl,
      shape,
      filter,
      adjustments,
    });
    onClose();
  };

  // Compute CSS filter string
  const getFilterStyle = () => {
    let filterString = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) opacity(${adjustments.opacity}%)`;

    if (filter === 'warm') filterString += ' sepia(25%) hue-rotate(-10deg)';
    if (filter === 'cool') filterString += ' hue-rotate(15deg) saturate(90%)';
    if (filter === 'cinematic') filterString += ' contrast(120%) saturate(110%) sepia(10%)';
    if (filter === 'vintage') filterString += ' sepia(50%) contrast(90%)';
    if (filter === 'bw') filterString += ' grayscale(100%) contrast(115%)';
    if (filter === 'golden') filterString += ' sepia(35%) saturate(130%) brightness(105%)';
    if (filter === 'matte') filterString += ' contrast(85%) brightness(108%)';
    if (filter === 'soft') filterString += ' blur(0.5px) brightness(105%)';
    if (filter === 'high_contrast') filterString += ' contrast(140%)';
    if (filter === 'portrait') filterString += ' saturate(105%) brightness(103%)';

    return filterString;
  };

  // Compute shape classes
  const getShapeClasses = (s: PhotoShape) => {
    switch (s) {
      case 'fade_bottom_gradient':
        return 'rounded-none aspect-[3/4] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]';
      case 'heart_ornamental_roses':
        return 'rounded-full aspect-square border-4 border-rose-300 shadow-xl';
      case 'arch_with_bottom_roses':
        return 'rounded-t-[140px] rounded-b-xl overflow-hidden aspect-[3/4] border-2 border-pink-300 shadow-lg';
      case 'gold_wreath_circular':
        return 'rounded-full aspect-square border-4 border-[#DFC48B] shadow-2xl';
      case 'organic_pebble':
        return 'aspect-square shadow-xl overflow-hidden [border-radius:60%_40%_50%_50%/50%_60%_40%_50%]';
      case 'quilted_gold_crest':
        return 'rounded-3xl aspect-square border-4 border-[#DFC48B] bg-[#FFF0F5] p-2 shadow-2xl';
      case 'gold_geometric_box':
        return 'border-3 border-[#DFC48B] p-2 bg-white aspect-[3/4] shadow-xl';
      case 'arch':
        return 'rounded-t-[140px] rounded-b-2xl overflow-hidden aspect-[3/4]';
      case 'oval':
        return 'rounded-[50%] overflow-hidden aspect-[3/4]';
      case 'circle':
        return 'rounded-full overflow-hidden aspect-square';
      case 'heart':
        return 'rounded-3xl overflow-hidden aspect-square border-4 border-rose-200';
      case 'polaroid':
        return 'rounded-xs bg-white p-3 pb-10 shadow-lg border border-slate-200 aspect-[4/5]';
      case 'diamond':
        return 'rounded-2xl rotate-45 scale-75 overflow-hidden aspect-square border-2 border-[#DFC48B]';
      case 'gold_frame':
        return 'rounded-2xl p-2 bg-gradient-to-tr from-[#9C7A3C] via-[#DFC48B] to-[#9C7A3C] shadow-lg aspect-[3/4]';
      case 'floral_frame':
        return 'rounded-3xl p-2.5 bg-[#FAF6EE] border-2 border-dashed border-[#C7BDDF] shadow-md aspect-[3/4]';
      case 'geometric_frame':
        return 'rounded-none border-2 border-slate-800 p-2 bg-white aspect-[3/4]';
      case 'paper_edge':
        return 'rounded-xl border border-stone-300 shadow-inner p-1.5 bg-[#FAF8F5] aspect-[3/4]';
      case 'square':
        return 'rounded-2xl overflow-hidden aspect-square';
      case 'rectangle':
      default:
        return 'rounded-xl overflow-hidden aspect-[3/4]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FDFBF7] shadow-2xl border border-[#E8DEC8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4DA] bg-white/70">
          <div>
            <h2 className="text-lg font-serif font-semibold text-slate-800">
              Estudio Fotográfico Profesional
            </h2>
            <p className="text-xs text-slate-500">
              Ajusta encuadre, formas decorativas, recortes y filtros de alta resolución
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium border border-rose-200 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Reemplazar Foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              title="Restablecer original"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Preview Canvas */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-stone-100/60 rounded-2xl p-6 border border-[#E8DEC8] relative overflow-hidden min-h-[360px]">
            <div className={`relative max-w-[280px] w-full flex items-center justify-center transition-all duration-300 ${getShapeClasses(shape)}`}>
              <div
                className="w-full h-full overflow-hidden flex items-center justify-center"
                style={{
                  transform: `scale(${adjustments.zoom}) rotate(${adjustments.rotate}deg) scaleX(${adjustments.flipH ? -1 : 1}) scaleY(${adjustments.flipV ? -1 : 1}) translate(${adjustments.panX}px, ${adjustments.panY}px)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <img
                  src={currentUrl}
                  alt={photo.alt || 'Fotografía'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{ filter: getFilterStyle() }}
                />
              </div>
            </div>

            {/* Quick Canvas Toolbar */}
            <div className="absolute bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs shadow-sm border border-stone-200 text-xs text-stone-700">
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                className="p-1 hover:text-stone-900 rounded"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1">{Math.round(adjustments.zoom * 100)}%</span>
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, zoom: Math.min(2.5, prev.zoom + 0.1) }))}
                className="p-1 hover:text-stone-900 rounded"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="w-px h-3.5 bg-stone-300 mx-1" />
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))}
                className="p-1 hover:text-stone-900 rounded"
                title="Girar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, flipH: !prev.flipH }))}
                className="p-1 hover:text-stone-900 rounded"
                title="Voltear horizontal"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, flipV: !prev.flipV }))}
                className="p-1 hover:text-stone-900 rounded"
                title="Voltear vertical"
              >
                <FlipVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-stone-200/60 rounded-xl text-xs font-medium text-stone-600">
              <button
                onClick={() => setActiveTab('shapes')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'shapes' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Forma & Marco</span>
              </button>
              <button
                onClick={() => setActiveTab('filters')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'filters' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Filtros</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'adjust' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Ajustes</span>
              </button>
            </div>

            {/* Tab: Shapes */}
            {activeTab === 'shapes' && (
              <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                <p className="text-xs text-stone-500 mb-2">
                  Elige la silueta y enmarcado artístico para la fotografía:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {shapesList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setShape(item.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        shape === item.id
                          ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-semibold ring-1 ring-[#DFC48B]'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className={`w-6 h-7 bg-stone-300 flex-shrink-0 ${item.iconClass}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Filters */}
            {activeTab === 'filters' && (
              <div className="space-y-1.5 overflow-y-auto max-h-[360px] pr-1">
                <p className="text-xs text-stone-500 mb-2">
                  Graduación de color profesional para bodas y galas:
                </p>
                {filtersList.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      filter === f.id
                        ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    {filter === f.id && <Check className="w-4 h-4 text-[#9C7A3C]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Adjustments */}
            {activeTab === 'adjust' && (
              <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-1 text-xs">
                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Brillo</span>
                    <span>{adjustments.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments.brightness}
                    onChange={(e) => setAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Contraste</span>
                    <span>{adjustments.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments.contrast}
                    onChange={(e) => setAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Saturación de Color</span>
                    <span>{adjustments.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={adjustments.saturation}
                    onChange={(e) => setAdjustments({ ...adjustments, saturation: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Desenfoque Artístico</span>
                    <span>{adjustments.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={adjustments.blur}
                    onChange={(e) => setAdjustments({ ...adjustments, blur: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>Opacidad</span>
                    <span>{adjustments.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={adjustments.opacity}
                    onChange={(e) => setAdjustments({ ...adjustments, opacity: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EBE4DA] bg-white/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-stone-900 text-xs font-semibold shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
