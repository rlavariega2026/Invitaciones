import { FontFamilyType } from '../types/invitation';

export interface ButtonTemplate {
  id: string; // btn-1 to btn-50
  name: string;
  category:
    | 'elegantes'
    | 'dorados'
    | 'florales'
    | 'romanticos'
    | 'infantiles'
    | 'modernos'
    | 'minimalistas'
    | 'ornamentales'
    | 'relieve'
    | 'cristal';
  className: string;
  defaultText: string;
  fontFamily: FontFamilyType;
  iconName?: string;
  animation?: 'none' | 'pulse' | 'shimmer' | 'bounce';
}

export const BUTTON_CATALOG: ButtonTemplate[] = [
  // 1-5: ELEGANTES CLÁSICOS
  {
    id: 'btn-1',
    name: '1. Sello Imperial',
    category: 'elegantes',
    className: 'bg-stone-900 text-stone-100 hover:bg-stone-800 tracking-[0.2em] uppercase text-xs font-semibold px-8 py-3.5 rounded-full border border-[#DFC48B] shadow-sm',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cinzel',
    iconName: 'Crown',
  },
  {
    id: 'btn-2',
    name: '2. Caligrafía Nupcial',
    category: 'elegantes',
    className: 'bg-[#FAF5EB] text-[#9C7A3C] hover:bg-[#F3EADB] text-base font-normal px-8 py-2.5 rounded-full border border-[#DFC48B] shadow-xs',
    defaultText: 'Acompañar a los Novios',
    fontFamily: 'script',
    iconName: 'Heart',
  },
  {
    id: 'btn-3',
    name: '3. Bodoni de Gala',
    category: 'elegantes',
    className: 'bg-white text-stone-900 hover:bg-stone-50 border-2 border-stone-900 text-xs font-bold uppercase tracking-widest px-7 py-3 rounded-none shadow-md',
    defaultText: 'Confirmar Reservación',
    fontFamily: 'bodoni',
  },
  {
    id: 'btn-4',
    name: '4. Marfil & Ébano',
    category: 'elegantes',
    className: 'bg-[#FAF8F5] text-stone-800 hover:bg-white text-xs font-medium tracking-wider px-7 py-3 rounded-xl border border-stone-300 shadow-sm',
    defaultText: 'Confirmar Lugar',
    fontFamily: 'cormorant',
    iconName: 'Check',
  },
  {
    id: 'btn-5',
    name: '5. Laurel Romano',
    category: 'elegantes',
    className: 'bg-stone-800 text-[#E5D5B8] hover:bg-stone-700 text-xs font-semibold tracking-widest uppercase px-8 py-3.5 rounded-2xl border border-[#9C7A3C]',
    defaultText: 'Pase de Honor',
    fontFamily: 'cinzel_dec',
    iconName: 'Sparkles',
  },

  // 6-10: DORADOS Y METÁLICOS
  {
    id: 'btn-6',
    name: '6. Oro Líquido Shimmer',
    category: 'dorados',
    className: 'bg-gradient-to-r from-[#9C7A3C] via-[#DFC48B] to-[#9C7A3C] animate-gold-shimmer text-stone-900 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg border border-[#FAF5EB]',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cinzel',
    animation: 'shimmer',
    iconName: 'Sparkles',
  },
  {
    id: 'btn-7',
    name: '7. Oro Rosa Champagne',
    category: 'dorados',
    className: 'bg-gradient-to-tr from-[#B76E79] via-[#E8C5C8] to-[#DFC48B] text-stone-900 text-xs font-semibold px-7 py-3 rounded-full shadow-md border border-white',
    defaultText: 'Confirmar con Cariño',
    fontFamily: 'parisienne',
    iconName: 'Heart',
  },
  {
    id: 'btn-8',
    name: '8. Plata Espejo',
    category: 'dorados',
    className: 'bg-gradient-to-r from-stone-200 via-white to-stone-300 text-stone-800 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-md border border-stone-300',
    defaultText: 'Acceso Exclusivo',
    fontFamily: 'cinzel',
  },
  {
    id: 'btn-9',
    name: '9. Filigrana Dorada',
    category: 'dorados',
    className: 'bg-[#FAF5EB] text-[#8C6D34] hover:bg-white text-xs font-semibold px-7 py-3 rounded-2xl border-2 border-dashed border-[#DFC48B] shadow-xs',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cormorant',
    iconName: 'Sparkles',
  },
  {
    id: 'btn-10',
    name: '10. Oro Cepillado',
    category: 'dorados',
    className: 'bg-[#DFC48B] hover:bg-[#D5B676] text-stone-950 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md border-t border-amber-100 border-b border-amber-700',
    defaultText: 'Confirmar Mi Asistencia',
    fontFamily: 'marcellus',
  },

  // 11-15: FLORALES & BOTÁNICOS
  {
    id: 'btn-11',
    name: '11. Guirnalda Salvia',
    category: 'florales',
    className: 'bg-[#E2ECE5] hover:bg-[#D4E3D8] text-[#2F4A39] text-xs font-semibold px-7 py-3 rounded-full border border-[#B6D1BE] shadow-xs',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cormorant',
    iconName: 'Flower2',
  },
  {
    id: 'btn-12',
    name: '12. Jardín de Rosas',
    category: 'florales',
    className: 'bg-[#FCEFEF] hover:bg-[#F9DFDF] text-[#7A3644] text-xs font-semibold px-7 py-3 rounded-full border border-[#EAAFB7] shadow-xs',
    defaultText: 'Acompañar en el Gran Día',
    fontFamily: 'pinyon',
    iconName: 'Heart',
  },
  {
    id: 'btn-13',
    name: '13. Lavanda Provenzal',
    category: 'florales',
    className: 'bg-[#EAE6F8] hover:bg-[#DDD7F3] text-[#4A3C6B] text-xs font-semibold px-7 py-3 rounded-2xl border border-[#C5BCED]',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'parisienne',
  },
  {
    id: 'btn-14',
    name: '14. Corona Botánica',
    category: 'florales',
    className: 'bg-white hover:bg-stone-50 text-[#3C5744] text-xs font-semibold px-8 py-3.5 rounded-full border-2 border-[#6E8574] shadow-sm',
    defaultText: 'Estaré Presente',
    fontFamily: 'cormorant',
    iconName: 'Check',
  },
  {
    id: 'btn-15',
    name: '15. Eucalipto Silvestre',
    category: 'florales',
    className: 'bg-[#FAF7F2] text-[#556B2F] hover:bg-white text-xs font-medium px-7 py-3 rounded-xl border border-[#A2B88B]',
    defaultText: 'Confirmar mi Lugar',
    fontFamily: 'marcellus',
  },

  // 16-20: ROMÁNTICOS & CINTAS
  {
    id: 'btn-16',
    name: '16. Lazo de Seda',
    category: 'romanticos',
    className: 'bg-gradient-to-r from-[#FCEFEF] via-white to-[#FCEFEF] text-rose-900 text-sm font-normal px-8 py-2.5 rounded-full border border-rose-200 shadow-sm',
    defaultText: 'Sí, con todo mi corazón',
    fontFamily: 'script',
    iconName: 'Heart',
  },
  {
    id: 'btn-17',
    name: '17. Cinta Nupcial Rosa',
    category: 'romanticos',
    className: 'bg-[#F7D6D0] hover:bg-[#F3C5BD] text-[#4A2821] text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-full shadow-xs',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'montserrat',
  },
  {
    id: 'btn-18',
    name: '18. Sello de Amor',
    category: 'romanticos',
    className: 'bg-[#9C7A3C] text-white hover:bg-[#85662F] text-xs font-semibold px-8 py-3.5 rounded-full shadow-md flex items-center justify-center gap-2',
    defaultText: 'Acepto la Invitación',
    fontFamily: 'cormorant',
    iconName: 'Heart',
  },
  {
    id: 'btn-19',
    name: '19. Promesa Eterna',
    category: 'romanticos',
    className: 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-300 text-xs font-medium px-7 py-3 rounded-2xl shadow-xs',
    defaultText: 'Compartir la Felicidad',
    fontFamily: 'allura',
  },
  {
    id: 'btn-20',
    name: '20. Cera Lacrada Rubí',
    category: 'romanticos',
    className: 'bg-gradient-to-b from-[#8B263E] to-[#68192C] text-rose-100 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full shadow-lg border border-rose-400/40',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cinzel',
    iconName: 'Crown',
  },

  // 21-25: INFANTILES & MÁGICOS
  {
    id: 'btn-21',
    name: '21. Nube de Azúcar',
    category: 'infantiles',
    className: 'bg-gradient-to-r from-sky-100 to-pink-100 hover:from-sky-200 hover:to-pink-200 text-slate-800 text-sm font-bold px-7 py-3 rounded-3xl shadow-sm border border-white',
    defaultText: '¡Sí voy a la fiesta!',
    fontFamily: 'fredoka',
    iconName: 'Sparkles',
  },
  {
    id: 'btn-22',
    name: '22. Cuento de Princesas',
    category: 'infantiles',
    className: 'bg-gradient-to-r from-[#EAE6F8] to-[#FCEFEF] text-purple-900 text-sm font-bold px-8 py-3 rounded-full shadow-md border-2 border-purple-200',
    defaultText: 'Confirmar mi Pase Mágico',
    fontFamily: 'comfortaa',
    iconName: 'Crown',
  },
  {
    id: 'btn-23',
    name: '23. Sapo Encantado',
    category: 'infantiles',
    className: 'bg-gradient-to-r from-[#2E6B56] to-[#1D4E3E] text-amber-200 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-lg border-2 border-[#DFC48B]',
    defaultText: 'Entrar al Reino Encantado',
    fontFamily: 'cinzel',
    iconName: 'Sparkles',
    animation: 'pulse',
  },
  {
    id: 'btn-24',
    name: '24. Arcoíris Pastel',
    category: 'infantiles',
    className: 'bg-gradient-to-r from-amber-100 via-rose-100 to-sky-100 text-slate-800 text-xs font-bold px-7 py-3 rounded-2xl shadow-xs border border-white',
    defaultText: '¡Quiero ir a celebrar!',
    fontFamily: 'fredoka',
  },
  {
    id: 'btn-25',
    name: '25. Burbuja Marina',
    category: 'infantiles',
    className: 'bg-[#DEF2F1] text-[#17252A] hover:bg-[#C9E8E6] text-xs font-bold px-7 py-3 rounded-full border border-[#3AAFA9] shadow-sm',
    defaultText: 'Confirmar Aventura',
    fontFamily: 'comfortaa',
  },

  // 26-30: MODERNOS & GLASSMORPHISM
  {
    id: 'btn-26',
    name: '26. Glass Muted Pastel',
    category: 'modernos',
    className: 'bg-white/70 backdrop-blur-md text-slate-800 hover:bg-white/90 border border-white/60 text-xs font-semibold px-8 py-3 rounded-2xl shadow-sm',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'outfit',
    iconName: 'Check',
  },
  {
    id: 'btn-27',
    name: '27. Dark Glass Elegance',
    category: 'modernos',
    className: 'bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-900 border border-slate-700 text-xs font-medium tracking-wider px-8 py-3 rounded-xl shadow-lg',
    defaultText: 'RSVP Digital',
    fontFamily: 'urbanist',
  },
  {
    id: 'btn-28',
    name: '28. Gradiente Aurora',
    category: 'modernos',
    className: 'bg-gradient-to-r from-violet-200 via-rose-200 to-amber-100 text-slate-900 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md',
    defaultText: 'Confirmar Mi Asistencia',
    fontFamily: 'montserrat',
  },
  {
    id: 'btn-29',
    name: '29. Neo-Brutalism Pastel',
    category: 'modernos',
    className: 'bg-[#FAF5EB] text-slate-900 text-xs font-bold uppercase px-7 py-3 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'urbanist',
  },
  {
    id: 'btn-30',
    name: '30. Píldora Monocroma',
    category: 'modernos',
    className: 'bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-8 py-3.5 rounded-full shadow-md tracking-wider uppercase',
    defaultText: 'Registrar RSVP',
    fontFamily: 'outfit',
  },

  // 31-35: MINIMALISTAS
  {
    id: 'btn-31',
    name: '31. Línea Fina Marfil',
    category: 'minimalistas',
    className: 'bg-transparent text-stone-800 hover:bg-stone-50 border border-stone-800 text-xs font-medium uppercase tracking-[0.25em] px-8 py-3 rounded-none',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cormorant',
  },
  {
    id: 'btn-32',
    name: '32. Clean Sand Box',
    category: 'minimalistas',
    className: 'bg-[#F4EFEA] hover:bg-[#EBE4DC] text-stone-800 text-xs font-medium px-7 py-3 rounded-lg border border-stone-300',
    defaultText: 'Confirmar Mi Lugar',
    fontFamily: 'sans',
  },
  {
    id: 'btn-33',
    name: '33. Subrayado Tipográfico',
    category: 'minimalistas',
    className: 'bg-transparent text-stone-900 hover:text-[#9C7A3C] text-sm font-medium pb-1.5 border-b-2 border-stone-900 hover:border-[#9C7A3C] rounded-none px-4',
    defaultText: 'Confirmar Asistencia →',
    fontFamily: 'playfair',
  },
  {
    id: 'btn-34',
    name: '34. Marco Hairline',
    category: 'minimalistas',
    className: 'bg-white text-stone-700 hover:border-stone-900 border border-stone-300 text-xs font-normal tracking-widest px-8 py-3 rounded-full',
    defaultText: 'Confirmar Lugar',
    fontFamily: 'cormorant',
  },
  {
    id: 'btn-35',
    name: '35. Cuadrado Suizo',
    category: 'minimalistas',
    className: 'bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold px-6 py-3 rounded-xs uppercase tracking-wider',
    defaultText: 'RSVP Online',
    fontFamily: 'sans',
  },

  // 36-40: ORNAMENTALES & FILIGRANA
  {
    id: 'btn-36',
    name: '36. Esquinas de Palacio',
    category: 'ornamentales',
    className: 'bg-[#FAF8F5] text-stone-900 hover:bg-white text-xs font-bold uppercase tracking-widest px-8 py-3 border-x-4 border-y border-[#DFC48B] shadow-xs',
    defaultText: 'Pase de Entrada',
    fontFamily: 'cinzel',
  },
  {
    id: 'btn-37',
    name: '37. Encaje Nupcial',
    category: 'ornamentales',
    className: 'bg-white text-[#9C7A3C] hover:bg-stone-50 text-xs font-semibold px-8 py-3 rounded-3xl border-2 border-dotted border-[#DFC48B] shadow-sm',
    defaultText: 'Confirmar con Honor',
    fontFamily: 'cormorant',
    iconName: 'Crown',
  },
  {
    id: 'btn-38',
    name: '38. Marco Heráldico',
    category: 'ornamentales',
    className: 'bg-[#FDFBF7] text-stone-800 text-xs font-semibold px-8 py-3 rounded-xl border-2 border-double border-stone-400 shadow-xs',
    defaultText: 'Acepto la Invitación',
    fontFamily: 'prata',
  },
  {
    id: 'btn-39',
    name: '39. Corona de Princesa',
    category: 'ornamentales',
    className: 'bg-gradient-to-r from-[#FAF5EB] via-[#FCEFEF] to-[#FAF5EB] text-amber-900 text-xs font-bold px-8 py-3 rounded-full border border-amber-300 shadow-md',
    defaultText: 'Confirmar mi Pase Real',
    fontFamily: 'cinzel_dec',
    iconName: 'Crown',
  },
  {
    id: 'btn-40',
    name: '40. Lacre & Flor',
    category: 'ornamentales',
    className: 'bg-[#7A3644] text-rose-100 hover:bg-[#662C38] text-xs font-semibold px-8 py-3.5 rounded-full shadow-md border border-rose-300/40',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cormorant',
    iconName: 'Heart',
  },

  // 41-45: RELIEVE & 3D PROFUNDIDAD
  {
    id: 'btn-41',
    name: '41. Relieve Champagne',
    category: 'relieve',
    className: 'bg-gradient-to-b from-[#FAF5EB] to-[#E8DCBA] text-stone-900 text-xs font-bold uppercase px-8 py-3.5 rounded-2xl shadow-[0_4px_0_0_#C5B289] active:translate-y-1 active:shadow-none border border-white',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cinzel',
  },
  {
    id: 'btn-42',
    name: '42. 3D Suave Pastel',
    category: 'relieve',
    className: 'bg-gradient-to-b from-rose-100 to-rose-200 text-rose-900 text-xs font-bold px-8 py-3 rounded-full shadow-[0_4px_0_0_#DDB5AD] active:translate-y-1 active:shadow-none border border-white',
    defaultText: '¡Confirmar!',
    fontFamily: 'comfortaa',
  },
  {
    id: 'btn-43',
    name: '43. Botón Neumórfico',
    category: 'relieve',
    className: 'bg-[#F2ECE4] text-stone-800 text-xs font-semibold px-8 py-3.5 rounded-2xl shadow-[5px_5px_10px_#ded6cc,-5px_-5px_10px_#ffffff]',
    defaultText: 'Confirmar Entrada',
    fontFamily: 'urbanist',
  },
  {
    id: 'btn-44',
    name: '44. Tecla de Marfil',
    category: 'relieve',
    className: 'bg-[#FAF8F5] text-stone-900 text-xs font-bold px-7 py-3 rounded-xl border border-stone-200 shadow-[inset_0_1px_0_0_#ffffff,0_3px_6px_rgba(0,0,0,0.06)]',
    defaultText: 'Confirmar Lugar',
    fontFamily: 'playfair',
  },
  {
    id: 'btn-45',
    name: '45. Bloque Esculpido',
    category: 'relieve',
    className: 'bg-stone-900 text-[#DFC48B] text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-t border-stone-700',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cinzel',
  },

  // 46-50: CRISTAL & FROSTED GLASS
  {
    id: 'btn-46',
    name: '46. Cristal Translúcido',
    category: 'cristal',
    className: 'bg-white/40 backdrop-blur-lg hover:bg-white/60 text-slate-800 text-xs font-semibold px-8 py-3 rounded-full border border-white/80 shadow-md',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'outfit',
    iconName: 'Sparkles',
  },
  {
    id: 'btn-47',
    name: '47. Hielo Polar',
    category: 'cristal',
    className: 'bg-sky-50/50 backdrop-blur-md text-sky-900 hover:bg-sky-50/80 text-xs font-bold px-8 py-3 rounded-2xl border border-sky-200/60 shadow-sm',
    defaultText: 'Confirmar Pase',
    fontFamily: 'urbanist',
  },
  {
    id: 'btn-48',
    name: '48. Cristal Dorado',
    category: 'cristal',
    className: 'bg-[#FAF5EB]/60 backdrop-blur-md text-[#8C6D34] hover:bg-[#FAF5EB]/90 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full border border-[#DFC48B]/50 shadow-sm',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'cormorant',
    iconName: 'Crown',
  },
  {
    id: 'btn-49',
    name: '49. Resplandor Pulsante',
    category: 'cristal',
    className: 'bg-rose-50/70 backdrop-blur-md text-rose-900 hover:bg-rose-100 text-xs font-bold px-8 py-3.5 rounded-full border border-rose-300 animate-gentle-pulse shadow-md',
    defaultText: 'Confirmar Asistencia',
    fontFamily: 'comfortaa',
    animation: 'pulse',
    iconName: 'Heart',
  },
  {
    id: 'btn-50',
    name: '50. Gran Gala Cristal Negro',
    category: 'cristal',
    className: 'bg-stone-900/75 backdrop-blur-lg text-[#E5D5B8] hover:bg-stone-900/90 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full border border-[#DFC48B]/60 shadow-xl',
    defaultText: 'Confirmar Mi Asistencia',
    fontFamily: 'cinzel',
    iconName: 'Sparkles',
  },
];
