import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useExchangeRates, formatCurrency } from '../../lib/currency';
import Skeleton from '../ui/Skeleton';
const CURRENCIES = [
    { code: 'USD', flag: '🇺🇸' },
    { code: 'UZS', flag: '🇺🇿' },
    { code: 'EUR', flag: '🇪🇺' },
];
const CurrencyWidget = () => {
    const { rates, loading, lastUpdated, refresh, convert } = useExchangeRates();
    const [amount, setAmount] = useState(1);
    const [from, setFrom] = useState('USD');
    const converted = useMemo(() => CURRENCIES.map(c => ({
        ...c,
        value: convert(amount, from, c.code),
    })), [amount, from, convert]);
    const minutesAgo = lastUpdated != null ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 60000)) : null;
    return (_jsxs("div", { style: {
            background: 'var(--surface-strong)',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, color: 'var(--text-3)' }, children: "Live exchange rates" }), _jsx("div", { style: { fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }, children: "Currency Converter" })] }), _jsxs("button", { onClick: refresh, disabled: loading, style: {
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            borderRadius: 10,
                            padding: '8px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 700,
                            color: '#2563eb',
                            opacity: loading ? 0.7 : 1,
                        }, type: "button", children: [_jsx(RotateCw, { size: 16 }), loading ? 'Refreshing' : 'Refresh'] })] }), loading ? (_jsx(Skeleton, { height: 18, count: 4 })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 12 }, children: [_jsx("input", { type: "number", min: 0, value: amount, onChange: e => setAmount(Number(e.target.value) || 0), style: {
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 12,
                                    border: '1px solid var(--border)',
                                    padding: '0 12px',
                                    fontSize: 14,
                                    background: 'var(--surface)',
                                    color: 'var(--text-1)',
                                } }), _jsx("select", { value: from, onChange: e => setFrom(e.target.value), style: {
                                    width: 110,
                                    height: 44,
                                    borderRadius: 12,
                                    border: '1px solid var(--border)',
                                    padding: '0 10px',
                                    fontWeight: 700,
                                    background: 'var(--surface)',
                                    color: 'var(--text-1)',
                                }, children: CURRENCIES.map(c => (_jsxs("option", { value: c.code, children: [c.flag, " ", c.code] }, c.code))) })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }, children: converted.map(c => (_jsxs("div", { style: {
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: 12,
                                background: 'var(--surface)',
                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 18 }, children: c.flag }), _jsx("span", { style: { fontWeight: 800, color: 'var(--text-1)' }, children: c.code })] }), _jsx("div", { style: { marginTop: 8, fontWeight: 700, fontSize: 15, color: '#2563eb' }, children: formatCurrency(c.value, c.code) }), _jsxs("div", { style: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 }, children: ["vs ", from] })] }, c.code))) }), _jsxs("div", { style: { marginTop: 12, fontSize: 12, color: 'var(--text-3)' }, children: ["Last updated: ", minutesAgo != null ? `${minutesAgo} minute(s) ago` : 'Fetching...'] })] }))] }));
};
export default CurrencyWidget;
