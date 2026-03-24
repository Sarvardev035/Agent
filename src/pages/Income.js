import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2, Leaf, LineChart, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import TransactionItem from '../components/ui/TransactionItem';
import Skeleton from '../components/ui/Skeleton';
import { incomeApi } from '../api/incomeApi';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, smartDate } from '../lib/helpers';
import { categoriesService } from '../services/categories.service';
import { safeArray } from '../lib/helpers';
import { CURRENCIES } from '../lib/constants';
import { sounds } from '../lib/sounds';
import { screenReader } from '../lib/screenReader';
const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
    const d = subMonths(new Date(), idx);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') };
});
const Income = () => {
    const { accounts, refreshAccounts } = useFinance();
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [formData, setFormData] = useState({
        amount: '',
        incomeDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        categoryId: '',
        accountId: '',
        currency: 'UZS',
    });
    const loadCategories = async () => {
        try {
            const res = await categoriesService.getByType('INCOME');
            setCategoryOptions(safeArray(res.data).map(cat => ({
                id: cat.id ?? cat.categoryId ?? cat.name,
                name: cat.name ?? cat.category ?? 'Other',
            })));
        }
        catch {
            setCategoryOptions([]);
        }
    };
    const loadIncome = async () => {
        try {
            setLoading(true);
            const { data } = await incomeApi.getAll();
            const list = safeArray(data).map(item => ({
                ...item,
                date: item.incomeDate || item.date,
                categoryId: item.categoryId || item.category,
                currency: item.currency || 'UZS',
            }));
            setIncome(list);
        }
        catch (err) {
            console.error(err);
            sounds.error();
            toast.error('Failed to load income');
        }
        finally {
            setLoading(false);
        }
    };
    const getCategoryName = (categoryId) => {
        const category = categoryOptions.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };
    useEffect(() => {
        loadIncome();
        loadCategories();
        refreshAccounts();
    }, [refreshAccounts]);
    const filtered = useMemo(() => {
        const monthMatch = (date) => date?.startsWith(month);
        return (income || [])
            .filter(item => (categoryFilter === 'ALL' ? true : item.categoryId === categoryFilter))
            .filter(item => (month ? monthMatch(item.date) : true))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [income, categoryFilter, month]);
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(item => {
            const key = smartDate(item.date);
            if (!map[key])
                map[key] = [];
            map[key].push(item);
        });
        return map;
    }, [filtered]);
    const handleChange = (key, value) => {
        if (key === 'accountId') {
            const selectedAccount = accounts.find(acc => acc.id === value);
            setFormData(prev => ({
                ...prev,
                accountId: value,
                currency: selectedAccount?.currency || 'UZS',
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };
    const handleSubmit = () => {
        setTimeout(async () => {
            if (!formData.amount || !formData.incomeDate || !formData.accountId || !formData.categoryId) {
                sounds.error();
                const errorText = 'Please fill amount, date, account, category, and currency';
                toast.error(errorText);
                screenReader.speak(`Error: ${errorText}`, true);
                return;
            }
            try {
                await incomeApi.create({
                    amount: Number(formData.amount),
                    incomeDate: formData.incomeDate,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    accountId: formData.accountId,
                    currency: formData.currency,
                });
                sounds.income();
                toast.success('Income recorded! 💰');
                screenReader.speak('Income added successfully', true);
                setShowModal(false);
                setFormData({
                    amount: '',
                    incomeDate: format(new Date(), 'yyyy-MM-dd'),
                    description: '',
                    categoryId: '',
                    accountId: '',
                    currency: 'UZS',
                });
                await Promise.allSettled([loadIncome(), refreshAccounts()]);
            }
            catch (err) {
                console.error(err);
                sounds.error();
                const errorText = 'Failed to add income';
                toast.error(errorText);
                screenReader.speak(`Error: ${errorText}`, true);
            }
        }, 0);
    };
    const dailyTotals = (items) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    return (_jsxs("div", { className: "page-content", style: { display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }, children: [_jsxs("div", { style: {
                    background: 'linear-gradient(120deg,#0f766e,#10b981)',
                    color: '#fff',
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }, children: [_jsx("div", { style: {
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.12)',
                            display: 'grid',
                            placeItems: 'center',
                        }, children: _jsx(Sparkles, { size: 20 }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("p", { style: { margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11, opacity: 0.8 }, children: "Earnings" }), _jsx("h2", { style: { margin: '4px 0 2px', fontSize: 18, fontWeight: 800 }, children: "Income tracker" }), _jsx("p", { style: { margin: 0, opacity: 0.8, fontSize: 13 }, children: "Stay on top of all inflows." })] }), _jsxs("button", { onClick: () => setShowModal(true), type: "button", style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#fff',
                            color: '#0f172a',
                            padding: '10px 14px',
                            borderRadius: 12,
                            border: 'none',
                            fontWeight: 800,
                            boxShadow: '0 12px 30px rgba(16,185,129,0.28)',
                            cursor: 'pointer',
                        }, children: [_jsx(Plus, { size: 18 }), " Add Income"] })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: 12,
                }, children: [
                    { icon: _jsx(LineChart, { size: 18 }), title: 'Growth view', desc: 'Monitor revenue trends month over month.' },
                    { icon: _jsx(Leaf, { size: 18 }), title: 'Diversify', desc: 'Balance between salary and side gigs.' },
                    { icon: _jsx(CheckCircle2, { size: 18 }), title: 'Goal alignment', desc: 'Keep savings targets in sight.' },
                ].map(card => (_jsxs("div", { style: {
                        background: 'var(--surface-strong)',
                        borderRadius: 14,
                        padding: 14,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        boxShadow: 'var(--shadow-sm)',
                    }, children: [_jsx("div", { style: {
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                background: 'var(--green-soft)',
                                display: 'grid',
                                placeItems: 'center',
                                color: 'var(--green)',
                            }, children: card.icon }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 4 }, children: card.title }), _jsx("div", { style: { color: 'var(--text-2)', fontSize: 13 }, children: card.desc })] })] }, card.title))) }), _jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    padding: 12,
                    background: 'var(--surface-strong)',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                }, children: [_jsx("div", { style: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }, children: monthOptions.map(opt => (_jsx("button", { onClick: () => setMonth(opt.value), type: "button", style: {
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: month === opt.value ? '1px solid var(--green)' : '1px solid var(--border)',
                                background: month === opt.value ? 'var(--green-soft)' : 'var(--surface)',
                                color: month === opt.value ? 'var(--green)' : 'var(--text-1)',
                                fontWeight: 700,
                                minWidth: 120,
                                whiteSpace: 'nowrap',
                            }, children: opt.label }, opt.value))) }), _jsx("div", { style: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }, children: ['ALL', ...categoryOptions.map(cat => cat.id || cat.name)].map(cat => (_jsx("button", { onClick: () => setCategoryFilter(cat), type: "button", style: {
                                padding: '8px 12px',
                                borderRadius: 999,
                                border: categoryFilter === cat ? '1px solid var(--green)' : '1px solid var(--border)',
                                background: categoryFilter === cat ? 'var(--green-soft)' : 'var(--surface)',
                                fontWeight: 700,
                                color: categoryFilter === cat ? 'var(--green)' : 'var(--text-1)',
                                whiteSpace: 'nowrap',
                            }, children: cat === 'ALL' ? 'All' : cat }, cat))) })] }), _jsx("div", { style: {
                    background: 'var(--surface-strong)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)',
                    minHeight: 260,
                }, children: loading ? (_jsx(Skeleton, { height: 66, count: 4 })) : filtered.length === 0 ? (_jsx(EmptyState, { title: "No income yet", description: "Record your earnings to visualize growth.", actionLabel: "Add income", onAction: () => setShowModal(true) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: Object.entries(grouped).map(([dateLabel, items]) => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("div", { style: { fontWeight: 800, color: 'var(--text-1)' }, children: dateLabel }), _jsx("div", { style: { fontWeight: 700, color: 'var(--green)' }, children: formatCurrency(dailyTotals(items)) })] }), _jsx(AnimatePresence, { children: items.map((item) => {
                                    const account = accounts.find(acc => acc.id === item.accountId);
                                    const categoryName = getCategoryName(item.categoryId);
                                    return (_jsx(TransactionItem, { type: "income", amount: item.amount, category: item.category || categoryName || 'OTHER', date: item.date, description: item.description, currency: account?.currency || 'UZS', accountLabel: account?.name }, item.id));
                                }) })] }, dateLabel))) })) }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Add income", subtitle: "Use ISO date format YYYY-MM-DD.", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Amount" }), _jsx("input", { type: "number", value: formData.amount, onChange: e => handleChange('amount', e.target.value), placeholder: "0.00", min: "0", step: "any", style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Date" }), _jsx("input", { type: "date", value: formData.incomeDate, onChange: e => handleChange('incomeDate', e.target.value), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 } })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Category" }), _jsxs("select", { value: formData.categoryId, onChange: e => handleChange('categoryId', e.target.value), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }, children: [_jsx("option", { value: "", children: "Select category" }), categoryOptions.map(cat => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Currency" }), _jsx("select", { value: formData.currency, onChange: e => handleChange('currency', e.target.value), disabled: !!formData.accountId, style: {
                                                width: '100%',
                                                border: '1px solid var(--border)',
                                                borderRadius: 12,
                                                padding: 10,
                                                opacity: formData.accountId ? 0.6 : 1,
                                                cursor: formData.accountId ? 'not-allowed' : 'pointer',
                                            }, children: CURRENCIES.map(cur => (_jsx("option", { value: cur, children: cur }, cur))) }), formData.accountId && (_jsx("div", { style: { fontSize: 11, color: 'var(--text-3)', marginTop: 4 }, children: "Currency auto-selected from account" }))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Account" }), _jsxs("select", { value: formData.accountId, onChange: e => handleChange('accountId', e.target.value), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }, children: [_jsx("option", { value: "", children: "Select account" }), accounts.map(acc => (_jsxs("option", { value: acc.id, children: [acc.name, " (", acc.currency, ")"] }, acc.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Description" }), _jsx("input", { value: formData.description, onChange: e => handleChange('description', e.target.value), placeholder: "Optional", style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 } })] }), _jsx("button", { onClick: handleSubmit, type: "button", style: {
                                width: '100%',
                                height: 48,
                                borderRadius: 14,
                                border: 'none',
                                background: 'linear-gradient(135deg,#10b981,#0ea5e9)',
                                color: '#fff',
                                fontWeight: 800,
                                boxShadow: '0 12px 30px rgba(16,185,129,0.35)',
                                cursor: 'pointer',
                            }, children: "Save income" })] }) })] }));
};
export default Income;
