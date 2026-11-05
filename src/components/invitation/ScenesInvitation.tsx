import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ScenesInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const ScenesInvitation: React.FC<ScenesInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  const activeSections = invitation.sections.filter((s) => s.enabled);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);

  const currentSection = activeSections[currentSceneIdx] || activeSections[0];

  const handleNext = () => {
    if (currentSceneIdx < activeSections.length - 1) {
      setCurrentSceneIdx(currentSceneIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(currentSceneIdx - 1);
    }
  };

  if (!currentSection) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFBF7] relative select-none">
      {/* Top Scene Progress Bar */}
      <div className="fixed top-0 inset-x-0 z-30 p-3 bg-white/80 backdrop-blur-md border-b border-[#EBE4DA] flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-1 max-w-md mx-auto px-4">
          {activeSections.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setCurrentSceneIdx(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentSceneIdx
                  ? 'bg-[#9C7A3C]'
                  : idx < currentSceneIdx
                  ? 'bg-[#DFC48B]'
                  : 'bg-stone-200'
              }`}
              title={s.title || `Escena ${idx + 1}`}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-stone-500 mr-2">
          {currentSceneIdx + 1} / {activeSections.length}
        </span>
      </div>

      {/* Main Scene Stage */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-20">
        <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-300 key={currentSection.id}">
          <SectionBlock
            section={currentSection}
            invitation={invitation}
            onOpenRSVP={onOpenRSVP}
            onSelectPhoto={onSelectPhoto}
            isEditor={isEditor}
          />
        </div>
      </div>

      {/* Bottom Scene Controls */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-white/90 backdrop-blur-md border-t border-[#EBE4DA] flex items-center justify-between max-w-2xl mx-auto rounded-t-3xl shadow-lg">
        <button
          onClick={handlePrev}
          disabled={currentSceneIdx === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentSceneIdx === 0
              ? 'opacity-30 cursor-not-allowed text-stone-400'
              : 'hover:bg-stone-100 text-stone-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={onOpenRSVP}
          className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-serif font-semibold shadow-xs transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>RSVP</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentSceneIdx === activeSections.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            currentSceneIdx === activeSections.length - 1
              ? 'opacity-30 cursor-not-allowed text-stone-400'
              : 'bg-[#DFC48B] hover:bg-[#D5B676] text-stone-900 shadow-xs'
          }`}
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
