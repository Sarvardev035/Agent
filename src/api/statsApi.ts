import api from './axios'

export const statsApi = {
  summary: () => api.get('/api/analytics/summary'),
  expensesByCategory: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/expenses-by-category', { params }),
  monthlyExpenses: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/monthly-expenses', { params }),
  incomeVsExpense: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/income-vs-expense', { params }),
  categories: (params?: { type?: 'EXPENSE' | 'INCOME'; startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/categories', { params }),
  timeseries: (params: { period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/timeseries', { params }),
}
