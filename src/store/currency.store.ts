import { create } from 'zustand'
import { CurrencyExchange, SupportedCurrency } from '../lib/currency'

interface CurrencyState {
  rates: Record<string, Record<string, number>>
  loading: Record<string, boolean>
  getRate: (base: SupportedCurrency, target: SupportedCurrency) => Promise<number>
  convert: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => Promise<number>
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  rates: {},
  loading: {},

  getRate: async (base, target) => {
    if (base === target) return 1

    const key = `${base}_${target}`
    const existing = get().rates[base]?.[target]
    if (existing) return existing

    set(s => ({ loading: { ...s.loading, [key]: true } }))
    try {
      const rate = await CurrencyExchange.getRate(base, target)
      set(s => ({
        rates: {
          ...s.rates,
          [base]: { ...s.rates[base], [target]: rate },
        },
      }))
      return rate
    } finally {
      set(s => {
        const { [key]: _, ...rest } = s.loading
        return { loading: rest }
      })
    }
  },

  convert: async (amount, from, to) => {
    const rate = await get().getRate(from, to)
    return CurrencyExchange.convert(amount, from, to, rate)
  },
}))
