import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { RegisterSchema, TokenStorage, UserProfileStorage } from '../../lib/security';
import api from '../../lib/api';
import { sounds } from '../../lib/sounds';
import { visitTracker } from '../../lib/visitTracker';
const asRecord = (value) => value && typeof value === 'object' ? value : {};
const extractToken = (value) => {
    const root = asRecord(value);
    const nestedData = asRecord(root.data);
    const nestedResult = asRecord(root.result);
    const candidates = [
        root.token,
        root.accessToken,
        root.access_token,
        root.jwt,
        nestedData.token,
        nestedData.accessToken,
        nestedData.access_token,
        nestedData.jwt,
        nestedResult.token,
        nestedResult.accessToken,
        nestedResult.access_token,
        nestedResult.jwt,
    ];
    const found = candidates.find((v) => typeof v === 'string' && v.length > 0);
    return found ?? null;
};
const GoogleIcon = () => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92 c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57 c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77 c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53 H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 s.13-1.43.35-2.09V7.07H2.18 C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15 C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84 c.87-2.6 3.3-4.53 6.16-4.53z" })] }));
const LinkedInIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#0A66C2", children: _jsx("path", { d: "M20.447 20.452h-3.554v-5.569 c0-1.328-.027-3.037-1.852-3.037 -1.853 0-2.136 1.445-2.136 2.939 v5.667H9.351V9h3.414v1.561h.046 c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z M5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019 H3.555V9h3.564v11.452z M22.225 0H1.771C.792 0 0 .774 0 1.729 v20.542C0 23.227.792 24 1.771 24h20.451 C23.2 24 24 23.227 24 22.271V1.729 C24 .774 23.2 0 22.222 0h.003z" }) }));
const FacebookIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#1877F2", children: _jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12 s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047 V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83 c-1.491 0-1.956.925-1.956 1.874v2.25h3.328 l-.532 3.47h-2.796v8.385 C19.612 23.027 24 18.062 24 12.073z" }) }));
const SocialButton = ({ name, icon, border, shadow }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isRippling, setIsRippling] = useState(false);
    const handleClick = () => {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 400);
        setTimeout(() => {
            window.location.assign('/login');
        }, 200);
    };
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("button", { type: "button", onClick: handleClick, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => {
                    setIsHovered(false);
                    setIsPressed(false);
                }, onMouseDown: () => setIsPressed(true), onMouseUp: () => setIsPressed(false), onTouchStart: () => setIsPressed(true), onTouchEnd: () => setIsPressed(false), title: `Continue with ${name}`, style: {
                    position: 'relative',
                    width: 64,
                    height: 64,
                    background: 'transparent',
                    border: `1.5px solid ${isHovered ? border.replace('0.3', '0.7') : border}`,
                    borderRadius: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    overflow: 'hidden',
                    transform: isPressed
                        ? 'scale(0.91) translateY(2px)'
                        : isHovered
                            ? 'scale(1.1) translateY(-3px)'
                            : 'scale(1) translateY(0)',
                    boxShadow: isHovered
                        ? `0 8px 24px ${shadow}, 0 0 0 1px ${border}`
                        : isPressed
                            ? 'none'
                            : '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1),' +
                        'box-shadow 0.2s ease,' +
                        'border-color 0.15s ease',
                }, children: [icon, _jsx("span", { style: {
                            fontSize: 9,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.5)',
                            letterSpacing: '0.02em',
                            transition: 'color 0.15s',
                            ...(isHovered ? { color: 'rgba(255,255,255,0.9)' } : {}),
                        }, children: name }), isRippling && (_jsx("div", { style: {
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: 'inherit',
                            animation: 'rippleFade 0.4s ease-out forwards',
                            pointerEvents: 'none',
                        } })), isHovered && (_jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: '-60%',
                            width: '40%',
                            height: '100%',
                            background: 'linear-gradient(90deg,' +
                                'transparent,' +
                                'rgba(255,255,255,0.12),' +
                                'transparent)',
                            transform: 'skewX(-15deg)',
                            animation: 'shineSweep 0.5s ease-out forwards',
                            pointerEvents: 'none',
                        } }))] }), isHovered && (_jsx("div", { style: {
                    position: 'absolute',
                    inset: -4,
                    borderRadius: 20,
                    background: `radial-gradient(circle, ${shadow} 0%, transparent 70%)`,
                    opacity: 0.4,
                    pointerEvents: 'none',
                    animation: 'pulseGlow 1.5s ease-in-out infinite',
                } }))] }));
};
export default function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const checkPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8)
            strength++;
        if (/[A-Z]/.test(pwd))
            strength++;
        if (/[0-9]/.test(pwd))
            strength++;
        if (/[^A-Za-z0-9]/.test(pwd))
            strength++;
        setPasswordStrength(strength);
    };
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        const result = RegisterSchema.safeParse({ fullName, email, password });
        if (!result.success) {
            sounds.error();
            setError(result.error.issues[0].message);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/register', {
                fullName: result.data.fullName,
                email: result.data.email,
                password: result.data.password,
            });
            const root = asRecord(data);
            const inner = asRecord(root.data);
            const accessToken = (inner.accessToken || root.accessToken);
            const refreshToken = (inner.refreshToken || root.refreshToken);
            if (accessToken)
                TokenStorage.setTokens(accessToken, refreshToken);
            UserProfileStorage.set({ name: result.data.fullName, email: result.data.email });
            visitTracker.markHasAccount();
            sounds.success();
            toast.success('Account created! Welcome to Finly.');
            navigate('/dashboard', { replace: true });
        }
        catch (err) {
            const axiosErr = err;
            const statusFromResponse = axiosErr.response?.status;
            const statusFromMessage = err instanceof Error ? Number.parseInt(err.message, 10) : NaN;
            const status = statusFromResponse || (Number.isNaN(statusFromMessage) ? undefined : statusFromMessage);
            if (status === 409 || (err instanceof Error && err.message?.includes('409'))) {
                sounds.error();
                setError('This email is already registered. Please log in instead.');
            }
            else if (status === 400) {
                sounds.error();
                setError('Please check your information and try again.');
            }
            else {
                sounds.error();
                setError('Registration failed. Please try again.');
            }
        }
        finally {
            setLoading(false);
        }
    }, [fullName, email, password, navigate]);
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: 'linear-gradient(to br, #f0f4f8 0%, #d9e2ec 50%, #c5d5e0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }, children: [_jsx(motion.div, { animate: { scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }, transition: { duration: 8, repeat: Infinity }, style: {
                    position: 'absolute', top: '-10%', right: '-10%',
                    width: '500px', height: '500px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), _jsx(motion.div, { animate: { scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }, transition: { duration: 10, repeat: Infinity, delay: 2 }, style: {
                    position: 'absolute', bottom: '-5%', left: '-5%',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), _jsxs(motion.div, { initial: { opacity: 0, y: 20, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.4, ease: 'easeOut' }, style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: 'clamp(24px, 5vw, 40px)',
                    width: '100%',
                    maxWidth: '460px',
                    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '28px' }, children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: 0.1, type: 'spring', stiffness: 300 }, style: {
                                    width: '56px', height: '56px', borderRadius: '14px',
                                    background: 'transparent',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '16px',
                                    boxShadow: 'none',
                                }, children: _jsx(Zap, { size: 26, color: "white", fill: "white" }) }), _jsx("h1", { style: {
                                    fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: '700', color: '#0f172a',
                                    margin: '0 0 8px', letterSpacing: '-0.02em',
                                }, children: "Create account" }), _jsx("p", { style: { fontSize: '14px', color: '#64748b', margin: '0', lineHeight: '1.5' }, children: "Join Finly and manage your finances" })] }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [_jsxs("div", { style: { marginBottom: '18px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '13px', fontWeight: '600',
                                            color: '#374151', marginBottom: '8px' }, children: "Full name" }), _jsx("input", { type: "text", value: fullName, onChange: e => setFullName(e.target.value), placeholder: "John Doe", required: true, maxLength: 100, style: {
                                            width: '100%', height: '48px',
                                            padding: '0 14px',
                                            border: '1.5px solid #e2e8f0', borderRadius: '12px',
                                            fontSize: '14px', color: '#0f172a',
                                            background: '#f8fafc', outline: 'none',
                                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        }, onFocus: e => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            e.currentTarget.style.background = '#fff';
                                        }, onBlur: e => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.background = '#f8fafc';
                                        } })] }), _jsxs("div", { style: { marginBottom: '18px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '13px', fontWeight: '600',
                                            color: '#374151', marginBottom: '8px' }, children: "Email address" }), _jsx("input", { type: "email", autoComplete: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "you@example.com", required: true, maxLength: 255, style: {
                                            width: '100%', height: '48px',
                                            padding: '0 14px',
                                            border: '1.5px solid #e2e8f0', borderRadius: '12px',
                                            fontSize: '14px', color: '#0f172a',
                                            background: '#f8fafc', outline: 'none',
                                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        }, onFocus: e => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            e.currentTarget.style.background = '#fff';
                                        }, onBlur: e => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.background = '#f8fafc';
                                        } })] }), _jsxs("div", { style: { marginBottom: '18px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '13px', fontWeight: '600',
                                            color: '#374151', marginBottom: '8px' }, children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: showPass ? 'text' : 'password', autoComplete: "new-password", value: password, onChange: e => {
                                                    setPassword(e.target.value);
                                                    checkPasswordStrength(e.target.value);
                                                }, placeholder: "At least 8 characters", required: true, maxLength: 128, style: {
                                                    width: '100%', height: '48px',
                                                    padding: '0 44px 0 14px',
                                                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                                                    fontSize: '14px', color: '#0f172a',
                                                    background: '#f8fafc', outline: 'none',
                                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                }, onFocus: e => {
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                    e.currentTarget.style.background = '#fff';
                                                }, onBlur: e => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.background = '#f8fafc';
                                                } }), _jsx("button", { type: "button", onClick: () => setShowPass(p => !p), style: {
                                                    position: 'absolute', right: '12px', top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none',
                                                    cursor: 'pointer', color: '#94a3b8', padding: '4px',
                                                    display: 'flex', alignItems: 'center',
                                                }, children: showPass ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), password && (_jsx("div", { style: { marginTop: '10px', display: 'flex', gap: '6px' }, children: [0, 1, 2, 3].map(i => (_jsx("div", { style: {
                                                flex: 1, height: '4px', borderRadius: '2px',
                                                background: i < passwordStrength ? '#22c55e' : '#e2e8f0',
                                                transition: 'all 0.2s',
                                            } }, i))) }))] }), error && (_jsxs(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, style: {
                                    background: '#fef2f2', border: '1px solid #fecdd3',
                                    borderRadius: '12px', padding: '12px 14px',
                                    fontSize: '13px', color: '#be123c',
                                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                                    marginBottom: '18px',
                                }, children: [_jsx(AlertTriangle, { size: 15, style: { marginTop: '2px', flexShrink: 0 } }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: loading || !fullName || !email || !password, className: "auth-submit-button", style: {
                                    width: '100%', height: '50px',
                                    background: (loading || !fullName || !email || !password)
                                        ? '#bfdbfe'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    color: '#ffffff', border: 'none',
                                    borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                                    cursor: (loading || !fullName || !email || !password) ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: (loading || !fullName || !email || !password)
                                        ? 'none'
                                        : '0 8px 24px rgba(59, 130, 246, 0.3)',
                                    letterSpacing: '0.01em',
                                }, children: loading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: 'linear' }, children: _jsx(Loader2, { size: 18 }) }), "Creating account..."] })) : 'Create Account →' }), _jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    margin: '22px 0',
                                }, children: [_jsx("div", { style: {
                                            flex: 1, height: '1px',
                                            background: '#e2e8f0',
                                        } }), _jsx("span", { style: {
                                            fontSize: '12px',
                                            color: '#94a3b8',
                                            whiteSpace: 'nowrap',
                                            fontWeight: '500',
                                        }, children: "or connect with" }), _jsx("div", { style: {
                                            flex: 1, height: '1px',
                                            background: '#e2e8f0',
                                        } })] }), _jsx("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                }, children: [
                                    {
                                        name: 'Google',
                                        icon: _jsx(GoogleIcon, {}),
                                        border: 'rgba(66,133,244,0.25)',
                                        shadow: 'rgba(66,133,244,0.25)',
                                    },
                                    {
                                        name: 'LinkedIn',
                                        icon: _jsx(LinkedInIcon, {}),
                                        border: 'rgba(10,102,194,0.25)',
                                        shadow: 'rgba(10,102,194,0.25)',
                                    },
                                    {
                                        name: 'Facebook',
                                        icon: _jsx(FacebookIcon, {}),
                                        border: 'rgba(24,119,242,0.25)',
                                        shadow: 'rgba(24,119,242,0.25)',
                                    },
                                ].map(social => (_jsx(SocialButton, { ...social }, social.name))) })] }), _jsx("div", { style: {
                            textAlign: 'center',
                            marginTop: '16px',
                        }, children: _jsxs("p", { style: {
                                fontSize: '14px',
                                color: '#64748b',
                                margin: '0',
                            }, children: ["Already have an account?", ' ', _jsx("span", { onClick: () => navigate('/login'), style: {
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'color 0.15s',
                                    }, onMouseEnter: e => {
                                        e.currentTarget.style.color = '#2563eb';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.color = '#3b82f6';
                                    }, children: "Sign in" })] }) })] })] }));
}
