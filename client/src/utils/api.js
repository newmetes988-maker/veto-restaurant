const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const getToken = () => localStorage.getItem('admin_token');

const headers = (auth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const authHeaders = (auth = true) => {
  const h = {};
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const parseJson = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { status: 'error', message: text.slice(0, 200) };
};

export const api = {
  get: (path, auth = true) =>
    fetch(`${API_BASE}${path}`, { headers: headers(auth) }).then(parseJson),

  post: (path, body, auth = true) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: headers(auth),
      body: JSON.stringify(body),
    }).then(parseJson),

  patch: (path, body, auth = true) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: headers(auth),
      body: JSON.stringify(body),
    }).then(parseJson),

  upload: (path, formData, auth = true) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(auth),
      body: formData,
    }).then(parseJson),
};
