import { create } from 'zustand'
import { accountsService, Account } from '../services/accounts.service'

interface FinanceState {
  accounts: Account[]
  refreshAccounts: () => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  refreshAccounts: async () => {
    try {
      const { data } = await accountsService.getAll()
      set({ accounts: data ?? [] })
    } catch {
      // Silently fail
    }
  },
}))
