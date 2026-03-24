import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const AnimatedBars = ({ items, valueKey, labelKey, color, formatter, minWidthPercent = 8, }) => {
    const max = Math.max(...items.map(item => Number(item[valueKey]) || 0), 1);
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: items.map((item, index) => {
            const value = Number(item[valueKey]) || 0;
            const width = `${Math.max((value / max) * 100, minWidthPercent)}%`;
            return (_jsxs("div", { style: { display: 'grid', gap: 8 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }, children: item[labelKey] }), _jsx("div", { className: "amount", style: { fontSize: 13, color: 'var(--text-2)' }, children: formatter(value) })] }), _jsx("div", { style: {
                            height: 14,
                            borderRadius: 999,
                            background: 'rgba(148,163,184,0.12)',
                            overflow: 'hidden',
                            position: 'relative',
                        }, children: _jsx("div", { style: {
                                width,
                                height: '100%',
                                borderRadius: 999,
                                background: color,
                                boxShadow: '0 10px 24px rgba(37,99,235,0.18)',
                                transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                            } }) })] }, `${item[labelKey]}_${index}`));
        }) }));
};
export default AnimatedBars;
