export type PresentationFormat =
  | 'cinematic'
  | 'scenes'
  | 'book'
  | 'envelope'
  | 'magazine'
  | 'gallery'
  | 'minimal'
  | 'interactive'
  | 'fairytale_book';

export type BackgroundBehavior = 'scroll' | 'fixed' | 'parallax';

export type BackgroundType = 'color' | 'gradient' | 'texture' | 'image';

export type BackgroundTexture =
  // Texturas de Lujo del ZIP
  | 'quilted_pink_pearl'      // Capitonado rosa acolchado con perlas (i3.jpg)
  | 'embossed_floral_white'   // Papel blanco repujado con flores en relieve 3D (b1.jpg)
  | 'blue_roses_watercolor'   // Rosas azul rey en acuarela con mariposas (i1.jpg)
  | 'mermaid_scales_pastel'   // Escamas de sirena iridiscentes (i4.jpg)
  | 'pampas_dry_grass'        // Pampas grass y espigas secas (i50.jpg)
  | 'gold_roses_eucalyptus'   // Rosas doradas lineales con eucalipto (i40.jpg)
  | 'ruby_gold_filigree'      // Rubí imperial con filigrana dorada (i23.jpg)
  | 'blue_night_floral'       // Azul marino noche con coronas florales (i33.jpg)
  | 'champagne_bokeh'         // Champaña, bokeh y destellos dorados (i35.jpg)
  | 'blue_velvet_ribbon'      // Terciopelo azul con encaje (i2.png)
  // Texturas Artesanales y Telas
  | 'lace_wedding'            // Encaje nupcial blanco
  | 'silk'                    // Seda satinada fina
  | 'velvet'                  // Terciopelo suave
  | 'marble'                  // Mármol pulido carrara
  | 'handmade_paper'          // Papel artesanal con fibras de lino
  | 'luxury_paper'            // Papel satinado marfil
  | 'linen'                   // Lino natural
  | 'damask'                  // Damasco real veneciano
  | 'parchment_vintage'       // Pergamino antiguo
  // Metales y Brillos
  | 'metal_gold'              // Oro metálico
  | 'rose_gold'               // Oro rosa brillante
  | 'metal_silver'            // Plata espejada
  | 'foil_stamped'            // Pan de oro batido
  | 'glitter_gold_dust'       // Lluvia de chispas de oro
  // Naturaleza y Acuarelas
  | 'watercolor'              // Acuarela pastel suave
  | 'floral'                  // Guirnalda floral de primavera
  | 'floral_roses'            // Ramo de rosas inglesas
  | 'floral_botanical'        // Follaje botánico de eucalipto
  // Fantasía e Infantiles
  | 'fairytale_forest'        // Bosque encantado y niebla mágica
  | 'stars_clouds'            // Cielo de estrellas y nubes
  | 'water_ripples'           // Ondas de agua cristalina
  | 'confetti_gold'           // Confeti dorado y chispas
  | 'geometric'               // Geometría suave art déco
  | 'none';

export type PhotoShape =
  // Diseños y Marcos del ZIP
  | 'heart_ornamental_roses'  // Corazón tallado con rosas azules y cinta (i2.png)
  | 'arch_with_bottom_roses'  // Arco con guirnalda de rosas abajo (i2.jpg)
  | 'gold_wreath_circular'    // Corona circular de laurel de oro con eucalipto (i40.jpg, i54.jpg)
  | 'organic_pebble'          // Silueta de piedra orgánica de playa (i33.jpg)
  | 'quilted_gold_crest'      // Marco capitonado con corona dorada (i3.jpg)
  | 'gold_geometric_box'      // Marco octagonal de oro fino (i40.jpg)
  | 'fade_bottom_gradient'    // Degradado suave inferior que se funde con el fondo (i2.jpg, i33.jpg)
  | 'arch'                    // Arco romano
  | 'oval'                    // Óvalo clásico
  | 'circle'                  // Círculo perfecto
  | 'heart'                   // Corazón clásico
  | 'polaroid'                // Estilo Polaroid
  | 'gold_frame'              // Marco dorado filigrana
  | 'floral_frame'            // Marco floral pastel
  | 'royal_crest'             // Escudo real de gala
  | 'fairytale_arch'          // Arco cuento de hadas
  | 'diamond'                 // Diamante
  | 'paper_edge'              // Borde de papel artesanal
  | 'geometric_frame'         // Marco geométrico
  | 'rectangle'               // Rectangular limpio
  | 'square';                 // Cuadrado

export type PhotoFilter =
  | 'none'
  | 'warm'
  | 'cool'
  | 'cinematic'
  | 'vintage'
  | 'bw'
  | 'golden'
  | 'matte'
  | 'soft'
  | 'high_contrast'
  | 'portrait'
  | 'fairytale_glow';

export interface PhotoAdjustments {
  zoom: number; // 0.5 to 2.5
  rotate: number; // -180 to 180
  flipH: boolean;
  flipV: boolean;
  panX: number;
  panY: number;
  brightness: number; // 50 to 150
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  blur: number; // 0 to 20
  opacity: number; // 0 to 100
  vignette: number; // 0 to 100
  sepia: number; // 0 to 100
  grayscale: number; // 0 to 100
}

export interface PhotoConfig {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  caption?: string;
  shape: PhotoShape;
  filter: PhotoFilter;
  adjustments: PhotoAdjustments;
}

export type MotifTheme =
  // XV Años
  | 'blue_roses_butterfly'        // Rosas azul rey, mariposas y chispas de oro (i1.jpg)
  | 'tiara_ruby_sparks'           // Tiara de rubí real y mariposas doradas en 3D (i23.jpg)
  | 'ruby_crown_butterflies'      // Alias
  | 'blue_heart_ribbon'           // Corazón tallado azul con cinta de raso y rosas (i2.png)
  | 'mirror_sparkle_xv'           // Espejo mágico de quinceañera con destellos de diamante
  | 'rose_gold_butterflies'       // Lluvia de mariposas en oro rosa y purpurina
  | 'orchid_crystal_gala'         // Guirnalda de orquídeas y cristales de gala
  // Bodas & Aniversarios
  | 'wax_seal_envelope'           // Sobre blanco con sello de lacre dorado y olivo (b1.jpg)
  | 'gold_roses_eucalyptus'       // Marco geométrico de oro y eucalipto (i40.jpg)
  | 'pampas_boho_minimal'         // Ramos de pampas secas en esquinas opuestas (i50.jpg)
  | 'white_floral_arch_candles'   // Arcos de flores blancas nupciales y velas cálidas
  | 'starry_gold_dust'            // Constelaciones de noche estrellada con polvo de oro
  | 'heraldic_gold_monogram'      // Monograma heráldico con laureles en pan de oro
  | 'navy_blue_floral_wreath'     // Azul marino con coronas botánicas (i33.jpg)
  // Infantiles & Cuentos
  | 'quilted_princess_crown'      // Capitonado rosa, corona con perlas y número 1 (i3.jpg)
  | 'mermaid_ocean_scales'        // Sirena pastel, conchas, tortuga y ballenita (i4.jpg)
  | 'fairytale_castle_frog'       // Castillo encantado, sapito con corona y luciérnagas
  | 'enchanted_fairy_mushrooms'   // Bosque mágico con hadas, honguitos y destellos
  | 'moon_stars_clouds'           // Nubes esponjosas, luna sonriente y estrellas doradas
  | 'hot_air_balloons_pastel'     // Globos aerostáticos pastel y banderines de fiesta
  // Cumpleaños & Fiestas
  | 'champagne_bowtie_party'      // Copa con moño negro de seda y luces bokeh (i35.jpg)
  | 'metallic_confetti_streamers' // Explosión de confeti metálico y serpentinas doradas
  | 'disco_mirror_ball'           // Esfera de espejos disco con resplandores neón pastel
  | 'gold_black_balloons'         // Globos de oro y negro con luces colgantes (i54.jpg)
  | 'sunset_twilight_lights'      // Luces festivas de verbena al atardecer
  // Graduaciones & Especiales
  | 'cap_laurel_diploma'          // Birrete con hojas de laurel de oro y diploma
  | 'sacred_chalice_wheat'        // Cáliz sacro con espigas de trigo y luz divina
  | 'none';

export interface CardStyleConfig {
  transparentBg?: boolean;    // Si es true, QUITA el recuadro blanco por completo!
  bgColor?: string;           // Color de fondo del recuadro
  borderRadius?: number;      // 0 a 48px
  borderWidth?: number;       // 0 a 6px
  borderColor?: string;       // Color del borde del recuadro
  hasShadow?: boolean;        // Sombra on/off
  backdropBlur?: number;      // 0 a 20px
}

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradient?: {
    from: string;
    via?: string;
    to: string;
    direction: string;
    presetName?: string;
  };
  texture?: BackgroundTexture;
  imageUrl?: string;
  behavior: BackgroundBehavior;
  scale?: 'cover' | 'contain' | 'repeat';
  position?: 'center' | 'top' | 'bottom';
  overlayOpacity: number; // 0 to 100
  overlayColor?: string;
  blur: number; // 0 to 20
  opacity?: number;
  motifTheme?: MotifTheme; // Motivos y efectos visuales inspirados en el ZIP
  customMotifs?: InvitationMotif[];
  cardStyle?: CardStyleConfig; // Control del recuadro de texto
}

export interface InvitationMotif {
  id: string;
  groupId?: string;
  name: string;
  src: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export type FontFamilyType =
  | 'cormorant'
  | 'playfair'
  | 'cinzel'
  | 'cinzel_dec'
  | 'bodoni'
  | 'prata'
  | 'marcellus'
  | 'script'
  | 'brush'
  | 'pinyon'
  | 'parisienne'
  | 'allura'
  | 'fredoka'
  | 'comfortaa'
  | 'outfit'
  | 'urbanist'
  | 'montserrat'
  | 'sans'
  | 'anton'
  | 'archivo_black'
  | 'barlow_condensed'
  | 'bebas_neue'
  | 'black_ops_one'
  | 'bungee'
  | 'changa_one'
  | 'exo_2'
  | 'fjalla_one'
  | 'league_spartan'
  | 'lexend'
  | 'manrope'
  | 'oswald'
  | 'raleway'
  | 'roboto_condensed'
  | 'rubik'
  | 'sora'
  | 'teko'
  | 'work_sans'
  | 'archivo';

export interface TypographyConfig {
  fontFamily: FontFamilyType;
  fontSize: number; // in px
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color: string;
  letterSpacing: number; // in px
  lineHeight: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUppercase?: boolean;
  textShadow?: boolean;
  textOutline?: boolean;
  textOutlineColor?: string;
  textOutlineWidth?: number;
  alignment?: 'left' | 'center' | 'right';
}

export type ContentPresentationMode = 'card' | 'plain' | 'tab';

export type SectionType =
  | 'portada'
  | 'nombres'
  | 'fotografia'
  | 'historia'
  | 'bienvenida'
  | 'dedicatoria'
  | 'fecha'
  | 'hora'
  | 'cuenta_regresiva'
  | 'ubicacion'
  | 'google_maps'
  | 'itinerario'
  | 'ceremonia'
  | 'recepcion'
  | 'vestimenta'
  | 'galeria'
  | 'musica'
  | 'rsvp'
  | 'regalos'
  | 'mesa_regalos'
  | 'datos_bancarios'
  | 'contacto'
  | 'info_adicional'
  | 'fairytale_scene';

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface StoryMilestone {
  id: string;
  yearOrDate: string;
  title: string;
  description: string;
  photoUrl?: string;
}

export interface ButtonCustomConfig {
  buttonStyleId: string; // 1 to 50
  label: string;
  customColor?: string;
  customBgColor?: string;
  customBorderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  fontSize?: number;
  fontFamily?: FontFamilyType;
  hasShadow?: boolean;
  animation?: 'none' | 'pulse' | 'shimmer' | 'bounce';
  icon?: string;
  action?: 'rsvp' | 'location' | 'gallery' | 'music' | 'itinerary' | 'gifts' | 'whatsapp' | 'custom_url';
  targetUrl?: string;
}

export interface GalleryConfig {
  layout: 'masonry' | 'carousel' | 'grid' | 'collage' | 'polaroid';
  enableLightbox: boolean;
  showCaptions: boolean;
  photos: PhotoConfig[];
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content?: string;
  enabled: boolean;
  presentationMode?: ContentPresentationMode; // 'card' (Recuadro), 'plain' (Solo texto), 'tab' (Pestaña)
  background: BackgroundConfig;
  typography: TypographyConfig; // base default
  titleTypography?: TypographyConfig;     // tipografía independiente para título
  subtitleTypography?: TypographyConfig;  // tipografía independiente para subtítulo
  contentTypography?: TypographyConfig;   // tipografía independiente para mensaje/contenido
  verticalAlign?: 'top' | 'center' | 'bottom';
  horizontalAlign?: 'left' | 'center' | 'right';
  photoPosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  offsetX?: number;
  offsetY?: number;
  isFullScreen?: boolean;
  photo?: PhotoConfig;
  itinerary?: ItineraryItem[];
  storyMilestones?: StoryMilestone[];
  customButton?: ButtonCustomConfig;
  countdownPosition?: 'top' | 'center' | 'bottom';
  countdownStyle?: 'clean_numbers' | 'boxed';
  dressCode?: {
    style: string;
    description: string;
    colors: string[];
    disallowedColors?: string[];
    hideColorPalette?: boolean;
  };
  location?: {
    venueName: string;
    address: string;
    googleMapsUrl?: string;
    embedMapUrl?: string;
  };
  gifts?: {
    registryUrl?: string;
    liverpoolCode?: string;
    amazonWishlist?: string;
    message?: string;
  };
  bank?: {
    bankName: string;
    beneficiary: string;
    accountNumber: string;
    clabe: string;
    concept?: string;
  };
  galleryConfig?: GalleryConfig;
  fairytaleData?: {
    princessName: string;
    age: number | string;
    castleTitle: string;
    enchantedStory: string;
    showFireflies: boolean;
    frogQuote: string;
  };
  customFields?: Record<string, any>;
}

export interface AudioTrackConfig {
  enabled: boolean;
  type: 'synth_ambient' | 'custom_upload';
  synthStyle: 'romantic_harp' | 'piano_ballad' | 'celebration_waltz' | 'gentle_celestial' | 'fairytale_lullaby';
  customAudioUrl?: string;
  fileName?: string;
  volume: number;
  autoplayAfterOpen: boolean;
  showFloatingPlayer: boolean;
}

export interface RSVPEventSettings {
  enabled: boolean;
  deadlineDate: string;
  maxCompanionsPerPass: number; // 1 to 5
  customMessage: string;
  collectDietaryInfo: boolean;
  collectPhone: boolean;
  requirePinToConfirm?: boolean;
}

export interface HostingerPublishConfig {
  isConfigured: boolean;
  ftpHost?: string;
  ftpUser?: string;
  ftpPort?: number;
  remoteDir?: string;
  remoteSlug?: string;
  customDomain?: string;
  publicUrl?: string;
  lastPublishedAt?: string;
  publishStatus?: 'idle' | 'publishing' | 'published' | 'error';
  errorMessage?: string;
}

export interface Invitation {
  id: string;
  templateId: string;
  category: 'bodas' | 'xv_anos' | 'cumpleanos' | 'graduaciones' | 'infantiles' | 'especiales';
  title: string;
  names: string;
  partnerNames?: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:mm
  eventLocation: string;
  presentationFormat: PresentationFormat;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  globalFontFamily?: FontFamilyType;
  audioTrack: AudioTrackConfig;
  rsvpSettings: RSVPEventSettings;
  sections: SectionConfig[];
  gallery: PhotoConfig[];
  envelope: {
    waxColor: string;
    sealIcon: 'initials' | 'heart' | 'ring' | 'crown' | 'star' | 'butterfly' | 'flower';
    paperColor: string;
    liningPattern: 'floral' | 'marble' | 'gold_leaves' | 'solid' | 'fairytale';
  };
  hostingerPublish?: HostingerPublishConfig;
  stats?: {
    views: number;
    rsvps: number;
  };
  createdAt?: string;
  updatedAt?: string;
  /** Saved reusable design; kept separate from ordinary invitations in the dashboard. */
  savedTemplate?: boolean;
  templateDescription?: string;
}

export interface RSVPRecord {
  id: string;
  invitationId: string;
  guestName: string;
  phone?: string;
  email?: string;
  companionsCount: number;
  attendance: boolean;
  dietaryRestrictions?: string;
  message?: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInCount: number;
  checkInHistory?: Array<{
    timestamp: string;
    entered: number;
    totalEntered: number;
  }>;
  createdAt: string;
}
