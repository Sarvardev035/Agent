import api from './axios';
export const transfersApi = {
    getAll: (params) => api.get('/api/transfers', { params }),
    create: (data) => api.post('/api/transfers', data),
};
