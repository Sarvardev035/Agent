import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (_jsxs("div", { style: {
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 20px',
        textAlign: 'center',
        background: 'var(--surface-strong)',
        color: 'var(--text-1)',
        boxShadow: 'var(--shadow-glass)',
        backdropFilter: 'blur(18px) saturate(145%)',
        WebkitBackdropFilter: 'blur(18px) saturate(145%)',
        overflow: 'hidden',
    }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 12 }, children: icon ?? '₿' }), _jsx("h3", { style: { margin: '0 0 8px', fontSize: 18, fontWeight: 800 }, children: title }), description && (_jsx("p", { style: { margin: '0 0 14px', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5 }, children: description })), actionLabel && onAction && (_jsx("button", { onClick: onAction, style: {
                padding: '12px 16px',
                borderRadius: 14,
                border: 'none',
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 16px 36px rgba(95,123,255,0.24)',
            }, type: "button", children: actionLabel }))] }));
export default EmptyState;
