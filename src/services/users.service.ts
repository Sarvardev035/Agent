import api from '../lib/api'

export const usersService = {
  getMe: () => api.get('/api/users/me'),

  updateName: (fullName: string) =>
    api.put('/api/users/me', { fullName })
      .catch(() => api.patch('/api/users/me', { fullName })),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/users/me/password', {
      currentPassword,
      newPassword,
    }).catch(() =>
      api.put('/api/users/me', {
        currentPassword,
        newPassword,
      })
    ),

  updateEmail: (email: string, password: string) =>
    api.put('/api/users/me/email', { email, password })
      .catch(() =>
        api.put('/api/users/me', { email, password })
      ),
}
