import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { safeArray } from '../../lib/helpers';
const HISTORY_KEY = 'finly_search_history';
const loadHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    }
    catch (error) {
        console.error(error);
        return [];
    }
};
const saveToHistory = (query) => {
    if (!query.trim())
        return;
    const h = loadHistory();
    const updated = [query, ...h.filter(q => q !== query)].slice(0, 5);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};
const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
export const GlobalSearch = ({ onOpenChange }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(loadHistory);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    const isDesktop = windowWidth > 1024;
    const closedSize = isMobile ? 36 : 40;
    const openWidth = isMobile ? `${windowWidth - 80}px` : isTablet ? '280px' : '380px';
    const dropdownWidth = isMobile ? `${windowWidth - 24}px` : isTablet ? '300px' : '420px';
    const fontSize = isMobile ? 13 : 14;
    const iconSize = isMobile ? 16 : 18;
    const showDropdown = open && (query.length > 0 || history.length > 0);
    useEffect(() => {
        onOpenChange?.(open);
    }, [open, onOpenChange]);
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    useEffect(() => {
        if (open) {
            window.setTimeout(() => inputRef.current?.focus(), 280);
        }
        else {
            setQuery('');
            setResults([]);
            setLoading(false);
        }
    }, [open]);
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);
    const parseRows = useMemo(() => ({
        expenses: (rows, lower) => rows
            .filter(e => e.description?.toLowerCase().includes(lower) ||
            String(e.amount).includes(lower) ||
            e.currency?.toLowerCase().includes(lower))
            .slice(0, 4)
            .map(e => ({
            id: String(e.id),
            type: 'expense',
            title: e.description || 'Expense',
            subtitle: `${e.expenseDate || e.date || '-'} · Expense`,
            amount: e.amount,
            currency: e.currency,
            path: '/expenses',
            icon: '📉',
        })),
        incomes: (rows, lower) => rows
            .filter(e => e.description?.toLowerCase().includes(lower) ||
            String(e.amount).includes(lower) ||
            e.currency?.toLowerCase().includes(lower))
            .slice(0, 4)
            .map(e => ({
            id: String(e.id),
            type: 'income',
            title: e.description || 'Income',
            subtitle: `${e.incomeDate || e.date || '-'} · Income`,
            amount: e.amount,
            currency: e.currency,
            path: '/income',
            icon: '📈',
        })),
        transfers: (rows, lower) => rows
            .filter(e => e.description?.toLowerCase().includes(lower) || String(e.amount).includes(lower))
            .slice(0, 3)
            .map(e => ({
            id: String(e.id),
            type: 'transfer',
            title: e.description || 'Transfer',
            subtitle: `${e.transferDate || e.date || '-'} · Transfer`,
            amount: e.amount,
            currency: e.currency,
            path: '/transfers',
            icon: '↔️',
        })),
        debts: (rows, lower) => rows
            .filter(e => e.personName?.toLowerCase().includes(lower) ||
            e.description?.toLowerCase().includes(lower) ||
            String(e.amount).includes(lower))
            .slice(0, 3)
            .map(e => ({
            id: String(e.id),
            type: 'debt',
            title: e.personName || 'Debt',
            subtitle: `${e.dueDate || '-'} · ${e.type === 'DEBT' ? 'I owe' : 'Owed to me'}`,
            amount: e.amount,
            currency: e.currency,
            path: '/debts',
            icon: '🤝',
        })),
        accounts: (rows, lower) => rows
            .filter(e => e.name?.toLowerCase().includes(lower) ||
            e.type?.toLowerCase().includes(lower) ||
            e.currency?.toLowerCase().includes(lower) ||
            String(e.balance).includes(lower))
            .slice(0, 3)
            .map(e => ({
            id: String(e.id),
            type: 'account',
            title: e.name || 'Account',
            subtitle: `${e.type || '-'} · ${e.currency || '-'}`,
            amount: e.balance,
            currency: e.currency,
            path: '/accounts',
            icon: e.type === 'CASH' ? '💵' : '💳',
        })),
    }), []);
    const performSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const lower = q.toLowerCase();
                const [expRes, incRes, trnRes, debtRes, accRes] = await Promise.allSettled([
                    api.get('/api/expenses'),
                    api.get('/api/incomes'),
                    api.get('/api/transfers'),
                    api.get('/api/debts'),
                    api.get('/api/accounts'),
                ]);
                const all = [
                    ...parseRows.expenses(safeArray(expRes.status === 'fulfilled' ? expRes.value.data : []), lower),
                    ...parseRows.incomes(safeArray(incRes.status === 'fulfilled' ? incRes.value.data : []), lower),
                    ...parseRows.transfers(safeArray(trnRes.status === 'fulfilled' ? trnRes.value.data : []), lower),
                    ...parseRows.debts(safeArray(debtRes.status === 'fulfilled' ? debtRes.value.data : []), lower),
                    ...parseRows.accounts(safeArray(accRes.status === 'fulfilled' ? accRes.value.data : []), lower),
                ];
                setResults(all);
                saveToHistory(q);
                setHistory(loadHistory());
            }
            catch (error) {
                console.error(error);
                setResults([]);
            }
            finally {
                setLoading(false);
            }
        }, 1500);
    }, [parseRows]);
    useEffect(() => {
        if (query) {
            void performSearch(query);
        }
        else {
            setResults([]);
            setLoading(false);
            if (debounceRef.current)
                clearTimeout(debounceRef.current);
        }
        return () => {
            if (debounceRef.current)
                clearTimeout(debounceRef.current);
        };
    }, [query, performSearch]);
    const handleSelect = (result) => {
        navigate(result.path);
        setOpen(false);
        setQuery('');
    };
    const highlightMatch = (text) => {
        if (!query || !text.toLowerCase().includes(query.toLowerCase()))
            return text;
        return text.split(new RegExp(`(${query})`, 'gi')).map((part, idx) => part.toLowerCase() === query.toLowerCase() ? (_jsx("mark", { style: {
                background: 'rgba(124,58,237,0.15)',
                color: '#7c3aed',
                borderRadius: 3,
                padding: '0 1px',
            }, children: part }, `${part}-${idx}`)) : (part));
    };
    return (_jsxs("div", { ref: wrapRef, style: { position: 'relative', display: 'inline-flex', alignItems: 'center' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    width: open ? openWidth : `${closedSize}px`,
                    height: closedSize,
                    background: open ? 'var(--card-bg)' : 'transparent',
                    border: open ? '1.5px solid #7c3aed' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: open ? '0 0 0 3px rgba(124,58,237,0.12), 0 4px 20px rgba(0,0,0,0.1)' : 'none',
                    cursor: open ? 'text' : 'pointer',
                }, onClick: () => {
                    if (!open)
                        setOpen(true);
                }, children: [_jsx("div", { style: {
                            width: closedSize,
                            height: closedSize,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                        }, onClick: e => {
                            e.stopPropagation();
                            if (open && query) {
                                void performSearch(query);
                            }
                            else {
                                setOpen(prev => !prev);
                            }
                        }, children: _jsxs("svg", { width: iconSize, height: iconSize, viewBox: "0 0 24 24", fill: "none", stroke: open ? '#7c3aed' : 'var(--text-2)', strokeWidth: "2.5", strokeLinecap: "round", style: {
                                transition: 'transform 0.3s ease',
                                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                            }, children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "m21 21-4.35-4.35" })] }) }), _jsx("input", { ref: inputRef, value: query, onChange: e => setQuery(e.target.value), placeholder: "Search transactions, accounts...", style: {
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize,
                            color: 'var(--text-1)',
                            fontFamily: 'inherit',
                            opacity: open ? 1 : 0,
                            paddingRight: 8,
                            transition: 'opacity 0.2s ease 0.1s',
                        } }), open && query && (_jsx("button", { onClick: e => {
                            e.stopPropagation();
                            setQuery('');
                            setResults([]);
                            inputRef.current?.focus();
                        }, style: {
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            marginRight: 6,
                            background: 'var(--surface-2)',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--text-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }, type: "button", children: "\u2715" }))] }), showDropdown && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: dropdownWidth,
                    maxWidth: isMobile ? '100vw' : isDesktop ? 440 : 420,
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    zIndex: 200,
                    overflow: 'hidden',
                    animation: 'searchDropIn 0.2s ease-out',
                }, children: [loading && (_jsxs("div", { style: { padding: '16px 16px 8px' }, children: [_jsxs("div", { style: {
                                    fontSize: 12,
                                    color: 'var(--text-3)',
                                    marginBottom: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }, children: [_jsx("span", { children: "Searching" }), _jsx("div", { style: { display: 'flex', gap: 3 }, children: [0, 1, 2].map(i => (_jsx("div", { style: {
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: '#7c3aed',
                                                animation: 'waveDot 1.2s ease-in-out infinite',
                                                animationDelay: `${i * 0.2}s`,
                                            } }, i))) })] }), [80, 60, 70].map((w, i) => (_jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }, children: [_jsx("div", { className: "skeleton", style: { width: 32, height: 32, borderRadius: 8, flexShrink: 0 } }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "skeleton", style: { height: 12, width: `${w}%`, borderRadius: 4, marginBottom: 5 } }), _jsx("div", { className: "skeleton", style: { height: 10, width: '50%', borderRadius: 4 } })] }), _jsx("div", { className: "skeleton", style: { height: 12, width: 60, borderRadius: 4 } })] }, i)))] })), !loading && results.length > 0 && (_jsxs("div", { children: [_jsxs("div", { style: {
                                    padding: '10px 16px 6px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: 'var(--text-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }, children: [results.length, " result", results.length !== 1 ? 's' : ''] }), _jsx("div", { style: { maxHeight: 340, overflowY: 'auto' }, children: results.map((r, i) => (_jsxs("div", { onClick: () => handleSelect(r), style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        transition: 'background 0.12s',
                                        borderBottom: '1px solid var(--border)',
                                    }, onMouseEnter: e => {
                                        e.currentTarget.style.background = 'var(--surface-2)';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.background = 'transparent';
                                    }, children: [_jsx("div", { style: {
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                background: r.type === 'income'
                                                    ? '#ecfdf5'
                                                    : r.type === 'expense'
                                                        ? '#fff1f2'
                                                        : r.type === 'transfer'
                                                            ? '#eff6ff'
                                                            : r.type === 'debt'
                                                                ? '#fffbeb'
                                                                : '#f5f3ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 18,
                                                flexShrink: 0,
                                            }, children: r.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: 'var(--text-1)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }, children: highlightMatch(r.title) }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-3)', marginTop: 2 }, children: r.subtitle })] }), r.amount !== undefined && (_jsxs("div", { style: {
                                                fontSize: 13,
                                                fontWeight: 700,
                                                flexShrink: 0,
                                                color: r.type === 'income' ? '#10b981' : r.type === 'expense' ? '#ef4444' : 'var(--text-1)',
                                                fontVariantNumeric: 'tabular-nums',
                                            }, children: [r.type === 'income' ? '+' : '', formatCurrency(r.amount, r.currency)] }))] }, `${r.type}-${r.id}-${i}`))) })] })), !loading && query && results.length === 0 && (_jsxs("div", { style: { padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)' }, children: [_jsx("div", { style: { fontSize: 32, marginBottom: 8 }, children: "\uD83D\uDD0D" }), _jsxs("div", { style: { fontSize: 14, fontWeight: 500 }, children: ["No results for \"", query, "\""] }), _jsx("div", { style: { fontSize: 12, marginTop: 4 }, children: "Try amount, description, person, or account name" })] })), !loading && !query && history.length > 0 && (_jsxs("div", { children: [_jsxs("div", { style: {
                                    padding: '10px 16px 6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }, children: [_jsx("span", { style: {
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: 'var(--text-3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }, children: "Recent searches" }), _jsx("button", { onClick: () => {
                                            clearHistory();
                                            setHistory([]);
                                        }, style: {
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-3)',
                                            cursor: 'pointer',
                                            fontSize: 11,
                                        }, type: "button", children: "Clear" })] }), history.map((h, i) => (_jsxs("div", { onClick: () => setQuery(h), style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 16px',
                                    cursor: 'pointer',
                                    transition: 'background 0.12s',
                                }, onMouseEnter: e => {
                                    e.currentTarget.style.background = 'var(--surface-2)';
                                }, onMouseLeave: e => {
                                    e.currentTarget.style.background = 'transparent';
                                }, children: [_jsx("span", { style: { fontSize: 14, color: 'var(--text-3)' }, children: "\uD83D\uDD50" }), _jsx("span", { style: { fontSize: 13, color: 'var(--text-2)' }, children: h }), _jsx("span", { style: { marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }, children: "\u2197" })] }, `${h}-${i}`)))] }))] }))] }));
};
