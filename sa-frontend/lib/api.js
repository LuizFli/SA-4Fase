// Default API URL for development. If you run the backend on another port, set NEXT_PUBLIC_API_URL.
const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function wrap(path){
  return base + path;
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default {
  get: (path) => fetch(wrap(path), { headers: { ...authHeaders() } }),
  post: (path, body, useAuth=false) => fetch(wrap(path), { method: 'POST', headers: { 'Content-Type': 'application/json', ...(useAuth ? authHeaders() : {}) }, body: JSON.stringify(body) }),
  put: (path, body, useAuth=false) => fetch(wrap(path), { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(useAuth ? authHeaders() : {}) }, body: JSON.stringify(body) }),
  delete: (path, useAuth=false) => fetch(wrap(path), { method: 'DELETE', headers: { ...(useAuth ? authHeaders() : {}) } }),
};
