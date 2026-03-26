// Base API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Token management
export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// Generic authenticated fetch helper
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`API Error: ${res.status} ${res.statusText}`, text);
    let errorMsg = `HTTP ${res.status}`;
    try {
      const err = JSON.parse(text);
      errorMsg = err.error || errorMsg;
    } catch (e) {
      errorMsg = `Server error (not JSON): ${res.status}`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}
