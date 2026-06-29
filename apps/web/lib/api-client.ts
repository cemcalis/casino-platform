const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function doFetch(path: string, headers: Record<string, string>, rest: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    ...rest,
  });
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { message?: string }).message ?? 'Request failed');
  }
}

async function request<T>(path: string, init?: RequestInit & { headers?: Record<string, string> }): Promise<T> {
  const { headers: customHeaders, ...rest } = init ?? {};
  const res = await doFetch(path, customHeaders ?? {}, rest);

  // Auto-refresh: on 401 with an Authorization header present, try refreshing once
  if (res.status === 401 && customHeaders?.['Authorization']) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      body: '{}',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (refreshRes.ok) {
      const { accessToken } = (await refreshRes.json()) as { accessToken: string };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', accessToken);
      }
      const retryHeaders: Record<string, string> = { ...(customHeaders as Record<string, string>), Authorization: `Bearer ${accessToken}` };
      const retryRes = await doFetch(path, retryHeaders, rest);
      await throwIfNotOk(retryRes);
      return retryRes.json() as Promise<T>;
    }
  }

  await throwIfNotOk(res);
  return res.json() as Promise<T>;
}

export const apiClient = {
  post: <T>(path: string, data: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data), headers }),
  get: <T>(path: string, token?: string) =>
    request<T>(path, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
};
