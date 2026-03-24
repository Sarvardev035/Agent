import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Bitcoin } from 'lucide-react';
const BrandLogo = ({ compact = false }) => (_jsxs(Link, { to: "/dashboard", className: "brand-logo", "aria-label": "Go to dashboard", "data-button-reset": "true", style: { gap: compact ? 0 : 10, justifyContent: compact ? 'center' : 'flex-start' }, children: [_jsx("span", { className: "brand-logo__coin", children: _jsx("span", { className: "brand-logo__coin-core", children: _jsx(Bitcoin, { size: compact ? 16 : 18, strokeWidth: 2.3 }) }) }), !compact && _jsx("span", { className: "brand-logo__wordmark", children: "Finly" })] }));
export default BrandLogo;
