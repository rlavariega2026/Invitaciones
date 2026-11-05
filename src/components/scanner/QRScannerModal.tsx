import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RSVPRecord } from '../../types/invitation';
import {
  QrCode,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ShieldCheck,
  UserCheck,
  Check,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationTitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  invitationTitle,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'qr' | 'search'>('qr');
  const [qrInput, setQrInput] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedRsvp, setCheckedRsvp] = useState<RSVPRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peopleToEnter, setPeopleToEnter] = useState<number>(1);
  const [allRsvps, setAllRsvps] = useState<RSVPRecord[]>([]);

  useEffect(() => {
    loadRsvps();
  }, []);

  const loadRsvps = async () => {
    try {
      const invs = await api.getInvitations();
      const list: RSVPRecord[] = [];
      for (const inv of invs) {
        const rsvps = await api.getRSVPs(inv.id);
        list.push(...rsvps);
      }
      setAllRsvps(list);
    } catch (e) {}
  };

  const handleValidate = async (qrToValidate: string, count: number) => {
    if (!qrToValidate.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.checkInGuest(qrToValidate.trim(), count);
      if (res.success && res.rsvp) {
        setCheckedRsvp(res.rsvp);
        setMessage(res.message);
        loadRsvps(); // refresh list
      } else {
        setError(res.message || 'Código QR inválido o cupo ya superado');
        if (res.rsvp) setCheckedRsvp(res.rsvp);
      }
    } catch (err) {
      setError('Error al procesar el acceso del invitado');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = nameQuery.trim()
    ? allRsvps.filter((r) =>
        r.guestName.toLowerCase().includes(nameQuery.toLowerCase()) ||
        r.qrCode.toLowerCase().includes(nameQuery.toLowerCase())
      )
    : allRsvps;

  const handleReset = () => {
    setQrInput('');
    setCheckedRsvp(null);
    setMessage(null);
    setError(null);
    setPeopleToEnter(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#FDFBF7] shadow-2xl border border-[#E8DEC8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4DA] bg-white/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#9C7A3C]" />
            <div>
              <h3 className="text-sm md:text-base font-serif font-bold text-slate-800">
                Control de Acceso / Validación de Pases
              </h3>
              <p className="text-[11px] text-stone-500">
                {invitationTitle || 'Valida pases por QR o búsqueda nominal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: QR Scanner vs Búsqueda por Nombre */}
        <div className="flex border-b border-[#EBE4DA] bg-white px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('qr');
              handleReset();
            }}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'qr'
                ? 'border-[#9C7A3C] text-[#9C7A3C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Validar Código QR
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              handleReset();
            }}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#9C7A3C] text-[#9C7A3C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Búsqueda Manual por Nombre ({allRsvps.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'qr' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleValidate(qrInput, peopleToEnter); }} className="space-y-4">
              <label className="block text-xs font-medium text-slate-700">
                Escanea o ingresa el código del Pase Digital:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ej. LAV-CHAMPA-X89..."
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !qrInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Validar</span>
                </button>
              </div>

              {/* People selector for partial entry */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-600">Personas ingresando en este momento:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setPeopleToEnter(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        peopleToEnter === n
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* Manual Search by Guest Name */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de invitado o código..."
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#DFC48B]"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredGuests.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">No se encontraron confirmaciones</p>
                ) : (
                  filteredGuests.map((r) => {
                    const remaining = r.companionsCount - (r.checkedInCount || 0);
                    return (
                      <div
                        key={r.id}
                        className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">{r.guestName}</span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            {r.qrCode} · Cupo: {r.companionsCount} | Adentro: {r.checkedInCount || 0}
                          </span>
                        </div>

                        {remaining > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleValidate(r.qrCode, 1)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Ingresar (+1)</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold">
                            Cupo Lleno
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Feedback Card */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                {checkedRsvp && (
                  <p className="mt-1 text-[11px] text-rose-700">
                    Invitado: {checkedRsvp.guestName} (Cupo: {checkedRsvp.companionsCount} | Ya ingresaron: {checkedRsvp.checkedInCount})
                  </p>
                )}
              </div>
            </div>
          )}

          {message && checkedRsvp && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm">¡Acceso Autorizado!</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl space-y-1">
                <p>
                  <strong>Titular:</strong> {checkedRsvp.guestName}
                </p>
                <p>
                  <strong>Cupo total autorizado:</strong> {checkedRsvp.companionsCount} personas
                </p>
                <p>
                  <strong>Personas dentro:</strong> {checkedRsvp.checkedInCount} / {checkedRsvp.companionsCount}
                </p>
                <p>
                  <strong>Lugares restantes:</strong> {Math.max(0, checkedRsvp.companionsCount - checkedRsvp.checkedInCount)} personas
                </p>
                {checkedRsvp.dietaryRestrictions && (
                  <p className="text-amber-800">
                    <strong>Alergias / Restricciones:</strong> {checkedRsvp.dietaryRestrictions}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Escanear Siguiente Invitado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
