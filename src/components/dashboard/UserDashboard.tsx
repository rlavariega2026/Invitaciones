import React, { useState, useEffect } from 'react';
import { Invitation, RSVPRecord } from '../../types/invitation';
import { TEMPLATES_CATALOG, buildInvitationFromTemplate } from '../../data/templates';
import { api } from '../../services/api';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { QRScannerModal } from '../scanner/QRScannerModal';
import { HostingerPublishModal } from '../hostinger/HostingerPublishModal';
import {
  Sparkles,
  Plus,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Users,
  Search,
  Filter,
  Share2,
  QrCode,
  Heart,
  BarChart3,
  Layers,
  Settings,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Globe,
} from 'lucide-react';

interface UserDashboardProps {
  onOpenEditor: (invitation: Invitation) => void;
  onPreviewInvitation: (id: string) => void;
  onOpenAdmin: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenEditor,
  onPreviewInvitation,
  onOpenAdmin,
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invitations' | 'templates' | 'rsvps' | 'stats'>('invitations');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [publishingInv, setPublishingInv] = useState<Invitation | null>(null);
  const [allRsvps, setAllRsvps] = useState<RSVPRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const invs = await api.getInvitations();
      setInvitations(invs);

      // Collect RSVPs across all user events
      const rsvpList: RSVPRecord[] = [];
      for (const inv of invs.slice(0, 5)) {
        const res = await api.getRSVPs(inv.id);
        rsvpList.push(...res);
      }
      setAllRsvps(rsvpList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const template = TEMPLATES_CATALOG.find((t) => t.id === templateId) || TEMPLATES_CATALOG[0];
    const newInv = buildInvitationFromTemplate(
      template,
      `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    );
    const saved = await api.saveInvitation(newInv);
    setInvitations([saved, ...invitations]);
    onOpenEditor(saved);
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await api.duplicateInvitation(id);
    if (duplicated) {
      setInvitations([duplicated, ...invitations]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta invitación?')) {
      await api.deleteInvitation(id);
      setInvitations(invitations.filter((i) => i.id !== id));
    }
  };

  const filteredTemplates =
    selectedCategory === 'todas'
      ? TEMPLATES_CATALOG
      : TEMPLATES_CATALOG.filter((t) => t.category === selectedCategory);

  const totalViews = invitations.reduce((acc, i) => acc + (i.stats?.views || 0), 0);
  const totalRsvps = invitations.reduce((acc, i) => acc + (i.stats?.rsvps || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col">
      {/* Top Navigation Bar: Zone Contract */}
      <header className="h-16 bg-white/85 backdrop-blur-md border-b border-[#EBE4DA] px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DFC48B] via-[#EAE6F8] to-[#FCEFEF] flex items-center justify-center border border-[#DFC48B]/50 shadow-xs">
            <span className="font-serif font-black text-slate-900 text-xs tracking-wider">LAV</span>
          </div>
          <span className="text-base font-serif font-bold text-slate-900 tracking-tight">
            LAV Invitations
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('invitations')}
            className={`hover:text-slate-900 transition-colors cursor-pointer ${
              activeTab === 'invitations' ? 'text-[#9C7A3C] font-semibold border-b-2 border-[#DFC48B] pb-1' : ''
            }`}
          >
            Mis Invitaciones
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`hover:text-slate-900 transition-colors cursor-pointer ${
              activeTab === 'templates' ? 'text-[#9C7A3C] font-semibold border-b-2 border-[#DFC48B] pb-1' : ''
            }`}
          >
            60 Plantillas
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`hover:text-slate-900 transition-colors cursor-pointer ${
              activeTab === 'rsvps' ? 'text-[#9C7A3C] font-semibold border-b-2 border-[#DFC48B] pb-1' : ''
            }`}
          >
            Invitados Confirmados ({allRsvps.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`hover:text-slate-900 transition-colors cursor-pointer ${
              activeTab === 'stats' ? 'text-[#9C7A3C] font-semibold border-b-2 border-[#DFC48B] pb-1' : ''
            }`}
          >
            Métricas
          </button>
        </nav>

        {/* Zone 3: Primary Action & Install Button */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            onClick={() => setShowQRScanner(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
            title="Escanear pases en la puerta"
          >
            <QrCode className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Escanear QR</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Crear Invitación</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Welcome & Quick Stats Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FAF5EB] via-[#FDF8F5] to-[#F7EDF4] border border-[#E8DEC8] p-6 md:p-8 shadow-xs overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] uppercase tracking-widest text-[#9C7A3C] font-semibold block mb-1">
              Plataforma Premium de Invitaciones Digitales
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-tight">
              Crea experiencias inolvidables para tus invitados
            </h2>
            <p className="text-xs md:text-sm text-stone-600 font-light mt-2 leading-relaxed">
              Diseña con estética pastel, música ambiental, 8 formatos interactivos y confirmación RSVP con códigos QR únicos.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DEC8]/60 flex flex-wrap items-center gap-6 md:gap-10 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Invitaciones Creadas</span>
              <span className="text-xl font-serif font-bold text-slate-800">{invitations.length}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Visualizaciones Totales</span>
              <span className="text-xl font-serif font-bold text-slate-800">{totalViews}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">RSVP Confirmados</span>
              <span className="text-xl font-serif font-bold text-slate-800">{totalRsvps}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'invitations', label: 'Mis Invitaciones' },
            { id: 'templates', label: '30 Plantillas' },
            { id: 'rsvps', label: 'RSVP' },
            { id: 'stats', label: 'Métricas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* VIEW: MIS INVITACIONES */}
        {activeTab === 'invitations' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-800">Tus Invitaciones Activas</h3>
                <p className="text-xs text-stone-500">Administra, edita y comparte tus enlaces de gala</p>
              </div>
              <button
                onClick={() => setActiveTab('templates')}
                className="text-xs text-[#9C7A3C] hover:underline font-semibold"
              >
                + Explorar 30 Plantillas
              </button>
            </div>

            {invitations.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-stone-300">
                <Sparkles className="w-8 h-8 text-[#DFC48B] mx-auto mb-3" />
                <h4 className="text-base font-serif font-bold text-slate-800">Aún no has creado una invitación</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Elige una de nuestras 30 plantillas exclusivas y personalízala a tu gusto.
                </p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 text-xs font-semibold"
                >
                  Ver Plantillas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="group rounded-3xl bg-white border border-[#E8DEC8] hover:border-[#DFC48B] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Header Card Preview */}
                    <div className="relative h-44 bg-stone-100 overflow-hidden">
                      {inv.sections.find((s) => s.photo)?.photo?.url ? (
                        <img
                          src={inv.sections.find((s) => s.photo)?.photo?.url}
                          alt={inv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#FAF5EB] to-[#FCEFEF] flex items-center justify-center">
                          <Heart className="w-8 h-8 text-[#DFC48B]" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-stone-700 uppercase tracking-wider">
                        {inv.presentationFormat}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#9C7A3C] font-semibold">
                          {inv.category}
                        </div>
                        <h4 className="text-base font-serif font-bold text-slate-800 mt-0.5">{inv.title}</h4>
                        <p className="text-xs text-stone-500 font-serif italic">{inv.names}</p>

                        <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {inv.eventDate}
                          </span>
                          <span>·</span>
                          <span>{inv.stats?.views || 0} Vistas</span>
                          <span>·</span>
                          <span>{inv.stats?.rsvps || 0} Confirmados</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenEditor(inv)}
                            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors"
                            title="Editar en el estudio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPreviewInvitation(inv.id)}
                            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors"
                            title="Ver como invitado"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(inv.id)}
                            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors"
                            title="Duplicar invitación"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/?invitationId=${inv.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              alert('¡Enlace de invitación copiado al portapapeles!');
                            }}
                            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                            title="Copiar enlace directo"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPublishingInv(inv)}
                            className="p-2 text-purple-700 hover:text-purple-900 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Publicar en Hostinger"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW: 30 PLANTILLAS */}
        {activeTab === 'templates' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">Catálogo de las 30 Plantillas Premium</h3>
                <p className="text-xs text-stone-500">
                  Cada plantilla cuenta con identidad visual única, tratamiento fotográfico y fondos exclusivos.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto text-xs">
                {[
                  { id: 'todas', label: 'Todas (60)' },
                  { id: 'bodas', label: 'Bodas & Galas (22)' },
                  { id: 'xv_anos', label: 'XV Años (6)' },
                  { id: 'graduaciones', label: 'Graduaciones (5)' },
                  { id: 'cumpleanos', label: 'Cumpleaños (10)' },
                  { id: 'infantiles', label: 'Infantiles (11)' },
                  { id: 'especiales', label: 'Especiales (6)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-3xl bg-white border border-[#E8DEC8] hover:border-[#DFC48B] hover:shadow-lg transition-all overflow-hidden flex flex-col group"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={tpl.previewImage}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-stone-800 uppercase tracking-wider">
                      {tpl.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-base font-serif font-bold text-slate-800">{tpl.name}</h4>
                      <p className="text-xs text-stone-600 font-light mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400">Paleta:</span>
                        <div className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tpl.palette.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tpl.palette.accent }} />
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: tpl.palette.background }} />
                        </div>
                        <span className="text-[10px] text-stone-400 ml-auto capitalize">
                          Formato: {tpl.defaultFormat}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateFromTemplate(tpl.id)}
                      className="w-full py-2.5 rounded-xl bg-[#DFC48B] hover:bg-[#D5B676] text-slate-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Usar Esta Plantilla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW: RSVPS & GUESTS */}
        {activeTab === 'rsvps' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">Invitados Confirmados (RSVP)</h3>
                <p className="text-xs text-stone-500">
                  Lista en tiempo real con pases QR y registro de asistencia
                </p>
              </div>
              <button
                onClick={() => setShowQRScanner(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Abrir Escáner de Acceso</span>
              </button>
            </div>

            {allRsvps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
                <Users className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-500">Aún no hay confirmaciones registradas para tus eventos.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E8DEC8] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-stone-500 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Invitado / Titular</th>
                        <th className="py-3 px-4">Lugares</th>
                        <th className="py-3 px-4">Código QR</th>
                        <th className="py-3 px-4">Estado Acceso</th>
                        <th className="py-3 px-4">Alergias / Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {allRsvps.map((r) => (
                        <tr key={r.id} className="hover:bg-stone-50/60">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{r.guestName}</span>
                            <span className="text-[11px] text-stone-400">{r.phone || r.email || 'Sin contacto'}</span>
                          </td>
                          <td className="py-3 px-4 tabular-nums font-semibold">{r.companionsCount} personas</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#9C7A3C]">{r.qrCode}</td>
                          <td className="py-3 px-4">
                            {r.checkedIn ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                Ingresó ({r.checkedInCount}/{r.companionsCount})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-stone-500">
                            {r.dietaryRestrictions || r.message || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VIEW: METRICS & STATS */}
        {activeTab === 'stats' && (
          <section className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-800">Métricas & Rendimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Aperturas de Enlaces</span>
                <div className="text-3xl font-serif font-bold text-slate-800 mt-2 tabular-nums">{totalViews}</div>
                <p className="text-[11px] text-stone-400 mt-1">Visitantes únicos de tus invitaciones</p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Tasa de Confirmación</span>
                <div className="text-3xl font-serif font-bold text-slate-800 mt-2 tabular-nums">
                  {totalViews > 0 ? Math.round((totalRsvps / totalViews) * 100) : 0}%
                </div>
                <p className="text-[11px] text-stone-400 mt-1">De visitas convertidas en confirmaciones</p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Pases QR Escaneados</span>
                <div className="text-3xl font-serif font-bold text-slate-800 mt-2 tabular-nums">
                  {allRsvps.filter((r) => r.checkedIn).length}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Registrados en la puerta del evento</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* QR Access Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal isOpen={true} onClose={() => setShowQRScanner(false)} />
      )}

      {/* Hostinger Publishing Modal */}
      {publishingInv && (
        <HostingerPublishModal
          invitation={publishingInv}
          isOpen={true}
          onClose={() => setPublishingInv(null)}
          onUpdateInvitation={(updated) => {
            setInvitations(invitations.map((i) => (i.id === updated.id ? updated : i)));
            setPublishingInv(null);
          }}
        />
      )}
    </div>
  );
};
