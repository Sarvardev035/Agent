import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function GlassCard({ children, className = '', hover = true, delay = 0 }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay }, whileHover: hover ? { y: -4, transition: { duration: 0.2 } } : {}, className: `
        relative rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-white/5
        border border-white/20 dark:border-white/10
        shadow-lg hover:shadow-2xl transition-shadow duration-300
        ${className}
      `, children: [_jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/0 pointer-events-none" }), _jsx("div", { className: "relative", children: children })] }));
}
export function StatCard({ icon: Icon, label, value, change, isPositive = true, delay = 0, }) {
    return (_jsx(GlassCard, { delay: delay, className: "p-6", children: _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: delay + 0.2 }, className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-400 mb-2", children: label }), _jsx("h3", { className: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3", children: value }), change && (_jsxs(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: delay + 0.4 }, className: `text-sm font-semibold ${isPositive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'}`, children: [isPositive ? '↑' : '↓', " ", change] }))] }), _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: 'linear' }, className: "w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 flex items-center justify-center text-white text-xl", children: Icon })] }) }));
}
export function AnimatedListItem({ icon, title, subtitle, value, delay = 0, onClick, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay }, whileHover: { x: 4 }, onClick: onClick, className: `
        flex items-center gap-4 p-4 rounded-xl
        bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10
        border border-white/20 dark:border-white/10
        transition-all duration-200 cursor-pointer
      `, children: [icon && (_jsx("div", { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 flex items-center justify-center text-white text-lg flex-shrink-0", children: icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white truncate", children: title }), subtitle && (_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400 truncate", children: subtitle }))] }), value && (_jsx("p", { className: "font-bold text-slate-900 dark:text-white text-lg flex-shrink-0", children: value }))] }));
}
