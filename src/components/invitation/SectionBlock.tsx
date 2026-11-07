import React, { useState } from 'react';
import { SectionConfig, Invitation, FontFamilyType, PhotoConfig, PhotoShape } from '../../types/invitation';
import { BackgroundRenderer } from './BackgroundRenderer';
import { SectionCountdown } from './SectionCountdown';
import { CustomButtonRenderer } from '../buttons/CustomButtonRenderer';
import {
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Gift,
  Heart,
  Sparkles,
  Shirt,
  Compass,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Maximize2,
  X,
  Crown,
} from 'lucide-react';

interface SectionBlockProps {
  section: SectionConfig;
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
  onSelectSection?: (sectionId: string) => void;
  isSelectedInEditor?: boolean;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
  onSelectSection,
  isSelectedInEditor = false,
}) => {
  // Legacy google_maps sections are now presented as the separate Misa location.
  if (!section.enabled) return null;

  const [copiedBank, setCopiedBank] = useState(false);
  const [isTabOpen, setIsTabOpen] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoConfig | null>(null);

  const handleCopyClabe = (clabe: string) => {
    navigator.clipboard.writeText(clabe);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const getFontFamilyClass = (f?: FontFamilyType) => {
    switch (f) {
      case 'cormorant':
        return 'font-cormorant';
      case 'playfair':
        return 'font-playfair';
      case 'cinzel':
        return 'font-cinzel';
      case 'cinzel_dec':
        return 'font-cinzel-dec';
      case 'bodoni':
        return 'font-bodoni';
      case 'prata':
        return 'font-prata';
      case 'marcellus':
        return 'font-marcellus';
      case 'script':
        return 'font-script';
      case 'brush':
        return 'font-brush';
      case 'pinyon':
        return 'font-pinyon';
      case 'parisienne':
        return 'font-parisienne';
      case 'allura':
        return 'font-allura';
      case 'fredoka':
        return 'font-fredoka';
      case 'comfortaa':
        return 'font-comfortaa';
      case 'outfit':
        return 'font-outfit';
      case 'urbanist':
        return 'font-urbanist';
      case 'montserrat':
        return 'font-montserrat';
      case 'anton': return 'font-anton';
      case 'archivo_black': return 'font-archivo-black';
      case 'barlow_condensed': return 'font-barlow-condensed';
      case 'bebas_neue': return 'font-bebas-neue';
      case 'black_ops_one': return 'font-black-ops-one';
      case 'bungee': return 'font-bungee';
      case 'changa_one': return 'font-changa-one';
      case 'exo_2': return 'font-exo-2';
      case 'fjalla_one': return 'font-fjalla-one';
      case 'league_spartan': return 'font-league-spartan';
      case 'lexend': return 'font-lexend';
      case 'manrope': return 'font-manrope';
      case 'oswald': return 'font-oswald';
      case 'raleway': return 'font-raleway';
      case 'roboto_condensed': return 'font-roboto-condensed';
      case 'rubik': return 'font-rubik';
      case 'sora': return 'font-sora';
      case 'teko': return 'font-teko';
      case 'work_sans': return 'font-work-sans';
      case 'archivo': return 'font-archivo';
      case 'sans':
      default:
        return 'font-sans-clean';
    }
  };

  const presentationMode = section.presentationMode || 'card';
  const isPremiumInvitation = invitation.templateId.startsWith('premium-');
  const cardStyle = section.background.cardStyle || {};
  // isPlainMode: strictly NO white cards, NO borders, NO box enclosures
  const isPlainMode = presentationMode === 'plain' || cardStyle.transparentBg === true;

  // Independent Typography resolution
  const titleTypo = section.titleTypography || section.typography || {};
  const subtitleTypo = section.subtitleTypography || section.typography || {};
  const contentTypo = section.contentTypography || section.typography || {};

  // Positioning & Alignment resolution
  const verticalAlign = section.verticalAlign || 'center';
  const horizontalAlign = section.horizontalAlign || 'center';
  const photoPosition = section.photoPosition || 'top';
  const offsetX = section.offsetX || 0;
  const offsetY = section.offsetY || 0;

  // Render authentic photo frames inspired by the ZIP
  const renderStyledPhoto = (photo: PhotoConfig) => {
    const s = photo.shape;

    // 1. Degradado suave inferior que se funde con el fondo (i2.jpg, i33.jpg)
    if (s === 'fade_bottom_gradient') {
      return (
        <div className="relative max-w-[280px] w-full mx-auto my-3 overflow-hidden">
          <div
            className="w-full aspect-[3/4] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
            }}
          >
            <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    }

    // 2. Corazón tallado con rosas azules y cinta de raso (i2.png)
    if (s === 'heart_ornamental_roses') {
      return (
        <div className="relative max-w-[280px] w-full mx-auto my-3 flex items-center justify-center">
          <div className="relative w-52 h-52 rounded-full p-2 bg-gradient-to-tr from-[#0F3A5D] via-[#3182CE] to-[#0F3A5D] shadow-2xl flex items-center justify-center">
            <div className="absolute -top-3.5 z-20 flex gap-1 text-sm filter drop-shadow-md">
              <span>🌹</span>
              <span className="text-base -mt-1">💙</span>
              <span>🌹</span>
            </div>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#DFC48B] bg-slate-900 shadow-inner">
              <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2.5 z-20 px-4 py-1 rounded-full bg-[#0F3A5D] border border-[#DFC48B] text-[#DFC48B] text-[10px] uppercase font-serif tracking-widest shadow-md">
              Mis XV Años
            </div>
          </div>
        </div>
      );
    }

    // 3. Arco con guirnalda de flores pastel abajo (i2.jpg)
    if (s === 'arch_with_bottom_roses') {
      return (
        <div className="relative max-w-[260px] w-full mx-auto my-3 flex flex-col items-center">
          <div className="w-full aspect-[3/4] rounded-t-[140px] rounded-b-2xl overflow-hidden border-2 border-[#DFC48B]/60 shadow-xl bg-stone-100">
            <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1 -mt-4 z-20 bg-white/95 backdrop-blur-xs px-4 py-1 rounded-full border border-[#DFC48B] shadow-md text-xs">
            <span>🌸</span>
            <span className="font-serif italic text-stone-700 text-[11px]">Nuestra Celebración</span>
            <span>🌸</span>
          </div>
        </div>
      );
    }

    // 4. Corona circular de laurel de oro con eucalipto (i40.jpg & i54.jpg)
    if (s === 'gold_wreath_circular') {
      return (
        <div className="relative max-w-[260px] w-full mx-auto my-3 flex items-center justify-center">
          <div className="w-52 h-52 rounded-full p-2.5 bg-gradient-to-tr from-[#9C7A3C] via-[#DFC48B] to-[#9C7A3C] shadow-xl flex items-center justify-center relative">
            <div className="absolute -inset-1.5 border-2 border-dashed border-[#DFC48B] rounded-full pointer-events-none opacity-60" />
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-stone-100">
              <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    // 5. Silueta de piedra orgánica de playa (i33.jpg)
    if (s === 'organic_pebble') {
      return (
        <div className="relative max-w-[260px] w-full mx-auto my-3 flex items-center justify-center">
          <div
            className="w-full aspect-square overflow-hidden shadow-xl border-2 border-white/80 bg-stone-100"
            style={{
              borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
            }}
          >
            <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    }

    // 6. Marco capitonado con corona dorada (i3.jpg)
    if (s === 'quilted_gold_crest') {
      return (
        <div className="relative max-w-[260px] w-full mx-auto my-3 flex flex-col items-center">
          <div className="absolute -top-3 z-20 text-2xl filter drop-shadow-[0_0_8px_#DFC48B]">
            👑
          </div>
          <div className="w-full aspect-square rounded-3xl p-2 bg-[#FFF0F5] border-3 border-[#DFC48B] shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-rose-200">
              <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    // 7. Marco octagonal de oro fino con doble filete (i40.jpg)
    if (s === 'gold_geometric_box') {
      return (
        <div className="relative max-w-[260px] w-full mx-auto my-3 p-2 border-2 border-[#DFC48B] bg-white shadow-xl">
          <div className="w-full aspect-[3/4] border border-[#DFC48B]/60 p-1">
            <img src={photo.url} alt={photo.alt || 'Foto'} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    }

    // Standard Shapes
    const getStandardShapeClass = () => {
      switch (s) {
        case 'arch':
          return 'rounded-t-[140px] rounded-b-2xl overflow-hidden aspect-[3/4]';
        case 'oval':
          return 'rounded-[50%] overflow-hidden aspect-[3/4]';
        case 'circle':
          return 'rounded-full overflow-hidden aspect-square';
        case 'heart':
          return 'rounded-3xl overflow-hidden aspect-square border-4 border-rose-200';
        case 'polaroid':
          return 'bg-white p-3 pb-8 shadow-md border border-stone-200 aspect-[4/5]';
        case 'gold_frame':
          return 'rounded-xl p-2.5 bg-gradient-to-tr from-[#9C7A3C] via-[#DFC48B] to-[#9C7A3C] shadow-md aspect-[3/4]';
        case 'floral_frame':
          return 'rounded-3xl p-2.5 bg-[#FAF6EE] border-2 border-dashed border-[#C7BDDF] shadow-md aspect-[3/4]';
        case 'diamond':
          return 'rounded-2xl rotate-45 scale-75 overflow-hidden aspect-square border-2 border-[#DFC48B]';
        case 'paper_edge':
          return 'rounded-xl border border-stone-300 shadow-inner p-1.5 bg-[#FAF8F5] aspect-[3/4]';
        default:
          return 'rounded-xl overflow-hidden aspect-[3/4]';
      }
    };

    return (
      <div className={`max-w-[260px] w-full mx-auto my-3 shadow-lg ${getStandardShapeClass()}`}>
        <img src={photo.url} alt={photo.alt || 'Fotografía'} className="w-full h-full object-cover" />
      </div>
    );
  };

  const photoElement = section.photo && (
    <div
      onClick={(e) => {
        if (isEditor) {
          e.stopPropagation();
          onSelectPhoto?.(section.photo);
        }
      }}
      className={isEditor ? 'hover:scale-[1.01] cursor-pointer transition-transform' : ''}
    >
      {renderStyledPhoto(section.photo)}
    </div>
  );

  const renderSectionInnerContent = () => {
    return (
      <div className="w-full max-w-full">
        {/* Photo on Top */}
        {photoPosition === 'top' && photoElement}

        {/* SPECIFIC: CUENTA REGRESIVA EN POSICIÓN SUPERIOR */}
        {section.type === 'cuenta_regresiva' && section.countdownPosition === 'top' && (
          <SectionCountdown
            eventDate={invitation.eventDate}
            eventTime={invitation.eventTime}
            primaryColor={invitation.primaryColor}
            isPlainMode={isPlainMode}
            styleType={section.countdownStyle || (isPlainMode ? 'clean_numbers' : 'boxed')}
            position="top"
          />
        )}

        {/* Subtítulo con sus CONTROLES INDEPENDIENTES */}
        {section.subtitle && (
          <div
            className={`block uppercase font-semibold mb-2 lav-text-enter lav-enter-${subtitleTypo.textEntrance || 'none'} ${getFontFamilyClass(subtitleTypo.fontFamily)}`}
            style={{
              color: subtitleTypo.color || '#9C7A3C',
              fontSize: subtitleTypo.fontSize ? `${subtitleTypo.fontSize}px` : '12px',
              textAlign: subtitleTypo.alignment || 'center',
              letterSpacing: subtitleTypo.letterSpacing ? `${subtitleTypo.letterSpacing}px` : '2px',
              fontWeight: subtitleTypo.fontWeight || '600',
              fontStyle: subtitleTypo.isItalic ? 'italic' : 'normal',
              textTransform: subtitleTypo.isUppercase ? 'uppercase' : 'none',
              lineHeight: subtitleTypo.lineHeight || undefined,
              textShadow: subtitleTypo.textShadow ? '0 2px 5px rgba(0,0,0,0.45)' : 'none',
              WebkitTextStroke: subtitleTypo.textOutline ? `${subtitleTypo.textOutlineWidth || 1}px ${subtitleTypo.textOutlineColor || '#FFFFFF'}` : '0 transparent',
            }}
          >
            {section.subtitle}
          </div>
        )}

        {/* Título Principal con sus CONTROLES INDEPENDIENTES */}
        {section.title && (
          <h2
            className={`font-serif tracking-tight leading-snug mb-3 break-words lav-text-enter lav-enter-${titleTypo.textEntrance || 'none'} ${getFontFamilyClass(titleTypo.fontFamily)}`}
            style={{
              color: titleTypo.color || '#1A202C',
              fontSize: titleTypo.fontSize ? `${titleTypo.fontSize}px` : '32px',
              letterSpacing: titleTypo.letterSpacing ? `${titleTypo.letterSpacing}px` : '1px',
              textAlign: titleTypo.alignment || 'center',
              fontWeight: titleTypo.fontWeight || 'bold',
              fontStyle: titleTypo.isItalic ? 'italic' : 'normal',
              textTransform: titleTypo.isUppercase ? 'uppercase' : 'none',
              lineHeight: titleTypo.lineHeight || undefined,
              textShadow: titleTypo.textShadow ? '0 2px 5px rgba(0,0,0,0.45)' : 'none',
              WebkitTextStroke: titleTypo.textOutline ? `${titleTypo.textOutlineWidth || 1}px ${titleTypo.textOutlineColor || '#FFFFFF'}` : '0 transparent',
            }}
          >
            {section.type === 'google_maps' ? 'Misa' : section.title}
          </h2>
        )}

        {/* Photo in Center */}
        {photoPosition === 'center' && photoElement}

        {/* SPECIFIC: CUENTA REGRESIVA EN POSICIÓN CENTRO */}
        {section.type === 'cuenta_regresiva' && (section.countdownPosition === 'center' || !section.countdownPosition) && (
          <SectionCountdown
            eventDate={invitation.eventDate}
            eventTime={invitation.eventTime}
            primaryColor={invitation.primaryColor}
            isPlainMode={isPlainMode}
            styleType={section.countdownStyle || (isPlainMode ? 'clean_numbers' : 'boxed')}
            position="center"
          />
        )}

        {/* Mensaje / Contenido de Texto con sus CONTROLES INDEPENDIENTES */}
        {section.content && (
          <p
            className={`leading-relaxed font-light mx-auto max-w-md mb-4 break-words lav-text-enter lav-enter-${contentTypo.textEntrance || 'none'} ${getFontFamilyClass(contentTypo.fontFamily)}`}
            style={{
              color: contentTypo.color || '#4A5568',
              fontSize: contentTypo.fontSize ? `${contentTypo.fontSize}px` : '14px',
              textAlign: contentTypo.alignment || 'center',
              fontWeight: contentTypo.fontWeight || 'normal',
              fontStyle: contentTypo.isItalic ? 'italic' : 'normal',
              textTransform: contentTypo.isUppercase ? 'uppercase' : 'none',
              lineHeight: contentTypo.lineHeight || undefined,
              textShadow: contentTypo.textShadow ? '0 2px 5px rgba(0,0,0,0.45)' : 'none',
              WebkitTextStroke: contentTypo.textOutline ? `${contentTypo.textOutlineWidth || 1}px ${contentTypo.textOutlineColor || '#FFFFFF'}` : '0 transparent',
            }}
          >
            {section.content}
          </p>
        )}

        {/* Photo on Bottom */}
        {photoPosition === 'bottom' && photoElement}

        {/* SPECIFIC: CUENTA REGRESIVA EN POSICIÓN INFERIOR */}
        {section.type === 'cuenta_regresiva' && section.countdownPosition === 'bottom' && (
          <SectionCountdown
            eventDate={invitation.eventDate}
            eventTime={invitation.eventTime}
            primaryColor={invitation.primaryColor}
            isPlainMode={isPlainMode}
            styleType={section.countdownStyle || (isPlainMode ? 'clean_numbers' : 'boxed')}
            position="bottom"
          />
        )}

        {/* SPECIFIC: NUESTRA HISTORIA (Cronología SIN RECUADROS en modo Solo Texto) */}
        {section.type === 'historia' && section.storyMilestones && (
          <div className="mt-4 space-y-3 max-w-md mx-auto text-left">
            {section.storyMilestones.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex items-start gap-4 p-3 transition-all ${
                  isPlainMode
                    ? 'border-b border-stone-300/40 pb-2.5 bg-transparent'
                    : 'rounded-2xl bg-white/90 border border-[#E8DEC8] shadow-xs'
                }`}
              >
                <div className="w-14 text-center shrink-0">
                  <span className="text-xs font-serif font-bold text-[#9C7A3C] block">{item.yearOrDate}</span>
                </div>
                <div className="border-l border-stone-300 pl-3 flex-1">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SPECIFIC: ITINERARIO (SIN RECUADROS en modo Solo Texto) */}
        {section.type === 'itinerario' && section.itinerary && (
          <div className="mt-4 space-y-2.5 max-w-md mx-auto text-left">
            {section.itinerary.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex items-start gap-4 p-2.5 transition-all ${
                  isPlainMode
                    ? 'border-b border-stone-300/40 pb-2 bg-transparent'
                    : 'rounded-2xl bg-white/90 border border-[#E8DEC8] shadow-xs'
                }`}
              >
                <div className="w-14 text-center shrink-0">
                  <span className="text-xs font-serif font-bold text-[#9C7A3C]">{item.time}</span>
                </div>
                <div className="border-l border-stone-300 pl-3 flex-1">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-800">{item.title}</h4>
                  {item.description && (
                    <p className="text-[11px] text-stone-600 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SPECIFIC: VESTIMENTA (SIN RECUADROS y SIN paleta forzada) */}
        {section.type === 'vestimenta' && section.dressCode && (
          <div
            className={`mt-3 max-w-sm mx-auto text-center ${
              isPlainMode
                ? 'bg-transparent p-1'
                : 'p-4 rounded-2xl bg-white/90 border border-[#E8DEC8]'
            }`}
          >
            <Shirt className="w-5 h-5 text-[#9C7A3C] mx-auto mb-1" />
            <div className="text-sm font-serif font-bold text-slate-800">
              {section.dressCode.style}
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">{section.dressCode.description}</p>
          </div>
        )}

        {/* SPECIFIC: GALERÍA DE FOTOS MULTI-DISEÑO */}
        {section.type === 'galeria' && (
          <div className="mt-4 max-w-xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {(section.galleryConfig?.photos || invitation.gallery || []).map((img, i) => (
                <div
                  key={img.id || i}
                  onClick={() => setLightboxPhoto(img)}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-sm border border-stone-200 hover:shadow-md transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.title || 'Foto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  {img.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                      <span className="text-[11px] text-white font-medium truncate block">{img.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPECIFIC: UBICACIÓN Y MAPS UNIFICADO (Sin duplicar sección) */}
        {(section.type === 'ubicacion' || section.type === 'google_maps') && (
          <div className="mt-4 space-y-2.5">
            {section.location?.venueName && (
              <p className="text-xs text-stone-600 font-medium">{section.location.venueName}</p>
            )}
            <CustomButtonRenderer
              config={{
                buttonStyleId: 'btn-1',
                label: section.type === 'google_maps' ? 'Abrir ubicación de la misa en Google Maps' : 'Abrir Ubicación en Google Maps',
                icon: 'MapPin',
                action: 'location',
                ...section.customButton,
              }}
              onClick={() => {
                const url =
                  section.location?.googleMapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    section.location?.address || invitation.eventLocation
                  )}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            />
          </div>
        )}

        {/* SPECIFIC: REGALOS (SIN RECUADROS en modo Solo Texto) */}
        {section.type === 'regalos' && section.gifts && (
          <div className="mt-4 space-y-2 max-w-sm mx-auto">
            {section.gifts.liverpoolCode && (
              <div
                className={`p-3 flex items-center justify-between ${
                  isPlainMode
                    ? 'border-b border-stone-200 bg-transparent'
                    : 'rounded-2xl bg-white/90 border border-[#E8DEC8]'
                }`}
              >
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">Liverpool</span>
                  <div className="text-xs font-semibold text-slate-800">
                    Evento: {section.gifts.liverpoolCode}
                  </div>
                </div>
                <a
                  href="https://www.liverpool.com.mx"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[#9C7A3C] hover:bg-stone-50 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            {section.gifts.amazonWishlist && (
              <div
                className={`p-3 flex items-center justify-between ${
                  isPlainMode
                    ? 'border-b border-stone-200 bg-transparent'
                    : 'rounded-2xl bg-white/90 border border-[#E8DEC8]'
                }`}
              >
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">Amazon México</span>
                  <div className="text-xs font-semibold text-slate-800">Mesa de Regalos Online</div>
                </div>
                <a
                  href={section.gifts.amazonWishlist}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[#9C7A3C] hover:bg-stone-50 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* SPECIFIC: DATOS BANCARIOS (SIN RECUADROS en modo Solo Texto) */}
        {section.type === 'datos_bancarios' && section.bank && (
          <div
            className={`mt-4 max-w-sm mx-auto text-left ${
              isPlainMode
                ? 'bg-transparent p-1'
                : 'p-4 rounded-2xl bg-white/95 border border-[#E8DEC8] shadow-xs'
            }`}
          >
            <div className="text-xs text-stone-500 uppercase tracking-wider mb-1.5 font-medium">
              {section.bank.bankName}
            </div>
            <div className="text-xs text-slate-700 mb-1">
              <span className="text-stone-400">Beneficiario: </span>
              <span className="font-semibold">{section.bank.beneficiary}</span>
            </div>
            <div className="text-xs text-slate-700 mb-2">
              <span className="text-stone-400">Cuenta: </span>
              <span className="font-mono">{section.bank.accountNumber}</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50/80 border border-stone-200 flex items-center justify-between mt-2">
              <div className="truncate pr-2">
                <span className="text-[10px] text-stone-400 block">CLABE Interbancaria</span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {section.bank.clabe}
                </span>
              </div>
              <button
                onClick={() => handleCopyClabe(section.bank?.clabe || '')}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copiar CLABE"
              >
                {copiedBank ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedBank && (
              <div className="text-[11px] text-emerald-600 text-center mt-1">¡CLABE copiada al portapapeles!</div>
            )}
          </div>
        )}

        {/* SPECIFIC: RSVP BUTTON */}
        {section.type === 'rsvp' && (
          <div className="mt-5">
            <CustomButtonRenderer
              config={section.customButton || {
                buttonStyleId: 'btn-1',
                label: 'Confirmar Mi Asistencia',
                action: 'rsvp',
              }}
              onClick={onOpenRSVP}
            />
            <p className="text-[11px] text-stone-500 mt-2 font-light">
              Fecha límite:{' '}
              <strong className="text-slate-700 font-normal">
                {invitation.rsvpSettings?.deadlineDate || 'Pronto'}
              </strong>
            </p>
          </div>
        )}
      </div>
    );
  };

  // Full-screen Viewport presence: ensures background covers entire screen and doesn't shrink with font size
  const isFullScreen = section.isFullScreen !== false;

  const verticalJustifyClass =
    verticalAlign === 'top'
      ? 'justify-start'
      : verticalAlign === 'bottom'
      ? 'justify-end'
      : 'justify-center';

  const horizontalAlignClass =
    horizontalAlign === 'left'
      ? 'items-start text-left'
      : horizontalAlign === 'right'
      ? 'items-end text-right'
      : 'items-center text-center';

  return (
    <div
      onClick={() => isEditor && onSelectSection?.(section.id)}
      className={`relative transition-all duration-200 w-full overflow-hidden ${
        isFullScreen ? 'min-h-screen' : 'min-h-[500px]'
      } flex flex-col ${verticalJustifyClass} ${horizontalAlignClass} ${
        isEditor
          ? `cursor-pointer hover:ring-2 hover:ring-[#DFC48B]/60 ${
              isSelectedInEditor ? 'ring-2 ring-[#9C7A3C]' : ''
            }`
          : ''
      }`}
    >
      <BackgroundRenderer
        config={section.background}
        sectionId={section.id}
        className={`w-full min-h-screen flex flex-col ${verticalJustifyClass} ${horizontalAlignClass} py-12 md:py-20 px-4 md:px-8 ${isPremiumInvitation ? 'premium-background-canvas' : ''}`}
      >
        {section.visualEffect && section.visualEffect !== 'none' && (
          <div aria-hidden="true" className={`lav-visual-effect lav-effect-${section.visualEffect}`}>
            {section.visualEffect === 'twinkle' && Array.from({ length: 14 }, (_, i) => (
              <span key={i} className={`lav-twinkle lav-twinkle-${i % 7}`} />
            ))}
            {section.visualEffect === 'gold-dust' && Array.from({ length: 18 }, (_, i) => (
              <span key={i} className={`lav-dust lav-dust-${i % 6}`} />
            ))}
            {section.visualEffect === 'bokeh' && Array.from({ length: 9 }, (_, i) => (
              <span key={i} className={`lav-bokeh lav-bokeh-${i % 5}`} />
            ))}
            {section.visualEffect === 'petals' && Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`lav-petal lav-petal-${i % 5}`}>✿</span>
            ))}
          </div>
        )}
        <div
          className="relative z-10 max-w-xl w-full transition-transform duration-150"
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            alignSelf: horizontalAlign === 'left' ? 'flex-start' : horizontalAlign === 'right' ? 'flex-end' : 'center',
          }}
        >
          {/* 1. Modalidad Solo Texto (Plain): 100% SIN RECUADRO, SIN CAJAS, SIN BORDES */}
          {isPlainMode ? (
            <div className="py-2 px-1 max-w-full">
              {renderSectionInnerContent()}
            </div>
          ) : presentationMode === 'card' ? (
            /* 2. Modalidad Recuadro: Con tarjeta contenedora estilizada */
            <div
              className={`p-6 md:p-8 max-w-full transition-all ${isPremiumInvitation ? 'premium-section-card' : ''} ${
                cardStyle.hasShadow !== false ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: cardStyle.bgColor || 'rgba(255, 255, 255, 0.92)',
                borderRadius: `${cardStyle.borderRadius !== undefined ? cardStyle.borderRadius : 24}px`,
                borderWidth: `${cardStyle.borderWidth !== undefined ? cardStyle.borderWidth : 1}px`,
                borderColor: cardStyle.borderColor || '#E8DEC8',
                backdropFilter: cardStyle.backdropBlur ? `blur(${cardStyle.backdropBlur}px)` : 'blur(4px)',
              }}
            >
              {renderSectionInnerContent()}
            </div>
          ) : (
            /* 3. Modalidad Pestaña: Acordeón interactivo */
            <div className={`rounded-2xl bg-white/95 border border-[#E8DEC8] shadow-xs overflow-hidden ${isPremiumInvitation ? 'premium-section-tab' : ''}`}>
              <button
                type="button"
                onClick={() => setIsTabOpen(!isTabOpen)}
                className={`w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5EFE4] transition-colors text-left cursor-pointer ${isPremiumInvitation ? 'premium-section-tab-heading' : ''}`}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9C7A3C] font-semibold block">
                    {section.subtitle || 'Apartado'}
                  </span>
                  <span className="text-sm font-serif font-bold text-slate-800">{section.type === 'google_maps' ? 'Misa' : section.title}</span>
                </div>
                <div className="p-1 rounded-full bg-white border border-stone-200 text-stone-600">
                  {isTabOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isTabOpen && (
                <div className={`p-6 border-t border-[#E8DEC8] animate-in fade-in duration-200 ${isPremiumInvitation ? 'premium-section-tab-content' : ''}`}>
                  {renderSectionInnerContent()}
                </div>
              )}
            </div>
          )}
        </div>
      </BackgroundRenderer>

      {/* Lightbox for Gallery Photos */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 p-1.5 text-white bg-black/50 hover:bg-black/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title || 'Foto'}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            {lightboxPhoto.title && (
              <div className="p-3 bg-black/90 text-white text-xs text-center">
                {lightboxPhoto.title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
