import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getBudgetColor } from '../../lib/helpers';
import Skeleton from './Skeleton';
const ProgressRing = ({ percent, size = 160, strokeWidth = 10, label, isLoading }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(percent, 0), 150);
    const offset = circumference - (clamped / 100) * circumference;
    const palette = getBudgetColor(percent);
    if (isLoading) {
        return (_jsx("div", { style: { width: size, height: size }, children: _jsx(Skeleton, { width: size, height: size }) }));
    }
    return (_jsxs("div", { style: { position: 'relative', width: size, height: size }, children: [_jsxs("svg", { width: size, height: size, style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { stroke: "#e2e8f0", fill: "transparent", strokeWidth: strokeWidth, r: radius, cx: size / 2, cy: size / 2, strokeDasharray: `${circumference} ${circumference}` }), _jsx("circle", { stroke: palette.bar, fill: "transparent", strokeWidth: strokeWidth, r: radius, cx: size / 2, cy: size / 2, strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset, strokeLinecap: "round", style: { transition: 'stroke-dashoffset 0.4s ease' } })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: palette.text,
                    fontWeight: 800,
                    fontSize: 28,
                    gap: 6,
                }, children: [_jsxs("div", { className: "tabular", children: [Math.round(percent), "%"] }), label && (_jsx("div", { style: { fontSize: 13, color: '#475569', fontWeight: 600, textAlign: 'center' }, children: label }))] })] }));
};
export default ProgressRing;
