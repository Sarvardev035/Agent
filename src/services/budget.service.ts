import api from '../lib/api'

export const budgetService = {
  get:           () => api.get('/api/budget'),
  set:           (d: unknown) => api.post('/api/budget', d),
  getCategories: () => api.get('/api/budget/categories'),
  setCategory:   (d: unknown) => api.post('/api/budget/categories', d),
}
