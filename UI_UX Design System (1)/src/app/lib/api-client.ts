// ============================================================
// API Client  HTTP wrapper for the NestJS backend
// ============================================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const response = await fetch(API_BASE_URL + endpoint, { ...options, headers });

  if (response.status === 204) return undefined as T;

  if (response.headers.get('Content-Type')?.includes('application/pdf')) {
    return response.blob() as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'API Error';
    const error: any = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data as T;
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function apiDelete<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

export { API_BASE_URL };