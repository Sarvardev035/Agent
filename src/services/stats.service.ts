import api from '../lib/api'

export const statsService = {
  expenses:  (period: string) =>
              api.get('/api/statistics/expenses', { params: { period } }),
  income:    (period: string) =>
              api.get('/api/statistics/income', { params: { period } }),
  breakdown: () => api.get('/api/statistics/category-breakdown'),
  vsIncome:  () => api.get('/api/statistics/income-vs-expense'),
}
