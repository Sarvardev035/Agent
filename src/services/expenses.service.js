import api from '../lib/api';
export const expensesService = {
    getAll: (params) => api.get('/api/expenses', { params }),
    create: (d) => api.post('/api/expenses', d),
    update: (id, d) => api.put(`/api/expenses/${id}`, d),
    delete: (id) => api.delete(`/api/expenses/${id}`),
};
