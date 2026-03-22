import api from './axios'

export const accountsApi = {
  getAll: () => api.get('/api/accounts'),
  create: (data: any) => api.post('/api/accounts', data),
  update: (id: string | number, data: any) => api.put(`/api/accounts/${id}`, data),
  delete: (id: string | number) => api.delete(`/api/accounts/${id}`),
}
