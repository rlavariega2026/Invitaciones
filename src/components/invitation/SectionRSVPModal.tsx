import React, { useState, useEffect } from 'react';
import { Invitation, RSVPRecord } from '../../types/invitation';
import { api } from '../../services/api';
import { getDigitalPassImageUrl } from '../../utils/invitationUrl';
import { createDigitalPassImage } from '../../utils/digitalPassImage';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { X, Check, Users, QrCode, Share2, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface SectionRSVPModalProps {
  invitation: Invitation;
  isOpen: boolean;
  onClose: () => void;
}

export const SectionRSVPModal: React.FC<SectionRSVPModalProps> = ({
  invitation,
  isOpen,
  onClose,
}) => {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companionsCount, setCompanionsCount] = useState(1);
  const [attendance, setAttendance] = useState(true);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRsvp, setConfirmedRsvp] = useState<RSVPRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [ticketImageUrl, setTicketImageUrl] = useState<string>('');
  const [ticketSaveError, setTicketSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCompanionsCount(authorizedPasses);
    setConfirmedRsvp(null);
    setQrDataUrl('');
    setTicketImageUrl('');
    setTicketSaveError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const authorizedPasses = Math.min(5, Math.max(1, Number(invitation.rsvpSettings?.maxCompanionsPerPass) || 1));
  const maxAllowed = authorizedPasses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await api.submitRSVP(invitation.id, {
        guestName,
        phone,
        email,
        companionsCount: authorizedPasses,
        attendance,
        dietaryRestrictions,
        message,
      });

      setConfirmedRsvp(result);

      try {
        const ticketPng = createDigitalPassImage(invitation, result);
        const imageUrl = await api.saveDigitalPassImage(result.qrCode, ticketPng);
        setTicketImageUrl(imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`);

        // The QR opens the saved ticket PNG itself, bypassing app and invitation routing.
        const qrImage = await QRCode.toDataURL(getDigitalPassImageUrl(result.qrCode), {
          width: 256,
          margin: 2,
          color: { dark: '#1A202C', light: '#FFFFFF' },
        });
        setQrDataUrl(qrImage);
      } catch (imageError) {
        setTicketSaveError(imageError instanceof Error ? imageError.message : 'No se pudo guardar el boleto PNG.');
      }

      // Trigger celebratory pastel confetti!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#DFC48B', '#F7D6D0', '#EAE6F8', '#E2ECE5'],
      });
    } catch (err) {
      console.error('Error submitting RSVP:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!confirmedRsvp) return;
    const passUrl = getDigitalPassImageUrl(confirmedRsvp.qrCode);

    const shareText = encodeURIComponent(
      `¡Hola! Confirmé mi asistencia para ${invitation.title} (${confirmedRsvp.companionsCount} personas). Puedes ver mi pase aquí: ${passUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#FDFBF7] shadow-2xl border border-[#E8DEC8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4DA] bg-white/70">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="text-base font-serif font-semibold text-slate-800">
              {confirmedRsvp ? '¡Confirmación Exitosa!' : 'Confirmar Asistencia'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!confirmedRsvp ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-rose-900 leading-relaxed">
                {invitation.rsvpSettings?.customMessage ||
                  'Nos encantará compartir este gran momento contigo. Por favor confirma tus lugares autorizados.'}
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Familia Sánchez Mendoza"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-800 mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. +52 55 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-800 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="nombre@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="font-semibold text-slate-800">Lugares autorizados para esta invitación</p>
                <p className="mt-1 text-amber-900 font-bold">{authorizedPasses} {authorizedPasses === 1 ? 'persona' : 'personas'}</p>
                <p className="mt-1 text-[10px] text-stone-600">La cantidad de pases fue establecida por los anfitriones y no se puede modificar desde esta invitación.</p>
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">¿Asistirás al evento?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendance(true)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      attendance
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Sí, con mucho gusto!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance(false)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      !attendance
                        ? 'border-rose-300 bg-rose-50 text-rose-800'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    <span>No podré asistir</span>
                  </button>
                </div>
              </div>

              {attendance && (
                <div>
                  <label className="block font-medium text-slate-800 mb-1">Alergias o Restricciones Alimentarias (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Menú vegetariano, celíaco, alergia a mariscos"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-800 mb-1">Mensaje para los Anfitriones</label>
                <textarea
                  rows={2}
                  placeholder="Escribe una dedicatoria o felicitación especial..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Guardando confirmación...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmar y Obtener Pase QR</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Confirmation Pass with Unique QR */
            <div className="space-y-5 text-center">
              <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-sm flex flex-col items-center">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full mb-2">
                  Pase Digital de Acceso
                </span>
                <h4 className="text-xl font-serif font-bold text-slate-800">{confirmedRsvp.guestName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pase válido para <strong>{confirmedRsvp.companionsCount} {confirmedRsvp.companionsCount === 1 ? 'persona' : 'personas'}</strong>
                </p>

                {qrDataUrl && (
                  <div className="p-3 bg-white rounded-2xl shadow-inner border border-stone-200 my-4">
                    <img src={qrDataUrl} alt="Pase QR" className="w-48 h-48 mx-auto" />
                  </div>
                )}

                <div className="font-mono text-xs font-semibold text-slate-600 bg-stone-100 px-3 py-1 rounded-lg">
                  {confirmedRsvp.qrCode}
                </div>
                {ticketImageUrl && <div className="mt-3 w-full"><img src={ticketImageUrl} alt={`Boleto digital de ${confirmedRsvp.guestName}`} className="mx-auto w-full max-w-xs rounded-xl border border-stone-200 shadow-sm" /><a href={ticketImageUrl} download={`${confirmedRsvp.qrCode}.png`} className="mt-2 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-[11px] font-semibold text-white">Descargar boleto PNG</a></div>}
                {ticketSaveError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-2 text-[10px] text-rose-700">{ticketSaveError}</p>}
                <p className="text-[11px] text-stone-500 mt-2">
                  Presenta este código en la entrada del evento para validar tu ingreso.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir en WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
