export function getInvitationUrl(invitationId: string, parameters: Record<string, string> = {}): string {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin);
  url.searchParams.set('invitationId', invitationId);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}
