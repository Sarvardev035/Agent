import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getBudgetColor } from '../../lib/helpers';
const ProgressBar = ({ percent, color, height = 10, label, showPercent = true, animate = true, isLoading, }) => {
    const palette = getBudgetColor(percent);
    const barColor = color ?? palette.bar;
    if (isLoading) {
        return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }, children: [label && _jsx("span", { children: label }), showPercent && _jsx("span", { children: "\u2014" })] }), _jsx("div", { style: { width: '100%', height, borderRadius: 999, background: 'var(--border)' } })] }));
    }
    return (_jsxs("div", { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }, children: [(label || showPercent) && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }, children: [label && _jsx("span", { children: label }), showPercent && (_jsxs("span", { style: { fontWeight: 700, color: palette.text }, children: [Math.round(percent), "%"] }))] })), _jsxs("div", { style: {
                    width: '100%',
                    height,
                    borderRadius: 999,
                    background: 'var(--border)',
                    overflow: 'hidden',
                    position: 'relative',
                }, children: [_jsx("div", { className: animate ? 'progress-animate' : undefined, style: {
                            height: '100%',
                            width: `${Math.min(percent, 120)}%`,
                            background: barColor,
                            borderRadius: 999,
                            transition: 'width 0.3s ease',
                        } }), percent > 100 && (_jsx("div", { style: {
                            position: 'absolute',
                            right: 6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--red)',
                            boxShadow: '0 0 0 6px rgba(244,63,94,0.18)',
                        } }))] })] }));
};
export default ProgressBar;
