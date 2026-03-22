import api from '../lib/api'

export const categoriesService = {
  getAll: () => api.get('/api/categories'),
  getByType: (type: 'EXPENSE' | 'INCOME') =>
    api.get('/api/categories', { params: { type } }),
  create: (d: { name: string; type: 'EXPENSE' | 'INCOME' }) =>
    api.post('/api/categories', d),
}
