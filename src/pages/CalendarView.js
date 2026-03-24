import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, } from 'date-fns';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { expensesApi } from '../api/expensesApi';
import { incomeApi } from '../api/incomeApi';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCategoryMeta, safeArray } from '../lib/helpers';
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dateKey = (d) => format(d, 'yyyy-MM-dd');
const CalendarView = () => {
    const { accounts, refreshAccounts } = useFinance();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hoverDate, setHoverDate] = useState(null);
    const loadData = async () => {
        try {
            setLoading(true);
            const [expRes, incRes] = await Promise.allSettled([expensesApi.getAll(), incomeApi.getAll()]);
            const expenses = expRes.status === 'fulfilled'
                ? safeArray(expRes.value.data).map((e) => ({
                    id: e.id,
                    type: 'expense',
                    date: e.expenseDate || e.date,
                    category: e.categoryId || e.category || 'OTHER',
                    amount: Number(e.amount ?? 0),
                    description: e.description,
                    accountId: e.accountId,
                    currency: e.currency || 'UZS',
                }))
                : [];
            const income = incRes.status === 'fulfilled'
                ? safeArray(incRes.value.data).map((i) => ({
                    id: i.id,
                    type: 'income',
                    date: i.incomeDate || i.date,
                    category: i.categoryId || i.category || 'OTHER',
                    amount: Number(i.amount ?? 0),
                    description: i.description,
                    accountId: i.accountId,
                    currency: i.currency || 'UZS',
                }))
                : [];
            setTransactions([...expenses, ...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            await refreshAccounts();
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadData();
    }, []);
    const txByDate = useMemo(() => {
        const map = {};
        transactions.forEach(tx => {
            const key = dateKey(new Date(tx.date));
            if (!map[key])
                map[key] = [];
            map[key].push(tx);
        });
        return map;
    }, [transactions]);
    const gridDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const start = startOfWeek(monthStart);
        const end = endOfWeek(monthEnd);
        const days = [];
        let cursor = start;
        while (cursor <= end) {
            days.push(cursor);
            cursor = addDays(cursor, 1);
        }
        return days;
    }, [currentMonth]);
    const activeDate = hoverDate || selectedDate;
    const activeDateTx = txByDate[dateKey(activeDate)] || [];
    const dailyIncome = activeDateTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const dailyExpense = activeDateTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const yearOptions = useMemo(() => {
        const nowYear = new Date().getFullYear();
        return Array.from({ length: 9 }, (_, idx) => nowYear - 4 + idx);
    }, []);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }, children: [_jsxs("div", { children: [_jsx("p", { style: { color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }, children: "CALENDAR" }), _jsx("h1", { style: { margin: '4px 0', fontSize: 22, fontWeight: 800 }, children: "Finance calendar" }), _jsx("p", { style: { margin: 0, color: 'var(--text-2)' }, children: "Hover or select any date to view money history and actions in detail." })] }), _jsx("div", { style: {
                    background: 'var(--surface-strong)',
                    borderRadius: 18,
                    padding: 14,
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)',
                }, children: loading ? (_jsx(Skeleton, { height: 70, count: 4 })) : transactions.length === 0 ? (_jsx(EmptyState, { title: "No transactions yet", description: "Add income or expenses to see a real calendar history." })) : (_jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1.35fr) minmax(300px,0.65fr)',
                        gap: 14,
                    }, children: [_jsxs("div", { style: {
                                borderRadius: 14,
                                border: '1px solid var(--border)',
                                background: 'linear-gradient(150deg, rgba(30,41,59,0.05), rgba(59,130,246,0.04))',
                                padding: 12,
                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }, children: [_jsx("div", { style: { fontWeight: 800, color: 'var(--text-1)' }, children: format(currentMonth, 'MMMM yyyy') }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("select", { "aria-label": "Select month", value: currentMonth.getMonth(), onChange: e => {
                                                        const d = new Date(currentMonth);
                                                        d.setMonth(Number(e.target.value));
                                                        setCurrentMonth(startOfMonth(d));
                                                    }, style: {
                                                        height: 34,
                                                        borderRadius: 8,
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--surface)',
                                                        color: 'var(--text-1)',
                                                        padding: '0 10px',
                                                    }, children: MONTHS.map((month, idx) => (_jsx("option", { value: idx, children: month }, month))) }), _jsx("select", { "aria-label": "Select year", value: currentMonth.getFullYear(), onChange: e => {
                                                        const d = new Date(currentMonth);
                                                        d.setFullYear(Number(e.target.value));
                                                        setCurrentMonth(startOfMonth(d));
                                                    }, style: {
                                                        height: 34,
                                                        borderRadius: 8,
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--surface)',
                                                        color: 'var(--text-1)',
                                                        padding: '0 10px',
                                                    }, children: yearOptions.map(y => (_jsx("option", { value: y, children: y }, y))) })] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }, children: WEEK_DAYS.map(day => (_jsx("div", { style: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', padding: '2px 0' }, children: day }, day))) }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }, children: gridDays.map(day => {
                                        const key = dateKey(day);
                                        const dayItems = txByDate[key] || [];
                                        const isInMonth = isSameMonth(day, currentMonth);
                                        const isSelected = isSameDay(day, selectedDate);
                                        const dayIncome = dayItems.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
                                        const dayExpense = dayItems.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
                                        return (_jsxs("button", { type: "button", onClick: () => setSelectedDate(day), onMouseEnter: () => setHoverDate(day), onMouseLeave: () => setHoverDate(null), style: {
                                                minHeight: 82,
                                                borderRadius: 12,
                                                border: isSelected ? '1px solid #2563eb' : '1px solid rgba(148,163,184,0.2)',
                                                background: isSelected
                                                    ? 'linear-gradient(145deg, rgba(59,130,246,0.14), rgba(20,184,166,0.12))'
                                                    : dayItems.length
                                                        ? 'linear-gradient(145deg, rgba(236,253,245,0.7), rgba(239,246,255,0.7))'
                                                        : 'var(--surface)',
                                                padding: 8,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                opacity: isInMonth ? 1 : 0.42,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }, children: format(day, 'd') }), dayItems.length > 0 && (_jsx("span", { style: { fontSize: 10, color: 'var(--text-3)' }, children: dayItems.length }))] }), dayItems.length > 0 && (_jsxs("div", { style: { display: 'grid', gap: 2 }, children: [_jsxs("div", { style: { fontSize: 10, color: '#0f766e' }, children: ["+ ", formatCurrency(dayIncome)] }), _jsxs("div", { style: { fontSize: 10, color: '#b91c1c' }, children: ["- ", formatCurrency(dayExpense)] })] }))] }, key));
                                    }) })] }), _jsxs("div", { style: {
                                borderRadius: 14,
                                border: '1px solid var(--border)',
                                background: 'linear-gradient(165deg, rgba(15,23,42,0.03), rgba(99,102,241,0.04))',
                                padding: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 320,
                            }, children: [_jsx("div", { style: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: "Daily history" }), _jsx("h3", { style: { margin: '6px 0 4px', fontSize: 18, color: 'var(--text-1)' }, children: format(activeDate, 'EEEE, MMM d, yyyy') }), _jsx("p", { style: { margin: 0, fontSize: 12, color: 'var(--text-2)' }, children: "Hover or click dates to inspect where money went and what actions were made." }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }, children: [_jsxs("span", { style: { padding: '5px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: '#047857', fontSize: 11, fontWeight: 700 }, children: ["Income: ", formatCurrency(dailyIncome)] }), _jsxs("span", { style: { padding: '5px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.14)', color: '#b91c1c', fontSize: 11, fontWeight: 700 }, children: ["Expense: ", formatCurrency(dailyExpense)] })] }), _jsx("div", { style: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 2 }, children: activeDateTx.length === 0 ? (_jsx(EmptyState, { title: "No actions on this date", description: "Choose another date to view transaction history." })) : (activeDateTx.map(tx => {
                                        const meta = getCategoryMeta(tx.category);
                                        const account = accounts.find(a => a.id === tx.accountId);
                                        return (_jsxs("div", { style: {
                                                border: '1px solid rgba(148,163,184,0.24)',
                                                borderRadius: 10,
                                                padding: 10,
                                                background: 'var(--surface)',
                                                display: 'grid',
                                                gap: 4,
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 8 }, children: [_jsx("div", { style: { fontWeight: 700, color: 'var(--text-1)', fontSize: 13 }, children: tx.description || `${meta.label} ${tx.type}` }), _jsxs("div", { style: { fontWeight: 800, fontSize: 13, color: tx.type === 'income' ? '#0f766e' : '#b91c1c' }, children: [tx.type === 'income' ? '+' : '-', " ", formatCurrency(tx.amount)] })] }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-3)' }, children: [meta.emoji, " ", meta.label, " \u2022 ", tx.type.toUpperCase(), " \u2022 ", account?.name || 'Account'] })] }, tx.id));
                                    })) })] })] })) })] }));
};
export default CalendarView;
