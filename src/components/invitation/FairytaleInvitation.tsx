import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { CustomButtonRenderer } from '../buttons/CustomButtonRenderer';
import { ambientMusic } from '../../audio/ambientMusic';
import {
  Sparkles,
  Crown,
  Heart,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Music,
  Check,
} from 'lucide-react';

interface FairytaleInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
  onSelectSection?: (sectionId: string) => void;
  selectedSectionId?: string;
}

export const FairytaleInvitation: React.FC<FairytaleInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
  onSelectSection,
  selectedSectionId,
}) => {
  const [isOpen, setIsOpen] = useState(isEditor);
  const [isOpening, setIsOpening] = useState(false);

  const coverSection = invitation.sections.find((s) => s.type === 'portada') || invitation.sections[0];
  const fairytaleData = coverSection?.fairytaleData || {
    princessName: 'Isabella',
    age: 5,
    castleTitle: 'Castillo del Lago Encantado',
    enchantedStory: 'En un reino muy lejano, junto a un lago donde florecen los nenúfares mágicos, una hermosa princesa y su alegre sapito te esperan para celebrar un cumpleaños de ensueño.',
    showFireflies: true,
    frogQuote: '“¡Croac! Prometo no convertir el pastel en moscas si vienes a festejar con nosotros.”',
  };

  const otherSections = invitation.sections.filter((s) => s.id !== coverSection?.id && s.enabled);

  const handleOpenBook = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      if (invitation.audioTrack?.autoplayAfterOpen) {
        ambientMusic.play(invitation.audioTrack.synthStyle || 'fairytale_lullaby');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#103B2B] via-[#1E5E4B] to-[#2B7A63] text-stone-100 relative overflow-hidden flex flex-col items-center">
      {/* Floating Animated Fireflies (Luciérnagas) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_2px_#FCD34D] animate-firefly"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 27) % 90}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {!isOpen ? (
        /* Fairytale Storybook Cover Presentation */
        <div className="flex-1 flex flex-col items-center justify-center p-4 z-20 w-full max-w-md my-auto">
          <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-[#DFC48B]/60 text-[#DFC48B] text-xs font-serif tracking-widest uppercase">
              <Crown className="w-3.5 h-3.5" />
              <span>Cuento Real Ilustrado</span>
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-[#F3E5AB] font-bold mt-2 drop-shadow-md">
              El Sapo y la Princesa
            </h1>
          </div>

          {/* 3D Storybook Cover Card */}
          <div
            onClick={handleOpenBook}
            className={`w-full aspect-[3/4] max-w-[340px] rounded-3xl bg-gradient-to-b from-[#154636] to-[#0A261C] p-4 border-4 border-[#DFC48B] shadow-2xl relative cursor-pointer group transition-all duration-500 hover:scale-[1.03] ${
              isOpening ? 'scale-95 opacity-80 rotate-[-5deg]' : ''
            }`}
          >
            {/* Golden Filigree Corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#DFC48B]" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#DFC48B]" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#DFC48B]" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#DFC48B]" />

            <div className="w-full h-full rounded-2xl border border-[#DFC48B]/40 p-4 flex flex-col items-center justify-between text-center relative overflow-hidden bg-radial from-[#1F6E57]/40 to-transparent">
              {/* Castle silhouette illustration */}
              <div className="mt-2">
                <Crown className="w-10 h-10 text-[#DFC48B] mx-auto filter drop-shadow-[0_0_8px_#DFC48B]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 block mt-1">
                  Crónicas del Reino Encantado
                </span>
              </div>

              {/* Princess & Charming Frog Vector Scene */}
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-[#2E8B6E]/40 to-[#0F382A]/80 border-2 border-[#DFC48B]/60 p-2 flex items-center justify-center shadow-inner overflow-hidden my-auto">
                {coverSection.photo?.url ? (
                  <img
                    src={coverSection.photo.url}
                    alt="Princesa y el Sapo"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl block animate-bounce">🐸👑</span>
                    <span className="text-xs text-[#DFC48B] font-serif font-semibold mt-1 block">
                      El Sapo & La Princesa
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Honoree */}
              <div>
                <h2 className="text-xl font-serif font-bold text-[#FDF8E2] tracking-wide">
                  {invitation.names}
                </h2>
                <p className="text-xs text-emerald-300 font-sans mt-0.5">
                  Celebrando sus {fairytaleData.age} años de magia
                </p>
              </div>

              {/* Wax Seal to Open */}
              <button
                type="button"
                className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#DFC48B] to-[#C5A059] text-stone-900 font-serif font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
              >
                <BookOpen className="w-4 h-4" />
                <span>Abrir el Cuento Real</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Opened Fairy Tale Invitation Experience */
        <div className="w-full max-w-2xl bg-[#FAF8F2] text-slate-800 shadow-2xl border-x-4 border-[#DFC48B] z-20 animate-in fade-in duration-700">
          {/* Fairy Tale Header Scene */}
          <div className="relative bg-gradient-to-b from-[#184837] via-[#22634D] to-[#FAF8F2] pt-12 pb-16 px-6 text-center text-white overflow-hidden">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/70 text-[#DFC48B] border border-[#DFC48B]/40 text-xs font-serif tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capítulo Único · Festejo Real</span>
            </span>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#FDF8E2] tracking-tight leading-tight">
              {invitation.names}
            </h1>
            <p className="text-sm font-serif italic text-emerald-200 mt-2">
              Cumpleaños Mágico N° {fairytaleData.age}
            </p>

            {/* Enchanted Story Card */}
            <div className="mt-8 p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-[#DFC48B] shadow-xl text-slate-800 max-w-lg mx-auto text-left relative">
              <div className="flex items-center gap-3 mb-3 border-b border-stone-200 pb-2">
                <span className="text-2xl">👑</span>
                <div>
                  <h4 className="text-sm font-serif font-bold text-emerald-900">
                    {fairytaleData.castleTitle}
                  </h4>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                    Historia de Fantasía
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-light">
                {fairytaleData.enchantedStory}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🐸</span>
                <p className="text-xs text-emerald-950 italic">
                  {fairytaleData.frogQuote}
                </p>
              </div>
            </div>

            {/* Quick RSVP CTA button */}
            <div className="mt-6">
              <CustomButtonRenderer
                config={{
                  buttonStyleId: 'btn-23',
                  label: 'Confirmar Asistencia al Reino',
                  action: 'rsvp',
                }}
                onClick={onOpenRSVP}
              />
            </div>
          </div>

          {/* Modular Sections Rendered with Fairy Tale Ambiance */}
          <div className="divide-y divide-[#EBE4DA]">
            {otherSections.map((sec) => (
              <SectionBlock
                key={sec.id}
                section={sec}
                invitation={invitation}
                onOpenRSVP={onOpenRSVP}
                onSelectPhoto={onSelectPhoto}
                isEditor={isEditor}
                onSelectSection={onSelectSection}
                isSelectedInEditor={sec.id === selectedSectionId}
              />
            ))}
          </div>

          {/* Fairy Tale Closing Royal Seal */}
          <div className="p-8 text-center bg-[#FAF5EB] border-t border-[#DFC48B]">
            <Crown className="w-8 h-8 text-[#9C7A3C] mx-auto mb-2" />
            <h4 className="text-lg font-serif font-bold text-slate-800">
              Y vivieron felices para siempre...
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              ¡Gracias por acompañar a nuestra pequeña princesa en este día inolvidable!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
