import React from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';

interface MinimalInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const MinimalInvitation: React.FC<MinimalInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] py-12 px-4 md:px-8">
      <div className="max-w-xl mx-auto space-y-12">
        {/* Minimal Hero Header */}
        <div className="text-center pt-8 border-b border-stone-200 pb-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-stone-400 font-sans block mb-3">
            {invitation.title}
          </span>
          <h1 className="text-3xl md:text-4xl font-cormorant font-normal text-stone-800 tracking-wide mb-3">
            {invitation.names}
          </h1>
          <div className="text-xs text-stone-500 tracking-wider uppercase">
            {invitation.eventDate} · {invitation.eventTime} hrs
          </div>
        </div>

        {/* Modular Sections with Clean Dividers */}
        <div className="divide-y divide-stone-100">
          {invitation.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
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
