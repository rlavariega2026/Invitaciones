import React, { useState, useEffect, useRef } from 'react';
import {
  Invitation,
  PresentationFormat,
  SectionConfig,
  BackgroundTexture,
  BackgroundType,
  FontFamilyType,
  ContentPresentationMode,
  PhotoConfig,
  PhotoShape,
  MotifTheme,
  InvitationMotif,
  TypographyConfig,
} from '../../types/invitation';
import { TEMPLATES_CATALOG, FEATURED_TEMPLATES, buildInvitationFromTemplate } from '../../data/templates';
import { BUTTON_CATALOG } from '../../data/buttonCatalog';
import { InvitationContainer } from '../invitation/InvitationContainer';
import { PhotoEditorModal } from '../photo-editor/PhotoEditorModal';
import { HostingerPublishModal } from '../hostinger/HostingerPublishModal';
import { SaveTemplateModal } from '../templates/SaveTemplateModal';
import { CustomButtonRenderer } from '../buttons/CustomButtonRenderer';
import { ambientMusic } from '../../audio/ambientMusic';
import { MOTIF_LIBRARY } from '../../data/motifLibrary';
import { getInvitationUrl } from '../../utils/invitationUrl';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Eye,
  Share2,
  Undo2,
  Redo2,
  Layout,
  Type,
  Palette,
  Image as ImageIcon,
  Music,
  CheckSquare,
  Layers,
  Smartphone,
  Monitor,
  Check,
  Sparkles,
  Upload,
  Globe,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  MousePointerClick,
  Trash2,
  Plus,
  Crown,
  Crop,
  Camera,
  FolderOpen,
  Box,
  Bookmark,
  Move,
  Maximize,
  MapPin,
  Clock,
} from 'lucide-react';

interface InvitationEditorProps {
  initialInvitation: Invitation;
  onBack: () => void;
  onPreviewPublic: (id: string) => void;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  initialInvitation,
  onBack,
  onPreviewPublic,
}) => {
  const [invitation, setInvitation] = useState<Invitation>(initialInvitation);
  const [history, setHistory] = useState<Invitation[]>([initialInvitation]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Default to 'sections' so all 22 sections are immediately accessible and editable!
  const [activeTab, setActiveTab] = useState<
    'sections' | 'motifs' | 'templates' | 'format' | 'buttons' | 'music' | 'info'
  >('sections');

  const [devicePreview, setDevicePreview] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-portada');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoConfig | null>(null);
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedMotifId, setSelectedMotifId] = useState<string | null>(null);

  // Sub-tab for independent text elements: Título, Subtítulo, Contenido
  const [selectedTextElement, setSelectedTextElement] = useState<'title' | 'subtitle' | 'content'>('title');

  // Filter for templates drawer
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('todas');
  const [buttonCategoryFilter, setButtonCategoryFilter] = useState<string>('todas');
  const [textureTab, setTextureTab] = useState<'zip' | 'telas' | 'metales' | 'flores' | 'fantasia'>('zip');

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const sectionPhotoInputRef = useRef<HTMLInputElement>(null);
  const galleryMultipleInputRef = useRef<HTMLInputElement>(null);
  const motifUploadInputRef = useRef<HTMLInputElement>(null);

  // Autosave when invitation changes with a debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      await api.saveInvitation(invitation);
      setIsSaving(false);
      setShowSavedFeedback(true);
      const hideFeedback = setTimeout(() => setShowSavedFeedback(false), 2000);
      return () => clearTimeout(hideFeedback);
    }, 1200);

    return () => clearTimeout(timer);
  }, [invitation]);

  const updateInvitationState = (updated: Invitation) => {
    setInvitation(updated);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setInvitation(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setInvitation(history[historyIndex + 1]);
    }
  };

  const handleSwitchTemplate = (templateId: string) => {
    const found = TEMPLATES_CATALOG.find((t) => t.id === templateId);
    if (!found) return;
    const newInv = buildInvitationFromTemplate(found, invitation.id);
    newInv.title = invitation.title;
    newInv.names = invitation.names;
    newInv.eventDate = invitation.eventDate;
    newInv.eventTime = invitation.eventTime;
    newInv.eventLocation = invitation.eventLocation;
    updateInvitationState(newInv);
  };

  const handleFormatChange = (format: PresentationFormat) => {
    updateInvitationState({
      ...invitation,
      presentationFormat: format,
    });
  };

  const selectedSection = invitation.sections.find((s) => s.id === selectedSectionId) || invitation.sections[0];

  const updateSelectedSection = (fields: Partial<SectionConfig>) => {
    if (!selectedSection) return;
    const updatedSections = invitation.sections.map((s) =>
      s.id === selectedSection.id ? { ...s, ...fields } : s
    );
    updateInvitationState({ ...invitation, sections: updatedSections });
  };

  const sectionMotifs = selectedSection?.background.customMotifs || [];
  const selectedMotif = sectionMotifs.find((motif) => motif.id === selectedMotifId) || null;
  const motifGroupId = selectedMotif?.groupId || selectedMotif?.id;
  const motifSectionCount = motifGroupId ? invitation.sections.filter((section) => section.background.customMotifs?.some((motif) => motif.groupId === motifGroupId || motif.id === motifGroupId)).length : 0;
  const addMotif = (src: string, name: string) => {
    const groupId = `motif-group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const motif: InvitationMotif = {
      id: `motif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      groupId, name, src, x: 50, y: 50, width: 26, rotation: 0, opacity: 100, zIndex: sectionMotifs.length,
    };
    updateInvitationState({
      ...invitation,
      sections: invitation.sections.map((section) => ({
        ...section,
        background: {
          ...section.background,
          customMotifs: [...(section.background.customMotifs || []), { ...motif, id: `${motif.id}-${section.id}` }],
        },
      })),
    });
    setSelectedMotifId(`${motif.id}-${selectedSection.id}`);
  };
  const updateMotif = (fields: Partial<InvitationMotif>) => {
    if (!selectedMotif) return;
    const matches = (motif: InvitationMotif) => selectedMotif.groupId ? motif.groupId === selectedMotif.groupId : motif.id === selectedMotif.id;
    updateInvitationState({
      ...invitation,
      sections: invitation.sections.map((section) => ({
        ...section,
        background: { ...section.background, customMotifs: section.background.customMotifs?.map((motif) => matches(motif) ? { ...motif, ...fields } : motif) },
      })),
    });
  };
  const handleMotifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.name.toLowerCase().endsWith('.png') || (file.type && file.type !== 'image/png')) return;
    try {
      const imageUrl = await api.uploadImage(file);
      if (selectedMotif) updateMotif({ src: imageUrl, name: file.name });
      else addMotif(imageUrl, file.name);
    } catch (error) {
      console.error('No se pudo cargar el PNG original', error);
    }
  };
  const alignMotif = (horizontal: 'left' | 'center' | 'right', vertical: 'top' | 'center' | 'bottom') => {
    if (!selectedMotif) return;
    updateMotif({
      x: horizontal === 'left' ? 15 : horizontal === 'right' ? 85 : 50,
      y: vertical === 'top' ? 15 : vertical === 'bottom' ? 85 : 50,
    });
  };
  const applyMotifToAllSections = () => {
    if (!selectedMotif) return;
    const groupId = selectedMotif.groupId || `motif-group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    updateInvitationState({
      ...invitation,
      sections: invitation.sections.map((section) => {
        const motifs = section.background.customMotifs || [];
        const existing = motifs.find((motif) => motif.groupId === groupId || motif.id === selectedMotif.id);
        const shared = { ...selectedMotif, groupId };
        const next = existing
          ? motifs.map((motif) => motif === existing ? { ...motif, ...shared, id: motif.id } : motif)
          : [...motifs, { ...shared, id: `${selectedMotif.id}-${section.id}` }];
        return { ...section, background: { ...section.background, customMotifs: next } };
      }),
    });
    if (!selectedMotif.groupId) setSelectedMotifId(`${selectedMotif.id}-${selectedSection.id}`);
  };
  const removeMotifFromAllSections = () => {
    if (!selectedMotif) return;
    const matches = (motif: InvitationMotif) => selectedMotif.groupId ? motif.groupId === selectedMotif.groupId : motif.id === selectedMotif.id;
    updateInvitationState({
      ...invitation,
      sections: invitation.sections.map((section) => ({
        ...section,
        background: { ...section.background, customMotifs: section.background.customMotifs?.filter((motif) => !matches(motif)) },
      })),
    });
    setSelectedMotifId(null);
  };

  // Helper to update independent typography for title, subtitle, or content
  const updateElementTypography = (
    element: 'title' | 'subtitle' | 'content',
    fields: Partial<TypographyConfig>
  ) => {
    if (!selectedSection) return;

    if (element === 'title') {
      const current = selectedSection.titleTypography || selectedSection.typography || {};
      updateSelectedSection({ titleTypography: { ...current, ...fields } });
    } else if (element === 'subtitle') {
      const current = selectedSection.subtitleTypography || selectedSection.typography || {};
      updateSelectedSection({ subtitleTypography: { ...current, ...fields } });
    } else {
      const current = selectedSection.contentTypography || selectedSection.typography || {};
      updateSelectedSection({ contentTypography: { ...current, ...fields } });
    }
  };

  // Section photo upload handler
  const handleSectionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSection) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newPhoto: PhotoConfig = {
          id: selectedSection.photo?.id || `ph-${Date.now()}`,
          url: dataUrl,
          alt: selectedSection.title,
          shape: selectedSection.photo?.shape || 'arch',
          filter: selectedSection.photo?.filter || 'none',
          adjustments: selectedSection.photo?.adjustments || {
            zoom: 1,
            rotate: 0,
            flipH: false,
            flipV: false,
            panX: 0,
            panY: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            opacity: 100,
            vignette: 0,
            sepia: 0,
            grayscale: 0,
          },
        };
        updateSelectedSection({ photo: newPhoto });
      }
    };
    reader.readAsDataURL(file);
  };

  // Multiple photos upload for Gallery section
  const handleGalleryMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newPhoto: PhotoConfig = {
            id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            alt: file.name,
            shape: 'polaroid',
            filter: 'none',
            adjustments: {
              zoom: 1,
              rotate: 0,
              flipH: false,
              flipV: false,
              panX: 0,
              panY: 0,
              brightness: 100,
              contrast: 100,
              saturation: 100,
              blur: 0,
              opacity: 100,
              vignette: 0,
              sepia: 0,
              grayscale: 0,
            },
          };

          setInvitation((prevInv) => {
            const updatedGallery = [...(prevInv.gallery || []), newPhoto];
            const updatedSections = prevInv.sections.map((s) => {
              if (s.type === 'galeria') {
                const existingPhotos = s.galleryConfig?.photos || [];
                return {
                  ...s,
                  galleryConfig: {
                    layout: s.galleryConfig?.layout || 'masonry',
                    enableLightbox: true,
                    showCaptions: true,
                    photos: [...existingPhotos, newPhoto],
                  },
                };
              }
              return s;
            });
            return {
              ...prevInv,
              gallery: updatedGallery,
              sections: updatedSections,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Custom audio upload handler
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateInvitationState({
          ...invitation,
          audioTrack: {
            ...invitation.audioTrack,
            enabled: true,
            type: 'custom_upload',
            customAudioUrl: dataUrl,
            fileName: file.name,
          },
        });
        ambientMusic.setCustomAudio(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom background texture/image upload handler for this specific section
  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSection) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateSelectedSection({
          background: {
            ...selectedSection.background,
            type: 'image',
            imageUrl: dataUrl,
            scale: 'cover',
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // 24 Curated Pastel & Luxury Colors Palette
  const luxuryColorsPalette = [
    { name: 'Marfil Seda', hex: '#FAF8F5' },
    { name: 'Crema Champán', hex: '#FAF6EE' },
    { name: 'Rosa Empolvado', hex: '#FCEFEF' },
    { name: 'Rosa Cuarzo', hex: '#F7D6D0' },
    { name: 'Lavanda Celestial', hex: '#EAE6F8' },
    { name: 'Violeta Noble', hex: '#DDD7F3' },
    { name: 'Azul Cielo Pastel', hex: '#EBF5FB' },
    { name: 'Azul Rey Suave', hex: '#D0E1FD' },
    { name: 'Menta Salvia', hex: '#E2ECE5' },
    { name: 'Verde Bosque Tenue', hex: '#D4E3D8' },
    { name: 'Arena Cálida', hex: '#F4EFEA' },
    { name: 'Terracota Boho', hex: '#F9EBEA' },
    { name: 'Dorado Champán', hex: '#F5EADB' },
    { name: 'Melocotón Suave', hex: '#FDF2E9' },
    { name: 'Gris Perla', hex: '#F2F3F4' },
    { name: 'Blanco Puro', hex: '#FFFFFF' },
    { name: 'Azul Noche Real', hex: '#0D1929' },
    { name: 'Negro Grafito', hex: '#1A202C' },
    { name: 'Vino Borgoña', hex: '#3A080E' },
    { name: 'Verde Esmeralda', hex: '#103B2B' },
    { name: 'Rubí Quinceañera', hex: '#9B111E' },
    { name: 'Azul Rey Clásico', hex: '#103B75' },
    { name: 'Oro Pulido', hex: '#DFC48B' },
    { name: 'Oro Rosa Metálico', hex: '#B76E79' },
  ];

  // 16 Pre-designed Luxury Gradient Presets
  const luxuryGradientPresets = [
    { name: 'Oro Champán Real', from: '#FAF5EB', via: '#DFC48B', to: '#FAF5EB' },
    { name: 'Atardecer Rosé', from: '#FCEFEF', via: '#F7D6D0', to: '#FAF5EB' },
    { name: 'Aurora Lavanda', from: '#EAE6F8', via: '#FCEFEF', to: '#FAF5EB' },
    { name: 'Cielo Azul Nupcial', from: '#EBF5FB', via: '#D0E1FD', to: '#FFFFFF' },
    { name: 'Esmeralda & Menta', from: '#E2ECE5', via: '#D4E3D8', to: '#FAF8F5' },
    { name: 'Rubí & Oro Imperial', from: '#FFF8F6', via: '#FADBD8', to: '#FAF5EB' },
    { name: 'Pampas & Arena', from: '#FAF7F2', via: '#F2ECE4', to: '#FFFFFF' },
    { name: 'Noche de Estrellas', from: '#0D1929', via: '#1A365D', to: '#0A192F' },
    { name: 'Grafito & Oro', from: '#1A202C', via: '#2D3748', to: '#DFC48B' },
    { name: 'Perla & Nácar', from: '#FFFFFF', via: '#F4EFEA', to: '#FFFFFF' },
    { name: 'Mariposa Azul Rey', from: '#F0F4FA', via: '#BFDBFE', to: '#EFF6FF' },
    { name: 'Capitonado Princesa', from: '#FFF0F5', via: '#FBCFE8', to: '#FFF0F5' },
    { name: 'Sirena Océano', from: '#E0F2F1', via: '#EDE9FE', to: '#FCE7F3' },
    { name: 'Champaña Festivo', from: '#FAF5EE', via: '#FEF3C7', to: '#FAF5EE' },
    { name: 'Vino & Oro Rosa', from: '#FDF2F4', via: '#FECDD3', to: '#FAF5EE' },
    { name: 'Sol Toscano', from: '#FEF9C3', via: '#FED7AA', to: '#FAF8F5' },
  ];

  const formatsList: Array<{ id: PresentationFormat; title: string; desc: string }> = [
    { id: 'cinematic', title: 'Cinematográfica', desc: 'Desplazamiento continuo con fondos por sección y parallax' },
    { id: 'envelope', title: 'Sobre de Gala', desc: 'Sobre digital con sello de cera que se abre interactivamente' },
    { id: 'scenes', title: 'Por Escenas', desc: 'Apartados como diapositivas con navegación paso a paso' },
    { id: 'book', title: 'Libro Editorial', desc: 'Páginas interiores con efecto editorial de pasar hoja' },
    { id: 'magazine', title: 'Revista Vogue', desc: 'Composiciones asimétricas inspiradas en revistas de moda' },
    { id: 'gallery', title: 'Galería Visual', desc: 'Fotografías protagonistas con recuerdos del evento' },
    { id: 'minimal', title: 'Minimalista', desc: 'Espacios visuales amplios y tipografía pura' },
    { id: 'interactive', title: 'Interactiva', desc: 'Tarjetas desplegables con toques interactivos' },
    { id: 'fairytale_book', title: 'Cuento de Princesas', desc: 'Formato ilustrado mágico con libro desplegable y luciérnagas' },
  ];

  const fontOptions: Array<{ id: FontFamilyType; label: string }> = [
    { id: 'cormorant', label: 'Cormorant Garamond (Elegante Clásica)' },
    { id: 'playfair', label: 'Playfair Display (Moderna de Revista)' },
    { id: 'cinzel', label: 'Cinzel (Gala Imperial)' },
    { id: 'cinzel_dec', label: 'Cinzel Decorative (Ornamento Real)' },
    { id: 'bodoni', label: 'Bodoni Moda (Alta Costura)' },
    { id: 'prata', label: 'Prata (Elegancia Solemne)' },
    { id: 'marcellus', label: 'Marcellus (Heráldica)' },
    { id: 'script', label: 'Great Vibes (Manuscrita Caligráfica)' },
    { id: 'brush', label: 'Alex Brush (Cursiva Romántica)' },
    { id: 'pinyon', label: 'Pinyon Script (Cortejo Quinceañera)' },
    { id: 'parisienne', label: 'Parisienne (Lazo Francés)' },
    { id: 'allura', label: 'Allura (Fluida & Suave)' },
    { id: 'fredoka', label: 'Fredoka (Infantil & Dulce)' },
    { id: 'comfortaa', label: 'Comfortaa (Lúdica & Redonda)' },
    { id: 'outfit', label: 'Outfit (Minimalista Contemporánea)' },
    { id: 'urbanist', label: 'Urbanist (Geométrica Limpia)' },
    { id: 'montserrat', label: 'Montserrat (Gala Urbana)' },
    { id: 'sans', label: 'Plus Jakarta Sans (Sans Limpia)' },
  ];

  const photoShapesList: Array<{ id: PhotoShape; label: string }> = [
    { id: 'fade_bottom_gradient', label: 'Degradado Suave Inferior (i2, i33)' },
    { id: 'heart_ornamental_roses', label: 'Corazón con Rosas y Cinta (i2.png)' },
    { id: 'arch_with_bottom_roses', label: 'Arco con Flores Abajo (i2.jpg)' },
    { id: 'gold_wreath_circular', label: 'Corona Laurel de Oro (i40.jpg)' },
    { id: 'organic_pebble', label: 'Piedra de Playa Asimétrica (i33.jpg)' },
    { id: 'quilted_gold_crest', label: 'Capitonado con Corona Real (i3.jpg)' },
    { id: 'gold_geometric_box', label: 'Marco Octagonal Dorado (i40.jpg)' },
    { id: 'arch', label: 'Arco Romano Clásico' },
    { id: 'oval', label: 'Óvalo Fino' },
    { id: 'circle', label: 'Círculo Perfecto' },
    { id: 'heart', label: 'Corazón Romántico' },
    { id: 'polaroid', label: 'Estilo Polaroid' },
    { id: 'gold_frame', label: 'Marco Dorado Filigrana' },
    { id: 'floral_frame', label: 'Marco Floral Pastel' },
    { id: 'paper_edge', label: 'Borde de Papel Artesanal' },
    { id: 'diamond', label: 'Diamante' },
    { id: 'rectangle', label: 'Rectangular Limpio' },
  ];

  // 25 Luxury Motifs
  const motifOptions: Array<{ id: MotifTheme; label: string; icon: string }> = [
    // XV Años
    { id: 'blue_roses_butterfly', label: '1. Rosas Azul Rey, Mariposas y Chispas de Oro (i1.jpg)', icon: '🦋' },
    { id: 'tiara_ruby_sparks', label: '2. Tiara de Rubí Real y Mariposas Doradas 3D (i23.jpg)', icon: '👑' },
    { id: 'blue_heart_ribbon', label: '3. Corazón Floral Azul con Cintas de Raso (i2.png)', icon: '💙' },
    { id: 'mirror_sparkle_xv', label: '4. Espejo Mágico de Quinceañera con Diamantes', icon: '✨' },
    { id: 'rose_gold_butterflies', label: '5. Lluvia de Mariposas en Oro Rosa y Purpurina', icon: '🦋' },
    { id: 'orchid_crystal_gala', label: '6. Guirnalda de Orquídeas y Cristales de Gala', icon: '💎' },
    // Bodas
    { id: 'wax_seal_envelope', label: '7. Sobre Blanco con Sello de Lacre Dorado (b1.jpg)', icon: '✉️' },
    { id: 'gold_roses_eucalyptus', label: '8. Marco Geométrico de Oro y Eucalipto (i40.jpg)', icon: '🌿' },
    { id: 'pampas_boho_minimal', label: '9. Ramos de Pampas Secas en Esquinas (i50.jpg)', icon: '🌾' },
    { id: 'white_floral_arch_candles', label: '10. Arcos de Flores Blancas Nupciales y Velas', icon: '🕊️' },
    { id: 'starry_gold_dust', label: '11. Constelaciones de Noche Estrellada con Oro', icon: '⭐' },
    { id: 'heraldic_gold_monogram', label: '12. Monograma Heráldico con Laureles de Oro', icon: '⚜️' },
    // Infantiles
    { id: 'quilted_princess_crown', label: '13. Capitonado Rosa, Corona con Perlas (i3.jpg)', icon: '👸' },
    { id: 'mermaid_ocean_scales', label: '14. Escamas de Sirena y Fauna Marina (i4.jpg)', icon: '🧜‍♀️' },
    { id: 'fairytale_castle_frog', label: '15. Castillo en el Lago con Luciérnagas y Sapito', icon: '🐸' },
    { id: 'enchanted_fairy_mushrooms', label: '16. Bosque Mágico con Hadas y Honguitos', icon: '🧚‍♀️' },
    { id: 'moon_stars_clouds', label: '17. Nubes Esponjosas, Luna Sonriente y Estrellas', icon: '🌙' },
    { id: 'hot_air_balloons_pastel', label: '18. Globos Aerostáticos Pastel y Banderines', icon: '🎈' },
    // Cumpleaños & Fiestas
    { id: 'champagne_bowtie_party', label: '19. Copa de Champaña con Moño Negro y Bokeh (i35.jpg)', icon: '🥂' },
    { id: 'metallic_confetti_streamers', label: '20. Explosión de Confeti Metálico y Serpentinas', icon: '🎉' },
    { id: 'disco_mirror_ball', label: '21. Esfera de Espejos Disco con Luces Neón', icon: '🪩' },
    { id: 'gold_black_balloons', label: '22. Globos de Oro y Negro con Luces Colgantes (i54.jpg)', icon: '🎈' },
    { id: 'sunset_twilight_lights', label: '23. Luces Festivas de Verbena al Atardecer', icon: '💡' },
    // Especiales
    { id: 'cap_laurel_diploma', label: '24. Birrete con Hojas de Laurel de Oro y Diploma', icon: '🎓' },
    { id: 'sacred_chalice_wheat', label: '25. Cáliz Sacro con Espigas de Trigo y Luz Divina', icon: '✝️' },
    { id: 'none', label: 'Sin Motivo Decorativo Adicional', icon: '⚪' },
  ];

  const filteredTemplates =
    templateCategoryFilter === 'todas'
      ? FEATURED_TEMPLATES
      : FEATURED_TEMPLATES.filter((t) => t.category === templateCategoryFilter);

  const filteredButtons =
    buttonCategoryFilter === 'todas'
      ? BUTTON_CATALOG
      : BUTTON_CATALOG.filter((b) => b.category === buttonCategoryFilter);

  // Active typography configuration based on selected element tab (Title / Subtitle / Content)
  const activeElementTypo: TypographyConfig =
    selectedTextElement === 'title'
      ? selectedSection.titleTypography || selectedSection.typography || { fontFamily: 'cormorant', fontSize: 32, color: '#1A202C', letterSpacing: 1, lineHeight: 1.3 }
      : selectedTextElement === 'subtitle'
      ? selectedSection.subtitleTypography || selectedSection.typography || { fontFamily: 'cormorant', fontSize: 12, color: '#9C7A3C', letterSpacing: 2, lineHeight: 1.4 }
      : selectedSection.contentTypography || selectedSection.typography || { fontFamily: 'sans', fontSize: 14, color: '#4A5568', letterSpacing: 0, lineHeight: 1.6 };

  return (
    <div className="h-screen flex flex-col bg-[#FAF8F5] overflow-hidden text-slate-800">
      {/* Top Studio Bar */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#E8DEC8] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Panel</span>
          </button>
          <div className="h-4 w-px bg-stone-200" />
          <div>
            <h1 className="text-xs md:text-sm font-serif font-bold text-slate-800 truncate max-w-xs">
              {invitation.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-stone-500">
              <span>{invitation.names}</span>
              <span>·</span>
              <span className="capitalize">{invitation.presentationFormat}</span>
            </div>
          </div>
        </div>

        {/* Center: Autosave Status & Device Frame Switch */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-stone-500">
            {isSaving ? (
              <span className="animate-pulse text-amber-700">Guardando cambios...</span>
            ) : showSavedFeedback ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Guardado
              </span>
            ) : (
              <span className="text-stone-400">Guardado automático activo</span>
            )}
          </div>

          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                devicePreview === 'mobile' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Vista Móvil"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                devicePreview === 'desktop' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Vista Escritorio"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
              title="Deshacer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
              title="Rehacer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Guardar en Mis Plantillas (Requirement: Poner nombre al guardar en plantillas) */}
          <button
            onClick={() => setShowSaveTemplateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer shadow-xs"
            title="Guardar como plantilla propia"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#9C7A3C]" />
            <span className="hidden sm:inline">Guardar Plantilla</span>
          </button>

          {/* Hostinger Publishing Button */}
          <button
            onClick={() => setShowHostingerModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200 transition-colors cursor-pointer shadow-xs"
            title="Publicar en Hostinger"
          >
            <Globe className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Hostinger</span>
          </button>

          <button
            onClick={() => onPreviewPublic(invitation.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vista Invitado</span>
          </button>

          <button
            onClick={() => {
              const url = getInvitationUrl(invitation.id);
              navigator.clipboard.writeText(url);
              alert('¡Enlace de la invitación copiado al portapapeles!');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-stone-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-16 bg-white border-r border-[#E8DEC8] flex flex-col items-center py-3 space-y-2.5 shrink-0 overflow-y-auto">
          {[
            { id: 'sections', icon: CheckSquare, label: 'Secciones' },
            { id: 'motifs', icon: ImageIcon, label: 'Motivos PNG' },
            { id: 'templates', icon: Sparkles, label: '12 Modelos' },
            { id: 'format', icon: Layout, label: 'Formato' },
            { id: 'buttons', icon: MousePointerClick, label: '50 Botones' },
            { id: 'music', icon: Music, label: 'Música' },
            { id: 'info', icon: Layers, label: 'Datos' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF5EB] text-[#9C7A3C] shadow-xs ring-1 ring-[#DFC48B]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Configuration Drawer: Unified Full Section Studio */}
        <div className="w-80 md:w-96 bg-[#FDFBF7] border-r border-[#E8DEC8] flex flex-col overflow-y-auto shrink-0 p-5 space-y-5 text-xs">
          {/* TAB: SECCIONES (22) - ESTUDIO INDIVIDUAL COMPLETO */}
          {activeTab === 'sections' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">
                  Estudio Individual por Sección ({invitation.sections.length})
                </h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Selecciona la sección para editar sus textos, tipografía, fondo y foto de forma individual:
                </p>
              </div>

              {/* Quick Section Selector Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sección Activa para Editar:
                </label>
                <select
                  value={selectedSection.id}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-xs text-slate-900 cursor-pointer"
                >
                  {invitation.sections.map((sec, idx) => (
                    <option key={sec.id} value={sec.id}>
                      {idx + 1}. {sec.title} ({sec.presentationMode || 'card'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Active Toggle & Fullscreen Height */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Mostrar esta sección</span>
                    <span className="text-[10px] text-stone-500">Activa o desactiva en la invitación</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedSection.enabled}
                    onChange={(e) => updateSelectedSection({ enabled: e.target.checked })}
                    className="w-4 h-4 accent-[#9C7A3C] cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      Pantalla Completa (Fondo Inmersivo)
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Evita que la imagen de fondo se encoja al cambiar la fuente
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedSection.isFullScreen !== false}
                    onChange={(e) => updateSelectedSection({ isFullScreen: e.target.checked })}
                    className="w-4 h-4 accent-[#9C7A3C] cursor-pointer"
                  />
                </div>
              </div>

              {/* 1. MODALIDAD DE PRESENTACIÓN & CONTROL DEL RECUADRO */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 block text-xs">
                    1. Modalidad de Presentación
                  </span>
                  <Box className="w-4 h-4 text-stone-400" />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['card', 'plain', 'tab'] as ContentPresentationMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateSelectedSection({ presentationMode: mode })}
                      className={`py-2 px-1 rounded-xl font-medium transition-all cursor-pointer text-center ${
                        (selectedSection.presentationMode || 'card') === mode
                          ? 'bg-[#DFC48B] text-slate-900 font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {mode === 'card' ? 'Recuadro' : mode === 'plain' ? 'Solo Texto' : 'Pestaña'}
                    </button>
                  ))}
                </div>

                {/* Control para Quitar o Personalizar el Recuadro */}
                {selectedSection.presentationMode === 'card' && (
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-700 text-[11px] font-medium">
                        Quitar fondo del recuadro (100% Transparente):
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedSection.background.cardStyle?.transparentBg || false}
                        onChange={(e) =>
                          updateSelectedSection({
                            background: {
                              ...selectedSection.background,
                              cardStyle: {
                                ...selectedSection.background.cardStyle,
                                transparentBg: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-4 h-4 accent-[#9C7A3C] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. TEXTOS DE ESTA SECCIÓN */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-2.5">
                <span className="font-semibold text-slate-800 block text-xs">
                  2. Textos & Contenido de la Sección
                </span>
                <div>
                  <label className="block text-stone-600 mb-0.5 text-[11px]">Título Principal</label>
                  <input
                    type="text"
                    value={selectedSection.title}
                    onChange={(e) => updateSelectedSection({ title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-0.5 text-[11px]">Subtítulo o Frase Superior</label>
                  <input
                    type="text"
                    value={selectedSection.subtitle || ''}
                    onChange={(e) => updateSelectedSection({ subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-0.5 text-[11px]">Mensaje / Texto</label>
                  <textarea
                    rows={2}
                    value={selectedSection.content || ''}
                    onChange={(e) => updateSelectedSection({ content: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              {/* 3. TIPOGRAFÍAS INDEPENDIENTES (Título, Subtítulo, Contenido) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 block text-xs">
                    3. Tipografía Independiente de Texto
                  </span>
                  <Type className="w-4 h-4 text-stone-400" />
                </div>

                {/* Sub-tabs for Independent Elements */}
                <div className="flex p-1 bg-stone-100 rounded-xl text-[11px] font-medium">
                  {[
                    { id: 'title', label: 'Título' },
                    { id: 'subtitle', label: 'Subtítulo' },
                    { id: 'content', label: 'Mensaje' },
                  ].map((elem) => (
                    <button
                      key={elem.id}
                      type="button"
                      onClick={() => setSelectedTextElement(elem.id as any)}
                      className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                        selectedTextElement === elem.id
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {elem.label}
                    </button>
                  ))}
                </div>

                {/* Font Family for active element */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">
                    Fuente de {selectedTextElement === 'title' ? 'Título' : selectedTextElement === 'subtitle' ? 'Subtítulo' : 'Mensaje'}
                  </label>
                  <select
                    value={activeElementTypo.fontFamily || 'cormorant'}
                    onChange={(e) =>
                      updateElementTypography(selectedTextElement, {
                        fontFamily: e.target.value as FontFamilyType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs cursor-pointer"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-stone-600">Biblioteca PNG del ZIP (19 originales)</span>
                      <label className="cursor-pointer px-2 py-1 rounded-lg bg-stone-900 text-white text-[10px] font-semibold">
                        {selectedMotif ? 'Reemplazar PNG' : 'Subir PNG'}
                        <input ref={motifUploadInputRef} type="file" accept="image/png,.png" onChange={handleMotifUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto">
                      {MOTIF_LIBRARY.map((motif) => (
                        <button key={motif.id} type="button" aria-label={`Agregar ${motif.name} a todas las secciones`} title={`Agregar ${motif.name} a todas las secciones`} onClick={() => addMotif(motif.src, motif.name)} className="aspect-square p-1 rounded-lg border border-stone-200 bg-white hover:border-[#9C7A3C] hover:bg-[#FAF5EB]">
                          <img src={motif.src} alt={motif.name} loading="lazy" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                    {sectionMotifs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <div className="flex gap-1 overflow-x-auto">
                          {sectionMotifs.map((motif, index) => (
                            <div key={motif.id} className={`relative w-10 h-10 shrink-0 rounded border p-1 ${selectedMotif?.id === motif.id ? 'border-[#9C7A3C] ring-1 ring-[#9C7A3C]' : 'border-stone-200'}`}>
                              <button type="button" onClick={() => setSelectedMotifId(motif.id)} className="w-full h-full" title={`Seleccionar ${index + 1}. ${motif.name}`} aria-label={`Seleccionar ${motif.name}`}>
                                <img src={motif.src} alt="" className="w-full h-full object-contain" />
                              </button>
                              <span className="absolute -top-1 -left-1 rounded-full bg-stone-800 text-white text-[8px] px-1 pointer-events-none">{index + 1}</span>
                              <button type="button" onClick={() => { updateSelectedSection({ background: { ...selectedSection.background, customMotifs: sectionMotifs.filter((item) => item.id !== motif.id) } }); if (selectedMotifId === motif.id) setSelectedMotifId(null); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full border border-rose-300 bg-white text-rose-600 shadow-sm flex items-center justify-center" title={`Eliminar ${motif.name} de esta sección`} aria-label={`Eliminar ${motif.name} de esta sección`}><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                        {selectedMotif && <>
                          <div className="text-[10px] text-stone-600 truncate">Seleccionado: {selectedMotif.name} · arrástralo directamente en cualquier sección</div>
                          <div className="flex items-center justify-between text-[10px] text-stone-600">
                            <span>Aplicado en {motifSectionCount} de {invitation.sections.length} secciones</span>
                            <button type="button" onClick={applyMotifToAllSections} className="font-semibold text-[#765A2D] underline">Aplicar a todas</button>
                          </div>
                          <label className="block text-[10px] text-stone-600">Tamaño {Math.round(selectedMotif.width)}%
                            <input type="range" min="4" max="100" value={selectedMotif.width} onChange={(e) => updateMotif({ width: Number(e.target.value) })} className="w-full accent-[#9C7A3C]" />
                          </label>
                          <label className="block text-[10px] text-stone-600">Rotación {selectedMotif.rotation}°
                            <input type="range" min="-180" max="180" value={selectedMotif.rotation} onChange={(e) => updateMotif({ rotation: Number(e.target.value) })} className="w-full accent-[#9C7A3C]" />
                          </label>
                          <label className="block text-[10px] text-stone-600">Opacidad {selectedMotif.opacity}%
                            <input type="range" min="0" max="100" value={selectedMotif.opacity} onChange={(e) => updateMotif({ opacity: Number(e.target.value) })} className="w-full accent-[#9C7A3C]" />
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            <button type="button" onClick={() => alignMotif('left', 'center')} className="rounded border px-1 py-1 text-[10px]">Izquierda</button>
                            <button type="button" onClick={() => alignMotif('center', 'center')} className="rounded border px-1 py-1 text-[10px]">Centrar</button>
                            <button type="button" onClick={() => alignMotif('right', 'center')} className="rounded border px-1 py-1 text-[10px]">Derecha</button>
                            <button type="button" onClick={() => alignMotif('center', 'top')} className="rounded border px-1 py-1 text-[10px]">Arriba</button>
                            <button type="button" onClick={() => alignMotif('center', 'bottom')} className="rounded border px-1 py-1 text-[10px]">Abajo</button>
                            <div className="flex gap-1">
                              <button type="button" title="Enviar hacia atrás" onClick={() => updateMotif({ zIndex: Math.max(0, selectedMotif.zIndex - 1) })} className="flex-1 rounded border px-1 py-1 text-[10px]">↓ Capa</button>
                              <button type="button" title="Traer al frente" onClick={() => updateMotif({ zIndex: selectedMotif.zIndex + 1 })} className="flex-1 rounded border px-1 py-1 text-[10px]">↑</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <button type="button" onClick={() => { updateSelectedSection({ background: { ...selectedSection.background, customMotifs: sectionMotifs.filter((motif) => motif.id !== selectedMotif.id) } }); setSelectedMotifId(null); }} className="rounded-lg border border-rose-200 px-2 py-1.5 text-[10px] text-rose-600 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Quitar de esta sección</button>
                            <button type="button" onClick={removeMotifFromAllSections} className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1.5 text-[10px] text-rose-700 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Eliminar de todas</button>
                          </div>
                        </>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Font Size Slider & Number */}
                <div>
                  <div className="flex justify-between text-stone-700 mb-1 text-[11px]">
                    <span>Tamaño de Fuente:</span>
                    <span className="font-bold">{activeElementTypo.fontSize || 28}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="64"
                    value={activeElementTypo.fontSize || 28}
                    onChange={(e) =>
                      updateElementTypography(selectedTextElement, {
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#9C7A3C] cursor-pointer"
                  />
                </div>

                {/* Color Picker for active element */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Color del Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeElementTypo.color || '#2D3748'}
                      onChange={(e) =>
                        updateElementTypography(selectedTextElement, {
                          color: e.target.value,
                        })
                      }
                      className="w-9 h-8 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={activeElementTypo.color || '#2D3748'}
                      onChange={(e) =>
                        updateElementTypography(selectedTextElement, {
                          color: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Alignment buttons */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Alineación del Texto</label>
                  <div className="flex gap-1.5">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() =>
                          updateElementTypography(selectedTextElement, {
                            alignment: align,
                          })
                        }
                        className={`flex-1 py-1.5 rounded-xl border capitalize text-xs font-medium cursor-pointer ${
                          (activeElementTypo.alignment || 'center') === align
                            ? 'bg-[#DFC48B] text-slate-900 font-bold'
                            : 'bg-stone-50 text-stone-600'
                        }`}
                      >
                        {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. POSICIÓN DE TEXTO & FOTO EN PANTALLA (Mover a cualquier lado) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 block text-xs">
                    4. Posición de Texto & Foto en Pantalla
                  </span>
                  <Move className="w-4 h-4 text-stone-400" />
                </div>

                {/* Posición Vertical */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Ubicación Vertical del Bloque</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'top', label: 'Arriba' },
                      { id: 'center', label: 'Centro' },
                      { id: 'bottom', label: 'Abajo' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateSelectedSection({ verticalAlign: pos.id as any })}
                        className={`py-1.5 rounded-xl border font-medium cursor-pointer ${
                          (selectedSection.verticalAlign || 'center') === pos.id
                            ? 'bg-stone-900 text-white font-bold'
                            : 'bg-stone-50 text-stone-600'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posición Horizontal */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Alineación Horizontal del Bloque</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'left', label: 'Izquierda' },
                      { id: 'center', label: 'Centro' },
                      { id: 'right', label: 'Derecha' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateSelectedSection({ horizontalAlign: pos.id as any })}
                        className={`py-1.5 rounded-xl border font-medium cursor-pointer ${
                          (selectedSection.horizontalAlign || 'center') === pos.id
                            ? 'bg-stone-900 text-white font-bold'
                            : 'bg-stone-50 text-stone-600'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ubicación de la Foto respecto al Texto */}
                {selectedSection.photo && (
                  <div>
                    <label className="block text-stone-600 mb-1 text-[11px]">Ubicación de la Fotografía</label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: 'top', label: 'Arriba Texto' },
                        { id: 'center', label: 'En Medio' },
                        { id: 'bottom', label: 'Abajo Texto' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updateSelectedSection({ photoPosition: pos.id as any })}
                          className={`py-1.5 rounded-xl border font-medium cursor-pointer ${
                            (selectedSection.photoPosition || 'top') === pos.id
                              ? 'bg-[#DFC48B] text-slate-900 font-bold'
                              : 'bg-stone-50 text-stone-600'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desplazamiento Fino Vertical (Offset Y) */}
                <div>
                  <div className="flex justify-between text-stone-700 text-[11px] mb-0.5">
                    <span>Desplazamiento Vertical (Offset Y):</span>
                    <span className="font-bold">{selectedSection.offsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={selectedSection.offsetY || 0}
                    onChange={(e) => updateSelectedSection({ offsetY: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C] cursor-pointer"
                  />
                </div>

                {/* Desplazamiento Fino Horizontal (Offset X) */}
                <div>
                  <div className="flex justify-between text-stone-700 text-[11px] mb-0.5">
                    <span>Desplazamiento Horizontal (Offset X):</span>
                    <span className="font-bold">{selectedSection.offsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={selectedSection.offsetX || 0}
                    onChange={(e) => updateSelectedSection({ offsetX: Number(e.target.value) })}
                    className="w-full accent-[#9C7A3C] cursor-pointer"
                  />
                </div>
              </div>

              {/* 5. FONDO, DEGRADADOS & 35+ TEXTURAS (CON PALETA REAL) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3.5">
                <span className="font-semibold text-slate-800 block text-xs">
                  5. Fondo, Degradados & Texturas
                </span>

                {/* Subir imagen de fondo propia */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Subir imagen de fondo para esta sección</span>
                    <input
                      ref={bgImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-amber-900/80 text-center">
                    JPG, PNG o WebP aplicado al fondo exclusivo de esta sección
                  </p>
                </div>

                {selectedSection.background.type === 'image' && selectedSection.background.imageUrl && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-stone-100 border border-stone-200">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={selectedSection.background.imageUrl}
                        alt="Fondo"
                        className="w-10 h-10 object-cover rounded-lg border"
                      />
                      <span className="text-[11px] text-stone-700 truncate">Fondo personalizado activo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedSection({
                          background: { ...selectedSection.background, type: 'color', imageUrl: undefined },
                        })
                      }
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      title="Quitar fondo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Selector Tipo de Fondo */}
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Tipo de Fondo</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['texture', 'color', 'gradient', 'image'] as BackgroundType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          updateSelectedSection({
                            background: { ...selectedSection.background, type: t },
                          })
                        }
                        className={`py-1.5 rounded-xl border capitalize text-xs font-medium cursor-pointer ${
                          selectedSection.background.type === t
                            ? 'bg-[#DFC48B] text-slate-900 font-bold'
                            : 'bg-stone-50 text-stone-600'
                        }`}
                      >
                        {t === 'texture' ? 'Textura' : t === 'color' ? 'Color Sólido' : t === 'gradient' ? 'Degradado' : 'Imagen'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PALETA DE COLOR SÓLIDO (24 Colores) */}
                {selectedSection.background.type === 'color' && (
                  <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      Paleta de Colores de Gala & Pastel (24 Tonos)
                    </span>
                    <div className="grid grid-cols-6 gap-2 py-1">
                      {luxuryColorsPalette.map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            updateSelectedSection({
                              background: {
                                ...selectedSection.background,
                                type: 'color',
                                color: col.hex,
                              },
                            })
                          }
                          className={`w-9 h-9 rounded-xl border-2 transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                            selectedSection.background.color === col.hex
                              ? 'border-stone-900 scale-105 ring-2 ring-[#DFC48B]'
                              : 'border-white'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-200">
                      <span className="text-[11px] text-stone-600">Personalizado:</span>
                      <input
                        type="color"
                        value={selectedSection.background.color || '#FAF6EE'}
                        onChange={(e) =>
                          updateSelectedSection({
                            background: {
                              ...selectedSection.background,
                              type: 'color',
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={selectedSection.background.color || '#FAF6EE'}
                        onChange={(e) =>
                          updateSelectedSection({
                            background: {
                              ...selectedSection.background,
                              type: 'color',
                              color: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-2.5 py-1 rounded-lg border border-stone-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* PALETA DE DEGRADADOS (16 Presets) */}
                {selectedSection.background.type === 'gradient' && (
                  <div className="space-y-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      16 Degradados Preconfigurados de Alta Gama
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {luxuryGradientPresets.map((grad, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            updateSelectedSection({
                              background: {
                                ...selectedSection.background,
                                type: 'gradient',
                                gradient: {
                                  from: grad.from,
                                  via: grad.via,
                                  to: grad.to,
                                  direction: selectedSection.background.gradient?.direction || 'to bottom',
                                  presetName: grad.name,
                                },
                              },
                            })
                          }
                          className="p-2 rounded-xl border border-stone-200 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                          style={{
                            background: `linear-gradient(to right, ${grad.from}, ${grad.via ? grad.via + ',' : ''} ${grad.to})`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-slate-900 bg-white/80 px-1.5 py-0.5 rounded shadow-xs truncate block">
                            {grad.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Dirección del Degradado */}
                    <div>
                      <label className="block text-stone-600 mb-1 text-[11px]">Dirección del Degradado</label>
                      <div className="grid grid-cols-4 gap-1 text-[11px]">
                        {[
                          { id: 'to bottom', label: 'Abajo (↓)' },
                          { id: 'to bottom right', label: 'Diagonal (↘)' },
                          { id: 'to right', label: 'Derecha (→)' },
                          { id: 'to top right', label: 'Arriba (↗)' },
                        ].map((dir) => (
                          <button
                            key={dir.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  gradient: {
                                    from: selectedSection.background.gradient?.from || '#FAF5EB',
                                    via: selectedSection.background.gradient?.via,
                                    to: selectedSection.background.gradient?.to || '#DFC48B',
                                    direction: dir.id,
                                  },
                                },
                              })
                            }
                            className={`py-1 rounded-lg border text-center font-medium cursor-pointer ${
                              (selectedSection.background.gradient?.direction || 'to bottom') === dir.id
                                ? 'bg-stone-900 text-white'
                                : 'bg-white text-stone-600'
                            }`}
                          >
                            {dir.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 35+ TEXTURAS EN CATEGORÍAS */}
                {selectedSection.background.type === 'texture' && (
                  <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      Catálogo de 35+ Texturas de Lujo
                    </span>

                    <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                      {[
                        { id: 'zip', label: '📁 Del ZIP' },
                        { id: 'telas', label: '👑 Telas & Papel' },
                        { id: 'metales', label: '✨ Metales' },
                        { id: 'flores', label: '🌸 Flores' },
                        { id: 'fantasia', label: '🏰 Fantasía' },
                      ].map((tTab) => (
                        <button
                          key={tTab.id}
                          type="button"
                          onClick={() => setTextureTab(tTab.id as any)}
                          className={`px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
                            textureTab === tTab.id
                              ? 'bg-stone-900 text-white font-bold'
                              : 'bg-white text-stone-600 border'
                          }`}
                        >
                          {tTab.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {textureTab === 'zip' &&
                        [
                          { id: 'quilted_pink_pearl', label: 'Capitonado Rosa & Perlas (i3)' },
                          { id: 'embossed_floral_white', label: 'Papel Repujado Floral (b1)' },
                          { id: 'blue_roses_watercolor', label: 'Rosas Azul Rey Acuarela (i1)' },
                          { id: 'mermaid_scales_pastel', label: 'Escamas de Sirena (i4)' },
                          { id: 'pampas_dry_grass', label: 'Pampas Grass Secas (i50)' },
                          { id: 'gold_roses_eucalyptus', label: 'Rosas Oro & Eucalipto (i40)' },
                          { id: 'ruby_gold_filigree', label: 'Rubí & Filigrana Oro (i23)' },
                          { id: 'blue_night_floral', label: 'Azul Noche Floral (i33)' },
                          { id: 'champagne_bokeh', label: 'Champaña Bokeh (i35)' },
                          { id: 'blue_velvet_ribbon', label: 'Terciopelo Azul (i2)' },
                        ].map((tx) => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  type: 'texture',
                                  texture: tx.id as BackgroundTexture,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-medium cursor-pointer text-left ${
                              selectedSection.background.texture === tx.id
                                ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-bold ring-1 ring-[#DFC48B]'
                                : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            {tx.label}
                          </button>
                        ))}

                      {textureTab === 'telas' &&
                        [
                          { id: 'lace_wedding', label: 'Encaje Nupcial Blanco' },
                          { id: 'silk', label: 'Seda Satinada Fina' },
                          { id: 'velvet', label: 'Terciopelo Suave' },
                          { id: 'marble', label: 'Mármol Carrara Pulido' },
                          { id: 'handmade_paper', label: 'Papel Artesanal con Fibras' },
                          { id: 'luxury_paper', label: 'Papel Satinado Marfil' },
                          { id: 'linen', label: 'Lino Natural Rústico' },
                          { id: 'damask', label: 'Damasco Real Veneciano' },
                          { id: 'parchment_vintage', label: 'Pergamino Antiguo' },
                        ].map((tx) => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  type: 'texture',
                                  texture: tx.id as BackgroundTexture,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-medium cursor-pointer text-left ${
                              selectedSection.background.texture === tx.id
                                ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-bold ring-1 ring-[#DFC48B]'
                                : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            {tx.label}
                          </button>
                        ))}

                      {textureTab === 'metales' &&
                        [
                          { id: 'metal_gold', label: 'Oro Metálico Clásico' },
                          { id: 'rose_gold', label: 'Oro Rosa Brillante' },
                          { id: 'metal_silver', label: 'Plata Espejada' },
                          { id: 'foil_stamped', label: 'Pan de Oro Batido' },
                          { id: 'glitter_gold_dust', label: 'Lluvia de Chispas de Oro' },
                        ].map((tx) => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  type: 'texture',
                                  texture: tx.id as BackgroundTexture,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-medium cursor-pointer text-left ${
                              selectedSection.background.texture === tx.id
                                ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-bold ring-1 ring-[#DFC48B]'
                                : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            {tx.label}
                          </button>
                        ))}

                      {textureTab === 'flores' &&
                        [
                          { id: 'floral', label: 'Guirnalda Floral de Primavera' },
                          { id: 'floral_roses', label: 'Ramo de Rosas Inglesas' },
                          { id: 'floral_botanical', label: 'Follaje Botánico de Eucalipto' },
                          { id: 'watercolor', label: 'Acuarela Pastel Suave' },
                        ].map((tx) => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  type: 'texture',
                                  texture: tx.id as BackgroundTexture,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-medium cursor-pointer text-left ${
                              selectedSection.background.texture === tx.id
                                ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-bold ring-1 ring-[#DFC48B]'
                                : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            {tx.label}
                          </button>
                        ))}

                      {textureTab === 'fantasia' &&
                        [
                          { id: 'fairytale_forest', label: 'Bosque Mágico & Niebla' },
                          { id: 'stars_clouds', label: 'Cielo de Estrellas & Nubes' },
                          { id: 'water_ripples', label: 'Ondas de Agua Cristalina' },
                          { id: 'confetti_gold', label: 'Confeti Dorado Festivo' },
                          { id: 'geometric', label: 'Geometría Art Déco' },
                        ].map((tx) => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() =>
                              updateSelectedSection({
                                background: {
                                  ...selectedSection.background,
                                  type: 'texture',
                                  texture: tx.id as BackgroundTexture,
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-medium cursor-pointer text-left ${
                              selectedSection.background.texture === tx.id
                                ? 'border-[#DFC48B] bg-[#FAF5EB] text-stone-900 font-bold ring-1 ring-[#DFC48B]'
                                : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            {tx.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* SELECTOR DE 25 MOTIVOS DECORATIVOS DEL ZIP (Chispas, Flores, Mariposas) */}
                <div className="space-y-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    25 Motivos & Efectos Decorativos del ZIP
                  </span>
                  <select
                    value={selectedSection.background.motifTheme || 'none'}
                    onChange={(e) =>
                      updateSelectedSection({
                        background: {
                          ...selectedSection.background,
                          motifTheme: e.target.value as MotifTheme,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs cursor-pointer"
                  >
                    {motifOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opacity slider */}
                <div>
                  <div className="flex justify-between text-stone-700 text-[11px] mb-0.5">
                    <span>Opacidad de Sobrecapa (Filtro):</span>
                    <span className="font-bold">{selectedSection.background.overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={selectedSection.background.overlayOpacity}
                    onChange={(e) =>
                      updateSelectedSection({
                        background: {
                          ...selectedSection.background,
                          overlayOpacity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#9C7A3C] cursor-pointer"
                  />
                </div>
              </div>

              {/* 6. FOTOGRAFÍA INDIVIDUAL DE ESTA SECCIÓN (CON MARCOS REALES DEL ZIP) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                <span className="font-semibold text-slate-800 block text-xs">
                  6. Fotografía de esta Sección
                </span>

                {/* Subir foto para esta sección */}
                <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>Subir fotografía para esta sección</span>
                  <input
                    ref={sectionPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSectionPhotoUpload}
                    className="hidden"
                  />
                </label>

                {selectedSection.photo ? (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={selectedSection.photo.url}
                        alt="Foto"
                        className="w-12 h-14 object-cover rounded-lg border"
                      />
                      <div className="truncate flex-1">
                        <span className="font-semibold text-slate-800 block truncate">
                          {selectedSection.photo.alt || 'Foto de la sección'}
                        </span>
                        <span className="text-[10px] text-stone-500 capitalize">
                          Silueta: {selectedSection.photo.shape}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPhoto(selectedSection.photo || null)}
                        className="p-1.5 text-[#9C7A3C] hover:bg-white rounded-lg border border-stone-200 cursor-pointer"
                        title="Estudio fotográfico"
                      >
                        <Crop className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedSection({ photo: undefined })}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-stone-600 mb-1 text-[11px]">
                        Silueta / Marco Inspirado en el ZIP:
                      </label>
                      <select
                        value={selectedSection.photo.shape}
                        onChange={(e) =>
                          updateSelectedSection({
                            photo: {
                              ...selectedSection.photo!,
                              shape: e.target.value as PhotoShape,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs cursor-pointer"
                      >
                        {photoShapesList.map((sh) => (
                          <option key={sh.id} value={sh.id}>
                            {sh.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic text-center">
                    Esta sección no tiene foto actualmente. Sube una con el botón de arriba.
                  </p>
                )}
              </div>

              {/* 7. GESTOR ESPECIAL SI LA SECCIÓN ES "galeria" (Requirement 6) */}
              {selectedSection.type === 'galeria' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#FAF5EB] to-white border-2 border-[#DFC48B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-slate-800 text-xs">
                      Gestor de Galería de Recuerdos
                    </span>
                    <span className="text-[11px] text-[#9C7A3C] font-semibold">
                      {(selectedSection.galleryConfig?.photos || invitation.gallery || []).length} Fotos
                    </span>
                  </div>

                  {/* Subir Múltiples Fotos */}
                  <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>+ Subir Múltiples Fotos a la Galería</span>
                    <input
                      ref={galleryMultipleInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryMultipleUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Lista de Fotos de la Galería */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedSection.galleryConfig?.photos || invitation.gallery || []).map((img, i) => (
                      <div
                        key={img.id || i}
                        className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-2"
                      >
                        <img src={img.url} alt="Foto" className="w-10 h-10 object-cover rounded-lg border" />
                        <input
                          type="text"
                          placeholder="Pie de foto..."
                          value={img.title || ''}
                          onChange={(e) => {
                            const currentPhotos = selectedSection.galleryConfig?.photos || invitation.gallery;
                            const updated = currentPhotos.map((p, idx) =>
                              idx === i ? { ...p, title: e.target.value } : p
                            );
                            updateSelectedSection({
                              galleryConfig: {
                                layout: selectedSection.galleryConfig?.layout || 'masonry',
                                enableLightbox: true,
                                showCaptions: true,
                                photos: updated,
                              },
                            });
                          }}
                          className="flex-1 px-2 py-1 rounded border text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentPhotos = selectedSection.galleryConfig?.photos || invitation.gallery;
                            const updated = currentPhotos.filter((_, idx) => idx !== i);
                            updateSelectedSection({
                              galleryConfig: {
                                layout: selectedSection.galleryConfig?.layout || 'masonry',
                                enableLightbox: true,
                                showCaptions: true,
                                photos: updated,
                              },
                            });
                            updateInvitationState({ ...invitation, gallery: updated });
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. GESTOR ESPECIAL SI LA SECCIÓN ES "historia" (Nuestra Historia) */}
              {selectedSection.type === 'historia' && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-xs">
                      Hitos Cronológicos de la Historia
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedSection.storyMilestones || [];
                        const newItem = {
                          id: `st-${Date.now()}`,
                          yearOrDate: '2026',
                          title: 'Nuevo Momento',
                          description: 'Describe este hermoso recuerdo...',
                        };
                        updateSelectedSection({ storyMilestones: [...current, newItem] });
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Hito</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedSection.storyMilestones || []).map((m, idx) => (
                      <div key={m.id || idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Año/Fecha"
                            value={m.yearOrDate}
                            onChange={(e) => {
                              const updated = (selectedSection.storyMilestones || []).map((item, i) =>
                                i === idx ? { ...item, yearOrDate: e.target.value } : item
                              );
                              updateSelectedSection({ storyMilestones: updated });
                            }}
                            className="w-20 px-2 py-1 rounded border text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Título del momento"
                            value={m.title}
                            onChange={(e) => {
                              const updated = (selectedSection.storyMilestones || []).map((item, i) =>
                                i === idx ? { ...item, title: e.target.value } : item
                              );
                              updateSelectedSection({ storyMilestones: updated });
                            }}
                            className="flex-1 px-2 py-1 rounded border text-xs font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (selectedSection.storyMilestones || []).filter((_, i) => i !== idx);
                              updateSelectedSection({ storyMilestones: updated });
                            }}
                            className="p-1 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={1}
                          value={m.description}
                          onChange={(e) => {
                            const updated = (selectedSection.storyMilestones || []).map((item, i) =>
                              i === idx ? { ...item, description: e.target.value } : item
                            );
                            updateSelectedSection({ storyMilestones: updated });
                          }}
                          className="w-full px-2 py-1 rounded border text-xs"
                          placeholder="Descripción del recuerdo..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. GESTOR ESPECIAL PARA LUGAR DEL EVENTO & GOOGLE MAPS (Campo para editar botón y link) */}
              {selectedSection.type === 'ubicacion' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#FAF5EB] to-white border-2 border-[#DFC48B] space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#9C7A3C]" />
                    <span className="font-serif font-bold text-slate-800 text-xs">
                      Lugar del Evento & Botón de Google Maps
                    </span>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Nombre del Salón / Hacienda / Lugar
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Hacienda San José de las Palmas"
                      value={selectedSection.location?.venueName || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          location: {
                            ...selectedSection.location,
                            venueName: e.target.value,
                            address: selectedSection.location?.address || invitation.eventLocation,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#DFC48B]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Dirección Completa
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carretera Huimilpan Km 4.5, Querétaro, México"
                      value={selectedSection.location?.address || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          location: {
                            ...selectedSection.location,
                            venueName: selectedSection.location?.venueName || invitation.eventLocation,
                            address: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-[#DFC48B]"
                    />
                  </div>

                  {/* CAMPO SOLICITADO: ENLACE / UBICACIÓN DE GOOGLE MAPS */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <label className="block text-amber-950 font-bold text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-700" />
                      <span>Enlace / URL de Google Maps *</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=... o https://maps.app.goo.gl/..."
                      value={selectedSection.location?.googleMapsUrl || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          location: {
                            ...selectedSection.location,
                            venueName: selectedSection.location?.venueName || invitation.eventLocation,
                            address: selectedSection.location?.address || invitation.eventLocation,
                            googleMapsUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#DFC48B]"
                    />
                    <p className="text-[10px] text-amber-900/80">
                      Pega aquí la ubicación exacta de Google Maps para que tus invitados abran el GPS directamente.
                    </p>
                  </div>

                  {/* CAMPO SOLICITADO: TEXTO DEL BOTÓN DE GOOGLE MAPS */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Texto del Botón de Ubicación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Abrir Ubicación en Google Maps"
                      value={selectedSection.customButton?.label || 'Abrir Ubicación en Google Maps'}
                      onChange={(e) =>
                        updateSelectedSection({
                          customButton: {
                            buttonStyleId: selectedSection.customButton?.buttonStyleId || 'btn-1',
                            label: e.target.value,
                            action: 'location',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#DFC48B]"
                    />
                  </div>

                  {/* Selector del diseño de botón (50 botones) para el mapa */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Diseño del Botón de Ubicación:
                    </label>
                    <select
                      value={selectedSection.customButton?.buttonStyleId || 'btn-1'}
                      onChange={(e) =>
                        updateSelectedSection({
                          customButton: {
                            ...selectedSection.customButton,
                            buttonStyleId: e.target.value,
                            label: selectedSection.customButton?.label || 'Abrir Ubicación en Google Maps',
                            action: 'location',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs cursor-pointer"
                    >
                      {BUTTON_CATALOG.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 10. GESTOR ESPECIAL PARA CUENTA REGRESIVA (Posición & Estilo) */}
              {selectedSection.type === 'cuenta_regresiva' && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#9C7A3C]" />
                    <span className="font-serif font-bold text-slate-800 text-xs">
                      Configuración de Cuenta Regresiva
                    </span>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Posición en la Sección
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: 'top', label: 'Arriba' },
                        { id: 'center', label: 'Centro' },
                        { id: 'bottom', label: 'Abajo' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updateSelectedSection({ countdownPosition: pos.id as any })}
                          className={`py-1.5 rounded-xl border font-medium cursor-pointer ${
                            (selectedSection.countdownPosition || 'center') === pos.id
                              ? 'bg-stone-900 text-white font-bold'
                              : 'bg-stone-50 text-stone-600'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                      Estilo de Visualización
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {[
                        { id: 'clean_numbers', label: 'Números Limpios (Sin Cajas)' },
                        { id: 'boxed', label: 'Cajas Estilizadas' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => updateSelectedSection({ countdownStyle: st.id as any })}
                          className={`py-1.5 rounded-xl border font-medium cursor-pointer ${
                            (selectedSection.countdownStyle || 'clean_numbers') === st.id
                              ? 'bg-[#DFC48B] text-slate-900 font-bold'
                              : 'bg-stone-50 text-stone-600'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. GESTOR ESPECIAL PARA DATOS BANCARIOS */}
              {selectedSection.type === 'datos_bancarios' && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-2.5">
                  <span className="font-semibold text-slate-800 text-xs block">
                    Datos de Transferencia Bancaria
                  </span>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Nombre del Banco</label>
                    <input
                      type="text"
                      placeholder="Ej. BBVA Bancomer"
                      value={selectedSection.bank?.bankName || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          bank: {
                            bankName: e.target.value,
                            beneficiary: selectedSection.bank?.beneficiary || invitation.names,
                            accountNumber: selectedSection.bank?.accountNumber || '',
                            clabe: selectedSection.bank?.clabe || '',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Beneficiario</label>
                    <input
                      type="text"
                      placeholder="Nombre del titular"
                      value={selectedSection.bank?.beneficiary || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          bank: {
                            bankName: selectedSection.bank?.bankName || 'Banco',
                            beneficiary: e.target.value,
                            accountNumber: selectedSection.bank?.accountNumber || '',
                            clabe: selectedSection.bank?.clabe || '',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Número de Cuenta</label>
                    <input
                      type="text"
                      placeholder="Cuenta bancaria"
                      value={selectedSection.bank?.accountNumber || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          bank: {
                            bankName: selectedSection.bank?.bankName || 'Banco',
                            beneficiary: selectedSection.bank?.beneficiary || invitation.names,
                            accountNumber: e.target.value,
                            clabe: selectedSection.bank?.clabe || '',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">CLABE Interbancaria (18 dígitos)</label>
                    <input
                      type="text"
                      placeholder="012 180 ..."
                      value={selectedSection.bank?.clabe || ''}
                      onChange={(e) =>
                        updateSelectedSection({
                          bank: {
                            bankName: selectedSection.bank?.bankName || 'Banco',
                            beneficiary: selectedSection.bank?.beneficiary || invitation.names,
                            accountNumber: selectedSection.bank?.accountNumber || '',
                            clabe: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 12. GESTOR ESPECIAL PARA CONFIRMACIÓN RSVP */}
              {selectedSection.type === 'rsvp' && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-2.5">
                  <span className="font-semibold text-slate-800 text-xs block">
                    Configuración del Botón de Confirmación (RSVP)
                  </span>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Texto del Botón</label>
                    <input
                      type="text"
                      placeholder="Confirmar Mi Asistencia"
                      value={selectedSection.customButton?.label || 'Confirmar Mi Asistencia'}
                      onChange={(e) =>
                        updateSelectedSection({
                          customButton: {
                            buttonStyleId: selectedSection.customButton?.buttonStyleId || 'btn-1',
                            label: e.target.value,
                            action: 'rsvp',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Fecha Límite</label>
                    <input
                      type="date"
                      value={invitation.rsvpSettings?.deadlineDate || ''}
                      onChange={(e) =>
                        updateInvitationState({
                          ...invitation,
                          rsvpSettings: {
                            ...invitation.rsvpSettings,
                            deadlineDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 text-[11px] mb-0.5">Diseño del Botón (50 Botones)</label>
                    <select
                      value={selectedSection.customButton?.buttonStyleId || 'btn-1'}
                      onChange={(e) =>
                        updateSelectedSection({
                          customButton: {
                            ...selectedSection.customButton,
                            buttonStyleId: e.target.value,
                            label: selectedSection.customButton?.label || 'Confirmar Mi Asistencia',
                            action: 'rsvp',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs cursor-pointer"
                    >
                      {BUTTON_CATALOG.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'motifs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Motivos PNG de la invitación</h3>
                <p className="text-[11px] text-stone-500 mt-1">Se agregan a las {invitation.sections.length} secciones. Selecciona uno y arrástralo sobre la vista previa.</p>
              </div>
              <label className="block cursor-pointer rounded-xl bg-stone-900 px-3 py-2 text-center text-xs font-semibold text-white">
                {selectedMotif ? 'Reemplazar PNG seleccionado' : 'Subir PNG propio'}
                <input type="file" accept="image/png,.png" onChange={handleMotifUpload} className="hidden" />
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                {MOTIF_LIBRARY.map((motif) => <button key={motif.id} type="button" onClick={() => addMotif(motif.src, motif.name)} title={`Agregar ${motif.name} a todas las secciones`} className="aspect-square rounded-xl border bg-white p-1 hover:border-amber-600"><img src={motif.src} alt={motif.name} loading="lazy" className="h-full w-full object-contain" /></button>)}
              </div>
              <div className="rounded-xl border bg-white p-3 space-y-3">
                <label className="block text-[11px] font-semibold">Sección seleccionada
                  <select value={selectedSection.id} onChange={(e) => setSelectedSectionId(e.target.value)} className="mt-1 w-full rounded-lg border p-2 font-normal">
                    {invitation.sections.map((section, index) => <option key={section.id} value={section.id}>{index + 1}. {section.title}</option>)}
                  </select>
                </label>
                {sectionMotifs.length === 0 ? <p className="text-[11px] text-stone-500">Aún no hay motivos en esta sección.</p> : sectionMotifs.map((motif) => <div key={motif.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <button type="button" onClick={() => setSelectedMotifId(motif.id)} className={`h-10 w-10 rounded border p-1 ${selectedMotifId === motif.id ? 'border-amber-600' : 'border-stone-200'}`}><img src={motif.src} alt="" className="h-full w-full object-contain" /></button>
                  <span className="min-w-0 flex-1 truncate text-[10px]">{motif.name}</span>
                  <button type="button" onClick={() => { const groupId = motif.groupId || motif.id; updateInvitationState({ ...invitation, sections: invitation.sections.map((section) => ({ ...section, background: { ...section.background, customMotifs: section.background.customMotifs?.filter((item) => (item.groupId || item.id) !== groupId) } })) }); if ((selectedMotif?.groupId || selectedMotif?.id) === groupId) setSelectedMotifId(null); }} title="Eliminar de todas las secciones" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                </div>)}
              </div>
              {selectedMotif && <div className="rounded-xl border bg-white p-3 space-y-3">
                <p className="text-[11px] font-semibold">Editar: {selectedMotif.name}</p>
                <p className="text-[10px] text-stone-500">Aplicado en {motifSectionCount} / {invitation.sections.length} secciones. Arrastra el PNG directamente sobre cualquiera de ellas.</p>
                <label className="block text-[11px]">Tamaño: {Math.round(selectedMotif.width)}%<input type="range" min="4" max="100" value={selectedMotif.width} onChange={(e) => updateMotif({ width: Number(e.target.value) })} className="w-full accent-amber-700" /></label>
                <label className="block text-[11px]">Rotación: {selectedMotif.rotation}°<input type="range" min="-180" max="180" value={selectedMotif.rotation} onChange={(e) => updateMotif({ rotation: Number(e.target.value) })} className="w-full accent-amber-700" /></label>
                <label className="block text-[11px]">Opacidad: {selectedMotif.opacity}%<input type="range" min="0" max="100" value={selectedMotif.opacity} onChange={(e) => updateMotif({ opacity: Number(e.target.value) })} className="w-full accent-amber-700" /></label>
                <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateMotif({ zIndex: Math.max(0, selectedMotif.zIndex - 1) })} className="rounded-lg border p-2 text-[10px]">Enviar atrás</button><button type="button" onClick={() => updateMotif({ zIndex: selectedMotif.zIndex + 1 })} className="rounded-lg border p-2 text-[10px]">Traer al frente</button></div>
                <button type="button" onClick={removeMotifFromAllSections} className="w-full rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] font-semibold text-rose-700">Eliminar motivo de todas las secciones</button>
              </div>}
            </div>
          )}

          {/* TAB: PLANTILLAS */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Catálogo de 12 Plantillas</h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Modelos de gala, bodas, XV años, graduaciones y cuentos mágicos.
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: 'todas', label: 'Todas (12)' },
                  { id: 'bodas', label: 'Bodas' },
                  { id: 'xv_anos', label: 'XV Años' },
                  { id: 'graduaciones', label: 'Graduaciones' },
                  { id: 'infantiles', label: 'Infantiles' },
                  { id: 'cumpleanos', label: 'Cumpleaños' },
                  { id: 'especiales', label: 'Especiales' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTemplateCategoryFilter(c.id)}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                      templateCategoryFilter === c.id
                        ? 'bg-stone-900 text-white font-medium'
                        : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleSwitchTemplate(tpl.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      invitation.templateId === tpl.id
                        ? 'border-[#DFC48B] bg-[#FAF5EB] ring-1 ring-[#DFC48B]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                      <img src={tpl.previewImage} alt={tpl.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 truncate">
                      <h4 className="text-xs font-serif font-bold text-slate-800 truncate">{tpl.name}</h4>
                      <p className="text-[10px] text-stone-500 truncate">{tpl.description}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.palette.primary }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.palette.accent }} />
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: tpl.palette.background }} />
                        <span className="text-[9px] text-stone-400 ml-auto capitalize">{tpl.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FORMAT */}
          {activeTab === 'format' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Formato de Presentación</h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Elige la experiencia visual con la que tus invitados recibirán la invitación:
                </p>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                {formatsList.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFormatChange(f.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      invitation.presentationFormat === f.id
                        ? 'border-[#DFC48B] bg-[#FAF5EB] ring-1 ring-[#DFC48B]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="font-serif font-bold text-xs text-slate-800">{f.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: 50 BOTONES PREMIUM */}
          {activeTab === 'buttons' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Catálogo de 50 Botones Premium</h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Elige y personaliza el diseño de los botones para RSVP, ubicación y accesos:
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: 'todas', label: 'Todos (50)' },
                  { id: 'elegantes', label: 'Elegantes' },
                  { id: 'dorados', label: 'Dorados' },
                  { id: 'florales', label: 'Florales' },
                  { id: 'romanticos', label: 'Románticos' },
                  { id: 'infantiles', label: 'Infantiles' },
                  { id: 'modernos', label: 'Modernos' },
                  { id: 'minimalistas', label: 'Minimalistas' },
                  { id: 'ornamentales', label: 'Ornamentales' },
                  { id: 'relieve', label: '3D Relieve' },
                  { id: 'cristal', label: 'Cristal' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setButtonCategoryFilter(c.id)}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                      buttonCategoryFilter === c.id
                        ? 'bg-stone-900 text-white font-medium'
                        : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                {filteredButtons.map((btn) => (
                  <div
                    key={btn.id}
                    onClick={() => {
                      const rsvpSection = invitation.sections.find((s) => s.type === 'rsvp');
                      if (rsvpSection) {
                        updateInvitationState({
                          ...invitation,
                          sections: invitation.sections.map((s) =>
                            s.type === 'rsvp'
                              ? {
                                  ...s,
                                  customButton: {
                                    buttonStyleId: btn.id,
                                    label: s.customButton?.label || btn.defaultText,
                                    fontFamily: btn.fontFamily,
                                    action: 'rsvp',
                                  },
                                }
                              : s
                          ),
                        });
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      invitation.sections.find((s) => s.type === 'rsvp')?.customButton?.buttonStyleId === btn.id
                        ? 'border-[#DFC48B] bg-[#FAF5EB] ring-2 ring-[#DFC48B]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] text-stone-400">
                      <span>{btn.name}</span>
                      <span className="capitalize">{btn.category}</span>
                    </div>

                    <div className="py-2">
                      <CustomButtonRenderer
                        config={{
                          buttonStyleId: btn.id,
                          label: btn.defaultText,
                          fontFamily: btn.fontFamily,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MÚSICA & AUDIO PROPIO */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Música de Fondo & Audio Propio</h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Sube tu propia canción o elige música ambiental de gala:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Subir música propia</span>
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-amber-900/80 text-center">
                  Formatos admitidos: MP3, WAV, AAC, M4A y OGG
                </p>
              </div>

              {invitation.audioTrack?.customAudioUrl && (
                <div className="p-3 rounded-2xl bg-white border border-[#E8DEC8] flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-stone-400 block">Pista propia activa:</span>
                    <span className="font-semibold text-xs text-slate-800 truncate block">
                      {invitation.audioTrack.fileName || 'Audio personalizado'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateInvitationState({
                        ...invitation,
                        audioTrack: {
                          ...invitation.audioTrack,
                          type: 'synth_ambient',
                          customAudioUrl: undefined,
                          fileName: undefined,
                        },
                      });
                      ambientMusic.setCustomAudio(null);
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Eliminar audio propio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200">
                <span className="font-medium text-slate-800">Reproducción automática</span>
                <input
                  type="checkbox"
                  checked={invitation.audioTrack?.enabled}
                  onChange={(e) =>
                    updateInvitationState({
                      ...invitation,
                      audioTrack: { ...invitation.audioTrack, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-[#9C7A3C] cursor-pointer"
                />
              </div>

              {invitation.audioTrack?.type !== 'custom_upload' && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Estilos Instrumentales Clásicos
                  </label>
                  <select
                    value={invitation.audioTrack?.synthStyle || 'romantic_harp'}
                    onChange={(e) =>
                      updateInvitationState({
                        ...invitation,
                        audioTrack: { ...invitation.audioTrack, synthStyle: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white cursor-pointer"
                  >
                    <option value="romantic_harp">Arpa Acústica Romántica (Clásico)</option>
                    <option value="piano_ballad">Balada de Piano Suave</option>
                    <option value="celebration_waltz">Vals de Celebración Imperial</option>
                    <option value="gentle_celestial">Ecos Celestiales</option>
                    <option value="fairytale_lullaby">Caja de Música de Cuento (Princesas)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB: DATOS GLOBALES */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">Datos Principales del Evento</h3>
                <p className="text-stone-500 text-[11px] mt-0.5">Personaliza los títulos, anfitriones y fecha:</p>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Título de la Invitación</label>
                <input
                  type="text"
                  value={invitation.title}
                  onChange={(e) => updateInvitationState({ ...invitation, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nombres de los Protagonistas</label>
                <input
                  type="text"
                  value={invitation.names}
                  onChange={(e) => updateInvitationState({ ...invitation, names: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={invitation.eventDate}
                    onChange={(e) => updateInvitationState({ ...invitation, eventDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={invitation.eventTime}
                    onChange={(e) => updateInvitationState({ ...invitation, eventTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Lugar / Salón / Hacienda</label>
                <input
                  type="text"
                  value={invitation.eventLocation}
                  onChange={(e) => updateInvitationState({ ...invitation, eventLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Center: Live Interactive Viewport */}
        <main className="flex-1 bg-[#EDE8E0] overflow-y-auto p-4 md:p-8 flex items-center justify-center">
          <div
            className={`transition-all duration-300 shadow-2xl bg-white overflow-hidden ${
              devicePreview === 'mobile'
                ? 'w-[375px] h-[780px] rounded-[48px] border-[8px] border-stone-900 shadow-stone-800/20'
                : 'w-full max-w-4xl min-h-[800px] rounded-3xl border border-stone-300'
            }`}
          >
            <div className="w-full h-full overflow-y-auto">
              <InvitationContainer
                invitation={invitation}
                isEditor={true}
                onUpdateInvitation={updateInvitationState}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  setActiveTab('sections');
                }}
                selectedSectionId={selectedSection.id}
                onSelectMotif={(sectionId, motifId) => {
                  if (sectionId !== selectedSectionId) setSelectedSectionId(sectionId);
                  setSelectedMotifId(motifId);
                  setActiveTab('motifs');
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Embedded Photo Editor Modal */}
      {editingPhoto && (
        <PhotoEditorModal
          photo={editingPhoto}
          isOpen={true}
          onClose={() => setEditingPhoto(null)}
          onSave={(updatedPhoto) => {
            const updatedSections = invitation.sections.map((s) => {
              if (s.photo?.id === updatedPhoto.id) {
                return { ...s, photo: updatedPhoto };
              }
              return s;
            });
            updateInvitationState({ ...invitation, sections: updatedSections });
            setEditingPhoto(null);
          }}
        />
      )}

      {/* Embedded Hostinger Publishing Modal */}
      {showHostingerModal && (
        <HostingerPublishModal
          invitation={invitation}
          isOpen={true}
          onClose={() => setShowHostingerModal(false)}
          onUpdateInvitation={updateInvitationState}
        />
      )}

      {/* Embedded Save Template Modal */}
      {showSaveTemplateModal && (
        <SaveTemplateModal
          invitation={invitation}
          isOpen={true}
          onClose={() => setShowSaveTemplateModal(false)}
          onSaved={(name, cat) => {
            const updated = {
              ...invitation,
              title: name,
              category: cat as any,
            };
            updateInvitationState(updated);
          }}
        />
      )}
    </div>
  );
};
