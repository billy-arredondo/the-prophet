/**
 * Typed fetch wrapper — all requests go through here.
 * Base URL is set via VITE_API_URL env variable.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = await res.text();
    }
    throw new ApiError(res.status, errorBody, `${method} ${path} → ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>('GET', path, undefined, signal),

  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body),

  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, body),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, body),

  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};
