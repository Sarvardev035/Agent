"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from "@/components/ui/calendar-rac";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
// Mock data generator for statistics
const generateMockStats = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    return {
        date: dateString,
        income: Math.round(1000 + (day * 50 + month * 100) % 5000),
        expenses: Math.round(500 + (day * 30 + month * 80) % 3000),
        transactions: Math.floor(5 + (day % 20)),
        categories: [
            {
                name: "Food & Dining",
                amount: Math.round(100 + (day * 10) % 500),
                trend: day % 2 === 0 ? "up" : "down",
            },
            {
                name: "Transportation",
                amount: Math.round(50 + (day * 5) % 300),
                trend: day % 3 === 0 ? "up" : "down",
            },
            {
                name: "Entertainment",
                amount: Math.round(75 + (day * 8) % 400),
                trend: day % 2 === 0 ? "down" : "up",
            },
            {
                name: "Shopping",
                amount: Math.round(150 + (day * 15) % 600),
                trend: day % 4 === 0 ? "down" : "up",
            },
        ],
    };
};
function CalendarWithStatistics() {
    const [date, setDate] = useState(today(getLocalTimeZone()));
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleDateChange = (newDate) => {
        setDate(newDate);
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            const dateString = `${newDate.year}-${String(newDate.month).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
            const newStats = generateMockStats(dateString);
            setStats(newStats);
            setLoading(false);
        }, 500);
    };
    const balance = stats ? stats.income - stats.expenses : 0;
    const isPositive = balance >= 0;
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8", children: _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx("h1", { className: "mb-2 text-4xl font-bold text-slate-900", children: "Financial Dashboard" }), _jsx("p", { className: "mb-8 text-lg text-slate-600", children: "Select a date to view detailed statistics" }), _jsxs("div", { className: "grid gap-8 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-slate-900", children: "Select Date" }), _jsx("div", { className: "flex justify-center", children: _jsx(Calendar, { className: "rounded-lg border border-slate-200 p-3", value: date, onChange: handleDateChange }) }), _jsxs("div", { className: "mt-4 rounded-lg bg-slate-50 p-3 text-center", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Selected Date" }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: date
                                                    ? `${date.month}/${date.day}/${date.year}`
                                                    : "No date selected" })] })] }) }), _jsx("div", { className: "lg:col-span-2", children: loading ? (_jsx("div", { className: "flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-4 inline-block", children: _jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" }) }), _jsx("p", { className: "text-slate-600", children: "Loading statistics..." })] }) })) : stats ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-600", children: "Income" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: ["$", stats.income.toLocaleString()] })] }), _jsx("div", { className: "rounded-lg bg-green-100 p-3", children: _jsx(TrendingUp, { className: "h-6 w-6 text-green-600" }) })] }) }), _jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-600", children: "Expenses" }), _jsxs("p", { className: "text-2xl font-bold text-red-600", children: ["$", stats.expenses.toLocaleString()] })] }), _jsx("div", { className: "rounded-lg bg-red-100 p-3", children: _jsx(TrendingDown, { className: "h-6 w-6 text-red-600" }) })] }) }), _jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-600", children: "Balance" }), _jsxs("p", { className: `text-2xl font-bold ${isPositive ? "text-blue-600" : "text-orange-600"}`, children: [isPositive ? "+" : "", " ", "$", Math.abs(balance).toLocaleString()] })] }), _jsx("div", { className: `rounded-lg ${isPositive ? "bg-blue-100" : "bg-orange-100"} p-3`, children: _jsx(DollarSign, { className: `h-6 w-6 ${isPositive ? "text-blue-600" : "text-orange-600"}` }) })] }) })] }), _jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-600", children: "Total Transactions" }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: stats.transactions })] }), _jsx("div", { className: "rounded-lg bg-purple-100 p-3", children: _jsx(Activity, { className: "h-6 w-6 text-purple-600" }) })] }) }), _jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "mb-4 font-semibold text-slate-900", children: "Spending by Category" }), _jsx("div", { className: "space-y-3", children: stats.categories.map((category, idx) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg bg-slate-50 p-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-blue-500" }), _jsx("span", { className: "font-medium text-slate-700", children: category.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold text-slate-900", children: ["$", category.amount.toLocaleString()] }), category.trend === "up" ? (_jsx(TrendingUp, { className: "h-4 w-4 text-red-600" })) : (_jsx(TrendingDown, { className: "h-4 w-4 text-green-600" }))] })] }, idx))) })] })] })) : (_jsx("div", { className: "flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12", children: _jsx("p", { className: "text-slate-500", children: "Select a date to view statistics" }) })) })] })] }) }));
}
export { CalendarWithStatistics };
