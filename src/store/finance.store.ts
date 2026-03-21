import { create } from 'zustand'
import { accountsService, Account } from '../services/accounts.service'

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
      const { data } = await accountsService.getAll()
      set({ accounts: data ?? [] })
    } catch {
      // Silent failure to avoid UI crash
    } finally {
      set({ isLoadingAccounts: false })
    }
  },
}))
