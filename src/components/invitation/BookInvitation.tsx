import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface BookInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const BookInvitation: React.FC<BookInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  const activeSections = invitation.sections.filter((s) => s.enabled);
  // Group into pages of 1 or 2 sections
  const totalPages = Math.ceil(activeSections.length / 2);
  const [currentPage, setCurrentPage] = useState(0);

  const leftSection = activeSections[currentPage * 2];
  const rightSection = activeSections[currentPage * 2 + 1];

  return (
    <div className="min-h-screen bg-[#F2EDE4] py-8 px-3 md:px-6 flex flex-col justify-between items-center">
      {/* Top Header */}
      <div className="text-center mb-4">
        <span className="text-[11px] uppercase tracking-widest text-[#9C7A3C] font-semibold flex items-center justify-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Libro Nupcial & Memoria de Evento</span>
        </span>
        <h1 className="text-xl font-serif text-slate-800">{invitation.title}</h1>
      </div>

      {/* Book Spread Container */}
      <div className="w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#D9CFC4] p-4 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 min-h-[520px]">
        {/* Book Spine Shadow in Center */}
        <div className="hidden md:block absolute inset-y-0 left-1/2 -ml-px w-2 bg-gradient-to-r from-stone-300/40 via-stone-200/20 to-stone-300/40 pointer-events-none" />

        {/* Left Page */}
        <div className="flex-1 rounded-2xl bg-white/70 p-4 border border-[#EBE4DA] shadow-xs flex flex-col justify-center">
          {leftSection ? (
            <SectionBlock
              section={leftSection}
              invitation={invitation}
              onOpenRSVP={onOpenRSVP}
              onSelectPhoto={onSelectPhoto}
              isEditor={isEditor}
            />
          ) : (
            <div className="text-center text-stone-400 text-xs italic">Fin del capítulo</div>
          )}
        </div>

        {/* Right Page */}
        <div className="flex-1 rounded-2xl bg-white/70 p-4 border border-[#EBE4DA] shadow-xs flex flex-col justify-center">
          {rightSection ? (
            <SectionBlock
              section={rightSection}
              invitation={invitation}
              onOpenRSVP={onOpenRSVP}
              onSelectPhoto={onSelectPhoto}
              isEditor={isEditor}
            />
          ) : (
            <div className="text-center text-stone-400 text-xs italic flex flex-col items-center justify-center h-full">
              <Sparkles className="w-6 h-6 text-[#DFC48B] mb-2" />
              <span>Gracias por ser parte de nuestra historia</span>
              <button
                onClick={onOpenRSVP}
                className="mt-4 px-4 py-2 rounded-xl bg-[#DFC48B] text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Confirmar Asistencia
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Book Pagination Toolbar */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-2 rounded-full bg-white shadow-xs border border-stone-200 hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <span className="text-xs font-serif text-stone-600">
          Páginas {currentPage * 2 + 1} - {Math.min(activeSections.length, currentPage * 2 + 2)} de {activeSections.length}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-full bg-white shadow-xs border border-stone-200 hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </div>
  );
};
