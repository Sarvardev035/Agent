import api from '../lib/api';
export const accountsService = {
    getAll: () => api.get('/api/accounts'),
    getOne: (id) => api.get(`/api/accounts/${id}`),
    create: (d) => api.post('/api/accounts', d),
    update: (id, d) => api.put(`/api/accounts/${id}`, d),
    delete: (id) => api.delete(`/api/accounts/${id}`),
};
