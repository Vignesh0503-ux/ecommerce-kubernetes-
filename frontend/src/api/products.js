import { request } from './client'

const BASE = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8082'

export const productsApi = {
  list: () => request(`${BASE}/api/products`),
  get: (id) => request(`${BASE}/api/products/${id}`),
  create: (product) => request(`${BASE}/api/products`, { method: 'POST', body: JSON.stringify(product) }),
  update: (id, product) => request(`${BASE}/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  remove: (id) => request(`${BASE}/api/products/${id}`, { method: 'DELETE' }),
}
