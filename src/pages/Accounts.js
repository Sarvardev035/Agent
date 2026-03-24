import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import BankCard from '../components/ui/BankCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import CardNumberField from '../components/ui/CardNumberField';
import { useFinanceStore } from '../store/finance.store';
import { AccountSchema, getCardNumberError } from '../lib/security';
import { formatCurrency, useExchangeRates } from '../lib/currency';
import api from '../lib/api';
import { safeArray, mapAccountType } from '../lib/helpers';
import { ACCOUNT_TYPES, CARD_TYPES, CURRENCIES } from '../lib/constants';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { sounds } from '../lib/sounds';
import { ActivityLog } from '../components/ui/ActivityLog';
import { expensesApi } from '../api/expensesApi';
import { incomeApi } from '../api/incomeApi';
import { debtsApi } from '../api/debtsApi';
const getDefaultAccountForm = () => ({
    name: '',
    type: 'CASH',
    currency: 'UZS',
    initialBalance: '',
    cardNumber: '',
    cardType: '',
});
const Accounts = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { accounts, refreshAccounts, isLoadingAccounts } = useFinanceStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState(getDefaultAccountForm);
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [activeQuickActionsFor, setActiveQuickActionsFor] = useState(null);
    const { convert, rates, loading: rateLoading, lastUpdated, refresh } = useExchangeRates();
    const isPhone = useMediaQuery('(max-width: 640px)');
    const isCardAccount = form.type === 'BANK_CARD';
    const cardNumberError = isCardAccount ? getCardNumberError(form.cardNumber) : null;
    const cardTypeError = isCardAccount && !form.cardType
        ? 'Card type is required for BANK_CARD accounts'
        : null;
    const isSubmitDisabled = isCardAccount && (Boolean(cardNumberError) || Boolean(cardTypeError));
    const focusedAccountId = searchParams.get('accountId');
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!cancelled) {
                await refreshAccounts();
            }
        };
        load();
        return () => { cancelled = true; };
    }, [refreshAccounts]);
    const portfolio = useMemo(() => {
        const totalUZS = accounts.reduce((sum, acc) => sum + convert(acc.balance, acc.currency, 'UZS'), 0);
        const converted = convert(totalUZS, 'UZS', displayCurrency);
        return converted;
    }, [accounts, convert, displayCurrency]);
    const handleSubmit = async () => {
        if (!form.name.trim()) {
            sounds.error();
            toast.error('Name is required');
            return;
        }
        if (isCardAccount && cardNumberError) {
            sounds.error();
            toast.error(cardNumberError);
            return;
        }
        if (isCardAccount && cardTypeError) {
            sounds.error();
            toast.error(cardTypeError);
            return;
        }
        const parsed = AccountSchema.safeParse({
            ...form,
            initialBalance: Number(form.initialBalance) || 0,
            cardNumber: isCardAccount ? form.cardNumber : undefined,
            cardType: isCardAccount ? form.cardType || undefined : undefined,
        });
        if (!parsed.success) {
            sounds.error();
            toast.error(parsed.error.issues[0].message);
            return;
        }
        try {
            await api.post('/api/accounts', {
                name: parsed.data.name,
                type: parsed.data.type,
                currency: parsed.data.currency,
                initialBalance: parsed.data.initialBalance,
                ...(parsed.data.type === 'BANK_CARD'
                    ? {
                        cardNumber: parsed.data.cardNumber,
                        cardType: parsed.data.cardType,
                    }
                    : {}),
            });
            toast.success('Account created! 🎉');
            setModalOpen(false);
            setForm(getDefaultAccountForm());
            await refreshAccounts();
        }
        catch (err) {
            const msg = err?.response?.data?.message
                || err?.response?.data?.error
                || (err instanceof Error ? err.message : 'Failed to create account');
            sounds.error();
            toast.error(msg);
        }
    };
    const handleDeleteAccount = async (account) => {
        setDeletingId(account.id);
        try {
            await removeLinkedRecords(account.id);
            await api.delete(`/api/accounts/${account.id}`);
            sounds.expense();
            const log = {
                id: `log_${Date.now()}`,
                action: 'ACCOUNT_DELETED',
                message: `Account "${account.name}" was deleted`,
                type: account.type,
                currency: account.currency,
                balance: account.balance,
                time: new Date().toISOString(),
                icon: '🗑️',
            };
            const existing = JSON.parse(localStorage.getItem('finly_activity_log') || '[]');
            existing.unshift(log);
            localStorage.setItem('finly_activity_log', JSON.stringify(existing.slice(0, 50)));
            toast.success(`Account "${account.name}" deleted`);
            setConfirmDeleteAccount(null);
            await refreshAccounts();
        }
        catch (err) {
            sounds.error();
            const msg = err?.message || 'Failed to delete account';
            toast.error(msg);
        }
        finally {
            setDeletingId(null);
        }
    };
    const handleQuickNavigate = (path, accountId) => {
        navigate(`${path}?accountId=${encodeURIComponent(accountId)}`);
        setActiveQuickActionsFor(null);
    };
    const removeLinkedRecords = async (accountId) => {
        const [expensesRes, incomesRes, debtsRes, transfersRes] = await Promise.allSettled([
            expensesApi.getAll({ accountId }),
            incomeApi.getAll({ accountId }),
            debtsApi.getAll(),
            api.get('/api/transfers', { params: { accountId } }),
        ]);
        const expenses = expensesRes.status === 'fulfilled' ? safeArray(expensesRes.value.data) : [];
        const incomes = incomesRes.status === 'fulfilled' ? safeArray(incomesRes.value.data) : [];
        const debts = debtsRes.status === 'fulfilled'
            ? safeArray(debtsRes.value.data).filter((d) => String(d.accountId) === String(accountId))
            : [];
        const transfers = transfersRes.status === 'fulfilled'
            ? safeArray(transfersRes.value.data).filter((t) => String(t.fromAccountId) === String(accountId) || String(t.toAccountId) === String(accountId))
            : [];
        await Promise.allSettled(expenses.map((item) => expensesApi.delete(item.id)));
        await Promise.allSettled(incomes.map((item) => incomeApi.delete(item.id)));
        await Promise.allSettled(debts.map((item) => debtsApi.delete(item.id)));
        await Promise.allSettled(transfers.map((item) => api.delete(`/api/transfers/${item.id}`)));
    };
    const handleDeleteCard = async (account) => {
        try {
            setDeletingId(account.id);
            await removeLinkedRecords(account.id);
            await api.delete(`/api/accounts/${account.id}`);
            sounds.expense();
            // Log the card deletion to activity log
            const log = {
                id: `log_${Date.now()}`,
                action: 'CARD_DROPPED',
                message: `Card "${account.name}" (${account.type}) was dropped`,
                type: account.type,
                currency: account.currency,
                balance: account.balance,
                time: new Date().toISOString(),
                icon: '🗑️',
            };
            const existing = JSON.parse(localStorage.getItem('finly_activity_log') || '[]');
            existing.unshift(log);
            localStorage.setItem('finly_activity_log', JSON.stringify(existing.slice(0, 50)));
            toast.success(`Card "${account.name}" has been dropped`);
            setActiveQuickActionsFor(null);
            await refreshAccounts();
        }
        catch (err) {
            sounds.error();
            const msg = err?.response?.data?.error || err?.message || 'Failed to drop card';
            toast.error(msg);
        }
        finally {
            setDeletingId(null);
        }
    };
    return (_jsxs("div", { className: "page-content page-enter", style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 24,
                }, children: [_jsxs("div", { children: [_jsx("p", { style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: 'var(--text-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    margin: '0 0 4px',
                                }, children: "ACCOUNTS" }), _jsx("h1", { style: {
                                    fontSize: 'clamp(20px,3vw,28px)',
                                    fontWeight: 800,
                                    color: 'var(--text-1)',
                                    margin: 0,
                                }, children: "Portfolio" }), _jsx("p", { style: {
                                    fontSize: 13,
                                    color: 'var(--text-3)',
                                    margin: '4px 0 0',
                                }, children: "Manage your cash, cards, and banks." })] }), _jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(ActivityLog, {}), _jsx("button", { onClick: () => setModalOpen(true), type: "button", style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '11px 20px',
                                    background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                }, onMouseEnter: e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)';
                                }, onMouseLeave: e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)';
                                }, children: "+ Add Account" })] })] }), _jsxs("div", { className: "card", style: {
                    background: 'var(--surface-strong)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
                    gap: 12,
                    alignItems: 'center',
                }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, color: '#94a3b8', fontSize: 13 }, children: "Portfolio value" }), _jsx("div", { className: "balance-large", children: rateLoading ? 'Loading...' : formatCurrency(portfolio, displayCurrency) }), _jsxs("p", { style: { margin: '4px 0 0', color: '#94a3b8', fontSize: 12 }, children: ["Last updated ", lastUpdated ? format(lastUpdated, 'PPpp') : '—'] })] }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }, children: [CURRENCIES.map(cur => (_jsx("button", { onClick: () => setDisplayCurrency(cur), type: "button", style: {
                                    padding: '8px 10px',
                                    borderRadius: 10,
                                    border: displayCurrency === cur ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                    background: displayCurrency === cur ? '#eff6ff' : '#fff',
                                    fontWeight: 700,
                                }, children: cur }, cur))), _jsx("button", { onClick: refresh, type: "button", style: {
                                    padding: '8px 10px',
                                    borderRadius: 10,
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    fontWeight: 700,
                                }, children: "Refresh rates" })] })] }), _jsx("div", { style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'flex-start',
                }, children: isLoadingAccounts ? (Array.from({ length: 3 }).map((_, i) => _jsx(Skeleton, { height: 180 }, i))) : accounts.length === 0 ? (_jsx(EmptyState, { title: "No accounts", description: "Add an account to start tracking.", actionLabel: "Add", onAction: () => setModalOpen(true) })) : (_jsx(AnimatePresence, { children: accounts.map(acc => (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -20 }, style: {
                            flex: isPhone ? '1 1 100%' : '0 1 calc(20% - 10px)',
                            width: isPhone ? '100%' : 'calc(20% - 10px)',
                            minWidth: isPhone ? '100%' : 230,
                            maxWidth: isPhone ? '100%' : 'calc(20% - 10px)',
                            borderRadius: 18,
                            outline: focusedAccountId === acc.id ? '2px solid #7c3aed' : 'none',
                            boxShadow: focusedAccountId === acc.id ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
                        }, children: _jsxs("div", { style: { position: 'relative' }, onClick: () => setActiveQuickActionsFor(prev => (prev === acc.id ? null : acc.id)), children: [_jsx(BankCard, { name: acc.name, last4: String(acc.id).slice(-4), balance: acc.balance, currency: acc.currency, type: mapAccountType(acc.type), accountId: acc.id }), activeQuickActionsFor === acc.id && (_jsxs("div", { style: {
                                        position: 'absolute',
                                        left: 8,
                                        right: 8,
                                        bottom: 8,
                                        background: 'rgba(15,23,42,0.86)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        borderRadius: 12,
                                        padding: 8,
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: 6,
                                        zIndex: 3,
                                        backdropFilter: 'blur(8px)',
                                    }, onClick: e => e.stopPropagation(), children: [_jsx("button", { type: "button", "data-button-reset": "true", onClick: () => handleQuickNavigate('/transfers', acc.id), style: {
                                                border: '1px solid rgba(59,130,246,0.35)',
                                                borderRadius: 10,
                                                padding: '8px 6px',
                                                background: 'rgba(59,130,246,0.15)',
                                                color: '#bfdbfe',
                                                fontWeight: 700,
                                                fontSize: 12,
                                                cursor: 'pointer',
                                            }, children: "\u2194 Transfer" }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: () => handleQuickNavigate('/income', acc.id), style: {
                                                border: '1px solid rgba(16,185,129,0.35)',
                                                borderRadius: 10,
                                                padding: '8px 6px',
                                                background: 'rgba(16,185,129,0.15)',
                                                color: '#a7f3d0',
                                                fontWeight: 700,
                                                fontSize: 12,
                                                cursor: 'pointer',
                                            }, children: "\u2193 Receive" }), _jsxs("button", { type: "button", "data-button-reset": "true", disabled: deletingId === acc.id, onClick: () => handleDeleteCard(acc), style: {
                                                border: '1px solid rgba(239,68,68,0.35)',
                                                borderRadius: 10,
                                                padding: '8px 6px',
                                                background: 'rgba(239,68,68,0.15)',
                                                color: deletingId === acc.id ? 'rgba(248,113,113,0.5)' : '#fca5a5',
                                                fontWeight: 700,
                                                fontSize: 12,
                                                cursor: deletingId === acc.id ? 'not-allowed' : 'pointer',
                                                opacity: deletingId === acc.id ? 0.5 : 1,
                                                transition: 'all 0.15s',
                                            }, onMouseEnter: e => {
                                                if (deletingId !== acc.id) {
                                                    e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                                                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                                                }
                                            }, onMouseLeave: e => {
                                                if (deletingId !== acc.id) {
                                                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                                                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                                                }
                                            }, children: [deletingId === acc.id ? '⏳' : '🗑️', " Drop"] })] }))] }) }, acc.id))) })) }), modalOpen && (_jsx("div", { className: "modal-overlay", style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: isPhone ? 'flex-end' : 'center',
                    justifyContent: 'center',
                    padding: isPhone ? '12px 12px 0' : '24px 16px',
                    zIndex: 100,
                }, onClick: e => {
                    if (e.target === e.currentTarget)
                        setModalOpen(false);
                }, children: _jsxs("div", { className: "modal-box", style: {
                        width: '100%',
                        maxWidth: 620,
                        background: 'var(--surface-strong)',
                        borderRadius: isPhone ? '24px 24px 0 0' : 20,
                        padding: isPhone ? 18 : 24,
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border)',
                        maxHeight: isPhone ? '92vh' : 'min(90vh, 720px)',
                        overflowY: 'auto',
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, children: [_jsx("h2", { style: { fontSize: 20, fontWeight: 700 }, children: "Add Account" }), _jsx("button", { onClick: () => setModalOpen(false), style: {
                                        background: 'var(--surface)',
                                        border: 'none',
                                        borderRadius: 8,
                                        width: 32,
                                        height: 32,
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        color: 'var(--text-3)',
                                    }, children: "\u2715" })] }), _jsxs("form", { onSubmit: e => {
                                e.preventDefault();
                                handleSubmit();
                            }, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }, children: "Account Name *" }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), placeholder: "e.g. My Uzcard", required: true, style: {
                                                width: '100%',
                                                height: 44,
                                                padding: '0 14px',
                                                border: '1.5px solid var(--border)',
                                                borderRadius: 10,
                                                fontSize: 14,
                                                background: 'var(--surface)',
                                                color: 'var(--text-1)',
                                            } })] }), _jsxs("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
                                        gap: 12,
                                        marginBottom: 16,
                                    }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }, children: "Type *" }), _jsx("select", { value: form.type, onChange: e => setForm({ ...form, type: e.target.value }), style: {
                                                        width: '100%',
                                                        height: 44,
                                                        padding: '0 14px',
                                                        border: '1.5px solid var(--border)',
                                                        borderRadius: 10,
                                                        fontSize: 14,
                                                        background: 'var(--surface)',
                                                        color: 'var(--text-1)',
                                                        cursor: 'pointer',
                                                    }, children: ACCOUNT_TYPES.map(t => (_jsxs("option", { value: t.value, children: [t.icon, " ", t.label] }, t.value))) })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }, children: "Currency *" }), _jsx("select", { value: form.currency, onChange: e => setForm({ ...form, currency: e.target.value }), style: {
                                                        width: '100%',
                                                        height: 44,
                                                        padding: '0 14px',
                                                        border: '1.5px solid var(--border)',
                                                        borderRadius: 10,
                                                        fontSize: 14,
                                                        background: 'var(--surface)',
                                                        color: 'var(--text-1)',
                                                        cursor: 'pointer',
                                                    }, children: CURRENCIES.map(cur => (_jsx("option", { value: cur, children: cur }, cur))) })] })] }), isCardAccount && (_jsxs(_Fragment, { children: [_jsx(CardNumberField, { value: form.cardNumber, error: cardNumberError, onChange: cardNumber => setForm(prev => ({ ...prev, cardNumber })) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }, children: "Card Type *" }), _jsxs("select", { value: form.cardType, onChange: e => setForm(prev => ({ ...prev, cardType: e.target.value })), style: {
                                                        width: '100%',
                                                        height: 44,
                                                        padding: '0 14px',
                                                        border: `1.5px solid ${cardTypeError ? '#ef4444' : 'var(--border)'}`,
                                                        borderRadius: 10,
                                                        fontSize: 14,
                                                        background: cardTypeError ? '#fef2f2' : '#ffffff',
                                                        color: '#111827',
                                                        colorScheme: 'light',
                                                        cursor: 'pointer',
                                                    }, children: [_jsx("option", { value: "", style: { color: '#6b7280', background: '#ffffff' }, children: "Select card type" }), CARD_TYPES.map(card => (_jsx("option", { value: card.value, style: { color: '#111827', background: '#ffffff' }, children: card.label }, card.value)))] }), _jsx("p", { style: { margin: '6px 0 0', minHeight: 18, color: cardTypeError ? '#dc2626' : 'var(--text-3)', fontSize: 12 }, children: cardTypeError ?? 'Supported by the backend: Uzcard, Humo, Visa, and Mastercard.' })] })] })), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }, children: "Initial Balance" }), _jsx("input", { type: "number", value: form.initialBalance, onChange: e => setForm({ ...form, initialBalance: e.target.value }), placeholder: "0", min: "0", step: "any", style: {
                                                width: '100%',
                                                height: 44,
                                                padding: '0 14px',
                                                border: '1.5px solid var(--border)',
                                                borderRadius: 10,
                                                fontSize: 14,
                                                background: 'var(--surface)',
                                                color: 'var(--text-1)',
                                            } })] }), _jsx("button", { type: "submit", disabled: isSubmitDisabled, className: "btn-primary", style: {
                                        width: '100%',
                                        height: 48,
                                        fontSize: 15,
                                        opacity: isSubmitDisabled ? 0.6 : 1,
                                        cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                                    }, children: "Save Account" })] })] }) })), confirmDeleteAccount && (_jsx("div", { onClick: e => {
                    if (e.target === e.currentTarget)
                        setConfirmDeleteAccount(null);
                }, style: {
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    zIndex: 999,
                    animation: 'fadeIn 0.2s ease-out',
                }, children: _jsxs("div", { style: {
                        background: 'var(--card-bg)',
                        borderRadius: 24,
                        padding: '32px 28px',
                        maxWidth: 380,
                        width: '100%',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.3), ' +
                            '0 0 0 1px rgba(255,255,255,0.05)',
                        animation: 'slideUpBounce 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                        textAlign: 'center',
                    }, children: [_jsxs("div", { style: {
                                width: 72, height: 72,
                                borderRadius: '50%',
                                background: 'rgba(239,68,68,0.1)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                position: 'relative',
                            }, children: [_jsx("div", { style: {
                                        position: 'absolute', inset: -4,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(239,68,68,0.3)',
                                        animation: 'pulseRing 1.5s ease-out infinite',
                                    } }), _jsx("span", { style: { fontSize: 32 }, children: "\uD83D\uDDD1\uFE0F" })] }), _jsx("h3", { style: {
                                fontSize: 20, fontWeight: 800,
                                color: 'var(--text-1)',
                                margin: '0 0 8px',
                                letterSpacing: '-0.02em',
                            }, children: "Delete Account?" }), _jsx("p", { style: {
                                fontSize: 14, color: 'var(--text-3)',
                                margin: '0 0 6px', lineHeight: 1.5,
                            }, children: "You are about to delete" }), _jsxs("div", { style: {
                                background: 'var(--surface-2)',
                                borderRadius: 12,
                                padding: '12px 16px',
                                margin: '0 0 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }, children: [_jsx("div", { style: {
                                        width: 40, height: 40, borderRadius: 10,
                                        background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 18, flexShrink: 0,
                                    }, children: confirmDeleteAccount.type === 'CASH' ? '💵' : '💳' }), _jsxs("div", { style: { textAlign: 'left' }, children: [_jsx("div", { style: {
                                                fontSize: 14, fontWeight: 700,
                                                color: 'var(--text-1)',
                                            }, children: confirmDeleteAccount.name }), _jsxs("div", { style: { fontSize: 12, color: 'var(--text-3)' }, children: [confirmDeleteAccount.type, " \u00B7", ' ', confirmDeleteAccount.currency, " \u00B7", ' ', "Balance: ", formatCurrency(confirmDeleteAccount.balance, confirmDeleteAccount.currency)] })] })] }), _jsxs("div", { style: {
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 12,
                                padding: '10px 14px',
                                marginBottom: 24,
                                fontSize: 13,
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                textAlign: 'left',
                            }, children: [_jsx("span", { style: { flexShrink: 0, fontSize: 16 }, children: "\u26A0\uFE0F" }), _jsxs("span", { children: [_jsx("strong", { children: "There is no comeback." }), " This account and all its data will be permanently deleted. This action cannot be undone."] })] }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 10,
                            }, children: [_jsx("button", { onClick: () => setConfirmDeleteAccount(null), style: {
                                        height: 46,
                                        borderRadius: 12,
                                        border: '1.5px solid var(--border)',
                                        background: 'var(--surface)',
                                        color: 'var(--text-2)',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                    }, onMouseEnter: e => {
                                        e.currentTarget.style.background = 'var(--surface-2)';
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.borderColor = 'var(--text-3)';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.background = 'var(--surface)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }, onMouseDown: e => e.currentTarget.style.transform = 'scale(0.97)', onMouseUp: e => e.currentTarget.style.transform = 'scale(1.02)', children: "\u2190 Keep it" }), _jsx("button", { onClick: () => handleDeleteAccount(confirmDeleteAccount), disabled: !!deletingId, style: {
                                        height: 46,
                                        borderRadius: 12,
                                        border: 'none',
                                        background: deletingId
                                            ? 'rgba(239,68,68,0.4)'
                                            : 'linear-gradient(135deg,#ef4444,#dc2626)',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: deletingId ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: deletingId
                                            ? 'none'
                                            : '0 4px 14px rgba(239,68,68,0.4), ' +
                                                '0 0 0 0 rgba(239,68,68,0)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }, onMouseEnter: e => {
                                        if (deletingId)
                                            return;
                                        e.currentTarget.style.transform = 'scale(1.04) translateY(-1px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 8px 24px rgba(239,68,68,0.5), ' +
                                                '0 0 0 4px rgba(239,68,68,0.12)';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 14px rgba(239,68,68,0.4)';
                                    }, onMouseDown: e => {
                                        if (deletingId)
                                            return;
                                        e.currentTarget.style.transform = 'scale(0.97)';
                                    }, onMouseUp: e => {
                                        if (deletingId)
                                            return;
                                        e.currentTarget.style.transform = 'scale(1.04)';
                                    }, children: deletingId ? (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                                    width: 14, height: 14,
                                                    border: '2px solid rgba(255,255,255,0.4)',
                                                    borderTopColor: 'white',
                                                    borderRadius: '50%',
                                                    animation: 'spin 0.8s linear infinite',
                                                } }), "Deleting..."] })) : (_jsx(_Fragment, { children: "\uD83D\uDDD1\uFE0F Delete" })) })] })] }) }))] }));
};
export default Accounts;
