import { differenceInDays, endOfMonth, format, formatDistanceToNow, isToday, isYesterday, parseISO, startOfMonth, } from 'date-fns';
export { formatCurrency } from './currency';
export const safeArray = (data) => {
    if (!data)
        return [];
    const root = data;
    const inner = root.success && root.data !== undefined
        ? root.data
        : root.data !== undefined
            ? root.data
            : root.result !== undefined
                ? root.result
                : data;
    if (Array.isArray(inner))
        return inner;
    const d = inner;
    if (Array.isArray(d?.data))
        return d.data;
    if (Array.isArray(d?.content))
        return d.content;
    if (Array.isArray(d?.items))
        return d.items;
    if (Array.isArray(d?.results))
        return d.results;
    if (Array.isArray(data))
        return data;
    return [];
};
export const safeObject = (data) => {
    if (!data)
        return null;
    const root = data;
    const inner = root.success && root.data !== undefined
        ? root.data
        : root.data !== undefined
            ? root.data
            : root.result !== undefined
                ? root.result
                : data;
    return inner;
};
export const smartDate = (d) => {
    try {
        const date = parseISO(d);
        if (isToday(date))
            return 'Today';
        if (isYesterday(date))
            return 'Yesterday';
        return format(date, 'MMM d, yyyy');
    }
    catch {
        return d;
    }
};
export const groupByDate = (items) => {
    const map = new Map();
    items.forEach(item => {
        const key = smartDate(item.date);
        if (!map.has(key))
            map.set(key, []);
        map.get(key).push(item);
    });
    return Array.from(map.entries());
};
export const CATEGORY_META = {
    FOOD: { emoji: '🍔', bg: '#fffbeb', color: '#92400e', label: 'Food', barColor: '#f59e0b' },
    TRANSPORT: { emoji: '🚗', bg: '#eff6ff', color: '#1e40af', label: 'Transport', barColor: '#3b82f6' },
    HEALTH: { emoji: '💊', bg: '#f0fdf4', color: '#166534', label: 'Health', barColor: '#10b981' },
    ENTERTAINMENT: { emoji: '🎮', bg: '#f5f3ff', color: '#5b21b6', label: 'Entertainment', barColor: '#8b5cf6' },
    UTILITIES: { emoji: '⚡', bg: '#fff1f2', color: '#9f1239', label: 'Utilities', barColor: '#ef4444' },
    OTHER: { emoji: '📦', bg: '#f8fafc', color: '#475569', label: 'Other', barColor: '#94a3b8' },
    SALARY: { emoji: '💰', bg: '#ecfdf5', color: '#065f46', label: 'Salary', barColor: '#10b981' },
    FREELANCE: { emoji: '💼', bg: '#eff6ff', color: '#1e40af', label: 'Freelance', barColor: '#3b82f6' },
    BUSINESS: { emoji: '🏢', bg: '#f5f3ff', color: '#5b21b6', label: 'Business', barColor: '#8b5cf6' },
    GIFT: { emoji: '🎁', bg: '#fdf4ff', color: '#86198f', label: 'Gift', barColor: '#d946ef' },
    INVESTMENT: { emoji: '📈', bg: '#ecfdf5', color: '#065f46', label: 'Investment', barColor: '#059669' },
};
export const getCategoryMeta = (category) => CATEGORY_META[category ?? 'OTHER'] ?? CATEGORY_META.OTHER;
export const getBudgetColor = (pct) => pct >= 100
    ? { bar: '#ef4444', text: '#be123c', bg: '#fff1f2' }
    : pct >= 75
        ? { bar: '#f59e0b', text: '#92400e', bg: '#fffbeb' }
        : { bar: '#10b981', text: '#065f46', bg: '#ecfdf5' };
// Map backend account types to frontend types
export const mapAccountType = (type) => {
    const typeMap = {
        'BANK_CARD': 'BANK_CARD',
        'BANK': 'BANK_CARD',
        'CASH': 'CASH',
    };
    return typeMap[type] || 'BANK_CARD';
};
export const getTimeOfDay = () => {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};
export const getDaysUntil = (dateStr) => differenceInDays(parseISO(dateStr), new Date());
export const thisMonthRange = () => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
};
export const isThisMonth = (dateStr) => {
    const { start, end } = thisMonthRange();
    const d = parseISO(dateStr);
    return d >= start && d <= end;
};
export const isTokenExpired = (token) => {
    try {
        if (!token)
            return true;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    }
    catch {
        return true;
    }
};
export const timeAgo = (date) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    }
    catch {
        return '';
    }
};
