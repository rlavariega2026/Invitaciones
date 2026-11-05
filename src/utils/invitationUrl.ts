export function getInvitationUrl(invitationId: string, parameters: Record<string, string> = {}): string {
  // Shared links must always open on the canonical production application path,
  // even when the editor was opened through an alias domain.
  const url = new URL('https://lavdigitalagency.com/Invitaciones/');
  url.searchParams.set('invitationId', invitationId);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export function getDigitalPassUrl(passCode: string): string {
  const url = new URL('https://lavdigitalagency.com/Invitaciones/QR/');
  url.searchParams.set('passCode', passCode);
  return url.toString();
}
