import React from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';

interface CinematicInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
  onSelectSection?: (sectionId: string) => void;
  selectedSectionId?: string;
}

export const CinematicInvitation: React.FC<CinematicInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
  onSelectSection,
  selectedSectionId,
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
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
