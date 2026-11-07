import { Invitation, RSVPRecord } from '../types/invitation';

const themes: Record<string, { accent: string; dark: string; paper: string; ornament: string }> = {
  bodas: { accent: '#C6A15B', dark: '#282638', paper: '#FFFDF7', ornament: '✦' },
  xv_anos: { accent: '#C77DA8', dark: '#392344', paper: '#FFF8FC', ornament: '✿' },
  graduaciones: { accent: '#53919A', dark: '#173B50', paper: '#F7FCFC', ornament: '✧' },
  cumpleanos: { accent: '#E47E61', dark: '#4A263B', paper: '#FFFAF6', ornament: '✹' },
  infantiles: { accent: '#69A987', dark: '#244A45', paper: '#F8FFF9', ornament: '☼' },
  especiales: { accent: '#8877C7', dark: '#30284D', paper: '#FBFAFF', ornament: '❖' },
};

function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function createDigitalPassImage(invitation: Invitation, pass: RSVPRecord): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear la imagen PNG del boleto.');

  const theme = themes[invitation.category] || themes.especiales;
  const gradient = ctx.createLinearGradient(0, 0, 1200, 1600);
  gradient.addColorStop(0, theme.dark);
  gradient.addColorStop(1, '#171A2B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative category-specific pattern around a warm ticket card.
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = theme.accent;
  ctx.font = '48px Georgia';
  for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
    ctx.fillText(theme.ornament, 56 + col * 276 + (row % 2) * 34, 90 + row * 238);
  }
  ctx.globalAlpha = 1;

  const x = 90, y = 90, w = 1020, h = 1420;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 42);
  ctx.fillStyle = theme.paper;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = `${theme.accent}AA`;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, 560, [42, 42, 0, 0]);
  ctx.clip();
  const header = ctx.createLinearGradient(x, y, x + w, y + 560);
  header.addColorStop(0, theme.dark);
  header.addColorStop(1, '#171A2B');
  ctx.fillStyle = header;
  ctx.fillRect(x, y, w, 560);
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = theme.accent;
  ctx.font = '72px Georgia';
  for (let i = 0; i < 5; i++) ctx.fillText(theme.ornament, x + 80 + i * 205, y + 120 + (i % 2) * 75);
  ctx.restore();

  const center = x + w / 2;
  const categoryLabels: Record<string, string> = { bodas: 'BODAS & GALAS', xv_anos: 'XV AÑOS', graduaciones: 'GRADUACIÓN', cumpleanos: 'CUMPLEAÑOS', infantiles: 'FIESTA INFANTIL', especiales: 'EVENTO ESPECIAL' };
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 26px Arial';
  ctx.fillText(categoryLabels[invitation.category] || categoryLabels.especiales, center, y + 205);
  // El boleto muestra el nombre personalizado de los anfitriones, nunca el
  // título interno de la plantilla/archivo.
  ctx.fillStyle = '#FFFFFFD9';
  ctx.font = 'italic 38px Georgia';
  fitText(ctx, invitation.names || 'Nuestros anfitriones', 820)
    .forEach((line, index) => ctx.fillText(line, center, y + 365 + index * 48));

  ctx.textAlign = 'left';
  ctx.fillStyle = '#7A7881';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('PASE A NOMBRE DE', x + 82, y + 660);
  ctx.fillStyle = '#25283A';
  ctx.font = '54px Georgia';
  fitText(ctx, pass.guestName || 'Invitado', 850).forEach((line, index) => ctx.fillText(line, x + 82, y + 735 + index * 62));
  ctx.fillStyle = '#585966';
  ctx.font = '30px Arial';
  const seats = Math.max(1, Number(pass.companionsCount) || 1);
  ctx.fillText(`${seats} ${seats === 1 ? 'asiento autorizado' : 'asientos autorizados'}`, x + 82, y + 850);

  ctx.setLineDash([14, 13]);
  ctx.strokeStyle = '#D6D2C9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 55, y + 900);
  ctx.lineTo(x + w - 55, y + 900);
  ctx.stroke();
  ctx.setLineDash([]);

  const dateText = invitation.eventDate
    ? new Date(`${invitation.eventDate}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Por confirmar';
  const drawDetail = (label: string, value: string, left: number, top: number, maxWidth: number) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8B8992';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(label.toUpperCase(), left, top);
    ctx.fillStyle = '#2C2E3A';
    ctx.font = '28px Arial';
    fitText(ctx, value || 'Por confirmar', maxWidth).forEach((line, index) => ctx.fillText(line, left, top + 42 + index * 38));
  };
  drawDetail('Fecha', dateText, x + 82, y + 980, 400);
  drawDetail('Hora', invitation.eventTime || 'Por confirmar', x + 560, y + 980, 350);
  drawDetail('Lugar', invitation.eventLocation || 'Por confirmar', x + 82, y + 1120, 850);

  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 22px Arial';
  ctx.fillText('CÓDIGO DE ACCESO', center, y + 1305);
  ctx.fillStyle = '#242637';
  ctx.font = 'bold 34px monospace';
  ctx.fillText(pass.qrCode, center, y + 1360);
  ctx.fillStyle = '#88858E';
  ctx.font = '20px Arial';
  ctx.fillText('Presenta este boleto en la entrada · LAV Invitations', center, y + 1400);

  return canvas.toDataURL('image/png');
}
