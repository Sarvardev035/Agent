import { create } from 'zustand';
import api from '../lib/api';
import { safeArray } from '../lib/helpers';
export const useFinanceStore = create(set => ({
    accounts: [],
    isLoadingAccounts: false,
    refreshAccounts: async () => {
        set({ isLoadingAccounts: true });
        try {
            const res = await api.get('/api/accounts').catch(() => ({ data: [] }));
            set({ accounts: safeArray(res.data) });
        }
        catch {
            // Silent failure to avoid UI crash
        }
        finally {
            set({ isLoadingAccounts: false });
        }
    },
}));
