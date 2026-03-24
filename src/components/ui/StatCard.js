import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import CountUp from 'react-countup';
import Skeleton from './Skeleton';
const StatCard = ({ label, value, change, changeType = 'flat', prefix = '', suffix = '', color = 'var(--blue)', isLoading, icon, }) => {
    const changeColor = changeType === 'up' ? 'var(--green)' : changeType === 'down' ? 'var(--red)' : 'var(--text-3)';
    const changeSymbol = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→';
    return (_jsxs("div", { className: "ui-stat-card", style: {
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: 'var(--radius-lg)',
                    pointerEvents: 'none',
                } }), _jsxs("div", { style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [icon && (_jsx("div", { style: {
                                    width: 38,
                                    height: 38,
                                    borderRadius: 12,
                                    background: 'rgba(59,130,246,0.08)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color,
                                }, children: icon })), _jsx("div", { style: {
                                    fontSize: 11,
                                    letterSpacing: '0.09em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-3)',
                                    fontWeight: 800,
                                }, children: label })] }), isLoading ? (_jsx(Skeleton, { height: 16, count: 3 })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, children: [_jsx("div", { className: "stat-number", style: {
                                    fontSize: 30,
                                    fontWeight: 800,
                                    letterSpacing: '-0.02em',
                                    color: 'var(--text-1)',
                                    lineHeight: 1,
                                }, children: typeof value === 'number' ? (_jsx(CountUp, { end: value, duration: 1.2, separator: ",", prefix: prefix, suffix: suffix })) : (_jsxs(_Fragment, { children: [prefix, value, suffix] })) }), typeof change === 'number' && (_jsxs("span", { style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: changeColor,
                                    background: 'var(--surface)',
                                    borderRadius: 999,
                                    padding: '6px 10px',
                                    boxShadow: 'var(--shadow-sm)',
                                }, children: [changeSymbol, " ", Math.abs(change), "%"] }))] }))] })] }));
};
export default StatCard;
