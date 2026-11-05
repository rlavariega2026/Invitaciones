import React, { useState } from 'react';
import { Invitation, PhotoConfig } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { Sparkles, Image, Maximize2, X } from 'lucide-react';

interface GalleryInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const GalleryInvitation: React.FC<GalleryInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoConfig | null>(null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4">
      {/* Top Banner */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-[#9C7A3C] font-semibold block mb-1">
          Galería & Memoria Fotográfica
        </span>
        <h1 className="text-3xl font-serif text-slate-800">{invitation.names}</h1>
        <p className="text-xs text-stone-500 mt-1">{invitation.title}</p>
      </div>

      {/* Featured Photo Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {invitation.gallery.map((photo, i) => (
          <div
            key={photo.id || i}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-sm border border-stone-200 hover:shadow-lg transition-all"
          >
            <img
              src={photo.url}
              alt={photo.alt || 'Galería'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Invitation Sections */}
      <div className="max-w-xl mx-auto rounded-3xl bg-white shadow-xl border border-[#E8DEC8] overflow-hidden">
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

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-1.5 text-white bg-black/50 hover:bg-black/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt || 'Foto ampliada'}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
