import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        try {
            const saved = localStorage.getItem('finly_activity_log');
            setLogs(saved ? JSON.parse(saved) : []);
        }
        catch {
            setLogs([]);
        }
    }, [open]);
    const clearLogs = () => {
        localStorage.removeItem('finly_activity_log');
        setLogs([]);
    };
    const formatTime = (iso) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).format(new Date(iso));
        }
        catch {
            return iso;
        }
    };
    if (!open) {
        return (_jsxs("button", { onClick: () => setOpen(true), style: {
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8, cursor: 'pointer',
                fontSize: 12, color: 'var(--text-2)',
                fontWeight: 500,
                transition: 'all 0.15s',
            }, onMouseEnter: e => {
                e.currentTarget.style.background = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-1)';
            }, onMouseLeave: e => {
                e.currentTarget.style.background = 'var(--surface-2)';
                e.currentTarget.style.color = 'var(--text-2)';
            }, children: ["\uD83D\uDD50 Activity", logs.length > 0 && (_jsx("span", { style: {
                        background: '#7c3aed', color: 'white',
                        borderRadius: '50%', width: 16, height: 16,
                        fontSize: 9, fontWeight: 700,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                    }, children: logs.length }))] }));
    }
    return (_jsx("div", { onClick: e => e.target === e.currentTarget && setOpen(false), style: {
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        }, children: _jsxs("div", { style: {
                background: 'var(--card-bg)',
                borderRadius: 20,
                padding: 24,
                maxWidth: 480,
                width: '100%',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUpBounce 0.3s ease-out',
            }, children: [_jsxs("div", { style: {
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 16,
                    }, children: [_jsx("h3", { style: {
                                fontSize: 18, fontWeight: 700,
                                color: 'var(--text-1)', margin: 0,
                            }, children: "\uD83D\uDD50 Activity History" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [logs.length > 0 && (_jsx("button", { onClick: clearLogs, style: {
                                        background: 'none',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8, padding: '4px 10px',
                                        cursor: 'pointer', fontSize: 12,
                                        color: 'var(--text-3)',
                                    }, children: "Clear" })), _jsx("button", { onClick: () => setOpen(false), style: {
                                        background: 'var(--surface-2)',
                                        border: 'none', borderRadius: 8,
                                        width: 28, height: 28,
                                        cursor: 'pointer', fontSize: 14,
                                        color: 'var(--text-2)',
                                    }, children: "\u2715" })] })] }), _jsx("div", { style: { overflowY: 'auto', flex: 1 }, children: logs.length === 0 ? (_jsxs("div", { style: {
                            textAlign: 'center', padding: '32px 16px',
                            color: 'var(--text-3)',
                        }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\uD83D\uDCCB" }), _jsx("p", { style: { margin: 0 }, children: "No activity yet" })] })) : (logs.map((log, i) => (_jsxs("div", { style: {
                            display: 'flex', alignItems: 'flex-start',
                            gap: 12, padding: '12px 0',
                            borderBottom: i < logs.length - 1
                                ? '1px solid var(--border)' : 'none',
                        }, children: [_jsx("div", { style: {
                                    width: 36, height: 36, borderRadius: 10,
                                    background: log.action === 'ACCOUNT_DELETED'
                                        ? 'rgba(239,68,68,0.1)'
                                        : 'rgba(124,58,237,0.1)',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 16,
                                    flexShrink: 0,
                                }, children: log.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                            fontSize: 13, fontWeight: 600,
                                            color: 'var(--text-1)',
                                        }, children: log.message }), _jsx("div", { style: {
                                            fontSize: 11, color: 'var(--text-3)',
                                            marginTop: 2,
                                        }, children: formatTime(log.time) })] })] }, log.id)))) })] }) }));
};
