import api from '../lib/api'

export const notificationsService = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
}
