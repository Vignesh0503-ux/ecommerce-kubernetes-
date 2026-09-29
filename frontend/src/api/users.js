import { request } from './client'

const BASE = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081'

export const usersApi = {
  list: () => request(`${BASE}/api/users`),
  get: (id) => request(`${BASE}/api/users/${id}`),
  create: (user) => request(`${BASE}/api/users`, { method: 'POST', body: JSON.stringify(user) }),
  remove: (id) => request(`${BASE}/api/users/${id}`, { method: 'DELETE' }),
}
