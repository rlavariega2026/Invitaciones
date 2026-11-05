import { Invitation, RSVPRecord } from '../types/invitation';
import { TEMPLATES_CATALOG, buildInvitationFromTemplate } from '../data/templates';

const API_BASE = `${import.meta.env.BASE_URL}api`;

const STORAGE_KEY_INVITATIONS = 'lav_invitations_cache';
const STORAGE_KEY_RSVPS = 'lav_rsvps_cache';

// Seed initial invitations if storage is empty
function getLocalInitialInvitations(): Invitation[] {
  const cached = localStorage.getItem(STORAGE_KEY_INVITATIONS);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // Pre-seed prominent showcase invitations from the catalog
  const seeds: Invitation[] = TEMPLATES_CATALOG.slice(0, 11).map((t) =>
    buildInvitationFromTemplate(t)
  );

  localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(seeds));
  return seeds;
}

function cacheInvitation(invitation: Invitation): void {
  const local = getLocalInitialInvitations();
  const idx = local.findIndex((item) => item.id === invitation.id);
  const updated = { ...invitation, updatedAt: new Date().toISOString() };
  if (idx >= 0) local[idx] = updated;
  else local.unshift(updated);
  localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(local));
}

async function saveInvitationToServer(invitation: Invitation): Promise<Invitation> {
  const response = await fetch(`${API_BASE}/invitations/${invitation.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invitation),
  });
  if (!response.ok) throw new Error(`El servidor rechazó el guardado (HTTP ${response.status}).`);
  const data = await response.json();
  if (!data?.success || !data?.invitation) throw new Error('El servidor no confirmó el guardado de la invitación.');
  return data.invitation;
}

export const api = {
  async uploadImage(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen'));
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Imagen inválida'));
      reader.readAsDataURL(file);
    });
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filedata: dataUrl, filename: file.name }),
      });
      const result = await response.json();
      if (response.ok && result.success && typeof result.url === 'string') return result.url;
    } catch (error) {
      console.warn('Image upload endpoint unavailable; retaining the original image in the invitation data.');
    }
    return dataUrl;
  },

  async getInvitations(): Promise<Invitation[]> {
    try {
      const res = await fetch(`${API_BASE}/invitations`);
      if (res.ok) {
        const data = await res.json();
        if (data.invitations && data.invitations.length > 0) {
          localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(data.invitations));
          return data.invitations;
        }
      }
    } catch (err) {
      console.warn('Backend /api/invitations unreachable, using local storage cache');
    }

    // Fallback: seed or read local storage
    const local = getLocalInitialInvitations();
    // Try sending initial seeds to backend if empty
    try {
      for (const item of local.slice(0, 3)) {
        fetch(`${API_BASE}/invitations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(() => {});
      }
    } catch (e) {}
    return local;
  },

  async getInvitationById(id: string): Promise<Invitation | null> {
    try {
      const res = await fetch(`${API_BASE}/invitations/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.invitation;
      }
    } catch (err) {
      console.warn(`Backend /api/invitations/${id} unreachable, searching cache`);
    }

    const local = getLocalInitialInvitations();
    const found = local.find((i) => i.id === id);
    if (found) return found;

    // Check if it's a template ID like 'inv-royal-champagne' or matches template catalog directly
    const templateMatch = TEMPLATES_CATALOG.find((t) => t.id === id || `inv-${t.id}` === id);
    if (templateMatch) {
      return buildInvitationFromTemplate(templateMatch, id);
    }

    // Default to first template if not found
    return buildInvitationFromTemplate(TEMPLATES_CATALOG[0], id);
  },

  async saveInvitation(invitation: Invitation): Promise<Invitation> {
    // Save to local storage first
    cacheInvitation(invitation);

    try {
      return await saveInvitationToServer(invitation);
    } catch (err) {
      console.warn('Backend save failed, saved to local cache');
    }

    return invitation;
  },

  async saveInvitationChecked(invitation: Invitation): Promise<Invitation> {
    cacheInvitation(invitation);
    return saveInvitationToServer(invitation);
  },

  async duplicateInvitation(id: string): Promise<Invitation | null> {
    try {
      const res = await fetch(`${API_BASE}/invitations/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.invitation;
      }
    } catch (e) {}

    const local = getLocalInitialInvitations();
    const existing = local.find((i) => i.id === id);
    if (!existing) return null;

    const copy: Invitation = {
      ...existing,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${existing.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    local.unshift(copy);
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(local));
    return copy;
  },

  async deleteInvitation(id: string): Promise<boolean> {
    const local = getLocalInitialInvitations().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(local));

    try {
      await fetch(`${API_BASE}/invitations/${id}`, { method: 'DELETE' });
    } catch (e) {}
    return true;
  },

  async submitRSVP(invitationId: string, payload: any): Promise<RSVPRecord> {
    try {
      const res = await fetch(`${API_BASE}/invitations/${invitationId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.rsvp;
      }
    } catch (e) {
      console.warn('Backend rsvp post failed, generating local fallback');
    }

    const qrCode = `LAV-${invitationId.slice(-6).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newRsvp: RSVPRecord = {
      id: `rsvp-${Date.now()}`,
      invitationId,
      guestName: payload.guestName,
      phone: payload.phone || '',
      email: payload.email || '',
      companionsCount: payload.companionsCount || 1,
      attendance: payload.attendance ?? true,
      dietaryRestrictions: payload.dietaryRestrictions || '',
      message: payload.message || '',
      qrCode,
      checkedIn: false,
      checkedInCount: 0,
      createdAt: new Date().toISOString(),
    };

    const cachedRsvps = JSON.parse(localStorage.getItem(STORAGE_KEY_RSVPS) || '[]');
    cachedRsvps.unshift(newRsvp);
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(cachedRsvps));

    return newRsvp;
  },

  async getRSVPs(invitationId: string): Promise<RSVPRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/invitations/${invitationId}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        return data.rsvps;
      }
    } catch (e) {}

    const cachedRsvps: RSVPRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY_RSVPS) || '[]');
    return cachedRsvps.filter((r) => r.invitationId === invitationId);
  },

  async checkInGuest(qrCode: string, peopleCount?: number): Promise<{ success: boolean; message: string; rsvp?: RSVPRecord }> {
    try {
      const res = await fetch(`${API_BASE}/rsvps/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode, peopleCheckingIn: peopleCount }),
      });
      const data = await res.json();
      return data;
    } catch (e) {}

    const cachedRsvps: RSVPRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY_RSVPS) || '[]');
    const rsvp = cachedRsvps.find((r) => r.qrCode === qrCode);
    if (!rsvp) {
      return { success: false, message: 'Código QR no encontrado en el sistema local' };
    }

    const count = peopleCount || rsvp.companionsCount;
    if (rsvp.checkedInCount >= rsvp.companionsCount) {
      return { success: false, message: 'Cupo completo: Todos los invitados ya ingresaron', rsvp };
    }

    rsvp.checkedInCount = Math.min(rsvp.companionsCount, (rsvp.checkedInCount || 0) + count);
    rsvp.checkedIn = rsvp.checkedInCount >= rsvp.companionsCount;
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(cachedRsvps));

    return {
      success: true,
      message: `Acceso registrado con éxito (${count} personas)`,
      rsvp,
    };
  },
};
