import api from './axios';
export const incomeApi = {
    getAll: (params) => api.get('/api/incomes', { params }),
    create: (data) => api.post('/api/incomes', data),
    update: (id, data) => api.put(`/api/incomes/${id}`, data),
    delete: (id) => api.delete(`/api/incomes/${id}`),
};
