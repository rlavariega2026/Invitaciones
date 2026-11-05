export function getInvitationUrl(invitationId: string, parameters: Record<string, string> = {}, routeName = invitationId): string {
  const safeRoute = routeName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || invitationId;
  const url = new URL(`https://lavdigitalagency.com/Invitaciones/Invitacionespost/${encodeURIComponent(safeRoute)}/`);
  url.searchParams.set('invitationId', invitationId);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export function getDigitalPassUrl(passCode: string): string {
  const safeCode = encodeURIComponent(passCode);
  return `https://lavdigitalagency.com/Invitaciones/QR/${safeCode}/`;
}
