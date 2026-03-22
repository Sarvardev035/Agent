import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { accountsApi } from '../api/accountsApi'
import { safeArray } from '../lib/helpers'

type FinanceContextValue = {
  accounts: any[]
  refreshAccounts: () => Promise<void>
  loading: boolean
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const refreshAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await accountsApi.getAll()
      setAccounts(safeArray(data))
    } catch (err) {
      console.error('Failed to load accounts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAccounts()
  }, [refreshAccounts])

  return (
    <FinanceContext.Provider value={{ accounts, refreshAccounts, loading }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}
