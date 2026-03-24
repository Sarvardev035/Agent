import api from '../lib/api';
export const authService = {
    login: (data) => api.post('/api/auth/login', data),
    register: (data) => api.post('/api/auth/register', data),
    me: () => api.get('/api/users/me'),
    logout: () => Promise.resolve(),
};
