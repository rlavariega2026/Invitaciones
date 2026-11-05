import type { FontFamilyType, BackgroundTexture, MotifTheme, PhotoShape, PresentationFormat, Invitation } from '../types/invitation';
import type { TemplateDefinition } from './templates';

export interface PremiumTemplateStyle {
  texture: BackgroundTexture;
  motif: MotifTheme;
  photoShape: PhotoShape;
  font: FontFamilyType;
  openingStyle: string;
  cardRadius: number;
  sectionMode: 'card' | 'plain' | 'tab';
  buttonId: string;
}

type PremiumBlueprint = {
  id: string;
  name: string;
  category: TemplateDefinition['category'];
  description: string;
  palette: TemplateDefinition['palette'];
  format: PresentationFormat;
  image: string;
  title: string;
  names: string;
  date: string;
  time: string;
  location: string;
  style: PremiumTemplateStyle;
};

const blueprints: PremiumBlueprint[] = [
  { id:'premium-boda-marfil-relieve', name:'Marfil en relieve', category:'bodas', description:'Papel marfil con textura repujada, filetes de oro suave, tipografía editorial y apertura con sello de lacre.', palette:{primary:'#765D36',accent:'#C5A66A',background:'#F8F4EC',surface:'#FFFCF6',text:'#332D25'}, format:'envelope', image:'b1.jpg', title:'Nuestra Boda', names:'Valentina y Santiago', date:'2027-10-16', time:'17:00', location:'Hacienda Los Olivos', style:{texture:'embossed_floral_white',motif:'wax_seal_envelope',photoShape:'arch',font:'cormorant',openingStyle:'wedding-relief',cardRadius:20,sectionMode:'card',buttonId:'btn-6'} },
  { id:'premium-boda-velvet-noir', name:'Gala de terciopelo', category:'bodas', description:'Azul noche aterciopelado, detalles dorados discretos, composición de gala y apertura tipo estuche.', palette:{primary:'#1E2942',accent:'#D7B66D',background:'#111827',surface:'#F9F5EC',text:'#20283A'}, format:'magazine', image:'i43.jpg', title:'Una noche para celebrar', names:'Camila y Andrés', date:'2027-11-06', time:'19:30', location:'Salón Imperial', style:{texture:'blue_night_floral',motif:'starry_gold_dust',photoShape:'gold_frame',font:'cinzel',openingStyle:'wedding-velvet',cardRadius:14,sectionMode:'card',buttonId:'btn-50'} },
  { id:'premium-boda-jardin-editorial', name:'Jardín editorial', category:'bodas', description:'Lino natural, follaje de eucalipto, paleta salvia y composición botánica de revista.', palette:{primary:'#526859',accent:'#B99A65',background:'#F2F1E8',surface:'#FCFBF5',text:'#354239'}, format:'minimal', image:'i40.jpg', title:'Celebramos nuestro amor', names:'Lucía y Mateo', date:'2027-09-25', time:'16:30', location:'Jardín Las Jacarandas', style:{texture:'linen',motif:'gold_roses_eucalyptus',photoShape:'gold_wreath_circular',font:'playfair',openingStyle:'wedding-garden',cardRadius:28,sectionMode:'plain',buttonId:'btn-31'} },
  { id:'premium-xv-alta-costura', name:'Portada de alta costura', category:'xv_anos', description:'Diseño de revista de moda con rosa empolvado, brillo fino y fotografía protagonista.', palette:{primary:'#713F56',accent:'#D8A9B5',background:'#F8EEF1',surface:'#FFF9FA',text:'#382633'}, format:'magazine', image:'i11.jpg', title:'Mis Quince Años', names:'Isabella', date:'2027-08-21', time:'19:00', location:'Palacio de Cristal', style:{texture:'rose_gold',motif:'rose_gold_butterflies',photoShape:'gold_frame',font:'bodoni',openingStyle:'xv-atelier',cardRadius:16,sectionMode:'card',buttonId:'btn-20'} },
  { id:'premium-xv-jardin-encantado', name:'Jardín encantado', category:'xv_anos', description:'Acuarela floral, tonos lavanda y verde suave, detalles luminosos y apertura de cuento.', palette:{primary:'#765C86',accent:'#C8A6C9',background:'#F4EFF8',surface:'#FFFBFF',text:'#40344B'}, format:'fairytale_book', image:'i8.jpg', title:'Una noche de ensueño', names:'María Fernanda', date:'2027-06-19', time:'18:30', location:'Jardín de los Sueños', style:{texture:'watercolor',motif:'orchid_crystal_gala',photoShape:'floral_frame',font:'pinyon',openingStyle:'xv-garden',cardRadius:26,sectionMode:'card',buttonId:'btn-21'} },
  { id:'premium-xv-laca-rosa', name:'Laca y oro rosa', category:'xv_anos', description:'Fondo vino rosado, acentos metálicos, jerarquía de gala y marco de retrato clásico.', palette:{primary:'#712D4A',accent:'#D7A1A7',background:'#F7ECEE',surface:'#FFF9F7',text:'#3B202C'}, format:'envelope', image:'i12.jpg', title:'Mis XV Años', names:'Renata', date:'2027-12-04', time:'20:00', location:'Salón Victoria', style:{texture:'rose_gold',motif:'ruby_crown_butterflies',photoShape:'gold_frame',font:'cinzel_dec',openingStyle:'xv-lacquer',cardRadius:18,sectionMode:'card',buttonId:'btn-20'} },
  { id:'premium-graduacion-legado', name:'Legado', category:'graduaciones', description:'Papel artesanal, insignias académicas sobrias, verde profundo y acentos de latón.', palette:{primary:'#31594C',accent:'#C3A66B',background:'#F0F2EC',surface:'#FCFCF6',text:'#28372F'}, format:'book', image:'i36.jpg', title:'Celebramos una meta', names:'Generación 2027', date:'2027-07-03', time:'18:00', location:'Auditorio Central', style:{texture:'handmade_paper',motif:'cap_laurel_diploma',photoShape:'rectangle',font:'marcellus',openingStyle:'grad-diploma',cardRadius:12,sectionMode:'tab',buttonId:'btn-15'} },
  { id:'premium-graduacion-noche-honor', name:'Noche de honor', category:'graduaciones', description:'Azul tinta con reflejos dorados, portada cinematográfica y retrato en marco editorial.', palette:{primary:'#203552',accent:'#D0B477',background:'#111B2B',surface:'#F7F4EC',text:'#242D3D'}, format:'cinematic', image:'i54.jpg', title:'Una noche de honor', names:'Sofía Martínez', date:'2027-06-26', time:'19:00', location:'Gran Salón del Centro', style:{texture:'blue_night_floral',motif:'starry_gold_dust',photoShape:'gold_frame',font:'cinzel',openingStyle:'grad-midnight',cardRadius:16,sectionMode:'card',buttonId:'btn-50'} },
  { id:'premium-graduacion-nueva-era', name:'Nueva era', category:'graduaciones', description:'Diseño moderno en marfil y azul petróleo, líneas limpias y acentos metálicos ligeros.', palette:{primary:'#28717A',accent:'#C9A96C',background:'#EAF2F1',surface:'#FFFFFF',text:'#263B3D'}, format:'scenes', image:'i5.jpg', title:'El comienzo de algo grande', names:'Generación 2027', date:'2027-08-12', time:'17:30', location:'Campus Universitario', style:{texture:'geometric',motif:'cap_laurel_diploma',photoShape:'square',font:'outfit',openingStyle:'grad-modern',cardRadius:8,sectionMode:'plain',buttonId:'btn-31'} },
  { id:'premium-cumple-champana', name:'Champaña a medianoche', category:'cumpleanos', description:'Negro satinado, destellos champaña y ritmo de celebración elegante.', palette:{primary:'#252329',accent:'#D1AC69',background:'#17171B',surface:'#FAF5EA',text:'#2D2A27'}, format:'cinematic', image:'i26.jpg', title:'Una noche para brindar', names:'Camila', date:'2027-10-02', time:'21:00', location:'Terraza Mirador', style:{texture:'champagne_bokeh',motif:'champagne_bowtie_party',photoShape:'polaroid',font:'bodoni',openingStyle:'birthday-champagne',cardRadius:14,sectionMode:'card',buttonId:'btn-50'} },
  { id:'premium-cumple-album', name:'Álbum de recuerdos', category:'cumpleanos', description:'Estética de álbum fotográfico cálido con papel mate y marcos de fotografía impresos.', palette:{primary:'#7B4E40',accent:'#C99A72',background:'#F4EAE0',surface:'#FFFBF5',text:'#44352F'}, format:'gallery', image:'i24.jpg', title:'Te invito a celebrar', names:'Daniela', date:'2027-05-22', time:'18:00', location:'Casa de la Familia', style:{texture:'parchment_vintage',motif:'sunset_twilight_lights',photoShape:'polaroid',font:'playfair',openingStyle:'birthday-album',cardRadius:6,sectionMode:'card',buttonId:'btn-26'} },
  { id:'premium-cumple-color', name:'Color de fiesta', category:'cumpleanos', description:'Paleta coral y durazno, confeti ilustrado, secciones vivas y lectura clara en celular.', palette:{primary:'#B34E55',accent:'#E7A86E',background:'#FFF1E8',surface:'#FFFCF8',text:'#4D3034'}, format:'interactive', image:'i35.jpg', title:'¡Vamos a celebrar!', names:'Emilia', date:'2027-04-17', time:'16:00', location:'Salón Magnolia', style:{texture:'watercolor',motif:'metallic_confetti_streamers',photoShape:'circle',font:'comfortaa',openingStyle:'birthday-confetti',cardRadius:24,sectionMode:'tab',buttonId:'btn-23'} },
  { id:'premium-infantil-libro-cuentos', name:'Libro de cuentos', category:'infantiles', description:'Papel ilustrado, estrellas y bosque mágico con capítulos visuales para una fiesta infantil.', palette:{primary:'#66548C',accent:'#E7C778',background:'#F3EFFB',surface:'#FFFCF4',text:'#3B3451'}, format:'fairytale_book', image:'i6.jpg', title:'Un día lleno de magia', names:'Valentina', date:'2027-03-14', time:'15:00', location:'Jardín Arcoíris', style:{texture:'fairytale_forest',motif:'enchanted_fairy_mushrooms',photoShape:'fairytale_arch',font:'pinyon',openingStyle:'kids-storybook',cardRadius:26,sectionMode:'card',buttonId:'btn-21'} },
  { id:'premium-infantil-safari', name:'Safari de exploradores', category:'infantiles', description:'Aventura de safari con verdes naturales, texturas de papel y detalles ilustrados alegres.', palette:{primary:'#56734E',accent:'#D0A65B',background:'#F3F0E5',surface:'#FFFDF4',text:'#3B4635'}, format:'scenes', image:'i3.jpg', title:'¡Aventura en el safari!', names:'Nicolás', date:'2027-07-10', time:'14:30', location:'Granja Los Pinos', style:{texture:'handmade_paper',motif:'hot_air_balloons_pastel',photoShape:'arch',font:'fredoka',openingStyle:'kids-safari',cardRadius:22,sectionMode:'tab',buttonId:'btn-25'} },
  { id:'premium-infantil-fondo-mar', name:'Fiesta bajo el mar', category:'infantiles', description:'Ondas acuáticas, escamas pastel, conchas y composición marina amable.', palette:{primary:'#287C83',accent:'#E5A9BB',background:'#EAF7F7',surface:'#F8FFFF',text:'#29444A'}, format:'gallery', image:'i4.jpg', title:'Una aventura bajo el mar', names:'Beatriz', date:'2027-02-10', time:'15:00', location:'Acuario del Parque', style:{texture:'mermaid_scales_pastel',motif:'mermaid_ocean_scales',photoShape:'circle',font:'comfortaa',openingStyle:'kids-ocean',cardRadius:30,sectionMode:'card',buttonId:'btn-25'} },
  { id:'premium-especial-art-deco', name:'Art déco', category:'especiales', description:'Geometría simétrica, negro tinta y detalles dorados con portada inspirada en los años veinte.', palette:{primary:'#29243B',accent:'#C9A75F',background:'#F1EEE7',surface:'#FCFAF4',text:'#302B36'}, format:'magazine', image:'i27.jpg', title:'Una celebración especial', names:'Alejandra', date:'2027-11-13', time:'20:00', location:'Salón Art Déco', style:{texture:'geometric',motif:'heraldic_gold_monogram',photoShape:'gold_frame',font:'cinzel_dec',openingStyle:'special-deco',cardRadius:4,sectionMode:'card',buttonId:'btn-50'} },
  { id:'premium-especial-celestial', name:'Noche celestial', category:'especiales', description:'Cielo profundo, constelaciones sutiles, luz violeta y detalles de brillo controlado.', palette:{primary:'#4A3E75',accent:'#C9B7EA',background:'#17172B',surface:'#F9F7FF',text:'#302A45'}, format:'envelope', image:'i2.png', title:'Bajo el mismo cielo', names:'Mariana', date:'2027-09-09', time:'19:30', location:'Terraza Estelar', style:{texture:'stars_clouds',motif:'moon_stars_clouds',photoShape:'oval',font:'prata',openingStyle:'special-celestial',cardRadius:18,sectionMode:'card',buttonId:'btn-50'} },
  { id:'premium-especial-botanica', name:'Botánica de autor', category:'especiales', description:'Fibras de papel, hojas de acuarela y composición artesanal en tonos salvia y terracota.', palette:{primary:'#526653',accent:'#B88768',background:'#F0EFE7',surface:'#FBFAF3',text:'#343D34'}, format:'minimal', image:'i22.jpg', title:'Celebremos juntos', names:'Renata y familia', date:'2027-05-29', time:'16:00', location:'Casa Botánica', style:{texture:'floral_botanical',motif:'white_floral_arch_candles',photoShape:'floral_frame',font:'allura',openingStyle:'special-botanical',cardRadius:22,sectionMode:'plain',buttonId:'btn-31'} },
];

const sample = (blueprint: PremiumBlueprint): Partial<Invitation> => ({
  title: blueprint.title,
  names: blueprint.names,
  eventDate: blueprint.date,
  eventTime: blueprint.time,
  eventLocation: blueprint.location,
});

export const PREMIUM_TEMPLATE_CATALOG: TemplateDefinition[] = blueprints.map((blueprint) => ({
  id: blueprint.id,
  name: `Premium · ${blueprint.name}`,
  category: blueprint.category,
  description: blueprint.description,
  palette: blueprint.palette,
  defaultFormat: blueprint.format,
  previewImage: import.meta.env.BASE_URL + `assets/templates/${blueprint.image}`,
  defaultButtonId: blueprint.style.buttonId,
  premiumStyle: blueprint.style,
  sampleData: sample(blueprint),
}));

