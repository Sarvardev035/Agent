import { create } from 'zustand'
import api from '../lib/api'
import { safeArray } from '../lib/helpers'

export interface Account {
  id: number
  name: string
  type: 'BANK_CARD' | 'CASH'
  currency: string
  balance: number
  createdAt?: string
  updatedAt?: string
}

interface FinanceState {
  accounts: Account[]
  isLoadingAccounts: boolean
  refreshAccounts: () => Promise<void>
}

export const useFinanceStore = create<FinanceState>(set => ({
  accounts: [],
  isLoadingAccounts: false,
  refreshAccounts: async () => {
    set({ isLoadingAccounts: true })
    try {
      const res = await api.get('/api/accounts').catch(() => ({ data: [] }))
      set({ accounts: safeArray<Account>(res.data) })
    } catch {
      // Silent failure to avoid UI crash
    } finally {
      set({ isLoadingAccounts: false })
    }
  },
}))
