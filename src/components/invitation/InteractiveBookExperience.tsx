import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Gift,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Volume2,
  VolumeX,
  Share2,
  Church,
  Utensils,
  GlassWater,
  PartyPopper,
  Grid,
  Image as ImageIcon,
  Send,
  Bookmark,
  Compass,
} from 'lucide-react';
import { Invitation } from '../../types';
import { musicPlayer } from '../../utils/audioSynth';
import { CelebrationParticles } from '../common/CelebrationParticles';
import { getGoogleCalendarUrl, downloadIcsFile, getWhatsAppRsvpUrl } from '../../utils/calendarAndQr';
import { addRSVP, incrementInvitationVisit } from '../../utils/storage';

interface InteractiveBookExperienceProps {
  invitation: Invitation;
  onBackToHome?: () => void;
  onEditInvitation?: (invitation: Invitation) => void;
  onToggleContinuousView?: () => void;
}

export const InteractiveBookExperience: React.FC<InteractiveBookExperienceProps> = ({
  invitation,
  onBackToHome,
  onEditInvitation,
  onToggleContinuousView,
}) => {
  // Book state: 0 = Closed Book Cover, 1 to 7 = Inner Pages
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 7;

  // Audio & Utilities
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Photo layout switcher for gallery page (1, 2, 3, or 4 photos)
  const [galleryLayout, setGalleryLayout] = useState<'single' | 'duo' | 'trio' | 'quad'>('quad');

  // RSVP Form State
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpGuestPhone, setRsvpGuestPhone] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState(true);
  const [rsvpGuestsCount, setRsvpGuestsCount] = useState(1);
  const [rsvpDietary, setRsvpDietary] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Track page visit once
  useEffect(() => {
    if (invitation?.slug) {
      incrementInvitationVisit(invitation.slug);
    }
  }, [invitation?.slug]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      musicPlayer.stop();
    };
  }, []);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage]);

  // Countdown calculation
  useEffect(() => {
    if (!invitation?.eventDate) return;
    const calculateCountdown = () => {
      const target = new Date(`${invitation.eventDate}T${invitation.eventTime || '18:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [invitation?.eventDate, invitation?.eventTime]);

  // Open Book with sound
  const handleOpenBook = () => {
    setIsOpen(true);
    setCurrentPage(1);
    if (invitation.musicTrackId && invitation.musicTrackId !== 'none') {
      musicPlayer.play(invitation.musicTrackId);
      setIsPlayingAudio(true);
    }
  };

  const toggleAudio = () => {
    if (invitation.musicTrackId && invitation.musicTrackId !== 'none') {
      const state = musicPlayer.toggle(invitation.musicTrackId);
      setIsPlayingAudio(state);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleCopyClabe = (clabeText: string) => {
    navigator.clipboard.writeText(clabeText);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpGuestName.trim()) return;

    addRSVP({
      invitationId: invitation.id,
      guestName: rsvpGuestName.trim(),
      guestPhone: rsvpGuestPhone.trim(),
      attending: rsvpAttending,
      guestsCount: rsvpAttending ? rsvpGuestsCount : 0,
      dietaryRestrictions: rsvpDietary.trim(),
      message: rsvpMessage.trim(),
    });

    setRsvpSubmitted(true);
  };

  // Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped Left -> Next page
      goToNextPage();
    } else if (diff < -50) {
      // Swiped Right -> Prev page
      goToPrevPage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const renderItineraryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Church':
        return <Church className="h-4 w-4" />;
      case 'Utensils':
        return <Utensils className="h-4 w-4" />;
      case 'GlassWater':
        return <GlassWater className="h-4 w-4" />;
      case 'Heart':
        return <Heart className="h-4 w-4" />;
      case 'Sparkles':
        return <Sparkles className="h-4 w-4" />;
      case 'PartyPopper':
        return <PartyPopper className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Cover Style themes
  const coverTheme = invitation.bookCoverStyle || 'luxury_linen';

  return (
    <div
      className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-500/20 flex flex-col justify-between overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background celebration particles */}
      <CelebrationParticles type={invitation.particlesEffect || 'petals'} intensity="gentle" />

      {/* Floating Top Action Bar */}
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 rounded-full border border-neutral-700/80 bg-neutral-900/90 px-3.5 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-md hover:bg-neutral-800 transition-colors shadow-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Volver a LAV</span>
            </button>
          )}

          {onEditInvitation && (
            <button
              onClick={() => onEditInvitation(invitation)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md hover:bg-amber-500/30 transition-colors shadow-lg"
            >
              <span>Editar Libro</span>
            </button>
          )}

          {onToggleContinuousView && (
            <button
              onClick={onToggleContinuousView}
              className="hidden md:flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
              title="Alternar a modo desplazamiento vertical"
            >
              <span>Vista Continua</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio toggle */}
          {invitation.musicTrackId && invitation.musicTrackId !== 'none' && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md shadow-lg transition-all ${
                isPlayingAudio
                  ? 'border-amber-400/80 bg-amber-500/20 text-amber-300'
                  : 'border-neutral-700/80 bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Música</span>
                </>
              )}
            </button>
          )}

          {/* Share link */}
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 rounded-full border border-neutral-700/80 bg-neutral-900/90 px-3.5 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-md hover:bg-neutral-800 transition-colors shadow-lg"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
          </button>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 1. CLOSED BOOK FRONT COVER PRESENTATION */}
      {/* --------------------------------------------------------------------- */}
      {!isOpen ? (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-20 pb-16">
          <div className="relative w-full max-w-md perspective-[1200px] animate-gentle-float">
            {/* Hardcover Outer Frame */}
            <div
              onClick={handleOpenBook}
              className="group relative aspect-[3/4] w-full rounded-2xl sm:rounded-3xl border-4 border-amber-300/30 bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-950 p-6 sm:p-8 shadow-2xl shadow-black cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-amber-400/50"
              style={{
                boxShadow:
                  '0 25px 50px -12px rgba(0,0,0,0.85), inset 4px 0 10px rgba(255,255,255,0.06), -12px 12px 24px rgba(0,0,0,0.7)',
              }}
            >
              {/* Spine shadow depth on left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/80 via-black/40 to-transparent rounded-l-2xl sm:rounded-l-3xl border-r border-amber-500/20" />

              {/* Silk ribbon bookmark hanging from top */}
              <div className="absolute -top-3 right-12 w-6 h-16 bg-gradient-to-b from-amber-600 via-rose-700 to-rose-800 shadow-md rounded-b-sm border-x border-amber-400/40 z-20 flex items-end justify-center pb-1">
                <Bookmark className="h-3.5 w-3.5 text-amber-200 fill-amber-200/40" />
              </div>

              {/* Gilded Book Cover Border & Corner Ornaments */}
              <div className="relative h-full w-full rounded-xl sm:rounded-2xl border-2 border-amber-400/40 p-6 flex flex-col justify-between items-center text-center overflow-hidden">
                {/* Vintage Corner Accents */}
                <div className="absolute top-2 left-2 text-amber-400/60 font-cinzel text-xs">❦</div>
                <div className="absolute top-2 right-2 text-amber-400/60 font-cinzel text-xs">❦</div>
                <div className="absolute bottom-2 left-2 text-amber-400/60 font-cinzel text-xs">❦</div>
                <div className="absolute bottom-2 right-2 text-amber-400/60 font-cinzel text-xs">❦</div>

                {/* Subtitle / Edition */}
                <div className="space-y-1 pt-4">
                  <span className="font-cinzel text-[11px] font-semibold uppercase tracking-widest text-amber-300/80">
                    Edición Especial · Recuerdo Inolvidable
                  </span>
                  <div className="h-px w-16 bg-amber-400/40 mx-auto" />
                </div>

                {/* Main Book Title: Érase una vez */}
                <div className="my-auto space-y-3">
                  <span className="font-cormorant text-2xl sm:text-3xl italic text-amber-200/90 block">
                    Érase una vez
                  </span>
                  <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
                    {invitation.hostNames}
                  </h1>
                  <p className="font-cinzel text-xs uppercase tracking-wider text-amber-300">
                    {invitation.headline}
                  </p>
                </div>

                {/* Date & Tap to open prompt */}
                <div className="space-y-4 pb-2 w-full">
                  <div className="text-[11px] font-mono text-neutral-400">
                    {invitation.eventDate} · {invitation.venueName}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBook();
                    }}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-950 shadow-xl shadow-amber-500/25 transition-transform group-hover:scale-105"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Tocar para Abrir el Libro</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-neutral-500 mt-4 flex items-center justify-center gap-1.5">
              <span>Desliza o toca para hojear las páginas</span>
            </p>
          </div>
        </main>
      ) : (
        /* --------------------------------------------------------------------- */
        /* 2. OPENED BOOK INTERACTIVE PAGES SPREAD */
        /* --------------------------------------------------------------------- */
        <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-16 pb-20 max-w-4xl mx-auto w-full">

          {/* Book Spine & Navigation Bar */}
          <div className="mb-4 flex items-center justify-between w-full max-w-2xl px-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-amber-400 font-semibold uppercase text-[11px]">
                Érase una vez
              </span>
              <span>·</span>
              <span className="text-neutral-300">{invitation.hostNames}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
              <span>Página</span>
              <span className="font-bold text-white">{currentPage}</span>
              <span>de</span>
              <span>{totalPages}</span>
            </div>
          </div>

          {/* Book Open Frame (3D Depth with paper texture & spine binding) */}
          <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-amber-500/20 bg-stone-900/90 shadow-2xl shadow-black overflow-hidden flex flex-col justify-between min-h-[580px] sm:min-h-[640px]">
            {/* Center Book Spine Line (Crease effect) */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/25 via-black/40 to-black/25 pointer-events-none hidden sm:block z-20" />

            {/* Inner Page Content by Step */}
            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between space-y-6">

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 1: Frontispicio & Dedicatoria */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 1 && (
                <div className="my-auto space-y-8 text-center animate-fade-in">
                  <div className="space-y-2">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400 block">
                      Prólogo
                    </span>
                    <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white">
                      {invitation.title}
                    </h2>
                    <div className="mx-auto h-0.5 w-16 bg-amber-400/80 my-3" />
                    <h3 className="font-cormorant text-2xl italic text-amber-200">
                      {invitation.hostNames}
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-neutral-950/60 p-6 sm:p-8 space-y-4 max-w-lg mx-auto shadow-inner">
                    <p className="font-cormorant text-lg sm:text-xl italic leading-relaxed text-neutral-200">
                      "{invitation.personalMessage}"
                    </p>
                  </div>

                  {invitation.parentsNames && (
                    <div className="space-y-1 text-xs text-neutral-400 max-w-md mx-auto pt-2">
                      <span className="font-semibold uppercase tracking-wider text-amber-400 text-[10px] block">
                        Con la bendición de nuestros padres
                      </span>
                      <p className="leading-relaxed">{invitation.parentsNames}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 2: Capítulo I: Protagonistas & Portada */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 2 && (
                <div className="my-auto space-y-6 text-center animate-fade-in">
                  <div className="space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo I
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      Los Protagonistas
                    </h2>
                  </div>

                  <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-neutral-950 shadow-xl">
                    <img
                      src={invitation.coverImage}
                      alt={invitation.hostNames}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-center justify-center">
                      <p className="font-cormorant text-xl italic text-amber-100">
                        {invitation.hostNames}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 max-w-md mx-auto italic">
                    «Cada página que escribimos juntos nos acerca al momento más esperado de nuestras vidas.»
                  </p>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 3: Capítulo II: Álbum de Recuerdos (Múltiples Fotos) */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 3 && (
                <div className="my-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo II
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      Galería de Recuerdos
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Toca cualquier imagen para ampliarla en detalle
                    </p>
                  </div>

                  {/* Layout Selector (1, 2, 3, 4 photos) */}
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[11px] text-neutral-500 mr-2">Diseño:</span>
                    {[
                      { id: 'single', label: '1 Foto' },
                      { id: 'duo', label: '2 Fotos' },
                      { id: 'trio', label: '3 Fotos' },
                      { id: 'quad', label: 'Mosaico 4' },
                    ].map((lay) => (
                      <button
                        key={lay.id}
                        onClick={() => setGalleryLayout(lay.id as any)}
                        className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                          galleryLayout === lay.id
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {lay.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Photo Spread */}
                  <div className="max-w-lg mx-auto">
                    {galleryLayout === 'single' && (
                      <div
                        onClick={() => setActivePhotoModal(invitation.galleryImages[0] || invitation.coverImage)}
                        className="aspect-[4/3] rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer shadow-lg group relative"
                      >
                        <img
                          src={invitation.galleryImages[0] || invitation.coverImage}
                          alt="Recuerdo"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-amber-300" />
                        </div>
                      </div>
                    )}

                    {galleryLayout === 'duo' && (
                      <div className="grid grid-cols-2 gap-3">
                        {invitation.galleryImages.slice(0, 2).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoModal(img)}
                            className="aspect-[3/4] rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer shadow-md group relative"
                          >
                            <img
                              src={img}
                              alt={`Recuerdo ${idx + 1}`}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {galleryLayout === 'trio' && (
                      <div className="grid grid-cols-3 gap-2">
                        {invitation.galleryImages.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoModal(img)}
                            className="aspect-[3/4] rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer shadow-md"
                          >
                            <img src={img} alt={`Recuerdo ${idx + 1}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {galleryLayout === 'quad' && (
                      <div className="grid grid-cols-2 gap-2.5">
                        {(invitation.galleryImages.length >= 4
                          ? invitation.galleryImages.slice(0, 4)
                          : [invitation.coverImage, ...invitation.galleryImages]
                        ).slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoModal(img)}
                            className="aspect-square rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer shadow-md group relative"
                          >
                            <img
                              src={img}
                              alt={`Recuerdo ${idx + 1}`}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 4: Capítulo III: La Fecha & El Itinerario */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 4 && (
                <div className="my-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo III
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      El Gran Día
                    </h2>
                    <p className="font-mono text-xs text-amber-300">
                      {invitation.eventDate} · {invitation.eventTime} hrs
                    </p>
                  </div>

                  {/* Real-time Countdown Box */}
                  <div className="rounded-xl border border-amber-500/20 bg-neutral-950/80 p-4 text-center max-w-sm mx-auto shadow-inner">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      Tiempo para el sí definitivo
                    </span>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                        <span className="font-playfair text-xl font-bold text-amber-300 tabular-nums">
                          {timeLeft.days}
                        </span>
                        <p className="text-[9px] uppercase text-neutral-400">Días</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                        <span className="font-playfair text-xl font-bold text-amber-300 tabular-nums">
                          {timeLeft.hours}
                        </span>
                        <p className="text-[9px] uppercase text-neutral-400">Horas</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                        <span className="font-playfair text-xl font-bold text-amber-300 tabular-nums">
                          {timeLeft.minutes}
                        </span>
                        <p className="text-[9px] uppercase text-neutral-400">Min</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                        <span className="font-playfair text-xl font-bold text-amber-300 tabular-nums">
                          {timeLeft.seconds}
                        </span>
                        <p className="text-[9px] uppercase text-neutral-400">Seg</p>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary timeline list */}
                  <div className="space-y-2.5 max-w-md mx-auto max-h-56 overflow-y-auto pr-1">
                    {invitation.itinerary.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                            {renderItineraryIcon(item.icon)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{item.title}</span>
                            <span className="text-[10px] text-neutral-400">{item.description}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-amber-400 shrink-0">
                          {item.time} hrs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 5: Capítulo IV: Las Coordenadas & Recinto */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 5 && (
                <div className="my-auto space-y-6 text-center animate-fade-in">
                  <div className="space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo IV
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      Las Coordenadas
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4 max-w-md mx-auto shadow-inner">
                    <div className="flex justify-center text-amber-400">
                      <Compass className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-playfair text-xl font-bold text-white">
                        {invitation.venueName}
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {invitation.venueAddress}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${invitation.venueName} ${invitation.venueAddress}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Google Maps</span>
                      </a>
                      <a
                        href={`https://waze.com/ul?q=${encodeURIComponent(`${invitation.venueName} ${invitation.venueAddress}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white"
                      >
                        <span>Waze</span>
                      </a>
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-center gap-3 text-xs">
                      <a
                        href={getGoogleCalendarUrl(invitation)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline"
                      >
                        + Google Calendar
                      </a>
                      <span className="text-neutral-600">·</span>
                      <button
                        onClick={() => downloadIcsFile(invitation)}
                        className="text-neutral-300 hover:text-white"
                      >
                        Descargar Apple iCal (.ics)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 6: Capítulo V: Código de Vestimenta & Mesa de Regalos */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 6 && (
                <div className="my-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo V
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      Detalles & Sugerencias
                    </h2>
                  </div>

                  {/* Dress code */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-center max-w-md mx-auto space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      Código de Vestimenta
                    </span>
                    <h4 className="font-playfair text-lg font-bold text-white">{invitation.dressCode}</h4>
                    <p className="text-xs text-neutral-300">{invitation.dressCodeDetails}</p>
                    {invitation.dressCodeColors && (
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {invitation.dressCodeColors.map((col, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full border border-neutral-700 shadow-sm"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gift registries */}
                  <div className="space-y-2.5 max-w-md mx-auto">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block text-center">
                      Mesa de Regalos
                    </span>
                    {invitation.giftRegistries.map((gift, gIdx) => (
                      <div
                        key={gIdx}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{gift.title}</span>
                          <span className="text-[11px] text-neutral-400 select-all">{gift.detail}</span>
                        </div>
                        {gift.type === 'bank' ? (
                          <button
                            onClick={() => handleCopyClabe(gift.detail)}
                            className="flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-amber-300 hover:bg-neutral-700"
                          >
                            {copiedClabe ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedClabe ? 'Copiada' : 'Copiar'}</span>
                          </button>
                        ) : gift.link ? (
                          <a
                            href={gift.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-amber-300 hover:bg-neutral-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Ver</span>
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* PÁGINA 7: Capítulo VI: Confirmación de Asistencia (RSVP) */}
              {/* ----------------------------------------------------------- */}
              {currentPage === 7 && (
                <div className="my-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="font-cinzel text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Capítulo VI
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                      Confirmación de Asistencia
                    </h2>
                    {invitation.rsvpDeadline && (
                      <p className="text-xs text-neutral-400">
                        Favor de confirmar antes del{' '}
                        <span className="text-amber-300 font-semibold">{invitation.rsvpDeadline}</span>
                      </p>
                    )}
                  </div>

                  {rsvpSubmitted ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-3 max-w-md mx-auto">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="h-5 w-5" />
                      </div>
                      <h4 className="font-playfair text-lg font-bold text-white">
                        ¡Tu firma ha sido grabada!
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Gracias por acompañarnos a escribir este capítulo.
                      </p>
                      {invitation.rsvpWhatsAppPhone && (
                        <a
                          href={getWhatsAppRsvpUrl(
                            invitation.rsvpWhatsAppPhone,
                            rsvpGuestName,
                            invitation.title,
                            rsvpAttending
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-emerald-500"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Notificar por WhatsApp</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-3 max-w-md mx-auto text-xs">
                      <input
                        type="text"
                        required
                        value={rsvpGuestName}
                        onChange={(e) => setRsvpGuestName(e.target.value)}
                        placeholder="Tu Nombre Completo *"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRsvpAttending(true)}
                          className={`rounded-xl border p-2.5 text-xs font-semibold ${
                            rsvpAttending
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                          }`}
                        >
                          Asistiré
                        </button>
                        <button
                          type="button"
                          onClick={() => setRsvpAttending(false)}
                          className={`rounded-xl border p-2.5 text-xs font-semibold ${
                            !rsvpAttending
                              ? 'border-neutral-600 bg-neutral-800 text-neutral-200'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                          }`}
                        >
                          No podré asistir
                        </button>
                      </div>

                      {rsvpAttending && (
                        <select
                          value={rsvpGuestsCount}
                          onChange={(e) => setRsvpGuestsCount(parseInt(e.target.value, 10))}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? 'Persona' : 'Personas'}
                            </option>
                          ))}
                        </select>
                      )}

                      <textarea
                        rows={2}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        placeholder="Dedicatoria o felicitación para los anfitriones..."
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none resize-none"
                      />

                      <div className="pt-1 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 shadow-md"
                        >
                          Confirmar Asistencia
                        </button>
                        {invitation.rsvpWhatsAppPhone && (
                          <a
                            href={getWhatsAppRsvpUrl(
                              invitation.rsvpWhatsAppPhone,
                              rsvpGuestName || 'Invitado',
                              invitation.title,
                              rsvpAttending
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-500"
                            title="Confirmar por WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Book Page Controls & Pagination */}
            <div className="p-4 sm:p-6 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between">
              <button
                onClick={goToPrevPage}
                className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{currentPage === 1 ? 'Portada' : 'Anterior'}</span>
              </button>

              {/* Page Dots Indicator */}
              <div className="hidden sm:flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-2 rounded-full transition-all ${
                      currentPage === page ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                    title={`Página ${page}`}
                  />
                ))}
              </div>

              {currentPage < totalPages ? (
                <button
                  onClick={goToNextPage}
                  className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 transition-colors shadow-md"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPage(1)}
                  className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-neutral-950 transition-colors"
                >
                  <span>Releer Libro</span>
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-pointer"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={activePhotoModal}
              alt="Detalle"
              className="max-h-[85vh] w-auto object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
