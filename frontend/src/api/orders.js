import { request } from './client'

const BASE = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8083'

export const ordersApi = {
  list: () => request(`${BASE}/api/orders`),
  get: (id) => request(`${BASE}/api/orders/${id}`),
  create: (order) => request(`${BASE}/api/orders`, { method: 'POST', body: JSON.stringify(order) }),
  updateStatus: (id, status) =>
    request(`${BASE}/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
}
