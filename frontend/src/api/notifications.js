import { request } from './client'

const BASE = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:8084'

export const notificationsApi = {
  list: () => request(`${BASE}/api/notifications`),
  create: (notification) =>
    request(`${BASE}/api/notifications`, { method: 'POST', body: JSON.stringify(notification) }),
}
