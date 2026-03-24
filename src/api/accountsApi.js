import api from './axios';
export const accountsApi = {
    getAll: () => api.get('/api/accounts'),
    create: (data) => api.post('/api/accounts', data),
    update: (id, data) => api.put(`/api/accounts/${id}`, data),
    delete: (id) => api.delete(`/api/accounts/${id}`),
};
