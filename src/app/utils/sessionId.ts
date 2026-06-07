export function generateSessionId(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${year}-${suffix}`;
}
