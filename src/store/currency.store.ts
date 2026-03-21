import { create } from 'zustand'
import { fetchExchangeRates, convert as convertAmount } from '../lib/currency'

type SupportedCurrency = 'USD' | 'EUR' | 'RUB' | 'UZS'

interface CurrencyState {
  rates: Record<string, number>
  loading: boolean
  refresh: () => Promise<void>
  convert: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  rates: {},
  loading: false,

  refresh: async () => {
    set({ loading: true })
    try {
      const rates = await fetchExchangeRates()
      set({ rates })
    } finally {
      set({ loading: false })
    }
  },

  convert: (amount, from, to) => convertAmount(amount, from, to, get().rates),
}))
