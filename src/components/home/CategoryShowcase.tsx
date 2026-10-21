import React from 'react';
import { Heart, Crown, Rocket, Sparkles, GraduationCap, Baby } from 'lucide-react';
import { EventCategory } from '../../types';

interface CategoryShowcaseProps {
  selectedCategory: string;
  onSelectCategory: (category: EventCategory | 'all') => void;
}

const CATEGORIES_DATA: Array<{
  id: EventCategory;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  count: number;
}> = [
  {
    id: 'boda',
    name: 'Bodas',
    subtitle: 'Lujo, romance & flores',
    icon: Heart,
    accentColor: 'from-amber-500/20 to-amber-900/10 text-amber-300',
    count: 4,
  },
  {
    id: 'xv_anos',
    name: 'XV Años',
    subtitle: 'Galas & realeza moderna',
    icon: Crown,
    accentColor: 'from-emerald-500/20 to-emerald-900/10 text-emerald-300',
    count: 4,
  },
  {
    id: 'infantil',
    name: 'Fiestas Infantiles',
    subtitle: 'Magia, espacio & safari',
    icon: Rocket,
    accentColor: 'from-sky-500/20 to-sky-900/10 text-sky-300',
    count: 3,
  },
  {
    id: 'cumpleanos',
    name: 'Cumpleaños',
    subtitle: 'Celebraciones de honor',
    icon: Sparkles,
    accentColor: 'from-purple-500/20 to-purple-900/10 text-purple-300',
    count: 2,
  },
  {
    id: 'bautizo',
    name: 'Bautizos',
    subtitle: 'Blanco marfil & celestial',
    icon: Baby,
    accentColor: 'from-amber-200/20 to-stone-800/10 text-amber-200',
    count: 1,
  },
  {
    id: 'graduacion',
    name: 'Graduaciones',
    subtitle: 'Magna cum laude',
    icon: GraduationCap,
    accentColor: 'from-blue-600/20 to-blue-900/10 text-blue-300',
    count: 1,
  },
];

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-16 border-t border-neutral-900 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Colecciones Exclusivas
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-normal text-neutral-100 mt-1">
              Diseños Curados por Categoría de Evento
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedCategory === 'all' ? 'text-amber-400 underline underline-offset-4' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ver todas las plantillas (14)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-300 ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-900 shadow-lg shadow-amber-500/10'
                    : 'border-neutral-800/80 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.accentColor} mb-3 transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-playfair text-base font-bold text-neutral-100 group-hover:text-amber-200">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{cat.subtitle}</p>
                <span className="mt-2 text-[10px] text-neutral-500 font-mono">
                  {cat.count} diseños
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
