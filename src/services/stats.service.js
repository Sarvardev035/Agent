import { analyticsService } from './analytics.service';
export const statsService = {
    summary: analyticsService.summary,
    expenses: analyticsService.expensesByCategory,
    incomeVsExpense: analyticsService.incomeVsExpense,
    timeseries: analyticsService.timeseries,
};
