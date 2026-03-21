// Uses exchangerate-api.com (free, no key needed for basic)
// Falls back to hardcoded UZS rates if API unavailable

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  UZS: 12700,
  EUR: 0.93,
  RUB: 92.5,
}

let ratesCache: Record<string, number> | null = null
let ratesFetchedAt = 0
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

export const fetchExchangeRates = async (): Promise<Record<string, number>> => {
  const now = Date.now()
  if (ratesCache && now - ratesFetchedAt < CACHE_TTL) return ratesCache

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await res.json()
    ratesCache = data.rates as Record<string, number>
    ratesFetchedAt = now
    return ratesCache
  } catch {
    return FALLBACK_RATES
  }
}

export const convert = (
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number => {
  if (from === to) return amount
  const inUSD = amount / (rates[from] ?? 1)
  return inUSD * (rates[to] ?? 1)
}

export const formatCurrency = (amount: number, currency = 'UZS'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

// React hook for live rates
import { useEffect, useState } from 'react'

export const useExchangeRates = () => {
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = async () => {
    setLoading(true)
    const r = await fetchExchangeRates()
    setRates(r)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // Auto-refresh every 30 minutes
    const interval = setInterval(refresh, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    rates,
    loading,
    lastUpdated,
    refresh,
    convert: (a: number, f: string, t: string) => convert(a, f, t, rates),
  }
}
