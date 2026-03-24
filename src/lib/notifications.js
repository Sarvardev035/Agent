import { formatCurrency } from './currency';
import { getDaysUntil } from './helpers';
const STORAGE_KEY = 'dismissed_notifications';
export const dismissNotification = (id) => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (current.includes(id))
        return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
};
export const generateNotifications = (expenses, budgetCategories, debts) => {
    const notes = [];
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    budgetCategories.forEach(({ category, limit, spent }) => {
        if (!limit)
            return;
        const pct = (spent / limit) * 100;
        if (pct >= 90 && pct < 100) {
            notes.push({
                id: `budget_warn_${category}`,
                type: 'warning',
                icon: '⚠️',
                message: `You've used ${Math.round(pct)}% of your ${category} budget this month`,
            });
        }
        if (pct >= 100) {
            notes.push({
                id: `budget_over_${category}`,
                type: 'danger',
                icon: '🔴',
                message: `${category} budget exceeded! Over by ${formatCurrency(spent - limit)}`,
            });
        }
    });
    debts
        .filter(d => d.status === 'OPEN')
        .forEach(debt => {
        const days = getDaysUntil(debt.dueDate);
        if (days < 0) {
            notes.push({
                id: `debt_overdue_${debt.id}`,
                type: 'danger',
                icon: '💸',
                message: `Overdue: ${debt.personName} debt of ${formatCurrency(debt.amount, debt.currency)}`,
                actionLabel: 'View debts',
            });
        }
        else if (days <= 3) {
            notes.push({
                id: `debt_due_${debt.id}`,
                type: 'warning',
                icon: '📅',
                message: `Debt due in ${days} day(s): ${formatCurrency(debt.amount, debt.currency)} to/from ${debt.personName}`,
            });
        }
    });
    return notes.filter(n => !dismissed.includes(n.id)).slice(0, 3);
};
