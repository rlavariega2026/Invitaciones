import React, { useState } from 'react';
import { Invitation, InvitationMotif, PhotoConfig } from '../../types/invitation';
import { CinematicInvitation } from './CinematicInvitation';
import { EnvelopeInvitation } from './EnvelopeInvitation';
import { ScenesInvitation } from './ScenesInvitation';
import { BookInvitation } from './BookInvitation';
import { MagazineInvitation } from './MagazineInvitation';
import { GalleryInvitation } from './GalleryInvitation';
import { MinimalInvitation } from './MinimalInvitation';
import { InteractiveInvitation } from './InteractiveInvitation';
import { FairytaleInvitation } from './FairytaleInvitation';
import { SectionRSVPModal } from './SectionRSVPModal';
import { SectionMusicPlayer } from './SectionMusicPlayer';
import { PhotoEditorModal } from '../photo-editor/PhotoEditorModal';
import { MotifEditorContext } from './MotifEditorContext';
import { TEMPLATES_CATALOG } from '../../data/templates';
import './premiumTemplates.css';

interface InvitationContainerProps {
  invitation: Invitation;
  isEditor?: boolean;
  onUpdateInvitation?: (updated: Invitation) => void;
  onSelectSection?: (sectionId: string) => void;
  selectedSectionId?: string;
  onSelectMotif?: (sectionId: string, motifId: string) => void;
}

export const InvitationContainer: React.FC<InvitationContainerProps> = ({
  invitation,
  isEditor = false,
  onUpdateInvitation,
  onSelectSection,
  selectedSectionId,
  onSelectMotif,
}) => {
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoConfig | null>(null);
  const premiumTemplate = TEMPLATES_CATALOG.find((template) => template.id === invitation.templateId && template.premiumStyle);
  const premiumStyle = premiumTemplate?.premiumStyle;
  const premiumVariables = premiumTemplate && premiumStyle ? {
    '--premium-primary': invitation.primaryColor,
    '--premium-accent': invitation.accentColor,
    '--premium-background': invitation.backgroundColor,
    '--premium-surface': premiumTemplate.palette.surface,
    '--premium-text': premiumTemplate.palette.text,
    '--premium-radius': `${premiumStyle.cardRadius}px`,
  } as React.CSSProperties : undefined;

  const handleOpenRSVP = () => {
    setShowRSVPModal(true);
  };

  const handleSelectPhoto = (photo: PhotoConfig) => {
    if (isEditor) {
      setEditingPhoto(photo);
    }
  };

  const handleSavePhoto = (updatedPhoto: PhotoConfig) => {
    if (!onUpdateInvitation) return;
    const updatedSections = invitation.sections.map((s) => {
      if (s.photo?.id === updatedPhoto.id) {
        return { ...s, photo: updatedPhoto };
      }
      return s;
    });

    const updatedGallery = invitation.gallery.map((p) =>
      p.id === updatedPhoto.id ? updatedPhoto : p
    );

    onUpdateInvitation({
      ...invitation,
      sections: updatedSections,
      gallery: updatedGallery,
    });
  };

  const renderFormat = () => {
    switch (invitation.presentationFormat) {
      case 'envelope':
        return (
          <EnvelopeInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
            onSelectSection={onSelectSection}
            selectedSectionId={selectedSectionId}
          />
        );
      case 'scenes':
        return (
          <ScenesInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'book':
        return (
          <BookInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'magazine':
        return (
          <MagazineInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'gallery':
        return (
          <GalleryInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'minimal':
        return (
          <MinimalInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'interactive':
        return (
          <InteractiveInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
          />
        );
      case 'fairytale_book':
        return (
          <FairytaleInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
            onSelectSection={onSelectSection}
            selectedSectionId={selectedSectionId}
          />
        );
      case 'cinematic':
      default:
        return (
          <CinematicInvitation
            invitation={invitation}
            onOpenRSVP={handleOpenRSVP}
            onSelectPhoto={handleSelectPhoto}
            isEditor={isEditor}
            onSelectSection={onSelectSection}
            selectedSectionId={selectedSectionId}
          />
        );
    }
  };

  return (
    <div className={`relative w-full min-h-screen ${premiumStyle ? 'invitation-premium' : ''}`} style={premiumVariables} data-premium-template={premiumTemplate?.id} data-premium-style={premiumStyle?.openingStyle}>
      <MotifEditorContext.Provider value={{
        isEditor,
        selectMotif: onSelectMotif,
        updateMotif: onUpdateInvitation ? (sectionId, motifId, fields) => {
          const sourceMotif = invitation.sections.find((section) => section.id === sectionId)?.background.customMotifs?.find((motif) => motif.id === motifId);
          if (!sourceMotif) return;
          const matches = (motif: InvitationMotif) => sourceMotif.groupId ? motif.groupId === sourceMotif.groupId : motif.id === motifId;
          onUpdateInvitation({
            ...invitation,
            sections: invitation.sections.map((section) => ({
              ...section,
              background: {
                ...section.background,
                customMotifs: section.background.customMotifs?.map((motif) => matches(motif) ? { ...motif, ...fields } : motif),
              },
            })),
          });
        } : undefined,
      }}>
        {renderFormat()}
      </MotifEditorContext.Provider>

      {/* Floating Music Controller */}
      {invitation.audioTrack?.enabled && (
        <SectionMusicPlayer
          styleName={invitation.audioTrack.synthStyle}
          autoplayAfterOpen={invitation.audioTrack.autoplayAfterOpen}
          customAudioUrl={invitation.audioTrack.type === 'custom_upload' ? invitation.audioTrack.customAudioUrl : undefined}
        />
      )}

      {/* RSVP Modal */}
      <SectionRSVPModal
        invitation={invitation}
        isOpen={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
      />

      {/* Photo Studio Editor Modal */}
      {editingPhoto && (
        <PhotoEditorModal
          photo={editingPhoto}
          isOpen={true}
          onClose={() => setEditingPhoto(null)}
          onSave={handleSavePhoto}
        />
      )}
    </div>
  );
};

