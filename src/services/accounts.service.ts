import api from '../lib/api'

export interface Account {
  id: string
  name: string
  type: 'BANK_CARD' | 'CASH'
  currency: string
  balance: number
  createdAt?: string
  updatedAt?: string
}

export const accountsService = {
  getAll:  () => api.get('/api/accounts'),
  getOne:  (id: string) => api.get(`/api/accounts/${id}`),
  create:  (d: unknown) => api.post('/api/accounts', d),
  update:  (id: string, d: unknown) => api.put(`/api/accounts/${id}`, d),
  delete:  (id: string) => api.delete(`/api/accounts/${id}`),
}
