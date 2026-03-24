import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatCurrency } from '../lib/helpers';
import AnimatedBars from '../components/ui/AnimatedBars';
import { UserProfileStorage } from '../lib/security';
import { screenReader } from '../lib/screenReader';
const Dashboard = () => {
    const navigate = useNavigate();
    const { stats, loading } = useDashboardStats();
    const [chartReady, setChartReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(t);
    }, []);
    const timeOfDay = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12)
            return 'morning';
        if (h < 17)
            return 'afternoon';
        return 'evening';
    }, []);
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const userName = useMemo(() => {
        const profile = UserProfileStorage.get();
        return profile.name
            || profile.email?.split('@')[0]
            || 'there';
    }, []);
    const last7DaysData = useMemo(() => {
        const today = new Date();
        const days = Array.from({ length: 7 }).map((_, idx) => {
            const d = subDays(today, 6 - idx);
            const label = format(d, 'EEE');
            const dayIncome = stats?.income
                ? stats.income.filter((i) => format(new Date(i.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).reduce((s, i) => s + (i.amount || 0), 0)
                : 0;
            const dayExpense = stats?.expenses
                ? stats.expenses.filter((e) => format(new Date(e.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).reduce((s, e) => s + (e.amount || 0), 0)
                : 0;
            return { label, income: dayIncome, expense: dayExpense };
        });
        return days;
    }, [stats?.income, stats?.expenses]);
    const expByCategory = useMemo(() => {
        if (!stats?.expenses)
            return [];
        const totals = {};
        stats.expenses.forEach((e) => {
            const key = e.category || e.categoryId || 'OTHER';
            totals[key] = (totals[key] || 0) + (e.amount || 0);
        });
        return Object.entries(totals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [stats?.expenses]);
    const recentTxns = useMemo(() => {
        const combined = [];
        if (stats?.recentTransactions) {
            combined.push(...stats.recentTransactions);
        }
        if (stats?.income) {
            combined.push(...stats.income.map((i) => ({ ...i, txnType: 'income' })));
        }
        if (stats?.expenses) {
            combined.push(...stats.expenses.map((e) => ({ ...e, txnType: 'expense' })));
        }
        return combined
            .sort((a, b) => new Date(b.date || b.incomeDate || b.expenseDate || 0).getTime() - new Date(a.date || a.incomeDate || a.expenseDate || 0).getTime())
            .slice(0, 8);
    }, [stats?.recentTransactions, stats?.income, stats?.expenses]);
    const smartDate = (dateStr) => {
        if (!dateStr)
            return 'Today';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
            return 'Today';
        if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'))
            return 'Yesterday';
        return format(date, 'MMM d');
    };
    const accounts = stats?.accounts || [];
    const summary = {
        totalBalance: stats?.totalBalance ?? 0,
        totalIncome: stats?.monthlyIncome ?? 0,
        totalExpense: stats?.monthlyExpenses ?? 0,
        savings: (stats?.monthlyIncome ?? 0) - (stats?.monthlyExpenses ?? 0),
    };
    const openDebts = stats?.openDebts || [];
    const budgetUsedPct = stats?.budgetUsedPct ?? 0;
    const quickStats = [
        {
            label: 'Net Savings',
            value: summary.savings,
            color: '#7c3aed',
            bg: '#f5f3ff',
            icon: '💰',
            path: '/statistics',
        },
        {
            label: 'Accounts',
            value: accounts.length,
            color: '#2563eb',
            bg: '#eff6ff',
            icon: '💳',
            path: '/accounts',
            isCount: true,
        },
        {
            label: 'Open Debts',
            value: openDebts.length,
            color: '#f59e0b',
            bg: '#fffbeb',
            icon: '🤝',
            path: '/debts',
            isCount: true,
        },
        {
            label: 'Budget Health',
            value: budgetUsedPct,
            color: '#10b981',
            bg: '#ecfdf5',
            icon: '🎯',
            path: '/budget',
            isPct: true,
        },
    ];
    const formatStatValue = (value, isPct) => {
        if (isPct) {
            return `${Math.round(value).toLocaleString('en-US')}%`;
        }
        return formatCurrency(value);
    };
    const softWrapNumber = (text) => text.split(',').join(',\u200b');
    useEffect(() => {
        if (!loading) {
            screenReader.readDashboard(summary);
        }
    }, [loading, summary.totalBalance, summary.totalIncome, summary.totalExpense, summary.savings]);
    return (_jsxs("div", { style: { padding: 'clamp(16px,3vw,32px)' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 20,
                }, children: [_jsxs("div", { children: [_jsx("p", { style: {
                                    fontSize: 13, color: 'var(--text-3)',
                                    margin: '0 0 4px',
                                }, children: format(new Date(), 'EEEE, MMMM do') }), _jsxs("h1", { style: {
                                    fontSize: 'clamp(20px,3vw,28px)',
                                    fontWeight: 800,
                                    color: 'var(--text-1)',
                                    margin: 0,
                                    letterSpacing: '-0.02em',
                                }, children: ["Good ", timeOfDay, ", ", capitalize(userName), " \uD83D\uDC4B"] })] }), _jsx("div", { style: { position: 'relative' }, children: _jsx("button", { style: {
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: 12, padding: '9px 12px',
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: 6,
                                color: 'var(--text-2)', fontSize: 13,
                                transition: 'all 0.2s',
                            }, onFocus: () => screenReader.speak('Notifications'), onMouseEnter: () => screenReader.speak('Notifications'), children: "\uD83D\uDD14" }) })] }), _jsxs("div", { style: {
                    background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,' +
                        'rgba(30,58,110,0.85) 50%,' +
                        'rgba(37,99,235,0.8) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 24,
                    padding: 'clamp(20px,3vw,28px)',
                    marginBottom: 20,
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(37,99,235,0.3),' +
                        'inset 0 1px 0 rgba(255,255,255,0.15)',
                }, children: [_jsx("div", { style: {
                            position: 'absolute', right: -40, top: -40,
                            width: 200, height: 200, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        } }), _jsx("div", { style: {
                            position: 'absolute', right: 40, top: 20,
                            width: 120, height: 120, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)',
                        } }), _jsx("p", { style: { margin: '0 0 4px', fontSize: 11,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            opacity: 0.6, fontWeight: 600,
                        }, children: "TOTAL BALANCE" }), _jsx("h2", { style: {
                            margin: '0 0 4px',
                            fontWeight: 800,
                        }, children: _jsx("span", { className: "balance-large", children: loading ? '—' : formatCurrency(summary.totalBalance) }) }), _jsxs("p", { style: { margin: '0 0 20px', opacity: 0.6, fontSize: 13 }, children: ["Across ", accounts.length, " account", accounts.length !== 1 ? 's' : ''] }), _jsxs("div", { style: {
                            display: 'flex', gap: 32, flexWrap: 'wrap',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: 16,
                        }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 2px', opacity: 0.6, fontSize: 12 }, children: "\u2191 Income this month" }), _jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: 16,
                                            color: '#4ade80' }, children: _jsx("span", { className: "amount amount-positive", children: loading ? '—' : formatCurrency(summary.totalIncome) }) })] }), _jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 2px', opacity: 0.6, fontSize: 12 }, children: "\u2193 Expenses this month" }), _jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: 16,
                                            color: '#f87171' }, children: _jsx("span", { className: "amount amount-negative", children: loading ? '—' : formatCurrency(summary.totalExpense) }) })] }), _jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 2px', opacity: 0.6, fontSize: 12 }, children: "\uD83D\uDCB0 Net Savings" }), _jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: 16,
                                            color: '#a78bfa' }, children: _jsx("span", { className: "amount", children: loading ? '—' : formatCurrency(summary.savings) }) })] })] })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))',
                    gap: 12,
                    marginBottom: 20,
                }, children: quickStats.map(card => (_jsxs(motion.button, { whileHover: { y: -5, scale: 1.01 }, transition: { duration: 0.22, delay: 0.06 }, onClick: () => navigate(card.path), type: "button", style: {
                        width: '100%',
                        textAlign: 'left',
                        borderLeft: `4px solid ${card.color}`,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: 16,
                        overflow: 'hidden',
                        transition: 'box-shadow 0.28s ease 0.06s, transform 0.28s ease 0.06s',
                        boxShadow: '0 10px 24px rgba(15,23,42,0.09),' +
                            'inset 0 1px 0 rgba(255,255,255,0.8)',
                    }, children: [_jsxs("div", { style: { fontSize: 11, fontWeight: 700,
                                color: card.color, textTransform: 'uppercase',
                                letterSpacing: '0.06em', marginBottom: 6,
                            }, children: [card.icon, " ", card.label] }), _jsx("div", { className: "stat-number", style: {
                                color: card.color,
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                                lineHeight: 1.15,
                                maxWidth: '100%',
                            }, children: card.isCount
                                ? card.value
                                : softWrapNumber(formatStatValue(card.value, card.isPct)) })] }, card.label))) }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("h3", { style: { fontSize: 15, fontWeight: 700,
                            color: 'var(--text-1)', marginBottom: 12,
                        }, children: "Quick Actions" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
                            gap: 10,
                        }, children: [
                            { label: '+ Expense', color: '#ef4444', bg: '#fff1f2', path: '/expenses', icon: '📉' },
                            { label: '+ Income', color: '#10b981', bg: '#ecfdf5', path: '/income', icon: '📈' },
                            { label: 'Transfer', color: '#2563eb', bg: '#eff6ff', path: '/transfers', icon: '↔️' },
                            { label: '+ Debt', color: '#f59e0b', bg: '#fffbeb', path: '/debts', icon: '🤝' },
                        ].map(action => (_jsxs(motion.button, { whileHover: { y: -4 }, onClick: () => navigate(action.path), style: {
                                background: action.bg,
                                border: `1.5px solid ${action.color}30`,
                                borderRadius: 14,
                                padding: '14px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                color: action.color,
                                fontWeight: 700,
                                fontSize: 13,
                                transition: 'all 0.2s',
                            }, children: [_jsx("span", { style: { fontSize: 22 }, children: action.icon }), action.label] }, action.label))) })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))',
                    gap: 16,
                    marginBottom: 20,
                }, children: [_jsxs("div", { style: {
                            background: 'var(--card-bg)',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: 16,
                                }, children: [_jsx("h3", { style: { fontSize: 16, fontWeight: 700,
                                            color: 'var(--text-1)', margin: 0,
                                        }, children: "Recent Activity" }), _jsx("button", { onClick: () => navigate('/expenses'), style: {
                                            background: 'none', border: 'none',
                                            color: '#7c3aed', fontSize: 13,
                                            fontWeight: 600, cursor: 'pointer',
                                        }, children: "View all \u2192" })] }), loading ? ([...Array(5)].map((_, i) => (_jsx("div", { className: "skeleton", style: { height: 52, marginBottom: 8 } }, i)))) : recentTxns.length === 0 ? (_jsxs("div", { style: {
                                    textAlign: 'center', padding: '32px 16px',
                                    color: 'var(--text-3)',
                                }, children: [_jsx("div", { style: { fontSize: 32, marginBottom: 8 }, children: "\uD83D\uDCCB" }), _jsx("p", { style: { margin: 0, fontSize: 14 }, children: "No transactions yet" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12 }, children: "Add your first expense or income" })] })) : (recentTxns.map((txn, i) => (_jsxs("div", { style: {
                                    display: 'flex', alignItems: 'center',
                                    gap: 12, padding: '10px 0',
                                    borderBottom: i < recentTxns.length - 1
                                        ? '1px solid var(--border)' : 'none',
                                }, children: [_jsx("div", { style: {
                                            width: 38, height: 38, borderRadius: 10,
                                            background: txn.txnType === 'expense' || txn.type === 'expense'
                                                ? '#fff1f2' : '#ecfdf5',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: 18, flexShrink: 0,
                                        }, children: txn.txnType === 'expense' || txn.type === 'expense' ? '📉' : '📈' }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                                    fontSize: 14, fontWeight: 600,
                                                    color: 'var(--text-1)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }, children: txn.description || 'Transaction' }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-3)', marginTop: 1 }, children: smartDate(txn.date || txn.expenseDate || txn.incomeDate) })] }), _jsxs("div", { className: txn.txnType === 'expense' || txn.type === 'expense' ? 'amount amount-negative' : 'amount amount-positive', style: { fontSize: 14, flexShrink: 0 }, children: [txn.txnType === 'expense' || txn.type === 'expense' ? '−' : '+', formatCurrency(txn.amount, txn.currency)] })] }, i))))] }), _jsxs("div", { style: {
                            background: 'var(--card-bg)',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: 16,
                                }, children: [_jsx("h3", { style: {
                                            fontSize: 16, fontWeight: 700,
                                            color: 'var(--text-1)', margin: 0,
                                        }, children: "My Accounts" }), _jsx("button", { onClick: () => navigate('/accounts'), style: {
                                            background: 'none', border: 'none',
                                            color: '#7c3aed', fontSize: 13,
                                            fontWeight: 600, cursor: 'pointer',
                                        }, children: "See all \u2192" })] }), accounts.length === 0 ? (_jsxs("div", { style: {
                                    textAlign: 'center', padding: '24px 16px',
                                    color: 'var(--text-3)',
                                }, children: [_jsx("div", { style: { fontSize: 32, marginBottom: 8 }, children: "\uD83D\uDCB3" }), _jsx("p", { style: { margin: '0 0 12px', fontSize: 14 }, children: "No accounts yet" }), _jsx("button", { onClick: () => navigate('/accounts'), style: {
                                            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                            color: 'white', border: 'none', borderRadius: 10,
                                            padding: '8px 16px', fontSize: 13,
                                            fontWeight: 600, cursor: 'pointer',
                                        }, children: "+ Add Account" })] })) : (_jsx("div", { style: {
                                    display: 'flex', flexDirection: 'column', gap: 10,
                                }, children: accounts.slice(0, 4).map((acc) => (_jsxs(motion.button, { whileHover: { x: 6, y: -1 }, transition: { duration: 0.22, delay: 0.06 }, onClick: () => navigate(`/accounts?accountId=${encodeURIComponent(acc.id)}`), type: "button", style: {
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 14px',
                                        background: 'var(--surface-2)',
                                        borderRadius: 14,
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
                                        transition: 'all 0.22s ease 0.06s',
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: {
                                                        width: 36, height: 36, borderRadius: 10,
                                                        background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                                        display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: 16,
                                                    }, children: acc.type === 'CASH' ? '💵' : '💳' }), _jsxs("div", { children: [_jsx("div", { style: {
                                                                fontSize: 13, fontWeight: 600,
                                                                color: 'var(--text-1)',
                                                            }, children: acc.name }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-3)' }, children: [acc.type, " \u00B7 ", acc.currency] })] })] }), _jsx("div", { className: "amount", style: {
                                                fontSize: 14,
                                                color: 'var(--text-1)',
                                                maxWidth: '48%',
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                            }, children: softWrapNumber(formatCurrency(acc.balance, acc.currency)) })] }, acc.id))) }))] })] }), chartReady && (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))',
                    gap: 16,
                    marginBottom: 20,
                }, children: [_jsxs("div", { style: {
                            background: 'var(--card-bg)',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }, children: [_jsx("h3", { style: {
                                    fontSize: 15, fontWeight: 700,
                                    color: 'var(--text-1)', marginBottom: 16,
                                }, children: "Last 7 Days" }), _jsx("div", { style: { width: '100%', minHeight: 200 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: last7DaysData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }), _jsx(XAxis, { dataKey: "label", tick: { fill: 'var(--text-3)', fontSize: 11 }, axisLine: false, tickLine: false }), _jsx(YAxis, { hide: true }), _jsx(Tooltip, { contentStyle: {
                                                    background: 'var(--card-bg)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 10, fontSize: 12,
                                                }, formatter: (value) => formatCurrency(value) }), _jsx(Bar, { dataKey: "expense", fill: "#ef4444", radius: [6, 6, 0, 0], name: "Expenses" }), _jsx(Bar, { dataKey: "income", fill: "#10b981", radius: [6, 6, 0, 0], name: "Income" })] }) }) })] }), _jsxs("div", { style: {
                            background: 'var(--card-bg)',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }, children: [_jsx("h3", { style: {
                                    fontSize: 15, fontWeight: 700,
                                    color: 'var(--text-1)', marginBottom: 16,
                                }, children: "Spending Breakdown" }), expByCategory.length === 0 ? (_jsxs("div", { style: {
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', height: 200,
                                    color: 'var(--text-3)', fontSize: 13,
                                    flexDirection: 'column', gap: 8,
                                }, children: [_jsx("span", { style: { fontSize: 32 }, children: "\uD83D\uDCCA" }), "No spending data yet"] })) : (_jsxs("div", { style: { display: 'grid', gap: 14 }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 12,
                                            flexWrap: 'wrap',
                                        }, children: [_jsx("p", { style: {
                                                    margin: 0,
                                                    fontSize: 12,
                                                    color: 'var(--text-3)',
                                                    fontWeight: 600,
                                                }, children: "Top categories from your real expense data" }), _jsx("span", { style: {
                                                    fontSize: 11,
                                                    color: 'var(--text-3)',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 700,
                                                }, children: "Live ranking" })] }), _jsx(AnimatedBars, { items: expByCategory.slice(0, 5), valueKey: "amount", labelKey: "category", color: "linear-gradient(90deg,#43A19E,#7B43A1,#F2317A)", formatter: value => formatCurrency(value) })] }))] })] }))] }));
};
export default Dashboard;
