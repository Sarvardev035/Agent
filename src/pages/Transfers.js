import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, Clock3, Landmark, Plus, ReceiptText, ScanLine, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { transfersApi } from '../api/transfersApi';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, smartDate } from '../lib/helpers';
import { safeArray } from '../lib/helpers';
import { convert, fetchExchangeRates } from '../lib/currency';
import { sounds } from '../lib/sounds';
const Transfers = () => {
    const { accounts, refreshAccounts } = useFinance();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [receiptTransfer, setReceiptTransfer] = useState(null);
    const [rates, setRates] = useState(null);
    const [form, setForm] = useState({
        amount: '',
        fromAccountId: '',
        toAccountId: '',
        description: '',
        transferDate: format(new Date(), 'yyyy-MM-dd'),
        exchangeRate: '1',
    });
    const getErrorMessage = (err, fallback) => {
        if (err instanceof Error && err.message)
            return err.message;
        return fallback;
    };
    const loadTransfers = async () => {
        try {
            setLoading(true);
            const { data } = await transfersApi.getAll();
            setTransfers(safeArray(data).map(item => ({
                ...item,
                date: item.transferDate || item.date,
            })));
        }
        catch (err) {
            console.error(err);
            sounds.error();
            toast.error('Failed to load transfers');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void Promise.allSettled([loadTransfers(), refreshAccounts()]);
        fetchExchangeRates()
            .then(setRates)
            .catch(() => { });
    }, [refreshAccounts]);
    const handleSubmit = async () => {
        if (!form.amount || !form.fromAccountId || !form.toAccountId) {
            sounds.error();
            toast.error('Fill all required fields');
            return;
        }
        if (form.fromAccountId === form.toAccountId) {
            sounds.error();
            toast.error('Choose different accounts');
            return;
        }
        try {
            await transfersApi.create({
                amount: Number(form.amount),
                fromAccountId: form.fromAccountId,
                toAccountId: form.toAccountId,
                description: form.description,
                transferDate: form.transferDate,
                exchangeRate: Number(form.exchangeRate) || 1,
            });
            sounds.transfer();
            toast.success('Transfer completed!');
            setModalOpen(false);
            setForm({
                amount: '',
                fromAccountId: '',
                toAccountId: '',
                description: '',
                transferDate: format(new Date(), 'yyyy-MM-dd'),
                exchangeRate: '1',
            });
            await Promise.allSettled([loadTransfers(), refreshAccounts()]);
        }
        catch (err) {
            console.error('Failed to save transfer:', err);
            sounds.error();
            toast.error(getErrorMessage(err, 'Failed to save transfer'));
        }
    };
    const fromAccount = useMemo(() => accounts.find(a => a.id === form.fromAccountId), [accounts, form.fromAccountId]);
    const toAccount = useMemo(() => accounts.find(a => a.id === form.toAccountId), [accounts, form.toAccountId]);
    const currenciesDiffer = !!(fromAccount?.currency && toAccount?.currency && fromAccount.currency !== toAccount.currency);
    const convertedAmount = useMemo(() => {
        const amt = Number(form.amount);
        if (!currenciesDiffer)
            return amt;
        return convert(amt, fromAccount?.currency || 'UZS', toAccount?.currency || 'UZS', rates || {});
    }, [currenciesDiffer, form.amount, fromAccount?.currency, toAccount?.currency, rates]);
    return (_jsxs("div", { className: "page-content", style: { display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }, children: "TRANSFERS" }), _jsx("h1", { style: { margin: '4px 0', fontSize: 22, fontWeight: 800 }, children: "Move money" }), _jsx("p", { style: { margin: 0, color: 'var(--text-2)' }, children: "Track internal movements." })] }), _jsxs("button", { onClick: () => setModalOpen(true), type: "button", className: "transfer-action-button", style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            border: 'none',
                            background: 'transparent',
                            color: '#fff',
                            padding: '10px 12px',
                            borderRadius: 12,
                            fontWeight: 800,
                            boxShadow: 'none',
                            cursor: 'pointer',
                        }, children: [_jsx(Plus, { size: 16 }), " Add transfer"] })] }), _jsx("div", { style: {
                    background: 'var(--surface-strong)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: 'var(--shadow-md)',
                    minHeight: 200,
                    border: '1px solid var(--border)',
                }, children: loading ? (_jsx(Skeleton, { height: 64, count: 4 })) : transfers.length === 0 ? (_jsx(EmptyState, { title: "No transfers", description: "Create your first transfer.", actionLabel: "Add transfer", onAction: () => setModalOpen(true) })) : (_jsx(AnimatePresence, { children: transfers.map(item => {
                        const from = accounts.find(a => a.id === item.fromAccountId);
                        const to = accounts.find(a => a.id === item.toAccountId);
                        return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -20 }, whileHover: { y: -2 }, onClick: () => setReceiptTransfer(item), style: {
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 8,
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: 8,
                                alignItems: 'center',
                                boxShadow: 'var(--shadow-sm)',
                                background: 'var(--surface)',
                                cursor: 'pointer',
                            }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, children: [_jsx("span", { style: {
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 10,
                                                        background: 'var(--blue-soft)',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--blue)',
                                                    }, children: _jsx(ArrowLeftRight, { size: 18 }) }), _jsxs("div", { style: { fontWeight: 800, color: 'var(--text-1)' }, children: [from?.name || 'From', " \u2192 ", to?.name || 'To'] })] }), _jsx("div", { style: { fontSize: 13, color: 'var(--text-2)', marginTop: 4 }, children: item.description || 'No description' }), _jsxs("div", { style: { fontSize: 12, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx(Clock3, { size: 12 }), smartDate(item.date)] })] }), _jsx("div", { style: { textAlign: 'right', fontWeight: 800, color: 'var(--blue)' }, children: formatCurrency(item.amount, from?.currency || 'UZS') })] }, item.id));
                    }) })) }), _jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: "Create transfer", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "From account" }), _jsxs("select", { value: form.fromAccountId, onChange: e => setForm(prev => ({ ...prev, fromAccountId: e.target.value })), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' }, children: [_jsx("option", { value: "", children: "Select account" }), accounts.map(acc => (_jsxs("option", { value: acc.id, children: [acc.name, " (", acc.currency, ")"] }, acc.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "To account" }), _jsxs("select", { value: form.toAccountId, onChange: e => setForm(prev => ({ ...prev, toAccountId: e.target.value })), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' }, children: [_jsx("option", { value: "", children: "Select account" }), accounts.map(acc => (_jsxs("option", { value: acc.id, children: [acc.name, " (", acc.currency, ")"] }, acc.id)))] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Amount" }), _jsx("input", { type: "number", value: form.amount, onChange: e => setForm(prev => ({ ...prev, amount: e.target.value })), placeholder: "0.00", min: "0", step: "any", style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Date" }), _jsx("input", { type: "date", value: form.transferDate, onChange: e => setForm(prev => ({ ...prev, transferDate: e.target.value })), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' } })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Exchange rate" }), _jsx("input", { type: "number", value: form.exchangeRate, min: "0", step: "any", onChange: e => setForm(prev => ({ ...prev, exchangeRate: e.target.value })), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' } })] }), _jsx("div", {})] }), currenciesDiffer && form.amount && (_jsxs("div", { style: {
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: 10, padding: '10px 14px',
                                fontSize: 13, color: '#166534',
                                marginBottom: 12,
                            }, children: ["\uD83D\uDCB1 ", form.amount, " ", fromAccount?.currency, " \u2248", ' ', _jsxs("strong", { children: [convertedAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }), " ", toAccount?.currency] }), _jsx("div", { style: { fontSize: 11, opacity: 0.7, marginTop: 2 }, children: "Rate updates automatically" })] })), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }, children: "Description" }), _jsx("input", { value: form.description, onChange: e => setForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Optional", style: { width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' } })] }), form.fromAccountId === form.toAccountId && form.fromAccountId && (_jsx("div", { style: {
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: 10,
                                padding: '10px 12px',
                                fontSize: 13,
                                color: '#991b1b',
                            }, children: "\u26A0\uFE0F From and To accounts must be different" })), _jsx("button", { onClick: handleSubmit, type: "button", className: "transfer-action-button", style: {
                                width: '100%',
                                height: 48,
                                borderRadius: 14,
                                border: 'none',
                                background: 'transparent',
                                color: '#fff',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: 'none',
                            }, children: "Save transfer" })] }) }), _jsx(Modal, { open: Boolean(receiptTransfer), onClose: () => setReceiptTransfer(null), title: "Transfer receipt", subtitle: "Tap any transfer in history to open this receipt view.", children: receiptTransfer && (_jsx("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }, children: _jsxs("div", { className: "transfer-receipt", style: {
                            borderRadius: 22,
                            padding: 18,
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }, children: "Finly cheque" }), _jsx("div", { style: { fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }, children: formatCurrency(receiptTransfer.amount, accounts.find(a => a.id === receiptTransfer.fromAccountId)?.currency || 'UZS') })] }), _jsx("div", { style: {
                                            width: 48,
                                            height: 48,
                                            borderRadius: 16,
                                            background: 'var(--blue-soft)',
                                            color: 'var(--blue)',
                                            display: 'grid',
                                            placeItems: 'center',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                                        }, children: _jsx(ReceiptText, { size: 22 }) })] }), _jsxs("div", { className: "transfer-receipt__grid", children: [_jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(Landmark, { size: 14 }), " From"] }), _jsx("strong", { children: accounts.find(a => a.id === receiptTransfer.fromAccountId)?.name || 'From account' })] }), _jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(Landmark, { size: 14 }), " To"] }), _jsx("strong", { children: accounts.find(a => a.id === receiptTransfer.toAccountId)?.name || 'To account' })] }), _jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(Clock3, { size: 14 }), " Date"] }), _jsx("strong", { children: format(new Date(receiptTransfer.transferDate || receiptTransfer.date), 'PPP') })] }), _jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(Clock3, { size: 14 }), " Time"] }), _jsx("strong", { children: receiptTransfer.createdAt
                                                    ? format(new Date(receiptTransfer.createdAt), 'p')
                                                    : 'Recorded by daily transfer log' })] }), _jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(ScanLine, { size: 14 }), " Route"] }), _jsxs("strong", { children: [(accounts.find(a => a.id === receiptTransfer.fromAccountId)?.name || 'From'), ' ', "\u2192", ' ', (accounts.find(a => a.id === receiptTransfer.toAccountId)?.name || 'To')] })] }), _jsxs("div", { className: "transfer-receipt__row", children: [_jsxs("span", { children: [_jsx(Ticket, { size: 14 }), " Transfer ID"] }), _jsx("strong", { children: `TRX-${String(receiptTransfer.id || Math.random().toString(36).slice(2))
                                                    .replace(/-/g, '')
                                                    .slice(0, 12)
                                                    .toUpperCase()}` })] })] }), receiptTransfer.description && (_jsxs("div", { style: {
                                    marginTop: 16,
                                    paddingTop: 14,
                                    borderTop: '1px dashed rgba(122,140,189,0.28)',
                                }, children: [_jsx("div", { style: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: 6 }, children: "Note" }), _jsx("div", { style: { fontSize: 14, color: 'var(--text-1)', lineHeight: 1.5 }, children: receiptTransfer.description })] }))] }) })) })] }));
};
export default Transfers;
