import api from '../lib/api';
export const transfersService = {
    getAll: (params) => api.get('/api/transfers', { params }),
    create: (d) => api.post('/api/transfers', d),
    delete: (id) => api.delete(`/api/transfers/${id}`),
};
