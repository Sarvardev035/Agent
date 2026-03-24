import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { AlertTriangle, CalendarRange, CircleDollarSign, Landmark, ScanSearch, Sparkles, TrendingDown, TrendingUp, Wallet, } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import AnimatedBars from '../components/ui/AnimatedBars';
import { statsApi } from '../api/statsApi';
import { formatCurrency, getCategoryMeta } from '../lib/helpers';
import { safeArray } from '../lib/helpers';
import { useMediaQuery } from '../hooks/useMediaQuery';
const periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
const rangeForPeriod = (period) => {
    const now = new Date();
    if (period === 'DAILY') {
        return { startDate: format(subDays(now, 6), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
    }
    if (period === 'WEEKLY') {
        return { startDate: format(subDays(now, 27), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
    }
    if (period === 'MONTHLY') {
        return { startDate: format(subMonths(now, 5), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
    }
    return { startDate: format(subYears(now, 1), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
};
const normalizeFinanceLabel = (raw) => {
    const source = String(raw ?? '').trim();
    if (!source)
        return '';
    const upper = source.toUpperCase();
    const meta = getCategoryMeta(upper);
    if (meta && meta.label && meta.label.toLowerCase() !== 'other') {
        return meta.label;
    }
    return source
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};
const formatFallbackPeriodLabel = (period, idx) => {
    if (period === 'DAILY')
        return `Day ${idx + 1}`;
    if (period === 'WEEKLY')
        return `Week ${idx + 1}`;
    if (period === 'MONTHLY')
        return `Month ${idx + 1}`;
    return `Year ${idx + 1}`;
};
const Statistics = () => {
    const [period, setPeriod] = useState('MONTHLY');
    const [chartReady, setChartReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backendNotice, setBackendNotice] = useState(null);
    const [visibleSections, setVisibleSections] = useState(0);
    const stackCharts = useMediaQuery('(max-width: 1500px)');
    const [summary, setSummary] = useState({});
    const [overview, setOverview] = useState({});
    const [insight, setInsight] = useState(null);
    const [cashflow, setCashflow] = useState([]);
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [accountBalances, setAccountBalances] = useState([]);
    const [largeExpenses, setLargeExpenses] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [vsData, setVsData] = useState([]);
    const [incomeGrowth, setIncomeGrowth] = useState([]);
    useEffect(() => {
        const t = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => {
        if (loading) {
            setVisibleSections(0);
            return;
        }
        const totalSections = 6;
        let current = 0;
        const timer = window.setInterval(() => {
            current += 1;
            setVisibleSections(current);
            if (current >= totalSections) {
                window.clearInterval(timer);
            }
        }, 140);
        return () => window.clearInterval(timer);
    }, [loading, period]);
    useEffect(() => {
        const fetchStats = async () => {
            const range = rangeForPeriod(period);
            try {
                setLoading(true);
                setBackendNotice(null);
                const [summaryRes, overviewRes, cashflowRes, balanceHistoryRes, accountBalancesRes, largeExpensesRes, insightRes, breakdownRes, vsRes, incomeGrowthRes,] = await Promise.allSettled([
                    statsApi.summary(),
                    statsApi.overview(range),
                    statsApi.cashflow(range),
                    statsApi.balanceHistory({ months: period === 'YEARLY' ? 12 : 6 }),
                    statsApi.accountBalances(),
                    statsApi.recentLargeExpenses({ ...range, limit: 5 }),
                    statsApi.insight(range),
                    statsApi.expensesByCategory({ from: range.startDate, to: range.endDate, period }),
                    statsApi.incomeVsExpense({ from: range.startDate, to: range.endDate, period }),
                    statsApi.incomeGrowth({ months: period === 'YEARLY' ? 12 : 6 }),
                ]);
                const summaryData = summaryRes.status === 'fulfilled'
                    ? summaryRes.value.data?.data ?? summaryRes.value.data ?? {}
                    : {};
                const overviewData = overviewRes.status === 'fulfilled'
                    ? overviewRes.value.data?.data ?? overviewRes.value.data ?? {}
                    : {};
                const insightData = insightRes.status === 'fulfilled'
                    ? insightRes.value.data?.data ?? insightRes.value.data ?? {}
                    : null;
                const cashflowData = cashflowRes.status === 'fulfilled'
                    ? safeArray(cashflowRes.value.data?.data ?? cashflowRes.value.data)
                    : [];
                const balanceHistoryData = balanceHistoryRes.status === 'fulfilled'
                    ? safeArray(balanceHistoryRes.value.data?.data ?? balanceHistoryRes.value.data)
                    : [];
                const accountBalanceData = accountBalancesRes.status === 'fulfilled'
                    ? safeArray(accountBalancesRes.value.data?.data ?? accountBalancesRes.value.data)
                    : [];
                const largeExpenseData = largeExpensesRes.status === 'fulfilled'
                    ? safeArray(largeExpensesRes.value.data?.data ?? largeExpensesRes.value.data)
                    : [];
                const breakdownData = breakdownRes.status === 'fulfilled'
                    ? safeArray(breakdownRes.value.data?.data ?? breakdownRes.value.data)
                    : [];
                const vsIncomeData = vsRes.status === 'fulfilled'
                    ? safeArray(vsRes.value.data?.data ?? vsRes.value.data)
                    : [];
                const incomeGrowthData = incomeGrowthRes.status === 'fulfilled'
                    ? safeArray(incomeGrowthRes.value.data?.data ?? incomeGrowthRes.value.data)
                    : [];
                setSummary(summaryData);
                setOverview(overviewData);
                setInsight(insightData && (insightData.title || insightData.message) ? insightData : null);
                setCashflow(cashflowData.map((item, idx) => ({
                    label: item.date
                        ? format(new Date(item.date), period === 'DAILY' ? 'MMM d' : 'MMM d')
                        : normalizeFinanceLabel(item.label || item.categoryName || item.source) || formatFallbackPeriodLabel(period, idx),
                    income: Number(item.income ?? 0),
                    expense: Number(item.expense ?? 0),
                })));
                setBalanceHistory(balanceHistoryData.map((item, idx) => ({
                    label: normalizeFinanceLabel(item.month || item.label) || formatFallbackPeriodLabel(period, idx),
                    balance: Number(item.balance ?? 0),
                })));
                setAccountBalances(accountBalanceData
                    .map((item) => ({
                    accountName: item.accountName || item.name || 'Account',
                    balance: Number(item.balance ?? 0),
                }))
                    .sort((a, b) => b.balance - a.balance));
                setLargeExpenses(largeExpenseData.map((item) => ({
                    id: item.id,
                    description: item.description || normalizeFinanceLabel(item.categoryName || item.category) || 'Expense',
                    categoryName: normalizeFinanceLabel(item.categoryName || item.category) || 'Other',
                    amount: Number(item.amount ?? 0),
                    expenseDate: item.expenseDate,
                })));
                setBreakdown(breakdownData.map((item) => ({
                    categoryKey: String(item.category || item.name || item.label || 'OTHER').toUpperCase(),
                    category: normalizeFinanceLabel(item.category || item.name || item.label) || 'Other',
                    value: Number(item.total ?? item.value ?? item.amount ?? 0),
                })));
                setVsData(vsIncomeData.map((item, idx) => ({
                    period: normalizeFinanceLabel(item.month || item.period || item.label) || formatFallbackPeriodLabel(period, idx),
                    income: Number(item.income ?? item.amount ?? item.totalIncome ?? 0),
                    expense: Number(item.expense ?? item.total ?? item.amount ?? 0),
                })));
                setIncomeGrowth(incomeGrowthData.map((item, idx) => ({
                    month: normalizeFinanceLabel(item.month || item.label) || formatFallbackPeriodLabel(period, idx),
                    amount: Number(item.amount ?? 0),
                })));
                const hasAnyData = Object.keys(summaryData).length
                    || Object.keys(overviewData).length
                    || cashflowData.length
                    || balanceHistoryData.length
                    || accountBalanceData.length
                    || largeExpenseData.length
                    || breakdownData.length
                    || vsIncomeData.length
                    || incomeGrowthData.length;
                if (!hasAnyData) {
                    setBackendNotice('The backend returned no analytics for the selected range yet. Add more transactions to unlock insights.');
                }
            }
            catch (err) {
                console.error(err);
                setSummary({});
                setOverview({});
                setInsight(null);
                setCashflow([]);
                setBalanceHistory([]);
                setAccountBalances([]);
                setLargeExpenses([]);
                setBreakdown([]);
                setVsData([]);
                setIncomeGrowth([]);
                setBackendNotice('Analytics could not be loaded from the backend right now. Sign in again or add transactions if your account is still empty.');
            }
            finally {
                setLoading(false);
            }
        };
        void fetchStats();
    }, [period]);
    const netSavings = useMemo(() => {
        if (!vsData.length)
            return [];
        return vsData.map(item => ({
            label: item.period,
            value: (item.income || 0) - (item.expense || 0),
        }));
    }, [vsData]);
    const totalIncome = Number(summary.totalIncome ?? vsData.reduce((s, i) => s + (i.income || 0), 0));
    const totalExpense = Number(summary.totalExpense ?? vsData.reduce((s, i) => s + (i.expense || 0), 0));
    const topCategory = breakdown[0]?.category || overview.topCategory || 'No category yet';
    const sourceRange = rangeForPeriod(period);
    const analyticsReady = breakdown.length
        || vsData.length
        || cashflow.length
        || balanceHistory.length
        || accountBalances.length
        || largeExpenses.length
        || incomeGrowth.length
        || Object.keys(summary).length
        || Object.keys(overview).length;
    const customTooltip = (props) => {
        const { active, payload, label } = props;
        if (!active || !payload?.length)
            return null;
        const primaryPoint = payload[0]?.payload;
        const categoryLabel = normalizeFinanceLabel(primaryPoint?.category || primaryPoint?.categoryName);
        return (_jsxs("div", { style: {
                background: '#0f172a',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 12,
                boxShadow: 'var(--shadow-lg)',
            }, children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 6 }, children: categoryLabel || label }), payload.map((p) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12 }, children: [_jsx("span", { children: p.name }), _jsx("span", { className: "amount", children: formatCurrency(p.value) })] }, p.dataKey)))] }));
    };
    const revealStyle = (index) => ({
        opacity: visibleSections >= index ? 1 : 0,
        transform: visibleSections >= index ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
    });
    return (_jsxs("div", { className: "page-content", style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingBottom: 12,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("p", { style: { color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }, children: "STATISTICS" }), _jsx("h1", { style: { margin: '4px 0', fontSize: 22, fontWeight: 800 }, children: "Analytics that explain your money" }), _jsxs("p", { style: { margin: 0, color: 'var(--text-2)' }, children: ["Live backend data from ", sourceRange.startDate, " to ", sourceRange.endDate, "."] })] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: periods.map(p => (_jsx("button", { onClick: () => setPeriod(p), type: "button", style: {
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: period === p ? '1px solid var(--blue)' : '1px solid var(--border)',
                                background: period === p ? 'var(--blue-soft)' : '#fff',
                                color: period === p ? 'var(--blue)' : 'var(--text-1)',
                                fontWeight: 700,
                            }, children: p.charAt(0) + p.slice(1).toLowerCase() }, p))) })] }), backendNotice && (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: 14,
                    borderRadius: 12,
                    border: '1px dashed var(--border)',
                    background: 'rgba(124,58,237,0.09)',
                    color: 'var(--text-1)',
                }, children: [_jsx(ScanSearch, { size: 18 }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 800, marginBottom: 4 }, children: "Backend analytics status" }), _jsx("div", { style: { color: 'var(--text-2)', fontSize: 14 }, children: backendNotice })] })] })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 12, ...revealStyle(1) }, children: [_jsx(StatCard, { label: "Income total", value: totalIncome, prefix: "UZS ", changeType: "up", isLoading: loading, icon: _jsx(TrendingUp, { size: 18 }) }), _jsx(StatCard, { label: "Expense total", value: totalExpense, prefix: "UZS ", changeType: "down", isLoading: loading, icon: _jsx(TrendingDown, { size: 18 }) }), _jsx(StatCard, { label: "Net savings", value: totalIncome - totalExpense, prefix: "UZS ", changeType: (totalIncome - totalExpense) >= 0 ? 'up' : 'down', isLoading: loading, icon: _jsx(Wallet, { size: 18 }) }), _jsx(StatCard, { label: "Savings rate", value: Math.round(Number(overview.savingsRate ?? 0)), suffix: "%", changeType: (overview.savingsRate ?? 0) >= 0 ? 'up' : 'down', isLoading: loading, icon: _jsx(CircleDollarSign, { size: 18 }) })] }), analyticsReady ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 12, ...revealStyle(2) }, children: [_jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx(Landmark, { size: 18, color: "#7c3aed" }), _jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Overview" })] }), _jsxs("div", { style: { display: 'grid', gap: 10 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }, children: "Current balance" }), _jsx("div", { className: "balance-large", children: formatCurrency(Number(overview.totalBalance ?? summary.totalBalance ?? 0)) })] }), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [_jsxs("span", { style: { padding: '6px 12px', borderRadius: 999, background: 'var(--blue-soft)', color: 'var(--blue)', fontWeight: 700, fontSize: 12 }, children: ["Top category: ", topCategory] }), _jsxs("span", { style: { padding: '6px 12px', borderRadius: 999, background: 'var(--amber-soft)', color: 'var(--amber)', fontWeight: 700, fontSize: 12 }, children: ["Share: ", Math.round(Number(overview.topCategoryPercent ?? 0)), "%"] })] })] })] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx(CalendarRange, { size: 18, color: "#2563eb" }), _jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "What this range says" })] }), _jsx("p", { style: { fontSize: 14, color: 'var(--text-2)', margin: 0 }, children: insight?.message || 'The backend did not return a generated insight for this range, so the page is showing direct metrics only.' }), insight?.title && (_jsx("div", { style: { marginTop: 12, fontWeight: 800, color: 'var(--text-1)' }, children: insight.title }))] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx(AlertTriangle, { size: 18, color: "#ef4444" }), _jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Monthly pressure" })] }), _jsx("div", { className: "stat-number", children: formatCurrency(Number(overview.monthlyExpenses ?? totalExpense)) }), _jsx("p", { style: { marginTop: 8, color: 'var(--text-2)', fontSize: 14 }, children: "This is the expense pressure detected by the backend for the current visible range." })] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1.12fr) minmax(360px,0.88fr)',
                            gap: 14,
                            alignItems: 'stretch',
                            ...revealStyle(3),
                        }, children: [_jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 340 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Cashflow" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "Income vs expense over time" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 260 })) : cashflow.length === 0 ? (_jsx(EmptyState, { title: "No cashflow data", description: "The backend has no cashflow points for this range yet." })) : (_jsx("div", { style: { width: '100%', minHeight: 270 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(AreaChart, { data: cashflow, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "cashIncome", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.45 }), _jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0.04 })] }), _jsxs("linearGradient", { id: "cashExpense", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#ef4444", stopOpacity: 0.02 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "label" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Area, { type: "monotone", dataKey: "income", stroke: "#10b981", fill: "url(#cashIncome)", strokeWidth: 2, name: "Income", activeDot: false }), _jsx(Area, { type: "monotone", dataKey: "expense", stroke: "#ef4444", fill: "url(#cashExpense)", strokeWidth: 2, name: "Expense", activeDot: false })] }) }) }))] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 340 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Expense mix" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "Category bars" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 260 })) : breakdown.length === 0 ? (_jsx(EmptyState, { title: "No category split", description: "Add expenses first so the backend can group them by category." })) : (_jsxs("div", { style: { display: 'grid', gap: 14 }, children: [_jsx("div", { style: { width: '100%', minHeight: 250 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { layout: "vertical", data: breakdown.slice(0, 6), margin: { left: 8, right: 8 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { type: "category", dataKey: "category", width: 88, tick: { fill: 'var(--text-2)', fontSize: 12 } }), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Bar, { dataKey: "value", radius: [0, 10, 10, 0], name: "Expense", activeBar: false, children: breakdown.slice(0, 6).map((item, idx) => {
                                                                    const meta = getCategoryMeta(item.categoryKey || item.category);
                                                                    return _jsx(Cell, { fill: meta.color }, `${item.category}-${idx}`);
                                                                }) })] }) }) }), _jsx(AnimatedBars, { items: breakdown.slice(0, 5), valueKey: "value", labelKey: "category", color: "linear-gradient(90deg,#43A19E,#7B43A1,#F2317A)", formatter: value => formatCurrency(value) })] }))] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
                            gap: 14,
                            alignItems: 'stretch',
                            ...revealStyle(4),
                        }, children: [_jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Account balances" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "CodePen-inspired bars" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 240 })) : accountBalances.length === 0 ? (_jsx(EmptyState, { title: "No account balances", description: "The backend has no balance ranking yet." })) : (_jsx(AnimatedBars, { items: accountBalances.slice(0, 6), valueKey: "balance", labelKey: "accountName", color: "linear-gradient(90deg,#43A19E,#7B43A1,#F2317A)", formatter: value => formatCurrency(value) }))] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Balance history" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "How your total balance moved" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 240 })) : balanceHistory.length === 0 ? (_jsx(EmptyState, { title: "No balance history", description: "The backend has not generated any balance history points yet." })) : (_jsx("div", { style: { width: '100%', minHeight: 250 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(LineChart, { data: balanceHistory, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "label" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Line, { type: "monotone", dataKey: "balance", stroke: "#7c3aed", strokeWidth: 3, dot: false, activeDot: false, name: "Balance" })] }) }) }))] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
                            gap: 14,
                            alignItems: 'stretch',
                            ...revealStyle(5),
                        }, children: [_jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Income growth" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "Backend monthly growth signal" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 240 })) : incomeGrowth.length === 0 ? (_jsx(EmptyState, { title: "No income growth yet", description: "Record income entries to unlock this trend." })) : (_jsx("div", { style: { width: '100%', minHeight: 250 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { data: incomeGrowth, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Bar, { dataKey: "amount", fill: "#0ea5e9", radius: [10, 10, 0, 0], name: "Income", activeBar: false })] }) }) }))] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Income vs expense comparison" }), _jsxs("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: [period.toLowerCase(), " grouped comparison"] })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 240 })) : vsData.length === 0 ? (_jsx(EmptyState, { title: "No comparison data", description: "The backend did not return grouped income and expense values for this range." })) : (_jsx("div", { style: { width: '100%', minHeight: 250 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { data: vsData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "period" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Bar, { dataKey: "income", fill: "#10b981", radius: [8, 8, 0, 0], name: "Income", activeBar: false }), _jsx(Bar, { dataKey: "expense", fill: "#f43f5e", radius: [8, 8, 0, 0], name: "Expense", activeBar: false })] }) }) }))] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
                            gap: 14,
                            alignItems: 'stretch',
                            ...revealStyle(6),
                        }, children: [_jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Net savings trend" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "Positive or negative momentum" })] }), loading || !chartReady ? (_jsx(Skeleton, { height: 240 })) : netSavings.length === 0 ? (_jsx(EmptyState, { title: "No net savings data", description: "Income and expense comparisons are needed to calculate savings momentum." })) : (_jsx("div", { style: { width: '100%', minHeight: 250 }, children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(AreaChart, { data: netSavings, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "netGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0.08 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "label" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: customTooltip, cursor: false }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#10b981", strokeWidth: 2, fill: "url(#netGradient)", name: "Net", activeDot: false })] }) }) }))] }), _jsxs("div", { className: "card glass-card", style: { padding: 18, borderRadius: 18, minHeight: 320 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 }, children: "Recent large expenses" }), _jsx("span", { style: { fontSize: 12, color: 'var(--text-3)' }, children: "High-impact transactions" })] }), loading ? (_jsx(Skeleton, { height: 240 })) : largeExpenses.length === 0 ? (_jsx(EmptyState, { title: "No large expenses", description: "The backend did not detect any large expenses in this range." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: largeExpenses.map(item => (_jsxs("div", { style: {
                                                padding: '12px 14px',
                                                borderRadius: 14,
                                                border: '1px solid var(--border)',
                                                background: 'var(--surface)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 12,
                                            }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }, children: item.description }), _jsxs("div", { style: { fontSize: 12, color: 'var(--text-2)' }, children: [item.categoryName, " \u2022 ", item.expenseDate] })] }), _jsx("div", { className: "amount amount-negative", style: { flexShrink: 0 }, children: formatCurrency(item.amount) })] }, item.id))) }))] })] })] })) : (!loading && (_jsx(EmptyState, { icon: _jsx(Sparkles, { size: 34, color: "#7c3aed" }), title: "No analytics yet", description: "The backend is available, but this account does not have enough financial activity for the selected range." }))), !loading && !chartReady && _jsx(Skeleton, { height: 120 })] }));
};
export default Statistics;
