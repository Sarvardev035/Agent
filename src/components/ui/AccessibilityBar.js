import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { onAccessibilityChange, screenReader } from '../../lib/screenReader';
const PAGE_DESCRIPTIONS = {
    '/dashboard': 'Dashboard page. Your financial overview.',
    '/expenses': 'Expenses page. View and add your spending.',
    '/income': 'Income page. Track money you receive.',
    '/transfers': 'Transfers page. Move money between accounts.',
    '/debts': 'Debts page. Track loans and receivables.',
    '/budget': 'Budget page. Set and monitor spending limits.',
    '/statistics': 'Statistics page. Charts and financial trends.',
    '/calendar': 'Calendar page. See transactions by date.',
    '/accounts': 'Accounts page. Manage your cards and wallets.',
    '/categories': 'Categories page. Manage spending categories.',
    '/community': 'Community page. Read and leave comments.',
    '/notes': 'Notes page. Your personal financial notes.',
};
export const AccessibilityBar = () => {
    const location = useLocation();
    const [active, setActive] = useState(screenReader.isActive());
    useEffect(() => {
        const sync = () => setActive(screenReader.isActive());
        const off = onAccessibilityChange(setActive);
        sync();
        window.addEventListener('storage', sync);
        return () => {
            off();
            window.removeEventListener('storage', sync);
        };
    }, []);
    useEffect(() => {
        if (active && PAGE_DESCRIPTIONS[location.pathname]) {
            screenReader.speak(PAGE_DESCRIPTIONS[location.pathname]);
        }
    }, [location.pathname, active]);
    if (!active)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#1e293b',
            borderBottom: '2px solid #7c3aed',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 999,
            fontSize: 13,
            color: 'white',
            flexWrap: 'wrap',
            gap: 8,
        }, children: [_jsx("span", { style: { whiteSpace: 'nowrap', fontSize: 12 }, children: "\u267F Accessibility mode ON \u2014 Screen reader active" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => screenReader.stop(), style: {
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 12,
                        }, children: "\u23F8 Pause" }), _jsx("button", { onClick: () => screenReader.speak(PAGE_DESCRIPTIONS[location.pathname] || 'Current page'), style: {
                            background: 'rgba(124,58,237,0.3)',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 12,
                        }, children: "\uD83D\uDD01 Re-read" }), _jsx("button", { onClick: () => {
                            screenReader.disable();
                            setActive(false);
                        }, style: {
                            background: 'rgba(239,68,68,0.3)',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 12,
                        }, children: "\u2715 Turn off" })] })] }));
};
