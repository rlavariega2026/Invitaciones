import React, { useState } from 'react';
import { Invitation } from '../../types/invitation';
import { SectionBlock } from './SectionBlock';
import { Sparkles, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface InteractiveInvitationProps {
  invitation: Invitation;
  onOpenRSVP: () => void;
  onSelectPhoto?: (photo: any) => void;
  isEditor?: boolean;
}

export const InteractiveInvitation: React.FC<InteractiveInvitationProps> = ({
  invitation,
  onOpenRSVP,
  onSelectPhoto,
  isEditor = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'sec-portada': true,
    'sec-fecha': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Interactive Top Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#FAF5EB] to-white border border-[#E8DEC8] shadow-sm text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Invitación Interactiva Multitáctil</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-800 mt-1">{invitation.names}</h1>
          <p className="text-xs text-stone-500 mt-1">Toca cada apartado para revelar los detalles de la celebración</p>
        </div>

        {/* Accordion / Interactive Cards */}
        {invitation.sections.map((sec) => {
          if (!sec.enabled) return null;
          const isExpanded = isEditor || expandedSections[sec.id] !== false;

          return (
            <div
              key={sec.id}
              className="rounded-3xl bg-white border border-[#E8DEC8] shadow-xs overflow-hidden transition-all duration-300"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => !isEditor && toggleSection(sec.id)}
                className="w-full flex items-center justify-between p-4 bg-[#FAF8F5] hover:bg-[#F5EFE4] transition-colors text-left"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9C7A3C] font-semibold block">
                    {sec.subtitle || 'Detalle'}
                  </span>
                  <span className="text-sm font-serif font-bold text-slate-800">{sec.title}</span>
                </div>
                <div className="p-1 rounded-full bg-white border border-stone-200 text-stone-500">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="animate-in fade-in duration-200">
                  <SectionBlock
                    section={sec}
                    invitation={invitation}
                    onOpenRSVP={onOpenRSVP}
                    onSelectPhoto={onSelectPhoto}
                    isEditor={isEditor}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
