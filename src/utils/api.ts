const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const API_BASE_URL = rawBase ? rawBase.replace(/\/$/, '') : '';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`apiUrl expected absolute path, received: ${path}`);
  }
  return `${API_BASE_URL}${path}`;
}
