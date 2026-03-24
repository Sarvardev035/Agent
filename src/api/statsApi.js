import api from './axios';
export const statsApi = {
    summary: () => api.get('/api/analytics/summary'),
    overview: (params) => api.get('/api/analytics/overview', { params }),
    cashflow: (params) => api.get('/api/analytics/cashflow', { params }),
    balanceHistory: (params) => api.get('/api/analytics/balance-history', { params }),
    accountBalances: () => api.get('/api/analytics/account-balances'),
    recentLargeExpenses: (params) => api.get('/api/analytics/recent-large-expenses', { params }),
    incomeGrowth: (params) => api.get('/api/analytics/income-growth', { params }),
    insight: (params) => api.get('/api/analytics/insight', { params }),
    expensesByCategory: (params) => api.get('/api/analytics/expenses-by-category', { params }),
    monthlyExpenses: (params) => api.get('/api/analytics/monthly-expenses', { params }),
    incomeVsExpense: (params) => api.get('/api/analytics/income-vs-expense', { params }),
    categories: (params) => api.get('/api/analytics/categories', { params }),
    timeseries: (params) => api.get('/api/analytics/timeseries', { params }),
};
