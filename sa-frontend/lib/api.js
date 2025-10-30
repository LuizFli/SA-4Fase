import axios from 'axios';

// Default API URL for development. If you run the backend on another port, set NEXT_PUBLIC_API_URL.
const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  // you can add timeout etc. here if desired
});

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to normalize axios responses into a fetch-like shape used across the app
function success(res) {
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    json: async () => res.data,
    text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
  };
}

function failure(err) {
  if (err && err.response) {
    return {
      ok: false,
      status: err.response.status,
      json: async () => err.response.data,
      text: async () => JSON.stringify(err.response.data),
    };
  }
  return {
    ok: false,
    status: 0,
    json: async () => ({ error: err?.message || 'Network error' }),
    text: async () => (err?.message || 'Network error'),
  };
}

export default {
  get: async (path) => {
    try {
      const res = await client.get(path, { headers: { ...authHeaders() } });
      return success(res);
    } catch (err) { return failure(err); }
  },
  post: async (path, body, useAuth = false) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...(useAuth ? authHeaders() : {}) };
      const res = await client.post(path, body, { headers });
      return success(res);
    } catch (err) { return failure(err); }
  },
  put: async (path, body, useAuth = false) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...(useAuth ? authHeaders() : {}) };
      const res = await client.put(path, body, { headers });
      return success(res);
    } catch (err) { return failure(err); }
  },
  delete: async (path, useAuth = false) => {
    try {
      const headers = { ...(useAuth ? authHeaders() : {}) };
      const res = await client.delete(path, { headers });
      return success(res);
    } catch (err) { return failure(err); }
  },
};
