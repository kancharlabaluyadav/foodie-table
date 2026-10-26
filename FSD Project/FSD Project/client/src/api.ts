export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch('/api' + path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'The request could not be completed.';
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

export const formatMoney = (paise: number, currency = 'INR'): string => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(paise / 100);
