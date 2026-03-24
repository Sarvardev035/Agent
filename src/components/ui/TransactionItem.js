import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import CategoryBadge from './CategoryBadge';
import { formatCurrency, getCategoryMeta, smartDate } from '../../lib/helpers';
const TransactionItem = ({ type, amount, category, date, description, currency = 'UZS', accountLabel, }) => {
    const meta = getCategoryMeta(category);
    const isExpense = type === 'expense';
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -40, height: 0, marginBottom: 0 }, transition: { duration: 0.18 }, style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            background: 'var(--surface-strong)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
        }, whileHover: { y: -2 }, children: [_jsx("div", { style: {
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: meta.bg,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                }, "aria-label": meta.label, children: meta.emoji }), _jsxs("div", { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, color: 'var(--text-1)', fontSize: 14, lineHeight: 1.2, minWidth: 0 }, children: description || meta.label }), accountLabel && (_jsx("span", { style: {
                                    background: 'var(--blue-soft)',
                                    color: 'var(--navy)',
                                    borderRadius: 999,
                                    padding: '2px 8px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                }, children: accountLabel }))] }), _jsxs("div", { style: {
                            fontSize: 12,
                            color: 'var(--text-3)',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }, children: [_jsx("span", { children: smartDate(date) }), _jsx("span", { style: {
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: 'var(--border)',
                                    display: 'inline-block',
                                } }), _jsx(CategoryBadge, { category: category })] })] }), _jsx("div", { style: {
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    alignItems: 'flex-end',
                    minWidth: 120,
                }, children: _jsxs("div", { className: isExpense ? 'amount amount-negative' : 'amount amount-positive', style: {
                        fontSize: 15,
                    }, children: [isExpense ? '-' : '+', formatCurrency(amount, currency)] }) })] }));
};
export default TransactionItem;
