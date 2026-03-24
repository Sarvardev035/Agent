import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { accountsApi } from '../api/accountsApi';
import { safeArray } from '../lib/helpers';
import { TokenStorage } from '../lib/security';
const FinanceContext = createContext(null);
export const FinanceProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const refreshAccounts = useCallback(async () => {
        if (!TokenStorage.isValid()) {
            setAccounts([]);
            return;
        }
        try {
            setLoading(true);
            const { data } = await accountsApi.getAll();
            setAccounts(safeArray(data));
        }
        catch (err) {
            console.error('Failed to load accounts:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refreshAccounts();
    }, [refreshAccounts]);
    return (_jsx(FinanceContext.Provider, { value: { accounts, refreshAccounts, loading }, children: children }));
};
export const useFinance = () => {
    const ctx = useContext(FinanceContext);
    if (!ctx)
        throw new Error('useFinance must be used inside FinanceProvider');
    return ctx;
};
