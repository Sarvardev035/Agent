import api from './axios';
export const budgetApi = {
    get: (params) => api.get('/api/budgets', { params }),
    set: (data) => api.post('/api/budgets', data),
    getCategories: (params) => api.get('/api/budgets', { params }),
    setCategory: (data) => api.post('/api/budgets', data),
};
