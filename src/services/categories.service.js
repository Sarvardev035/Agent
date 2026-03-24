import api from '../lib/api';
export const categoriesService = {
    getAll: () => api.get('/api/categories'),
    getByType: (type) => api.get('/api/categories', { params: { type } }),
    create: (d) => api.post('/api/categories', d),
};
