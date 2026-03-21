import {
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
} from 'date-fns'

export { formatCurrency } from './currency'

export const toArray = <T,>(data: unknown): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  const obj = data as Record<string, unknown>
  if (Array.isArray(obj.content)) return obj.content as T[]
  if (Array.isArray(obj.data)) return obj.data as T[]
  if (typeof data === 'object') return [data] as T[]
  return []
}

export const smartDate = (d: string): string => {
  try {
    const date = parseISO(d)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d, yyyy')
  } catch {
    return d
  }
}

export const groupByDate = <T extends { date: string }>(
  items: T[]
): [string, T[]][] => {
  const map = new Map<string, T[]>()
  items.forEach(item => {
    const key = smartDate(item.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  return Array.from(map.entries())
}

export const CATEGORY_META: Record<
  string,
  { emoji: string; bg: string; color: string; label: string; barColor: string }
> = {
  FOOD: { emoji: '🍔', bg: '#fffbeb', color: '#92400e', label: 'Food', barColor: '#f59e0b' },
  TRANSPORT: { emoji: '🚗', bg: '#eff6ff', color: '#1e40af', label: 'Transport', barColor: '#3b82f6' },
  HEALTH: { emoji: '💊', bg: '#f0fdf4', color: '#166534', label: 'Health', barColor: '#10b981' },
  ENTERTAINMENT: { emoji: '🎮', bg: '#f5f3ff', color: '#5b21b6', label: 'Entertainment', barColor: '#8b5cf6' },
  UTILITIES: { emoji: '⚡', bg: '#fff1f2', color: '#9f1239', label: 'Utilities', barColor: '#ef4444' },
  OTHER: { emoji: '📦', bg: '#f8fafc', color: '#475569', label: 'Other', barColor: '#94a3b8' },
  SALARY: { emoji: '💰', bg: '#ecfdf5', color: '#065f46', label: 'Salary', barColor: '#10b981' },
  FREELANCE: { emoji: '💼', bg: '#eff6ff', color: '#1e40af', label: 'Freelance', barColor: '#3b82f6' },
  BUSINESS: { emoji: '🏢', bg: '#f5f3ff', color: '#5b21b6', label: 'Business', barColor: '#8b5cf6' },
  GIFT: { emoji: '🎁', bg: '#fdf4ff', color: '#86198f', label: 'Gift', barColor: '#d946ef' },
  INVESTMENT: { emoji: '📈', bg: '#ecfdf5', color: '#065f46', label: 'Investment', barColor: '#059669' },
}

export const getBudgetColor = (pct: number) =>
  pct >= 100
    ? { bar: '#ef4444', text: '#be123c', bg: '#fff1f2' }
    : pct >= 75
      ? { bar: '#f59e0b', text: '#92400e', bg: '#fffbeb' }
      : { bar: '#10b981', text: '#065f46', bg: '#ecfdf5' }

export const getTimeOfDay = () => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

export const getDaysUntil = (dateStr: string): number =>
  differenceInDays(parseISO(dateStr), new Date())

export const thisMonthRange = () => {
  const now = new Date()
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

export const isThisMonth = (dateStr: string): boolean => {
  const { start, end } = thisMonthRange()
  const d = parseISO(dateStr)
  return d >= start && d <= end
}
