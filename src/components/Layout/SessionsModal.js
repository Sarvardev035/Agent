import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
export const SessionsModal = ({ isOpen, onClose }) => {
    const [sessionSummary, setSessionSummary] = useState({
        activeUsers: null,
        activeSessions: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await settingsService.getSessionSummary();
            setSessionSummary(data);
        }
        catch {
            setError('Could not load session data from backend.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            void loadData();
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsx("div", { onClick: e => {
            if (e.target === e.currentTarget)
                onClose();
        }, style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        }, children: _jsxs("div", { style: {
                width: 'min(520px, 100%)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--surface-strong)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--border)',
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }, children: "Active Sessions" }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: onClose, style: {
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text-2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }, children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: {
                                display: 'grid',
                                gap: 16,
                                marginBottom: 24,
                            }, children: [_jsxs("div", { style: {
                                        borderRadius: 12,
                                        border: '1px solid rgba(148,163,184,0.22)',
                                        background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(99,102,241,0.08))',
                                        padding: 20,
                                    }, children: [_jsx("div", { style: { fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }, children: "Users online now" }), _jsx("div", { style: { fontSize: 32, fontWeight: 700, color: 'var(--text-1)' }, children: loading ? '—' : sessionSummary.activeUsers ?? 'N/A' })] }), _jsxs("div", { style: {
                                        borderRadius: 12,
                                        border: '1px solid rgba(148,163,184,0.22)',
                                        background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08))',
                                        padding: 20,
                                    }, children: [_jsx("div", { style: { fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }, children: "Your active sessions" }), _jsx("div", { style: { fontSize: 32, fontWeight: 700, color: 'var(--text-1)' }, children: loading ? '—' : sessionSummary.activeSessions ?? 'N/A' }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-3)', marginTop: 8 }, children: "You can manage these sessions from any device" })] }), error && (_jsx("div", { style: {
                                        borderRadius: 8,
                                        background: 'rgba(252, 165, 165, 0.08)',
                                        border: '1px solid rgba(252, 93, 93, 0.3)',
                                        padding: 12,
                                        fontSize: 13,
                                        color: '#fca5a5',
                                    }, children: error }))] }), _jsxs("button", { type: "button", "data-button-reset": "true", onClick: () => void loadData(), disabled: loading, style: {
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 10,
                                border: '1px solid rgba(148,163,184,0.3)',
                                background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))',
                                color: '#dbeafe',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }, children: [_jsx(RefreshCw, { size: 16, style: { opacity: loading ? 0.5 : 1 } }), loading ? 'Refreshing...' : 'Refresh sessions'] }), _jsx("div", { style: {
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 8,
                                background: 'rgba(226,232,240,0.05)',
                                fontSize: 12,
                                color: 'var(--text-3)',
                                lineHeight: 1.5,
                            }, children: "Session data is fetched from your backend. If the numbers show \"N/A\", the backend session endpoints may not be configured yet." })] })] }) }));
};
