import React, { useState, useMemo } from 'react';
import { Sparkles, Eye, Palette, Music, Check, Filter } from 'lucide-react';
import { Template, EventCategory, TemplateStyle } from '../../types';

interface TemplateCatalogProps {
  templates: Template[];
  selectedCategory: string;
  onSelectCategory: (cat: EventCategory | 'all') => void;
  onSelectTemplateToCustomize: (template: Template) => void;
}

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  templates,
  selectedCategory,
  onSelectCategory,
  onSelectTemplateToCustomize,
}) => {
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const matchCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
      const matchStyle = styleFilter === 'all' || tmpl.style === styleFilter;
      return matchCat && matchStyle;
    });
  }, [templates, selectedCategory, styleFilter]);

  const categoryTabs: Array<{ id: EventCategory | 'all'; label: string }> = [
    { id: 'all', label: 'Todas las Colecciones' },
    { id: 'boda', label: 'Bodas' },
    { id: 'xv_anos', label: 'XV Años' },
    { id: 'infantil', label: 'Infantiles' },
    { id: 'cumpleanos', label: 'Cumpleaños' },
    { id: 'bautizo', label: 'Bautizos' },
    { id: 'graduacion', label: 'Graduaciones' },
  ];

  const styleTabs: Array<{ id: TemplateStyle | 'all'; label: string }> = [
    { id: 'all', label: 'Todos los Estilos' },
    { id: 'luxury_gold', label: 'Oro & Lujo' },
    { id: 'botanical_emerald', label: 'Botánico & Olivo' },
    { id: 'champagne_blush', label: 'Rosa & Champagne' },
    { id: 'midnight_black', label: 'Medianoche' },
    { id: 'cosmic_fun', label: 'Aventura' },
  ];

  return (
    <section id="catalog" className="py-20 border-t border-neutral-900 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <Palette className="h-3.5 w-3.5" />
              <span>Librería de Alta Gama</span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-4xl font-normal text-neutral-100">
              Catálogo de Plantillas Exclusivas
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl">
              Cada diseño cuenta con su propia dirección de arte, composición tipográfica, paleta cromática y animación de apertura.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            Mostrando <span className="text-amber-400 font-bold">{filteredTemplates.length}</span> plantillas
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Style Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-neutral-500 whitespace-nowrap">
              <Filter className="h-3 w-3" />
              <span>Estilo:</span>
            </span>
            {styleTabs.map((style) => (
              <button
                key={style.id}
                onClick={() => setStyleFilter(style.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-md text-xs transition-colors ${
                  styleFilter === style.id
                    ? 'bg-neutral-200 text-neutral-950 font-medium'
                    : 'text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            return (
              <div
                key={template.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800/90 bg-neutral-900/80 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Image Preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {template.isPopular && (
                      <span className="rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-950 backdrop-blur-sm">
                        Popular
                      </span>
                    )}
                    {template.isNew && (
                      <span className="rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-950 backdrop-blur-sm">
                        Nuevo
                      </span>
                    )}
                  </div>

                  {/* Quick Preview Hover Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px]">
                    <button
                      onClick={() => setSelectedPreviewTemplate(template)}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-900/90 border border-neutral-700 px-3.5 py-2 text-xs font-medium text-neutral-100 hover:bg-neutral-800 transition-colors shadow-lg"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Unboxed category label */}
                    <div className="text-[11px] font-medium uppercase tracking-wider text-amber-400 mb-1">
                      {template.category === 'xv_anos' ? 'XV Años' : template.category.toUpperCase()}
                    </div>
                    <h3 className="font-playfair text-lg font-bold text-neutral-100 group-hover:text-amber-200 transition-colors">
                      {template.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Tags unboxed */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-800">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <React.Fragment key={tag}>
                        <span>{tag}</span>
                        {idx < template.tags.slice(0, 3).length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Primary Customize Button */}
                  <button
                    onClick={() => onSelectTemplateToCustomize(template)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 py-2.5 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500 hover:text-neutral-950 transition-all duration-200"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Personalizar Plantilla</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Template Detail Modal */}
        {selectedPreviewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                  <img
                    src={selectedPreviewTemplate.previewImage}
                    alt={selectedPreviewTemplate.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Plantilla Oficial
                    </span>
                    <h3 className="font-playfair text-2xl font-bold text-neutral-100 mt-1">
                      {selectedPreviewTemplate.name}
                    </h3>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedPreviewTemplate.description}
                  </p>

                  <div className="space-y-2 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400" />
                      <span>Encabezado predeterminado: "{selectedPreviewTemplate.defaultHeadline}"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-amber-400" />
                      <span>Banda sonora ambiental incluida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400" />
                      <span>Soporte para mapa, RSVP y mesa de regalos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        const t = selectedPreviewTemplate;
                        setSelectedPreviewTemplate(null);
                        onSelectTemplateToCustomize(t);
                      }}
                      className="flex-1 rounded-lg bg-amber-500 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 transition-colors text-center"
                    >
                      Personalizar Ahora
                    </button>
                    <button
                      onClick={() => setSelectedPreviewTemplate(null)}
                      className="rounded-lg border border-neutral-700 px-4 py-3 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
