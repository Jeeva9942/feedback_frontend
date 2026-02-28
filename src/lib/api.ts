/**
 * Centralized API base URL.
 * - In production (Vercel frontend deploy): points to the separate backend
 * - In local development: Vite proxies /api/* to localhost:5000
 */
const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '';

/**
 * Wrapper around fetch that prepends the API base URL.
 * Usage: apiFetch('/api/login', { method: 'POST', body: ... })
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const url = `${API_BASE}${path}`;
    return fetch(url, options);
}
