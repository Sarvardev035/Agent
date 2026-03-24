import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { LoginSchema, loginRateLimiter, TokenStorage, UserProfileStorage, } from '../../lib/security';
import { sounds } from '../../lib/sounds';
import AuthLinkGrid from '../../components/ui/AuthLinkGrid';
import { visitTracker } from '../../lib/visitTracker';
export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        if (!loginRateLimiter.canProceed()) {
            const ms = loginRateLimiter.getRemainingMs();
            const mins = Math.ceil(ms / 60000);
            sounds.error();
            setError(`Too many attempts. Try again in ${mins} minute(s).`);
            return;
        }
        const result = LoginSchema.safeParse({ email, password });
        if (!result.success) {
            sounds.error();
            setError(result.error.issues[0].message);
            return;
        }
        try {
            setIsLoading(true);
            const { data } = await api.post('/api/auth/login', {
                email: result.data.email,
                password: result.data.password,
            });
            const tokenData = data?.data ?? data;
            const accessToken = tokenData?.accessToken ?? tokenData?.data?.accessToken;
            const refreshToken = tokenData?.refreshToken ?? tokenData?.data?.refreshToken;
            const user = tokenData?.user ?? tokenData?.data?.user;
            if (!accessToken)
                throw new Error('No token received');
            TokenStorage.setTokens(accessToken, refreshToken || null);
            UserProfileStorage.set({
                name: user?.name || user?.fullName || result.data.email.split('@')[0],
                email: user?.email || result.data.email,
            });
            visitTracker.markHasAccount();
            sounds.success();
            toast.success('Welcome back!');
            navigate('/dashboard', { replace: true });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            if (msg.includes('401') || msg.includes('credentials')) {
                sounds.error();
                setError('Incorrect email or password.');
            }
            else {
                sounds.error();
                setError('Unable to sign in right now. Please try again.');
            }
        }
        finally {
            setIsLoading(false);
        }
    }, [email, password, navigate]);
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 40%, #1a1a2e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }, children: [_jsx(motion.div, { animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }, transition: { duration: 8, repeat: Infinity }, style: {
                    position: 'absolute', top: -100, right: -100,
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), _jsx(motion.div, { animate: { scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }, transition: { duration: 10, repeat: Infinity }, style: {
                    position: 'absolute', bottom: -150, left: -100,
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), _jsxs(motion.div, { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.35, ease: 'easeOut' }, style: {
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: 24,
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: 420,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                    position: 'relative',
                }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 32 }, children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: 0.1, type: 'spring', stiffness: 300 }, style: {
                                    width: 56, height: 56, borderRadius: 16,
                                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16,
                                    boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                                }, children: _jsx(Zap, { size: 26, color: "white", fill: "white" }) }), _jsx("h1", { style: {
                                    fontSize: 26, fontWeight: 700, color: '#0a1628',
                                    margin: '0 0 6px', letterSpacing: '-0.02em',
                                }, children: "Welcome back" }), _jsx("p", { style: { fontSize: 14, color: '#64748b', margin: 0 }, children: "Sign in to your Finly account" })] }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, autoComplete: "on", children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600,
                                            color: '#374151', marginBottom: 6 }, children: "Email address" }), _jsx("input", { type: "email", autoComplete: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "you@example.com", required: true, maxLength: 255, style: {
                                            width: '100%', height: 46,
                                            padding: '0 14px',
                                            border: '1.5px solid #e2e8f0', borderRadius: 10,
                                            fontSize: 14, color: '#0f172a',
                                            background: '#f8fafc', outline: 'none',
                                            transition: 'all 0.2s',
                                        }, onFocus: e => {
                                            e.currentTarget.style.borderColor = '#2563eb';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                                            e.currentTarget.style.background = '#fff';
                                        }, onBlur: e => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.background = '#f8fafc';
                                        } })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { display: 'block', fontSize: 13, fontWeight: 600,
                                            color: '#374151', marginBottom: 6 }, children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: showPass ? 'text' : 'password', autoComplete: "current-password", value: password, onChange: e => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, maxLength: 128, style: {
                                                    width: '100%', height: 46,
                                                    padding: '0 44px 0 14px',
                                                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                                                    fontSize: 14, color: '#0f172a',
                                                    background: '#f8fafc', outline: 'none',
                                                    transition: 'all 0.2s',
                                                }, onFocus: e => {
                                                    e.currentTarget.style.borderColor = '#2563eb';
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                                                    e.currentTarget.style.background = '#fff';
                                                }, onBlur: e => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.background = '#f8fafc';
                                                } }), _jsx("button", { type: "button", onClick: () => setShowPass(p => !p), style: {
                                                    position: 'absolute', right: 12, top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none',
                                                    cursor: 'pointer', color: '#94a3b8', padding: 4,
                                                    display: 'flex', alignItems: 'center',
                                                }, children: showPass ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), error && (_jsxs(motion.div, { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, style: {
                                    background: '#fff1f2', border: '1px solid #fecdd3',
                                    borderRadius: 10, padding: '10px 14px',
                                    fontSize: 13, color: '#be123c',
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                    marginBottom: 16,
                                }, children: [_jsx(AlertTriangle, { size: 15, style: { marginTop: 1, flexShrink: 0 } }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: isLoading || !email || !password, className: "auth-submit-button", style: {
                                    width: '100%', height: 48,
                                    background: (isLoading || !email || !password)
                                        ? '#bfdbfe'
                                        : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                    color: '#ffffff', border: 'none',
                                    borderRadius: 12, fontSize: 15, fontWeight: 600,
                                    cursor: (isLoading || !email || !password) ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s',
                                    boxShadow: (isLoading || !email || !password)
                                        ? 'none'
                                        : '0 4px 16px rgba(37,99,235,0.4)',
                                    letterSpacing: '0.01em',
                                }, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: 'linear' }, children: _jsx(Loader2, { size: 18 }) }), "Signing in..."] })) : 'Sign In →' }), _jsx("div", { style: { marginTop: 18 }, children: _jsx(AuthLinkGrid, {}) }), _jsxs("p", { style: {
                                    fontSize: 11, color: '#94a3b8', textAlign: 'center',
                                    marginTop: 14, lineHeight: 1.6,
                                }, children: ["By signing in you agree to our", ' ', _jsx(Link, { to: "/terms", style: { color: '#2563eb', textDecoration: 'none' }, children: "Terms" }), ' ', "and", ' ', _jsx(Link, { to: "/privacy", style: { color: '#2563eb', textDecoration: 'none' }, children: "Privacy Policy" })] })] }), _jsx("div", { style: {
                            borderTop: '1px solid #f1f5f9', marginTop: 20, paddingTop: 20,
                            textAlign: 'center',
                        }, children: _jsxs("p", { style: { fontSize: 14, color: '#64748b', margin: 0 }, children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", style: { color: '#2563eb', fontWeight: 600,
                                        textDecoration: 'none' }, children: "Create account" })] }) })] })] }));
}
