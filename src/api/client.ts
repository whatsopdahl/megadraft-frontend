export class ApiError extends Error {}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  idToken: string;
  body?: unknown;
}

export async function apiRequest<T>(path: string, { method, idToken, body }: RequestOptions): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    throw new ApiError('VITE_API_URL not configured');
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
