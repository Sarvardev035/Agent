import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { style: {
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f1f5f9',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    padding: 24,
                }, children: [_jsx("div", { style: { fontSize: 48, marginBottom: 16 }, children: "\u26A0\uFE0F" }), _jsx("h2", { style: {
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: 8,
                        }, children: "Something went wrong" }), _jsx("p", { style: {
                            color: '#64748b',
                            fontSize: 14,
                            marginBottom: 24,
                            textAlign: 'center',
                            maxWidth: 360,
                        }, children: this.state.error?.message ?? 'Unknown error' }), _jsx("button", { onClick: () => window.location.reload(), style: {
                            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px 24px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }, children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
