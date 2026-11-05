import React, { useRef, useState } from 'react';
import { BackgroundConfig, BackgroundTexture, InvitationMotif, MotifTheme } from '../../types/invitation';
import { useMotifEditor } from './MotifEditorContext';

interface BackgroundRendererProps {
  config: BackgroundConfig;
  className?: string;
  children: React.ReactNode;
  sectionId?: string;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  config,
  className = '',
  children,
  sectionId = '',
}) => {
  const { isEditor, updateMotif: updateMotifFromContext, selectMotif } = useMotifEditor();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; pointerId: number; anchorX: number; anchorY: number; x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ id: string; x: number; y: number } | null>(null);
  const updateMotif = (id: string, fields: Partial<InvitationMotif>) => updateMotifFromContext?.(sectionId, id, fields);
  const handleMotifPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface || drag.pointerId !== event.pointerId) return;
    const bounds = surface.getBoundingClientRect();
    const motif = config.customMotifs?.find((item) => item.id === drag.id);
    if (!motif) return;
    drag.x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100 + drag.anchorX));
    drag.y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100 + drag.anchorY));
    setDragPosition({ id: drag.id, x: drag.x, y: drag.y });
  };
  // 35+ Texture style definitions with SVG/CSS patterns
  const getTextureStyle = (texture?: BackgroundTexture): React.CSSProperties => {
    switch (texture) {
      // 1. Texturas del ZIP
      case 'quilted_pink_pearl':
        return {
          backgroundColor: '#FFF0F5',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #F687B3 1px, transparent 1.5px),
            linear-gradient(45deg, rgba(246, 135, 179, 0.15) 25%, transparent 25%, transparent 75%, rgba(246, 135, 179, 0.15) 75%),
            linear-gradient(-45deg, rgba(246, 135, 179, 0.15) 25%, transparent 25%, transparent 75%, rgba(246, 135, 179, 0.15) 75%)
          `,
          backgroundSize: '28px 28px',
        };
      case 'embossed_floral_white':
        return {
          backgroundColor: '#FAF8F5',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(200,190,180,0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(200,190,180,0.12) 0%, transparent 40%),
            linear-gradient(45deg, rgba(223,196,139,0.06) 25%, transparent 25%)
          `,
          backgroundSize: '40px 40px',
        };
      case 'blue_roses_watercolor':
        return {
          backgroundColor: '#F0F4FA',
          backgroundImage: `
            radial-gradient(circle at 10% 10%, rgba(49, 130, 206, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(26, 54, 93, 0.15) 0%, transparent 50%)
          `,
        };
      case 'mermaid_scales_pastel':
        return {
          backgroundColor: '#E0F2F1',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(77, 208, 225, 0.25) 35%, transparent 36%),
            radial-gradient(circle at 0% 50%, rgba(240, 98, 146, 0.2) 35%, transparent 36%),
            radial-gradient(circle at 100% 50%, rgba(186, 104, 200, 0.2) 35%, transparent 36%)
          `,
          backgroundSize: '36px 36px',
        };
      case 'pampas_dry_grass':
        return {
          backgroundColor: '#FAF7F2',
          backgroundImage: `
            radial-gradient(ellipse at 15% 85%, rgba(192, 160, 128, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, rgba(192, 160, 128, 0.2) 0%, transparent 50%)
          `,
        };
      case 'gold_roses_eucalyptus':
        return {
          backgroundColor: '#FCFBF9',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(223, 196, 139, 0.22) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(74, 124, 89, 0.18) 0%, transparent 40%)
          `,
        };
      case 'ruby_gold_filigree':
        return {
          backgroundColor: '#FFF8F6',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(155, 17, 30, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 10% 90%, rgba(223, 196, 139, 0.2) 0%, transparent 40%)
          `,
        };
      case 'blue_night_floral':
        return {
          backgroundColor: '#0D1929',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(99, 179, 237, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(49, 130, 206, 0.12) 0%, transparent 50%)
          `,
        };
      case 'champagne_bokeh':
        return {
          backgroundColor: '#FAF5EE',
          backgroundImage: `
            radial-gradient(circle at 25% 30%, rgba(223, 196, 139, 0.4) 6px, transparent 12px),
            radial-gradient(circle at 75% 65%, rgba(223, 196, 139, 0.3) 10px, transparent 18px),
            radial-gradient(circle at 45% 80%, rgba(247, 214, 208, 0.35) 8px, transparent 16px)
          `,
          backgroundSize: '80px 80px',
        };
      case 'blue_velvet_ribbon':
        return {
          backgroundColor: '#EBF5FB',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(12, 59, 94, 0.12) 0%, transparent 70%)`,
        };

      // 2. Telas & Papelería
      case 'lace_wedding':
        return {
          backgroundColor: '#FAF8F5',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(223, 196, 139, 0.15) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(223, 196, 139, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        };
      case 'silk':
        return {
          background: 'linear-gradient(135deg, #FAF8F5 0%, #F3EDE3 25%, #FAF8F5 50%, #EFE7DA 75%, #FAF8F5 100%)',
        };
      case 'velvet':
        return {
          background: 'radial-gradient(circle at 30% 30%, #FDF4F6 0%, #F5E5EA 60%, #EAD6DC 100%)',
        };
      case 'marble':
        return {
          backgroundColor: '#FAF8F5',
          backgroundImage: `linear-gradient(45deg, rgba(200,190,180,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(200,190,180,0.08) 25%, transparent 25%)`,
          backgroundSize: '36px 36px',
        };
      case 'handmade_paper':
        return {
          backgroundColor: '#FAF7F0',
          backgroundImage: `radial-gradient(#D8CEBF 0.8px, transparent 0.8px)`,
          backgroundSize: '16px 16px',
        };
      case 'luxury_paper':
        return {
          background: 'linear-gradient(to bottom, #FDFBF7, #F7F3EB)',
        };
      case 'linen':
        return {
          backgroundColor: '#F7F5EE',
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px)`,
        };
      case 'damask':
        return {
          backgroundColor: '#FAF6EE',
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(197, 160, 89, 0.12) 20%, transparent 60%)`,
          backgroundSize: '48px 48px',
        };
      case 'parchment_vintage':
        return {
          backgroundColor: '#F7EED8',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(184, 134, 11, 0.08) 0%, transparent 70%)`,
        };

      // 3. Metales & Brillos
      case 'metal_gold':
        return {
          background: 'linear-gradient(135deg, rgba(250,245,235,1) 0%, rgba(223,196,139,0.35) 50%, rgba(197,160,89,0.2) 100%)',
        };
      case 'metal_silver':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(220,225,230,0.4) 50%, rgba(190,195,205,0.25) 100%)',
        };
      case 'rose_gold':
        return {
          background: 'linear-gradient(135deg, rgba(253,247,247,1) 0%, rgba(232,197,200,0.4) 50%, rgba(183,110,121,0.2) 100%)',
        };
      case 'foil_stamped':
        return {
          backgroundColor: '#FBF9F5',
          boxShadow: 'inset 0 0 40px rgba(223, 196, 139, 0.15)',
        };
      case 'glitter_gold_dust':
        return {
          backgroundColor: '#FDFBF7',
          backgroundImage: `
            radial-gradient(circle, #DFC48B 1.2px, transparent 1.2px),
            radial-gradient(circle, #D4AF37 1px, transparent 1px),
            radial-gradient(circle, #F6E05E 0.8px, transparent 0.8px)
          `,
          backgroundSize: '24px 24px, 36px 36px, 16px 16px',
          backgroundPosition: '0 0, 12px 18px, 6px 8px',
        };

      // 4. Flores & Acuarelas
      case 'floral':
      case 'floral_roses':
        return {
          backgroundColor: '#FAF6F8',
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(247, 214, 208, 0.35) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(234, 230, 248, 0.35) 0%, transparent 40%)`,
        };
      case 'floral_botanical':
        return {
          backgroundColor: '#F7FAF8',
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(182, 209, 190, 0.3) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(223, 196, 139, 0.25) 0%, transparent 40%)`,
        };
      case 'watercolor':
        return {
          background: 'radial-gradient(ellipse at top left, rgba(247,214,208,0.3) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(223,196,139,0.25) 0%, transparent 60%), radial-gradient(ellipse at center, rgba(234,230,248,0.2) 0%, transparent 70%)',
        };

      // 5. Fantasía e Infantiles
      case 'fairytale_forest':
        return {
          backgroundColor: '#F3FAF6',
          backgroundImage: `radial-gradient(circle at 15% 15%, rgba(223, 196, 139, 0.4) 2px, transparent 2px), radial-gradient(circle at 85% 85%, rgba(182, 209, 190, 0.4) 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        };
      case 'stars_clouds':
        return {
          backgroundColor: '#F6F9FD',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(249, 223, 141, 0.4) 1px, transparent 1px), radial-gradient(circle at 20% 30%, rgba(200, 225, 250, 0.3) 2px, transparent 2px)`,
          backgroundSize: '36px 36px',
        };
      case 'water_ripples':
        return {
          backgroundColor: '#F2FAF9',
          backgroundImage: `radial-gradient(circle, rgba(58, 175, 169, 0.15) 10%, transparent 20%), radial-gradient(circle, rgba(58, 175, 169, 0.1) 20%, transparent 30%)`,
          backgroundSize: '50px 50px',
        };
      case 'confetti_gold':
        return {
          backgroundColor: '#FDFBF7',
          backgroundImage: `radial-gradient(circle, #DFC48B 1.5px, transparent 1.5px), radial-gradient(circle, #F7D6D0 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        };
      case 'geometric':
        return {
          backgroundColor: '#FAF8F5',
          backgroundImage: `linear-gradient(30deg, #F0EAE1 12%, transparent 12.5%, transparent 87%, #F0EAE1 87.5%, #F0EAE1), linear-gradient(150deg, #F0EAE1 12%, transparent 12.5%, transparent 87%, #F0EAE1 87.5%, #F0EAE1)`,
          backgroundSize: '40px 70px',
        };
      default:
        return {};
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    let style: React.CSSProperties = {};

    if (config.type === 'color' && config.color) {
      style.backgroundColor = config.color;
    } else if (config.type === 'gradient' && config.gradient) {
      const g = config.gradient;
      style.background = `linear-gradient(${g.direction || 'to bottom'}, ${g.from}, ${g.via ? g.via + ',' : ''} ${g.to})`;
    } else if (config.type === 'texture') {
      style = { ...style, ...getTextureStyle(config.texture) };
    } else if (config.type === 'image' && config.imageUrl) {
      style.backgroundImage = `url(${config.imageUrl})`;
      style.backgroundSize = config.scale || 'cover';
      style.backgroundPosition = config.position || 'center';
      style.backgroundRepeat = config.scale === 'repeat' ? 'repeat' : 'no-repeat';
    }

    if (config.behavior === 'fixed') {
      style.backgroundAttachment = 'fixed';
    }

    if (config.blur && config.blur > 0) {
      style.filter = `blur(${config.blur}px)`;
    }

    return style;
  };

  // Render 25 authentic luxury motifs inspired by the ZIP
  const renderMotifDecorations = (motif?: MotifTheme) => {
    if (!motif || motif === 'none') return null;

    switch (motif) {
      // 1. XV Años: Rosas Azul Rey, Mariposas con alas de oro y chispas doradas (i1.jpg)
      case 'blue_roses_butterfly':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-3xl filter drop-shadow-[0_0_10px_#3B82F6] animate-pulse">🦋</span>
              <div className="flex gap-1.5 text-[9px] text-amber-400 font-bold mt-0.5">
                <span>✦</span>
                <span className="text-amber-200">✧</span>
                <span>✦</span>
              </div>
            </div>
            {/* Top Floral Wreath Clusters */}
            <div className="absolute top-1 left-2 flex gap-1 text-base filter drop-shadow-sm">
              <span>🌹</span><span>💙</span><span>🌿</span>
            </div>
            <div className="absolute top-1 right-2 flex gap-1 text-base filter drop-shadow-sm">
              <span>🌿</span><span>💙</span><span>🌹</span>
            </div>
            {/* Gold glitter dust */}
            <div className="absolute inset-0 bg-[radial-gradient(#DFC48B_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40" />
          </div>
        );

      // 2. XV Años: Tiara de Rubí Real y Mariposas Doradas en 3D (i23.jpg)
      case 'tiara_ruby_sparks':
      case 'ruby_crown_butterflies':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-3xl filter drop-shadow-[0_0_12px_#E53E3E]">
              👑
            </div>
            <div className="absolute top-4 left-6 text-2xl text-amber-500 filter drop-shadow-md animate-pulse">🦋</div>
            <div className="absolute top-4 right-6 text-2xl text-amber-500 filter drop-shadow-md animate-pulse" style={{ animationDelay: '1s' }}>🦋</div>
            <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-35" />
          </div>
        );

      // 3. XV Años: Corazón Tallado Azul y Cintas (i2.png)
      case 'blue_heart_ribbon':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-[#0C3B5E]/80 border border-[#DFC48B] text-[#DFC48B] text-[10px] font-serif uppercase tracking-widest shadow-md">
              <span>✦</span><span>Mis XV Años</span><span>✦</span>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
          </div>
        );

      // 4. XV Años: Espejo Mágico de Quinceañera con Chispas de Diamante
      case 'mirror_sparkle_xv':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute inset-3 border border-pink-300/40 rounded-3xl pointer-events-none" />
            <div className="absolute top-3 left-3 text-xs text-amber-400">✨</div>
            <div className="absolute top-3 right-3 text-xs text-amber-400">✨</div>
            <div className="absolute bottom-3 left-3 text-xs text-amber-400">✨</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-400">✨</div>
          </div>
        );

      // 5. XV Años: Lluvia de Mariposas en Oro Rosa y Purpurina
      case 'rose_gold_butterflies':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 left-8 text-xl opacity-80 animate-pulse">🦋</div>
            <div className="absolute top-8 right-8 text-lg opacity-80 animate-pulse" style={{ animationDelay: '1.2s' }}>🦋</div>
            <div className="absolute inset-0 bg-[radial-gradient(#B76E79_1.5px,transparent_1.5px)] [background-size:26px_26px] opacity-30" />
          </div>
        );

      // 6. XV Años: Guirnalda de Orquídeas y Cristales de Gala
      case 'orchid_crystal_gala':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-1 inset-x-0 flex justify-between px-4 text-sm opacity-90">
              <span>🌸💎</span><span>💎🌸</span>
            </div>
          </div>
        );

      // 7. Bodas: Sobre Blanco Repujado con Sello de Lacre Dorado y Anillos (b1.jpg)
      case 'wax_seal_envelope':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 left-3 w-14 h-14 border-t-2 border-l-2 border-[#DFC48B]/60" />
            <div className="absolute top-3 right-3 w-14 h-14 border-t-2 border-r-2 border-[#DFC48B]/60" />
            <div className="absolute bottom-3 left-3 w-14 h-14 border-b-2 border-l-2 border-[#DFC48B]/60" />
            <div className="absolute bottom-3 right-3 w-14 h-14 border-b-2 border-r-2 border-[#DFC48B]/60" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-base text-[#9C7A3C] opacity-80">
              💍
            </div>
          </div>
        );

      // 8. Bodas: Rosas Doradas y Eucalipto (i40.jpg)
      case 'gold_roses_eucalyptus':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#DFC48B]" />
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#DFC48B]" />
            <div className="absolute top-3 left-4 text-sm">🌿🌹</div>
            <div className="absolute bottom-3 right-4 text-sm">🌹🌿</div>
          </div>
        );

      // 9. Bodas: Pampas Grass Secas en Esquinas Opuestas (i50.jpg)
      case 'pampas_boho_minimal':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-[#C0A080]/30 to-transparent blur-xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-radial from-[#C0A080]/30 to-transparent blur-xl" />
            <div className="absolute top-2 right-3 text-lg opacity-80">🌾</div>
            <div className="absolute bottom-2 left-3 text-lg opacity-80">🌾</div>
          </div>
        );

      // 10. Bodas: Arcos de Flores Blancas Nupciales y Velas Cálidas
      case 'white_floral_arch_candles':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-1 inset-x-0 flex justify-center gap-2 text-sm opacity-80">
              <span>🕊️</span><span>🤍</span><span>🕊️</span>
            </div>
          </div>
        );

      // 11. Bodas: Constelaciones de Noche Estrellada con Polvo de Oro
      case 'starry_gold_dust':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#F6E05E_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-45" />
          </div>
        );

      // 12. Bodas: Monograma Heráldico con Laureles en Pan de Oro
      case 'heraldic_gold_monogram':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl text-[#DFC48B]">
              ⚜️
            </div>
          </div>
        );

      // 13. Infantiles: Capitonado Rosa, Corona Real y Chispas (i3.jpg)
      case 'quilted_princess_crown':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl filter drop-shadow-[0_0_8px_#DFC48B]">
              👑
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#F687B3_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-30" />
          </div>
        );

      // 14. Infantiles: Sirena y Mar Pastel (i4.jpg)
      case 'mermaid_ocean_scales':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 right-4 text-xl">🐚</div>
            <div className="absolute bottom-3 left-4 text-xl">🐠</div>
            <div className="absolute bottom-3 right-4 text-xl">🐢</div>
          </div>
        );

      // 15. Infantiles: Castillo en el Lago Encantado con Luciérnagas (El Sapo y la Princesa)
      case 'fairytale_castle_frog':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-[#DFC48B] font-serif uppercase tracking-widest bg-emerald-950/70 px-3 py-1 rounded-full border border-[#DFC48B]/50">
              <span>🐸</span><span>Reino Encantado</span><span>👑</span>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#FCD34D_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-45 animate-pulse" />
          </div>
        );

      // 16. Infantiles: Bosque Mágico con Hadas y Destellos
      case 'enchanted_fairy_mushrooms':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 left-4 text-lg">🍄</div>
            <div className="absolute top-3 right-4 text-lg">🧚‍♀️</div>
          </div>
        );

      // 17. Infantiles: Nubes Esponjosas, Luna Sonriente y Estrellas
      case 'moon_stars_clouds':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-3 left-6 text-xl">🌙</div>
            <div className="absolute top-3 right-6 text-xl">⭐</div>
          </div>
        );

      // 18. Infantiles: Globos Aerostáticos Pastel y Banderines
      case 'hot_air_balloons_pastel':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-4 text-xl">🎈</div>
            <div className="absolute top-2 right-4 text-xl">🎈</div>
          </div>
        );

      // 19. Cumpleaños: Copa con Moño Negro de Seda y Bokeh (i35.jpg)
      case 'champagne_bowtie_party':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#DFC48B_2px,transparent_2px)] [background-size:36px_36px] opacity-40 animate-pulse" />
            <div className="absolute top-3 right-4 text-xl">🥂</div>
          </div>
        );

      // 20. Cumpleaños: Explosión de Confeti Metálico y Serpentinas
      case 'metallic_confetti_streamers':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 inset-x-0 flex justify-around text-base">
              <span>🎉</span><span>✨</span><span>🎊</span><span>✨</span>
            </div>
          </div>
        );

      // 21. Cumpleaños: Esfera de Espejos Disco
      case 'disco_mirror_ball':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-[0_0_10px_#E2E8F0]">
              🪩
            </div>
          </div>
        );

      // 22. Cumpleaños: Globos de Oro y Negro (i54.jpg)
      case 'gold_black_balloons':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-1 left-2 text-xl">🎈</div>
            <div className="absolute top-1 right-2 text-xl">🎈</div>
          </div>
        );

      // 23. Cumpleaños: Luces Festivas de Verbena al Atardecer
      case 'sunset_twilight_lights':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-1 inset-x-0 flex justify-between px-6 text-xs text-amber-300 opacity-80">
              <span>💡</span><span>💡</span><span>💡</span><span>💡</span>
            </div>
          </div>
        );

      // 24. Graduaciones: Birrete con Hojas de Laurel de Oro y Diploma
      case 'cap_laurel_diploma':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-md">
              🎓
            </div>
          </div>
        );

      // 25. Especiales: Cáliz Sacro con Espigas de Trigo y Luz Divina
      case 'sacred_chalice_wheat':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl filter drop-shadow-md">
              ✝️
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={surfaceRef} className={`relative w-full h-full min-h-screen overflow-hidden transition-all duration-300 ${className}`}>
      {/* Background Surface Layer (Covers full screen 100vh) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 premium-background-surface"
        style={{
          ...getBackgroundStyle(),
          minHeight: '100%',
        }}
      />

      {/* Tint Overlay / Scrim */}
      {config.overlayOpacity > 0 && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-1"
          style={{
            backgroundColor: config.overlayColor || '#FFFFFF',
            opacity: config.overlayOpacity / 100,
          }}
        />
      )}

      {/* Decorative Motifs & Gold Sparkles Overlay (Renders ON TOP of image and background) */}
      {renderMotifDecorations(config.motifTheme)}

      {(config.customMotifs || []).map((motif) => (
        <img
          key={motif.id}
          src={motif.src}
          alt={motif.name}
          draggable={false}
          onPointerDown={(event) => {
            if (!isEditor) return;
            event.stopPropagation();
            const bounds = surfaceRef.current?.getBoundingClientRect();
            if (!bounds) return;
            selectMotif?.(sectionId, motif.id);
            dragRef.current = {
              id: motif.id,
              pointerId: event.pointerId,
              anchorX: motif.x - ((event.clientX - bounds.left) / bounds.width) * 100,
              anchorY: motif.y - ((event.clientY - bounds.top) / bounds.height) * 100,
              x: motif.x,
              y: motif.y,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={handleMotifPointerMove}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            if (drag?.pointerId === event.pointerId) {
              updateMotif(drag.id, { x: drag.x, y: drag.y });
              dragRef.current = null;
              setDragPosition(null);
            }
          }}
          onPointerCancel={() => { dragRef.current = null; setDragPosition(null); }}
          className={`absolute object-contain ${isEditor ? 'cursor-grab active:cursor-grabbing pointer-events-auto touch-none' : 'pointer-events-none'}`}
          style={{ left: `${dragPosition?.id === motif.id ? dragPosition.x : motif.x}%`, top: `${dragPosition?.id === motif.id ? dragPosition.y : motif.y}%`, width: `${motif.width}%`, opacity: motif.opacity / 100, transform: `translate(-50%, -50%) rotate(${motif.rotation}deg)`, zIndex: 30 + motif.zIndex }}
        />
      ))}

      {/* Children Content (Z-indexed above background and motifs) */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center items-center">{children}</div>
    </div>
  );
};
