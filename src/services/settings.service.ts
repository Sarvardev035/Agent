import { isAxiosError } from 'axios'
import api, { unwrap } from '../lib/api'

export type SessionSummary = {
  activeUsers: number | null
  activeSessions: number | null
}

export type FamilyRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export type FamilyMember = {
  id: string
  name: string
  email: string
  role: FamilyRole
  status: string
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const asNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const numberValue = typeof value === 'string' ? Number(value) : value
    if (typeof numberValue === 'number' && Number.isFinite(numberValue)) return numberValue
  }
  return null
}

const asString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const root = asRecord(value)
  if (Array.isArray(root.data)) return root.data
  if (Array.isArray(root.items)) return root.items
  if (Array.isArray(root.members)) return root.members
  if (Array.isArray(root.content)) return root.content
  return []
}

const shouldTryNextEndpoint = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === 404 || status === 405 || status === 501
}

const requestFromCandidates = async <T,>(
  requests: Array<() => Promise<unknown>>,
  parse: (value: unknown) => T
): Promise<T> => {
  let lastError: unknown = null

  for (const request of requests) {
    try {
      const response = await request()
      return parse(response)
    } catch (error) {
      lastError = error
      if (!shouldTryNextEndpoint(error)) break
    }
  }

  throw lastError ?? new Error('Request failed')
}

const parseSessionSummary = (response: unknown): SessionSummary => {
  const payload = asRecord(unwrap<Record<string, unknown>>(response as { data: unknown }))

  const activeUsers = asNumber(
    payload.activeUsers,
    payload.activeUsersCount,
    payload.onlineUsers,
    payload.onlineUserCount,
    payload.currentUsers,
    payload.totalUsers
  )

  const activeSessions = asNumber(
    payload.activeSessions,
    payload.sessionCount,
    payload.activeSessionCount,
    payload.currentSessions
  )

  return { activeUsers, activeSessions }
}

const parseFamilyMembers = (response: unknown): FamilyMember[] => {
  const payload = unwrap<unknown>(response as { data: unknown })
  const items = asArray(payload)

  return items.map(item => {
    const record = asRecord(item)
    return {
      id: asString(record.id, record.memberId, record.userId) || crypto.randomUUID(),
      name: asString(record.name, record.fullName, record.displayName) || 'Family member',
      email: asString(record.email, record.username),
      role: (asString(record.role).toUpperCase() as FamilyRole) || 'VIEWER',
      status: asString(record.status).toUpperCase() || 'ACTIVE',
    }
  })
}

export const settingsService = {
  getSessionSummary: async (): Promise<SessionSummary> => {
    try {
      return await requestFromCandidates<SessionSummary>(
        [
          () => api.get('/api/sessions/summary'),
          () => api.get('/api/sessions/active-users'),
          () => api.get('/api/analytics/active-users'),
          () => api.get('/api/users/sessions/summary'),
        ],
        parseSessionSummary
      )
    } catch {
      return { activeUsers: null, activeSessions: null }
    }
  },

  listFamilyMembers: async (): Promise<FamilyMember[]> => {
    try {
      return await requestFromCandidates<FamilyMember[]>(
        [
          () => api.get('/api/family/members'),
          () => api.get('/api/users/family-members'),
          () => api.get('/api/sharing/family-members'),
        ],
        parseFamilyMembers
      )
    } catch {
      return []
    }
  },

  createFamilyMember: async (payload: {
    name: string
    email: string
    role: 'EDITOR' | 'VIEWER'
  }): Promise<void> => {
    await requestFromCandidates<void>(
      [
        () => api.post('/api/family/members', payload),
        () => api.post('/api/users/family-members', payload),
        () => api.post('/api/sharing/family-members', payload),
      ],
      () => undefined
    )
  },
}
