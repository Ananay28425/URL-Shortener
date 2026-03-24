const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_PREFIX = `${API_BASE_URL}/api/v1`;

async function request(path, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload !== null && 'detail' in payload
      ? payload.detail
      : 'Request failed';
    throw new Error(detail);
  }

  return payload;
}

export function createShortUrl({ url, customAlias, expiresInDays }) {
  const body = {
    url,
    custom_alias: customAlias || null,
    expires_in_days: expiresInDays ? Number(expiresInDays) : null,
  };

  return request('/shorten', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listShortUrls() {
  return request('/shorten');
}

export function deleteShortUrl(shortCode) {
  return request(`/shorten/${shortCode}`, {
    method: 'DELETE',
  });
}

export function getAnalytics(shortCode) {
  return request(`/analytics/${shortCode}`);
}

export { API_BASE_URL };
