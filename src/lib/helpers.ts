import { format, isToday, isYesterday } from 'date-fns'

export const formatCurrency = (
  amount: number,
  currency = 'UZS'
): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export const smartDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr)
    if (isToday(d))     return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export const groupByDate = <T extends { date: string }>(
  items: T[]
): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const key = smartDate(item.date)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export const CATEGORY_META: Record<string, {
  emoji: string; bg: string; color: string; label: string
}> = {
  FOOD:          { emoji:'🍔', bg:'#fffbeb', color:'#92400e', label:'Food' },
  TRANSPORT:     { emoji:'🚗', bg:'#eff6ff', color:'#1e40af', label:'Transport' },
  HEALTH:        { emoji:'💊', bg:'#f0fdf4', color:'#166534', label:'Health' },
  ENTERTAINMENT: { emoji:'🎮', bg:'#f5f3ff', color:'#5b21b6', label:'Entertainment' },
  UTILITIES:     { emoji:'⚡', bg:'#fff1f2', color:'#9f1239', label:'Utilities' },
  OTHER:         { emoji:'📦', bg:'#f8fafc', color:'#475569', label:'Other' },
  SALARY:        { emoji:'💰', bg:'#ecfdf5', color:'#065f46', label:'Salary' },
  FREELANCE:     { emoji:'💼', bg:'#eff6ff', color:'#1e40af', label:'Freelance' },
  BUSINESS:      { emoji:'🏢', bg:'#f5f3ff', color:'#5b21b6', label:'Business' },
  GIFT:          { emoji:'🎁', bg:'#fdf4ff', color:'#86198f', label:'Gift' },
  INVESTMENT:    { emoji:'📈', bg:'#ecfdf5', color:'#065f46', label:'Investment' },
}

export const getBudgetColor = (pct: number) => {
  if (pct >= 100) return { bar: '#ef4444', text: '#be123c', bg: '#fff1f2' }
  if (pct >= 75)  return { bar: '#f59e0b', text: '#92400e', bg: '#fffbeb' }
  return               { bar: '#22c55e', text: '#166534', bg: '#f0fdf4' }
}

export const getTimeOfDay = (): string => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
