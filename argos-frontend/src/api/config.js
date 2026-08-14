export const API_ORIGIN = import.meta.env.VITE_API_URL.replace('/api/v1', '');

export function urlFoto(fotoUrl) {
  if (!fotoUrl) return null;
  return `${API_ORIGIN}${fotoUrl}`;
}