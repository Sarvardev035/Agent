import { create } from 'zustand';
import { fetchExchangeRates, convert as convertAmount } from '../lib/currency';
export const useCurrencyStore = create((set, get) => ({
    rates: {},
    loading: false,
    refresh: async () => {
        set({ loading: true });
        try {
            const rates = await fetchExchangeRates();
            set({ rates });
        }
        finally {
            set({ loading: false });
        }
    },
    convert: (amount, from, to) => convertAmount(amount, from, to, get().rates),
}));
