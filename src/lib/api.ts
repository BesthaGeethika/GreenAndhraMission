const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api`;

function token(): string | null {
  return localStorage.getItem('gam_token');
}

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = token();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed (${res.status})`);
  return data as T;
}

export const AUTH = {
  signup: (email: string, password: string, fullName: string, dob: string) =>
    api<{ token: string; user: any }>('/signup', { method: 'POST', body: { email, password, fullName, dob }, auth: false }),
  login: (email: string, password: string) =>
    api<{ token: string; user: any }>('/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => api<{ user: any }>('/me'),
};

export function setToken(t: string) {
  localStorage.setItem('gam_token', t);
}

export function clearToken() {
  localStorage.removeItem('gam_token');
}
