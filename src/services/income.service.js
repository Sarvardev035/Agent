import api from '../lib/api';
export const incomesService = {
    getAll: (params) => api.get('/api/incomes', { params }),
    create: (d) => api.post('/api/incomes', d),
    update: (id, d) => api.put(`/api/incomes/${id}`, d),
    delete: (id) => api.delete(`/api/incomes/${id}`),
};
export const incomeService = incomesService;
