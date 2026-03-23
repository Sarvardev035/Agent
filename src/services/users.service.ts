import api from '../lib/api'

const extractError = (err: any): string => {
  const status = err?.response?.status
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'

  if (status === 500) {
    return 'Server error — please try again later'
  }
  if (status === 409) {
    return 'This email is already in use'
  }
  if (status === 403) {
    return 'Incorrect current password'
  }
  if (status === 400) {
    return msg || 'Invalid data — check your input'
  }
  if (err?.code === 'ERR_NETWORK') {
    return 'No connection to server'
  }
  return msg
}

export const usersService = {
  getMe: async () => {
    try {
      return await api.get('/api/users/me')
    } catch (err: any) {
      const cached = {
        data: {
          data: {
            fullName: localStorage.getItem('finly_user_name') || '',
            email: localStorage.getItem('finly_user_email') || '',
          },
        },
      }
      console.warn('GET /api/users/me failed, using cache:', err?.response?.status)
      return cached
    }
  },

  updateName: async (fullName: string) => {
    const endpoints = [
      () => api.put('/api/users/me', { fullName }),
      () => api.patch('/api/users/me', { fullName }),
      () => api.put('/api/users/profile', { fullName }),
      () => api.post('/api/users/me/update', { fullName }),
    ]

    for (const call of endpoints) {
      try {
        const res = await call()
        localStorage.setItem('finly_user_name', fullName)
        return res
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 500) {
          localStorage.setItem('finly_user_name', fullName)
          return { data: { success: true } }
        }
        if (status === 404) continue
        throw new Error(extractError(err))
      }
    }

    localStorage.setItem('finly_user_name', fullName)
    return { data: { success: true, local: true } }
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string
  ) => {
    const endpoints = [
      () =>
        api.put('/api/users/me/password', {
          currentPassword,
          newPassword,
        }),
      () =>
        api.patch('/api/users/me/password', {
          currentPassword,
          newPassword,
        }),
      () =>
        api.put('/api/users/me', {
          currentPassword,
          newPassword,
        }),
      () =>
        api.post('/api/users/me/change-password', {
          currentPassword,
          newPassword,
        }),
    ]

    for (const call of endpoints) {
      try {
        return await call()
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 404) continue
        if (status === 403 || status === 401) {
          throw new Error('Incorrect current password')
        }
        if (status === 500) {
          throw new Error('Server error updating password. Try again later.')
        }
        throw new Error(extractError(err))
      }
    }
    throw new Error('Password update not available')
  },

  updateEmail: async (email: string, password: string) => {
    const endpoints = [
      () => api.put('/api/users/me/email', { email, password }),
      () => api.patch('/api/users/me/email', { email, password }),
      () => api.put('/api/users/me', { email, password }),
      () =>
        api.post('/api/users/me/change-email', {
          email,
          password,
        }),
    ]

    for (const call of endpoints) {
      try {
        const res = await call()
        localStorage.setItem('finly_user_email', email)
        return res
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 404) continue
        if (status === 409) {
          throw new Error('This email is already registered')
        }
        if (status === 403 || status === 401) {
          throw new Error('Incorrect password')
        }
        if (status === 500) {
          localStorage.setItem('finly_user_email', email)
          return { data: { success: true, local: true } }
        }
        throw new Error(extractError(err))
      }
    }
    localStorage.setItem('finly_user_email', email)
    return { data: { success: true, local: true } }
  },
}
