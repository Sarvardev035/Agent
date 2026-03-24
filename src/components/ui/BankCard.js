import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowUpRight, Bitcoin } from 'lucide-react';
import { formatCurrency } from '../../lib/helpers';
import { useMediaQuery } from '../../hooks/useMediaQuery';
const BankCard = ({ name, balance, currency, type }) => {
    const [flipped, setFlipped] = useState(false);
    const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
    return (_jsx("div", { onMouseEnter: canHover ? () => setFlipped(true) : undefined, onMouseLeave: canHover ? () => setFlipped(false) : undefined, style: {
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(180px, 18vw, 220px)',
            flexShrink: 0,
            perspective: '1000px',
            minWidth: 0,
        }, children: _jsxs("div", { style: {
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transform: canHover && flipped
                    ? 'rotateY(180deg)'
                    : 'rotateY(0deg)',
                transition: canHover ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }, children: [_jsxs("div", { className: "plastic-account-card", style: {
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 22,
                        padding: '18px 18px 16px',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                    }, children: [_jsx("div", { style: {
                                position: 'absolute', top: -28, right: -20,
                                width: 120, height: 120, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                pointerEvents: 'none',
                            } }), _jsx("div", { style: {
                                position: 'absolute', left: -18, bottom: 38,
                                width: 100, height: 100, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                pointerEvents: 'none',
                            } }), _jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }, children: [_jsxs("span", { className: "plastic-account-card__brand", children: [_jsx(Bitcoin, { size: 16 }), "Finly"] }), _jsx("span", { className: "plastic-account-card__type", children: type === 'CASH' ? 'Cash reserve' : 'Plastic account' })] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }, children: [_jsx("div", { style: { fontSize: 13, letterSpacing: '0.15em', opacity: 0.78 }, children: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022" }), _jsx(ArrowUpRight, { size: 18, style: { opacity: 0.7 } })] }), _jsxs("div", { className: "plastic-account-card__footer", children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { className: "plastic-account-card__footer-label", children: "Account" }), _jsx("div", { className: "plastic-account-card__footer-name", children: name })] }), _jsxs("div", { style: { textAlign: 'right', flexShrink: 0 }, children: [_jsx("div", { className: "plastic-account-card__footer-label", children: "Balance" }), _jsx("div", { className: "balance-large", style: { fontSize: 18 }, children: formatCurrency(balance, currency) })] })] })] }), _jsxs("div", { className: "plastic-account-card plastic-account-card--back", style: {
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 22,
                        padding: '20px',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                    }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.6 }, children: "Finly plastic" }), _jsx("div", { style: {
                                fontSize: 16, fontWeight: 700, textAlign: 'center',
                            }, children: name }), _jsx("div", { style: {
                                marginTop: 8, fontSize: 13, opacity: 0.6,
                            }, children: type === 'CASH' ? 'Cash Wallet' : 'Bank Card' }), _jsx("div", { className: "balance", style: {
                                fontSize: 15, fontWeight: 700, color: '#a78bfa',
                            }, children: formatCurrency(balance, currency) })] })] }) }));
};
export default BankCard;
