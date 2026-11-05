import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { ambientMusic } from '../../audio/ambientMusic';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';

interface EnvelopeInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
  onSelectSection?: (sectionId: string) => void;
  selectedSectionId?: string;
}

export const EnvelopeInvitation: React.FC<EnvelopeInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
  onSelectSection,
  selectedSectionId,
}) => {
  const [isOpen, setIsOpen] = useState(isEditor);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      if (invitation.audioTrack?.autoplayAfterOpen) {
        ambientMusic.play(invitation.audioTrack.synthStyle);
      }
    }, 900);
  };

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="text-center mb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-xs uppercase tracking-widest text-[#9C7A3C] font-semibold block mb-1">
            Has recibido una invitación de gala
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-800">
            {invitation.names}
          </h1>
        </div>

        <div
          onClick={handleOpenEnvelope}
          className={`relative w-full max-w-md h-72 md:h-80 cursor-pointer group perspective-1000 transition-transform duration-500 hover:scale-[1.02] ${
            isOpening ? 'scale-95 opacity-80' : ''
          }`}
        >
          <div className="w-full h-full rounded-2xl bg-[#FAF8F5] shadow-2xl border border-[#E8DEC8] relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FAF4EA] to-transparent opacity-80 border-b border-[#E8DEC8]/50" />
            <div className="w-4/5 h-20 bg-white rounded-t-xl shadow-xs border-t border-x border-stone-200 -mt-10 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-serif">
                LAV Invitations
              </span>
            </div>
            <div
              className="absolute top-0 inset-x-0 h-36 bg-[#FAF5EB] shadow-xs border-b border-[#DFC48B]/40 flex items-center justify-center origin-top transition-transform duration-700"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
            <div className="absolute z-20 top-24 flex flex-col items-center">
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9C7A3C] via-[#C5A059] to-[#E5CF8B] shadow-lg border-2 border-[#FAF5EB] flex items-center justify-center text-white transform group-hover:scale-110 transition-all active:scale-95 cursor-pointer ring-4 ring-[#9C7A3C]/20"
                title="Toca para abrir la invitación"
              >
                <Heart className="w-7 h-7 text-white fill-white/80" />
              </button>
              <span className="text-[11px] font-serif font-medium text-stone-600 mt-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                Toca el sello para abrir
              </span>
            </div>
            <div className="absolute bottom-4 text-center px-4">
              <p className="text-xs font-serif text-slate-700">{invitation.title}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{invitation.eventDate}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] animate-in fade-in duration-700">
      {invitation.sections.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          invitation={invitation}
          onOpenRSVP={onOpenRSVP}
          onSelectPhoto={onSelectPhoto}
          isEditor={isEditor}
          onSelectSection={onSelectSection}
          isSelectedInEditor={section.id === selectedSectionId}
        />
      ))}
    </div>
  );
};
