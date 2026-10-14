export const apiEnabled = import.meta.env.VITE_API_ENABLED === 'true';
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}
export function safeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' ||
      (u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname))
      ? u.href
      : '';
  } catch {
    return '';
  }
}
export const money = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
