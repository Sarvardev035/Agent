import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { getCategoryMeta } from '../../lib/helpers';
const CategoryBadge = ({ category, children }) => {
    const meta = getCategoryMeta(category);
    return (_jsxs("span", { className: clsx('tabular'), style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: meta.bg,
            color: meta.color,
        }, children: [meta.emoji && _jsx("span", { children: meta.emoji }), _jsx("span", { children: children ?? meta.label })] }));
};
export default CategoryBadge;
