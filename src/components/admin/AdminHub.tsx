import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Eye,
  CheckCircle,
  DollarSign,
  Search,
  Download,
  Trash2,
  Edit,
  Power,
  Tag,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Invitation, RSVPRecord, PricingPlan, Coupon, Template } from '../../types';
import {
  saveInvitations,
  exportRSVPsToCSV,
  savePricing,
  saveCoupons,
  isAdminLoggedIn,
  setAdminLoggedIn,
} from '../../utils/storage';

interface AdminHubProps {
  invitations: Invitation[];
  rsvps: RSVPRecord[];
  pricing: PricingPlan[];
  coupons: Coupon[];
  templates: Template[];
  onRefreshData: () => void;
  onEditInvitation: (invitation: Invitation) => void;
  onViewInvitation: (slug: string) => void;
  onBackToHome: () => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({
  invitations,
  rsvps,
  pricing,
  coupons,
  templates,
  onRefreshData,
  onEditInvitation,
  onViewInvitation,
  onBackToHome,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminLoggedIn());
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'invitations' | 'rsvps' | 'pricing' | 'coupons'>('invitations');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilterEvent, setRsvpFilterEvent] = useState<string>('all');

  // New Coupon Form Modal
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);

  // Auth Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2026 or lavdigital
    if (adminPin.toLowerCase() === '2026' || adminPin.toLowerCase() === 'lav' || adminPin.toLowerCase() === 'lavdigital') {
      setAdminLoggedIn(true);
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
  };

  // Toggle Invitation Status (activa <-> suspendida)
  const toggleInvitationStatus = (id: string) => {
    const updated = invitations.map((inv) => {
      if (inv.id === id) {
        const nextStatus: 'activa' | 'suspendida' = inv.status === 'activa' ? 'suspendida' : 'activa';
        return { ...inv, status: nextStatus };
      }
      return inv;
    });
    saveInvitations(updated);
    onRefreshData();
  };

  // Delete Invitation
  const handleDeleteInvitation = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta invitación permanentemente?')) {
      const updated = invitations.filter((inv) => inv.id !== id);
      saveInvitations(updated);
      onRefreshData();
    }
  };

  // Update Package Price
  const handleUpdatePrice = (tierId: string, field: 'priceMxn' | 'priceUsd', val: number) => {
    const updated = pricing.map((p) => (p.id === tierId ? { ...p, [field]: val } : p));
    savePricing(updated);
    onRefreshData();
  };

  // Add Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const code = newCouponCode.trim().toUpperCase();
    const updated = [...coupons, { code, discountPercent: newCouponDiscount, active: true, usageCount: 0 }];
    saveCoupons(updated);
    setNewCouponCode('');
    onRefreshData();
  };

  const toggleCouponStatus = (code: string) => {
    const updated = coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c));
    saveCoupons(updated);
    onRefreshData();
  };

  // Filtered lists
  const filteredInvitations = invitations.filter((i) =>
    (i.title || i.hostNames).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRsvps = rsvps.filter((r) => {
    const matchEvent = rsvpFilterEvent === 'all' || r.invitationId === rsvpFilterEvent;
    const matchSearch = r.guestName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEvent && matchSearch;
  });

  // Calculate high-level metrics
  const totalVisits = invitations.reduce((acc, curr) => acc + (curr.visitsCount || 0), 0);
  const totalRsvpsCount = rsvps.length;
  const activeCount = invitations.filter((i) => i.status === 'activa').length;
  const estimatedRevenue = pricing.reduce((sum, p) => sum + p.priceMxn * 4, 12500);

  // If not logged in, show elegant PIN login card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-neutral-100">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-white">Panel de Administración</h2>
            <p className="text-xs text-neutral-400">
              Acceso seguro para el equipo de LAV Digital Marketing
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                PIN o Contraseña Maestra
              </label>
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Ingresa PIN (ej. 2026)"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-center tracking-widest text-white focus:border-amber-400 focus:outline-none"
              />
              {pinError && (
                <p className="text-[11px] text-rose-400 mt-1.5 text-center">
                  PIN incorrecto. Puedes ingresar: 2026
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 transition-colors shadow-lg"
            >
              Ingresar al Panel
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 transition-colors pt-2"
            >
              Regresar al portal principal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-base font-bold text-white">LAV Admin Hub</h1>
              <p className="text-[11px] text-neutral-400">Control maestro de invitaciones y precios</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white"
            >
              Ver Sitio Web
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-rose-400 hover:bg-neutral-800"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Cards Row (Tabular figures) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Total Invitaciones
            </span>
            <div className="font-playfair text-3xl font-bold text-white tabular-nums">
              {invitations.length}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">
              {activeCount} publicaciones activas
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Confirmaciones (RSVPs)
            </span>
            <div className="font-playfair text-3xl font-bold text-white tabular-nums">
              {totalRsvpsCount}
            </div>
            <p className="text-[11px] text-neutral-400">Registros en tiempo real</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Visitas Totales
            </span>
            <div className="font-playfair text-3xl font-bold text-amber-300 tabular-nums">
              {totalVisits.toLocaleString('es-MX')}
            </div>
            <p className="text-[11px] text-neutral-400">Vistas en dispositivos</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Ingresos Estimados
            </span>
            <div className="font-playfair text-3xl font-bold text-emerald-400 tabular-nums">
              ${estimatedRevenue.toLocaleString('es-MX')} <span className="text-xs">MXN</span>
            </div>
            <p className="text-[11px] text-neutral-400">Proyección comercial activa</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'invitations'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Gestión de Invitaciones ({invitations.length})
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'rsvps'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Confirmaciones RSVP ({rsvps.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'pricing'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Paquetes & Tarifas ({pricing.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'coupons'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cupones & Promociones ({coupons.length})
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: Invitations Management */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por anfitriones o título..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <span className="text-xs text-neutral-400 font-mono">
                {filteredInvitations.length} encontradas
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Evento / Anfitriones</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Visitas</th>
                    <th className="p-4">RSVPs</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{inv.title}</div>
                        <div className="text-[11px] text-neutral-400">{inv.hostNames}</div>
                      </td>
                      <td className="p-4 uppercase text-[11px] font-mono text-amber-400">
                        {inv.category}
                      </td>
                      <td className="p-4 tabular-nums">{inv.eventDate}</td>
                      <td className="p-4 tabular-nums font-mono text-neutral-300">
                        {inv.visitsCount || 0}
                      </td>
                      <td className="p-4 tabular-nums font-mono text-emerald-400 font-semibold">
                        {inv.rsvpsCount || 0}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'activa'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => onViewInvitation(inv.slug)}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 hover:text-white"
                          title="Abrir Invitación"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEditInvitation(inv)}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-amber-300 hover:bg-neutral-700"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleInvitationStatus(inv.id)}
                          className={`rounded-lg border p-1.5 ${
                            inv.status === 'activa'
                              ? 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                              : 'border-emerald-700 bg-emerald-950 text-emerald-400'
                          }`}
                          title={inv.status === 'activa' ? 'Suspender' : 'Activar'}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        {!inv.isDemo && (
                          <button
                            onClick={() => handleDeleteInvitation(inv.id)}
                            className="rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-rose-400 hover:bg-rose-950"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: RSVPs Central Manager */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={rsvpFilterEvent}
                  onChange={(e) => setRsvpFilterEvent(e.target.value)}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">Todos los eventos</option>
                  {invitations.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar invitado..."
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => exportRSVPsToCSV('LAV_Confirmaciones', filteredRsvps)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 transition-colors shadow"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Invitado</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Asiste</th>
                    <th className="p-4">Personas</th>
                    <th className="p-4">Restricciones Dietéticas</th>
                    <th className="p-4">Mensaje</th>
                    <th className="p-4">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {filteredRsvps.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white">{r.guestName}</td>
                      <td className="p-4 tabular-nums text-neutral-400">{r.guestPhone || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            r.attending ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {r.attending ? 'SÍ' : 'NO'}
                        </span>
                      </td>
                      <td className="p-4 tabular-nums font-mono text-center font-bold">
                        {r.attending ? r.guestsCount : 0}
                      </td>
                      <td className="p-4 text-neutral-400">{r.dietaryRestrictions || 'Ninguna'}</td>
                      <td className="p-4 text-neutral-400 italic max-w-xs truncate">{r.message || '—'}</td>
                      <td className="p-4 tabular-nums text-[11px] text-neutral-500">
                        {new Date(r.confirmedAt).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: Pricing Packages Manager */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-playfair text-xl font-bold text-white">Tarifas y Precios de Paquetes</h3>
              <p className="text-xs text-neutral-400">
                Ajusta los precios de venta en tiempo real para todos los clientes de la plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricing.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Paquete {plan.name}
                    </span>
                    <h4 className="font-playfair text-2xl font-bold text-white">{plan.name}</h4>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Precio en Pesos (MXN)</label>
                      <input
                        type="number"
                        value={plan.priceMxn}
                        onChange={(e) =>
                          handleUpdatePrice(plan.id, 'priceMxn', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Precio en Dólares (USD)</label>
                      <input
                        type="number"
                        value={plan.priceUsd}
                        onChange={(e) =>
                          handleUpdatePrice(plan.id, 'priceUsd', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-neutral-500">
                    Cambios guardados automáticamente en la plataforma.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: Coupons Manager */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-playfair text-xl font-bold text-white">Cupones y Descuentos</h3>
                <p className="text-xs text-neutral-400">Crea códigos de descuento para promociones y campañas</p>
              </div>
            </div>

            {/* Create Coupon Form */}
            <form onSubmit={handleAddCoupon} className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                placeholder="Código (ej. VERANO25)"
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-mono uppercase text-white focus:outline-none"
              />
              <select
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(parseInt(e.target.value, 10))}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={10}>10% Descuento</option>
                <option value={15}>15% Descuento</option>
                <option value={20}>20% Descuento</option>
                <option value={30}>30% Descuento</option>
                <option value={50}>50% Descuento</option>
              </select>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-amber-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crear Cupón</span>
              </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Descuento</th>
                    <th className="p-4">Usos Registrados</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-neutral-800/40">
                      <td className="p-4 font-mono font-bold text-amber-300">{c.code}</td>
                      <td className="p-4 font-semibold text-white">{c.discountPercent}% OFF</td>
                      <td className="p-4 font-mono tabular-nums">{c.usageCount} veces</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            c.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {c.active ? 'Activo' : 'Pausado'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleCouponStatus(c.code)}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs text-neutral-300 hover:text-white"
                        >
                          {c.active ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
