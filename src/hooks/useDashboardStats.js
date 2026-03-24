import { useEffect, useState } from 'react';
import api, { unwrap } from '../api/axios';
import { safeArray } from '../lib/helpers';
export const useDashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const [accounts, expenses, income, summary, debts, budgets] = await Promise.allSettled([
                    api.get('/api/accounts'),
                    api.get('/api/expenses'),
                    api.get('/api/incomes'),
                    api.get('/api/analytics/summary'),
                    api.get('/api/debts'),
                    api.get('/api/budgets', {
                        params: {
                            year: now.getFullYear(),
                            month: now.getMonth() + 1,
                        },
                    }),
                ]);
                const accountsData = accounts.status === 'fulfilled' ? safeArray(unwrap(accounts.value)) : [];
                const expensesData = expenses.status === 'fulfilled'
                    ? safeArray(unwrap(expenses.value)).map(e => ({
                        ...e,
                        date: e.expenseDate || e.date,
                    }))
                    : [];
                const incomeData = income.status === 'fulfilled'
                    ? safeArray(unwrap(income.value)).map(i => ({
                        ...i,
                        date: i.incomeDate || i.date,
                    }))
                    : [];
                const thisMonth = (items) => items.filter(i => {
                    const d = new Date(i.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                const summaryData = summary.status === 'fulfilled'
                    ? unwrap(summary.value) || {}
                    : {};
                const debtsData = debts.status === 'fulfilled'
                    ? safeArray(unwrap(debts.value))
                    : [];
                const budgetData = budgets.status === 'fulfilled'
                    ? safeArray(unwrap(budgets.value))
                    : [];
                const computedTotalBalance = accountsData.reduce((s, a) => s + (a.balance || 0), 0);
                const computedMonthlyIncome = thisMonth(incomeData).reduce((s, i) => s + (i.amount || 0), 0);
                const computedMonthlyExpenses = thisMonth(expensesData).reduce((s, e) => s + (e.amount || 0), 0);
                const overallBudget = budgetData.find((item) => item.type === 'OVERALL');
                const openDebts = debtsData.filter((item) => (item.status || 'OPEN') !== 'CLOSED');
                const totalBalance = Number(summaryData.totalBalance ?? computedTotalBalance);
                const monthlyIncome = Number(summaryData.totalIncome ?? summaryData.monthlyIncome ?? computedMonthlyIncome);
                const monthlyExpenses = Number(summaryData.totalExpense ?? summaryData.monthlyExpense ?? summaryData.monthlyExpenses ?? computedMonthlyExpenses);
                const budgetUsedPct = Number(overallBudget?.percentageUsed
                    ?? (overallBudget?.monthlyLimit
                        ? ((overallBudget?.spentAmount ?? overallBudget?.spent ?? 0) / overallBudget.monthlyLimit) * 100
                        : 0));
                setStats({
                    totalBalance,
                    monthlyIncome,
                    monthlyExpenses,
                    netSavings: monthlyIncome - monthlyExpenses,
                    budgetUsedPct,
                    openDebts,
                    accounts: accountsData,
                    expenses: expensesData,
                    income: incomeData,
                    recentTransactions: [
                        ...expensesData.map((e) => ({ ...e, type: 'expense' })),
                        ...incomeData.map((i) => ({ ...i, type: 'income' })),
                    ]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10),
                });
            }
            catch (err) {
                setError(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);
    return { stats, loading, error };
};
