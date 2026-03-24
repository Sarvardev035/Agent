import api from '../lib/api';
export const analyticsService = {
    summary: () => api.get('/api/analytics/summary'),
    expensesByCategory: (params) => api.get('/api/analytics/expenses-by-category', { params }),
    monthlyExpenses: (params) => api.get('/api/analytics/monthly-expenses', { params }),
    incomeVsExpense: (params) => api.get('/api/analytics/income-vs-expense', { params }),
    accountBalances: () => api.get('/api/analytics/account-balances'),
    dashboard: (params) => api.get('/api/analytics/dashboard', { params }),
    categories: (params) => api.get('/api/analytics/categories', { params }),
    timeseries: (params) => api.get('/api/analytics/timeseries', { params }),
};
