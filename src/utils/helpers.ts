import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// Format currency — handles UZS, USD, EUR
export const formatCurrency = (amount: number | null | undefined, currency: string = 'UZS') => {
  if (amount === null || amount === undefined) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`
  }
}

// Smart date display
export const smartDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

// Group transactions by date
export const groupByDate = <T extends { date?: string }>(items: T[]) => {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = smartDate(item.date)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
}

// Get category metadata
export const getCategoryMeta = (category?: string) => {
  const map: Record<
    string,
    { emoji: string; label: string; bg: string; color: string }
  > = {
    FOOD: { emoji: '🍔', label: 'Food', bg: '#fffbeb', color: '#92400e' },
    TRANSPORT: { emoji: '🚗', label: 'Transport', bg: '#eff6ff', color: '#1e40af' },
    HEALTH: { emoji: '💊', label: 'Health', bg: '#f0fdf4', color: '#166534' },
    ENTERTAINMENT: { emoji: '🎮', label: 'Entertainment', bg: '#f5f3ff', color: '#5b21b6' },
    UTILITIES: { emoji: '⚡', label: 'Utilities', bg: '#fff1f2', color: '#9f1239' },
    OTHER: { emoji: '📦', label: 'Other', bg: '#f8fafc', color: '#475569' },
    SALARY: { emoji: '💰', label: 'Salary', bg: '#ecfdf5', color: '#065f46' },
    FREELANCE: { emoji: '💼', label: 'Freelance', bg: '#eff6ff', color: '#1e40af' },
    BUSINESS: { emoji: '🏢', label: 'Business', bg: '#f5f3ff', color: '#5b21b6' },
    GIFT: { emoji: '🎁', label: 'Gift', bg: '#fdf4ff', color: '#86198f' },
    INVESTMENT: { emoji: '📈', label: 'Investment', bg: '#f0fdf4', color: '#065f46' },
  }
  return map[category ?? 'OTHER'] ?? map['OTHER']
}

// Budget health color
export const getBudgetColor = (percent: number) => {
  if (percent >= 100) return { bg: '#fff1f2', text: '#f43f5e', bar: '#f43f5e' }
  if (percent >= 75) return { bg: '#fffbeb', text: '#f59e0b', bar: '#f59e0b' }
  return { bg: '#ecfdf5', text: '#10b981', bar: '#10b981' }
}

// Check if token is expired
export const isTokenExpired = (token: string | null) => {
  try {
    if (!token) return true
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export const timeAgo = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}
