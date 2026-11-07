import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { ambientMusic } from '../../audio/ambientMusic';
import { Heart } from 'lucide-react';
import { CustomButtonRenderer } from '../buttons/CustomButtonRenderer';
import { PREMIUM_TEMPLATE_CATALOG } from '../../data/premiumTemplates';

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
  const premiumTemplate = PREMIUM_TEMPLATE_CATALOG.find((template) => template.id === invitation.templateId);
  const openingStyle = premiumTemplate?.premiumStyle.openingStyle;
  const selectedOpeningButton = invitation.envelope.openingButton || invitation.sections.find((section) => section.type === 'rsvp')?.customButton;
  const premiumOpeningVariables = premiumTemplate ? {
    '--premium-primary': invitation.primaryColor,
    '--premium-accent': invitation.accentColor,
    '--premium-background': invitation.backgroundColor,
    '--premium-surface': premiumTemplate.palette.surface,
    '--premium-text': premiumTemplate.palette.text,
  } as React.CSSProperties : undefined;

  const handleOpenEnvelope = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      if (invitation.audioTrack?.autoplayAfterOpen) {
        const uploadedTrack = invitation.audioTrack.type === 'custom_upload'
          ? invitation.audioTrack.customAudioUrl || null
          : null;
        ambientMusic.setCustomAudio(uploadedTrack);
        ambientMusic.play(invitation.audioTrack.synthStyle);
      }
    }, 900);
  };

  if (!isOpen) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${openingStyle ? 'premium-envelope-opening premium-opening-style' : 'bg-[#F4EFEA]'}`} data-opening-style={openingStyle} style={premiumOpeningVariables}>
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="text-center mb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className={`text-xs uppercase tracking-widest text-[#9C7A3C] font-semibold block mb-1 ${openingStyle ? 'premium-opening-eyebrow' : ''}`}>
            Has recibido una invitación de gala
          </span>
          <h1 className={`text-2xl md:text-3xl font-serif text-slate-800 ${openingStyle ? 'premium-opening-title' : ''}`}>
            {invitation.names}
          </h1>
        </div>

        <div
          onClick={handleOpenEnvelope}
          className={`relative w-full max-w-md h-72 md:h-80 cursor-pointer group perspective-1000 transition-transform duration-500 hover:scale-[1.02] ${
            isOpening ? 'scale-95 opacity-80' : ''
          }`}
        >
          <div className={`w-full h-full rounded-2xl shadow-2xl border relative overflow-hidden flex flex-col items-center justify-center ${openingStyle ? 'premium-envelope-paper' : 'bg-[#FAF8F5] border-[#E8DEC8]'}`}>
            <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FAF4EA] to-transparent opacity-80 border-b border-[#E8DEC8]/50 ${openingStyle ? 'premium-envelope-band' : ''}`} />
            <div
              className={`absolute top-0 inset-x-0 h-36 bg-[#FAF5EB] shadow-xs border-b border-[#DFC48B]/40 flex items-center justify-center origin-top transition-transform duration-700 ${openingStyle ? 'premium-envelope-flap' : ''}`}
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
            <div className="absolute z-20 top-24 flex flex-col items-center">
              {selectedOpeningButton ? (
                <div data-premium-opening-button="true" className="premium-opening-seal">
                  <CustomButtonRenderer
                    config={{ ...selectedOpeningButton, label: 'Abrir invitación' }}
                    className="!min-h-[3.5rem] !px-5 !py-3 !text-xs"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#9C7A3C] via-[#C5A059] to-[#E5CF8B] shadow-lg border-2 border-[#FAF5EB] flex items-center justify-center text-white transform group-hover:scale-110 transition-all active:scale-95 cursor-pointer ring-4 ring-[#9C7A3C]/20 ${openingStyle ? 'premium-opening-seal' : ''}`}
                  data-premium-opening-button={openingStyle ? 'true' : undefined}
                  title="Toca para abrir la invitación"
                >
                  {invitation.envelope.sealIcon === 'crown' && openingStyle ? <span className="font-serif text-2xl">♛</span> : invitation.envelope.sealIcon === 'butterfly' && openingStyle ? <span className="text-2xl">❀</span> : invitation.envelope.sealIcon === 'star' && openingStyle ? <span className="text-2xl">✦</span> : <Heart className="w-7 h-7 text-white fill-white/80" />}
                </button>
              )}
              <span className={`text-[11px] font-serif font-medium text-stone-600 mt-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs ${openingStyle ? 'premium-opening-instruction' : ''}`}>
                Toca el sello para abrir
              </span>
            </div>
            <div className="absolute bottom-4 text-center px-4">
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

