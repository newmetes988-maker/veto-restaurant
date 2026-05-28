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

export const api = {
  get: (path, auth = true) =>
    fetch(`${API_BASE}${path}`, { headers: headers(auth) }).then((r) => r.json()),

  post: (path, body, auth = true) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: headers(auth),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  patch: (path, body, auth = true) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: headers(auth),
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};
