import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const lineStyle = {
    width: 20,
    height: 2,
    borderRadius: 999,
    background: 'currentColor',
    transition: 'transform 0.35s ease, opacity 0.25s ease, width 0.35s ease',
    transformOrigin: 'center',
};
const MobileMenuButton = ({ open }) => (_jsxs("span", { className: `mobile-menu-button${open ? ' is-open' : ''}`, children: [_jsx("span", { style: { ...lineStyle } }), _jsx("span", { style: { ...lineStyle, width: open ? 20 : 14, marginLeft: open ? 0 : 6 } }), _jsx("span", { style: { ...lineStyle } })] }));
export default MobileMenuButton;
