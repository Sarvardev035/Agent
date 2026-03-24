import { useEffect, useState } from 'react';
import api from './api';
import { safeArray } from './helpers';
const FALLBACK_RATES = {
    USD: 1,
    UZS: 12700,
    EUR: 0.93,
};
let ratesCache = null;
let ratesFetchedAt = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
export const normalizeExchangeRates = (payload) => {
    const normalized = { ...FALLBACK_RATES };
    const rows = safeArray(payload);
    rows.forEach(row => {
        const base = row.baseCurrency;
        const target = row.targetCurrency;
        const rate = Number(row.rate);
        if (!base || !target || !Number.isFinite(rate) || rate <= 0)
            return;
        if (base === 'USD')
            normalized[target] = rate;
        if (target === 'USD')
            normalized[base] = 1 / rate;
    });
    return normalized;
};
export const fetchExchangeRates = async () => {
    const now = Date.now();
    if (ratesCache && now - ratesFetchedAt < CACHE_TTL)
        return ratesCache;
    try {
        const res = await api.get('/api/exchange-rates');
        ratesCache = normalizeExchangeRates(res.data);
        ratesFetchedAt = now;
        return ratesCache;
    }
    catch {
        return FALLBACK_RATES;
    }
};
export const convert = (amount, from, to, rates) => {
    if (from === to)
        return amount;
    const inUSD = amount / (rates[from] ?? 1);
    return inUSD * (rates[to] ?? 1);
};
export const formatCurrency = (amount, currency = 'UZS') => {
    if (amount === null || amount === undefined)
        return '—';
    const num = Number(amount);
    if (Number.isNaN(num))
        return '—';
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: currency === 'UZS' ? 0 : 2,
            maximumFractionDigits: currency === 'UZS' ? 0 : 2,
        }).format(num);
    }
    catch {
        return `${currency} ${num.toLocaleString('en-US')}`;
    }
};
export const useExchangeRates = () => {
    const [rates, setRates] = useState(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const refresh = async () => {
        setLoading(true);
        const r = await fetchExchangeRates();
        setRates(r);
        setLastUpdated(new Date());
        setLoading(false);
    };
    useEffect(() => {
        refresh();
        // Auto-refresh every 30 minutes
        const interval = setInterval(refresh, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    return {
        rates,
        loading,
        lastUpdated,
        refresh,
        convert: (a, f, t) => convert(a, f, t, rates),
    };
};
