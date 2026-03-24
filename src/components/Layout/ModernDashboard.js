import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { GlassCard, StatCard, AnimatedListItem } from '@/components/ui/ModernCards';
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};
export function ModernDashboard() {
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950", children: [_jsxs("div", { className: "fixed inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { animate: {
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                        }, transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' }, className: "absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl" }), _jsx(motion.div, { animate: {
                            x: [0, -100, 0],
                            y: [0, -50, 0],
                        }, transition: { duration: 25, repeat: Infinity, ease: 'easeInOut' }, className: "absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl" })] }), _jsxs("div", { className: "relative z-10", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "px-4 sm:px-6 lg:px-8 pt-8 pb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Dashboard" }), _jsx(motion.div, { whileHover: { scale: 1.05 }, className: "text-sm font-medium px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", children: "\u2713 Active" })] }), _jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Welcome back! Here's your financial overview." })] }), _jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { icon: "\uD83D\uDCB0", label: "Total Balance", value: "$24,580", change: "+12.5%", isPositive: true, delay: 0 }), _jsx(StatCard, { icon: "\uD83D\uDCC8", label: "Monthly Income", value: "$8,400", change: "+5.2%", isPositive: true, delay: 0.1 }), _jsx(StatCard, { icon: "\uD83D\uDCB8", label: "Monthly Expense", value: "$4,200", change: "-3.1%", isPositive: false, delay: 0.2 }), _jsx(StatCard, { icon: "\uD83C\uDFAF", label: "Savings Goal", value: "68%", change: "+8.3%", isPositive: true, delay: 0.3 })] }), _jsxs("div", { className: "px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.4 }, className: "lg:col-span-2", children: _jsxs(GlassCard, { className: "p-6", children: [_jsx(motion.h2, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "text-xl font-bold text-slate-900 dark:text-white mb-6", children: "Recent Transactions" }), _jsx(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-3", children: [
                                                {
                                                    icon: '🍔',
                                                    title: 'Restaurant',
                                                    subtitle: 'Lunch at Downtown Cafe',
                                                    value: '-$45.00',
                                                    delay: 0.5,
                                                },
                                                {
                                                    icon: '🚕',
                                                    title: 'Transportation',
                                                    subtitle: 'Uber to Downtown',
                                                    value: '-$12.50',
                                                    delay: 0.6,
                                                },
                                                {
                                                    icon: '💳',
                                                    title: 'Salary',
                                                    subtitle: 'Monthly paycheck',
                                                    value: '+$4,200.00',
                                                    delay: 0.7,
                                                },
                                                {
                                                    icon: '🏠',
                                                    title: 'Rent Payment',
                                                    subtitle: 'Monthly rent',
                                                    value: '-$1,500.00',
                                                    delay: 0.8,
                                                },
                                            ].map((tx, i) => (_jsx(AnimatedListItem, { icon: tx.icon, title: tx.title, subtitle: tx.subtitle, value: tx.value, delay: tx.delay }, i))) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.4 }, children: _jsxs(GlassCard, { className: "p-6 h-full", children: [_jsx(motion.h2, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "text-xl font-bold text-slate-900 dark:text-white mb-6", children: "Quick Actions" }), _jsx(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-3", children: [
                                                { icon: '📤', label: 'Send Money', delay: 0.5 },
                                                { icon: '📥', label: 'Request Money', delay: 0.6 },
                                                { icon: '💰', label: 'Add Income', delay: 0.7 },
                                                { icon: '📊', label: 'View Reports', delay: 0.8 },
                                            ].map((action, i) => (_jsxs(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: action.delay }, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: `
                      w-full px-4 py-3 rounded-lg
                      bg-gradient-to-r from-blue-500/20 to-purple-500/20
                      dark:from-blue-600/20 dark:to-purple-600/20
                      border border-blue-300/30 dark:border-blue-500/30
                      text-slate-900 dark:text-white font-medium
                      hover:from-blue-500/30 hover:to-purple-500/30
                      dark:hover:from-blue-600/30 dark:hover:to-purple-600/30
                      transition-all duration-200
                      flex items-center justify-between
                    `, children: [_jsx("span", { className: "text-lg", children: action.icon }), _jsx("span", { children: action.label }), _jsx(motion.span, { animate: { x: [0, 4, 0] }, transition: { duration: 2, repeat: Infinity }, children: "\u2192" })] }, i))) })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.6 }, className: "px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8", children: [_jsxs(GlassCard, { className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white mb-6", children: "Spending by Category" }), _jsx("div", { className: "space-y-4", children: [
                                            { label: 'Food & Dining', amount: '$1,240', percentage: 45, color: 'from-orange-500 to-red-500' },
                                            { label: 'Transportation', amount: '$680', percentage: 25, color: 'from-blue-500 to-cyan-500' },
                                            { label: 'Entertainment', amount: '$450', percentage: 16, color: 'from-purple-500 to-pink-500' },
                                            { label: 'Utilities', amount: '$320', percentage: 14, color: 'from-green-500 to-emerald-500' },
                                        ].map((item, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.7 + i * 0.1 }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-700 dark:text-slate-300", children: item.label }), _jsx("span", { className: "text-sm font-bold text-slate-900 dark:text-white", children: item.amount })] }), _jsx(motion.div, { initial: { width: 0 }, animate: { width: '100%' }, transition: { duration: 1, delay: 0.7 + i * 0.1 }, className: "h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${item.percentage}%` }, transition: { duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }, className: `h-full bg-gradient-to-r ${item.color} rounded-full` }) })] }, i))) })] }), _jsxs(GlassCard, { className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white mb-6", children: "Financial Goals" }), _jsx("div", { className: "space-y-4", children: [
                                            { goal: 'Emergency Fund', current: 8500, target: 10000, icon: '🏦' },
                                            { goal: 'Vacation', current: 3200, target: 5000, icon: '✈️' },
                                            { goal: 'Car Fund', current: 6800, target: 15000, icon: '🚗' },
                                        ].map((item, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.7 + i * 0.1 }, children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: "text-2xl", children: item.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-slate-300", children: item.goal }), _jsxs("p", { className: "text-xs text-slate-600 dark:text-slate-400", children: ["$", item.current.toLocaleString(), " / $", item.target.toLocaleString()] })] })] }), _jsx(motion.div, { initial: { width: 0 }, animate: { width: '100%' }, transition: { duration: 1, delay: 0.7 + i * 0.1 }, className: "h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${(item.current / item.target) * 100}%` }, transition: { duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }, className: "h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" }) })] }, i))) })] })] })] })] }));
}
