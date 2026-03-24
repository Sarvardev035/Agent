import { categoriesService } from '../services/categories.service';
import { safeArray } from './helpers';
const DEFAULT_EXPENSE = ['Food', 'Transport', 'Health', 'Entertainment', 'Utilities', 'Other'];
const DEFAULT_INCOME = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment'];
const seedType = async (type, existingNames) => {
    const defaults = type === 'EXPENSE' ? DEFAULT_EXPENSE : DEFAULT_INCOME;
    const missing = defaults.filter(name => !existingNames.has(name));
    if (!missing.length)
        return;
    await Promise.all(missing.map(name => categoriesService.create({
        name,
        type,
    })));
};
export const seedDefaultCategories = async () => {
    try {
        const res = await categoriesService.getAll();
        const categories = safeArray(res.data);
        const expenseNames = new Set(categories.filter(c => c.type === 'EXPENSE').map(c => c.name));
        const incomeNames = new Set(categories.filter(c => c.type === 'INCOME').map(c => c.name));
        await Promise.all([seedType('EXPENSE', expenseNames), seedType('INCOME', incomeNames)]);
    }
    catch (err) {
        console.error('Failed to seed default categories', err);
    }
};
