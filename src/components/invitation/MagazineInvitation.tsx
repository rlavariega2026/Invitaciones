import React from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { Sparkles, Calendar, MapPin, Heart } from 'lucide-react';

interface MagazineInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const MagazineInvitation: React.FC<MagazineInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  const coverSection = invitation.sections.find((s) => s.type === 'portada') || invitation.sections[0];
  const otherSections = invitation.sections.filter((s) => s.id !== coverSection?.id && s.enabled);

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl border border-stone-200 rounded-none overflow-hidden">
        {/* Magazine Cover Header */}
        <div className="border-b-2 border-stone-900 pt-6 pb-3 px-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] font-sans text-stone-500 mb-1">
            LAV EDITORIAL ISSUE N° 27 · SPECIAL WEDDING EDITION
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight uppercase text-stone-900">
            THE CELEBRATION
          </h1>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-400 mt-2 pt-1 border-t border-stone-100">
            <span>{invitation.eventDate}</span>
            <span className="font-serif italic capitalize text-stone-800">{invitation.title}</span>
            <span>EDICIÓN PRIVADA</span>
          </div>
        </div>

        {/* Magazine Hero Cover Photo with Overlay Text Headlines */}
        {coverSection?.photo && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
            <img
              src={coverSection.photo.url}
              alt="Editorial Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
              <span className="text-xs uppercase tracking-widest text-[#DFC48B] font-semibold mb-2">
                EXCLUSIVA NUPCIAL
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-2">
                {invitation.names}
              </h2>
              <p className="text-xs md:text-sm text-stone-200 max-w-lg font-light leading-relaxed">
                {coverSection.content || 'Una historia de amor celebrada en alta gala y elegancia contemporánea.'}
              </p>
            </div>
          </div>
        )}

        {/* Editorial Sub-bar */}
        <div className="bg-[#FAF8F5] p-4 border-y border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-700">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#9C7A3C]" />
            <span>{invitation.eventDate} · {invitation.eventTime} hrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#9C7A3C]" />
            <span className="truncate max-w-xs">{invitation.eventLocation}</span>
          </div>
          <button
            onClick={onOpenRSVP}
            className="px-4 py-1.5 bg-stone-900 text-white font-medium text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Confirmar RSVP
          </button>
        </div>

        {/* Editorial Articles / Columns */}
        <div className="divide-y divide-stone-200">
          {otherSections.map((sec) => (
            <SectionBlock
              key={sec.id}
              section={sec}
              invitation={invitation}
              onOpenRSVP={onOpenRSVP}
              onSelectPhoto={onSelectPhoto}
              isEditor={isEditor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
