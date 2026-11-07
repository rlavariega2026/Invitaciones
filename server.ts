import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Hostinger serves this app from /Invitaciones while Express handles paths internally.
app.use((req, _res, next) => {
  if (req.url === '/Invitaciones' || req.url.startsWith('/Invitaciones/')) {
    req.url = req.url.slice('/Invitaciones'.length) || '/';
  }
  next();
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INVITATIONS_FILE = path.join(DATA_DIR, 'invitations.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');

// Helper to read and write json data
function readData<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// REST Endpoints for Invitations
app.get('/api/invitations', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  res.json({ success: true, invitations });
});

app.get('/api/invitations/:id', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const invitation = invitations.find((i) => i.id === req.params.id);
  if (!invitation) {
    return res.status(404).json({ success: false, error: 'Invitación no encontrada' });
  }
  // Increment view count
  invitation.stats = invitation.stats || { views: 0, rsvps: 0 };
  invitation.stats.views = (invitation.stats.views || 0) + 1;
  writeData(INVITATIONS_FILE, invitations);

  res.json({ success: true, invitation });
});

app.post('/api/invitations', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const newInvitation = {
    ...req.body,
    id: req.body.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { views: 0, rsvps: 0 },
  };
  invitations.unshift(newInvitation);
  writeData(INVITATIONS_FILE, invitations);
  res.status(201).json({ success: true, invitation: newInvitation });
});

app.put('/api/invitations/:id', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const index = invitations.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    // If not existing yet, create it
    const newInv = {
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };
    invitations.unshift(newInv);
    writeData(INVITATIONS_FILE, invitations);
    return res.json({ success: true, invitation: newInv });
  }
  invitations[index] = {
    ...invitations[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeData(INVITATIONS_FILE, invitations);
  res.json({ success: true, invitation: invitations[index] });
});

app.delete('/api/invitations/:id', (req: Request, res: Response) => {
  let invitations = readData<any[]>(INVITATIONS_FILE, []);
  invitations = invitations.filter((i) => i.id !== req.params.id);
  writeData(INVITATIONS_FILE, invitations);
  res.json({ success: true, message: 'Invitación eliminada' });
});

app.post('/api/invitations/:id/duplicate', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const existing = invitations.find((i) => i.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'No se encontró la invitación a duplicar' });
  }
  const duplicated = {
    ...existing,
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${existing.title} (Copia)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { views: 0, rsvps: 0 },
  };
  invitations.unshift(duplicated);
  writeData(INVITATIONS_FILE, invitations);
  res.status(201).json({ success: true, invitation: duplicated });
});

// REST Endpoints for RSVPs & Access QR
app.get('/api/invitations/:id/rsvps', (req: Request, res: Response) => {
  const rsvps = readData<any[]>(RSVPS_FILE, []);
  const eventRsvps = rsvps.filter((r) => r.invitationId === req.params.id);
  res.json({ success: true, rsvps: eventRsvps });
});

app.post('/api/invitations/:id/rsvp', async (req: Request, res: Response) => {
  const rsvps = readData<any[]>(RSVPS_FILE, []);
  const { guestName, phone, email, companionsCount, attendance, dietaryRestrictions, message } = req.body;

  if (!guestName) {
    return res.status(400).json({ success: false, error: 'El nombre del invitado es obligatorio' });
  }

  const qrCode = `LAV-${req.params.id.slice(-6).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newRsvp = {
    id: `rsvp-${Date.now()}`,
    invitationId: req.params.id,
    guestName,
    phone: phone || '',
    email: email || '',
    companionsCount: Math.min(Math.max(parseInt(companionsCount, 10) || 1, 1), 5),
    attendance: attendance ?? true,
    dietaryRestrictions: dietaryRestrictions || '',
    message: message || '',
    qrCode,
    checkedIn: false,
    checkedInCount: 0,
    checkInHistory: [],
    createdAt: new Date().toISOString(),
  };

  rsvps.unshift(newRsvp);
  writeData(RSVPS_FILE, rsvps);

  // Update invitation rsvp stats
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const inv = invitations.find((i) => i.id === req.params.id);
  if (inv) {
    inv.stats = inv.stats || { views: 0, rsvps: 0 };
    inv.stats.rsvps = (inv.stats.rsvps || 0) + 1;
    writeData(INVITATIONS_FILE, invitations);
  }

  // Send an automatic WhatsApp Business template notification to the event client's number.
  // Credentials are configured only as server environment variables; never expose tokens in the browser.
  let whatsappNotification: { sent: boolean; reason?: string } = { sent: false, reason: 'WhatsApp Business API no está configurada.' };
  const clientPhone = String(inv?.clientWhatsApp || '').replace(/[^0-9]/g, '');
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const waTemplateName = process.env.WHATSAPP_RSVP_TEMPLATE || 'lav_rsvp_notification';
  const waLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'es_MX';
  if (clientPhone && waToken && waPhoneNumberId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v22.0/${waPhoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${waToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: clientPhone,
          type: 'template',
          template: {
            name: waTemplateName,
            language: { code: waLanguage },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: String(newRsvp.guestName).slice(0, 200) },
                { type: 'text', text: newRsvp.attendance ? 'CONFIRMÓ ASISTENCIA' : 'NO PODRÁ ASISTIR' },
                { type: 'text', text: String(newRsvp.companionsCount) },
                { type: 'text', text: String(inv?.title || 'Evento').slice(0, 200) },
                { type: 'text', text: newRsvp.qrCode }
              ]
            }]
          }
        })
      });
      const waResult: any = await response.json().catch(() => ({}));
      whatsappNotification = response.ok
        ? { sent: true }
        : { sent: false, reason: waResult?.error?.message || `WhatsApp API respondió HTTP ${response.status}` };
    } catch (error) {
      whatsappNotification = { sent: false, reason: error instanceof Error ? error.message : 'Error de conexión con WhatsApp.' };
    }
  } else if (!clientPhone) {
    whatsappNotification = { sent: false, reason: 'Falta configurar el WhatsApp del cliente en esta invitación.' };
  }

  res.status(201).json({ success: true, rsvp: newRsvp, whatsappNotification });
});

// Check-in verification endpoint for Host QR Scanner
app.post('/api/rsvps/checkin', (req: Request, res: Response) => {
  const rsvps = readData<any[]>(RSVPS_FILE, []);
  const { qrCode, peopleCheckingIn } = req.body;

  const rsvp = rsvps.find((r) => r.qrCode === qrCode);
  if (!rsvp) {
    return res.status(404).json({ success: false, error: 'Pase o código QR no encontrado' });
  }

  const countToEnter = Math.min(peopleCheckingIn || rsvp.companionsCount, rsvp.companionsCount - (rsvp.checkedInCount || 0));

  if (countToEnter <= 0 && rsvp.checkedInCount >= rsvp.companionsCount) {
    return res.status(400).json({
      success: false,
      error: 'Cupo completo: Todos los invitados de este pase ya ingresaron',
      rsvp,
    });
  }

  rsvp.checkedInCount = (rsvp.checkedInCount || 0) + countToEnter;
  rsvp.checkedIn = rsvp.checkedInCount >= rsvp.companionsCount;
  rsvp.checkInHistory = rsvp.checkInHistory || [];
  rsvp.checkInHistory.push({
    timestamp: new Date().toISOString(),
    entered: countToEnter,
    totalEntered: rsvp.checkedInCount,
  });

  writeData(RSVPS_FILE, rsvps);

  res.json({
    success: true,
    message: `Acceso registrado con éxito (${countToEnter} personas)`,
    rsvp,
  });
});

// Admin global stats
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const invitations = readData<any[]>(INVITATIONS_FILE, []);
  const rsvps = readData<any[]>(RSVPS_FILE, []);
  const totalViews = invitations.reduce((acc, i) => acc + (i.stats?.views || 0), 0);
  const totalGuests = rsvps.reduce((acc, r) => acc + (r.companionsCount || 1), 0);
  const totalCheckedIn = rsvps.reduce((acc, r) => acc + (r.checkedInCount || 0), 0);

  res.json({
    success: true,
    stats: {
      invitationsCount: invitations.length,
      rsvpsCount: rsvps.length,
      totalViews,
      totalGuests,
      totalCheckedIn,
    },
    recentRsvps: rsvps.slice(0, 10),
  });
});

// File upload endpoint for custom textures, photos and audio
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { filename, filedata, filetype } = req.body;
    if (!filedata) {
      return res.status(400).json({ success: false, error: 'No se recibieron datos de archivo' });
    }

    const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeName = `${Date.now()}-${(filename || 'archivo').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    // filedata can be base64 data url
    const base64Data = filedata.includes(';base64,') ? filedata.split(';base64,').pop() : filedata;
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/Invitaciones/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: 'Error al procesar el archivo subido' });
  }
});

// Hostinger Publishing & Direct HTML Export Endpoint
app.post('/api/hostinger/publish', (req: Request, res: Response) => {
  try {
    const { invitationId, slug, remoteDirectory, customDomain } = req.body;
    const invitations = readData<any[]>(INVITATIONS_FILE, []);
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invitación no encontrada' });
    }

    const safeSlug = (slug || inv.title || invitationId).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const domain = customDomain ? customDomain.replace(/\/$/, '') : 'https://lav-invitaciones.hostinger.site';
    const finalUrl = `${domain}/${safeSlug}`;

    inv.hostingerPublish = {
      isConfigured: true,
      remoteDir: remoteDirectory || '/public_html/invitaciones/',
      customDomain: domain,
      publicUrl: finalUrl,
      lastPublishedAt: new Date().toISOString(),
      publishStatus: 'published',
    };
    writeData(INVITATIONS_FILE, invitations);

    res.json({
      success: true,
      message: 'Invitación empaquetada y lista para Hostinger',
      publicUrl: finalUrl,
      slug: safeSlug,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al publicar en Hostinger' });
  }
});

app.get('/api/hostinger/export-html/:id', (req: Request, res: Response) => {
  try {
    const invitations = readData<any[]>(INVITATIONS_FILE, []);
    const inv = invitations.find((i) => i.id === req.params.id);
    if (!inv) {
      return res.status(404).send('Invitación no encontrada');
    }

    // Generate complete self-contained HTML for Hostinger cPanel File Manager upload
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>${inv.title} — Invitación de Gala</title>
  <meta name="description" content="Invitación digital exclusiva para ${inv.names}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: ${inv.backgroundColor || '#FDFBF7'}; color: #2D3748; }
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-playfair { font-family: 'Playfair Display', Georgia, serif; }
    .font-script { font-family: 'Great Vibes', cursive; }
  </style>
</head>
<body class="antialiased selection:bg-rose-100">
  <div class="max-w-xl mx-auto min-h-screen bg-white/80 shadow-2xl p-6 md:p-10 text-center space-y-8">
    <div class="py-8 border-b border-stone-200">
      <span class="text-xs uppercase tracking-widest text-[#9C7A3C] font-semibold">${inv.title}</span>
      <h1 class="text-3xl md:text-5xl font-script text-[#9C7A3C] my-3">${inv.names}</h1>
      <p class="text-xs text-stone-500 uppercase tracking-widest">${inv.eventDate} · ${inv.eventTime} hrs</p>
    </div>
    <div class="p-6 rounded-2xl bg-[#FAF5EB] border border-[#DFC48B]">
      <h2 class="text-xl font-cormorant font-bold text-slate-800">Lugar de Celebración</h2>
      <p class="text-sm text-stone-600 mt-2">${inv.eventLocation}</p>
    </div>
    <div class="py-6">
      <a href="/?invitationId=${inv.id}" class="inline-block px-8 py-3.5 rounded-full bg-[#DFC48B] text-slate-900 font-serif font-bold text-sm shadow-md hover:scale-105 transition-transform">
        Confirmar Asistencia (RSVP)
      </a>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${inv.id}-hostinger.html"`);
    res.send(html);
  } catch (err) {
    res.status(500).send('Error al exportar invitación');
  }
});

// Dev environment with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LAV Invitations running on port ${PORT}`);
  });
}

startServer();
