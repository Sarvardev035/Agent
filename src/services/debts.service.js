import api from '../lib/api';
export const debtsService = {
    getAll: (params) => api.get('/api/debts', { params }),
    create: (d) => api.post('/api/debts', d),
    repay: (id, d) => api.post(`/api/debts/${id}/repay`, d),
    delete: (id) => api.delete(`/api/debts/${id}`),
};
