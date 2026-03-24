import api from '../lib/api';
export const budgetService = {
    getAll: (params) => api.get('/api/budgets', { params }),
    create: (d) => api.post('/api/budgets', d),
    delete: (id) => api.delete(`/api/budgets/${id}`),
};
export const budgetsService = budgetService;
