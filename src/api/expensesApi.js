import api from './axios';
export const expensesApi = {
    getAll: (params) => api.get('/api/expenses', { params }),
    create: (data) => api.post('/api/expenses', data),
    update: (id, data) => api.put(`/api/expenses/${id}`, data),
    delete: (id) => api.delete(`/api/expenses/${id}`),
};
