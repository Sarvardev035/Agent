import api from './axios';
export const debtsApi = {
    getAll: (params) => api.get('/api/debts', { params }),
    create: (data) => api.post('/api/debts', data),
    repay: (id, data) => api.post(`/api/debts/${id}/repay`, data),
    delete: (id) => api.delete(`/api/debts/${id}`),
};
