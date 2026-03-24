import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
const GoogleIcon = () => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92 c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57 c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77 c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53 H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 s.13-1.43.35-2.09V7.07H2.18 C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15 C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84 c.87-2.6 3.3-4.53 6.16-4.53z" })] }));
const LinkedInIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#0A66C2", children: _jsx("path", { d: "M20.447 20.452h-3.554v-5.569 c0-1.328-.027-3.037-1.852-3.037 -1.853 0-2.136 1.445-2.136 2.939 v5.667H9.351V9h3.414v1.561h.046 c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z M5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019 H3.555V9h3.564v11.452z M22.225 0H1.771C.792 0 0 .774 0 1.729 v20.542C0 23.227.792 24 1.771 24h20.451 C23.2 24 24 23.227 24 22.271V1.729 C24 .774 23.2 0 22.222 0h.003z" }) }));
const FacebookIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#1877F2", children: _jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12 s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047 V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83 c-1.491 0-1.956.925-1.956 1.874v2.25h3.328 l-.532 3.47h-2.796v8.385 C19.612 23.027 24 18.062 24 12.073z" }) }));
const SocialButton = ({ name, icon, bg, border, hover, shadow, href }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isRippling, setIsRippling] = useState(false);
    const handleClick = () => {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 400);
        setTimeout(() => {
            window.location.assign(href);
        }, 200);
    };
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("button", { type: "button", onClick: handleClick, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => {
                    setIsHovered(false);
                    setIsPressed(false);
                }, onMouseDown: () => setIsPressed(true), onMouseUp: () => setIsPressed(false), onTouchStart: () => setIsPressed(true), onTouchEnd: () => setIsPressed(false), title: `Continue with ${name}`, style: {
                    position: 'relative',
                    width: 64,
                    height: 64,
                    background: isHovered ? hover : bg,
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
                        'background 0.15s ease,' +
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
const AuthLinkGrid = () => (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '22px 0',
            }, children: [_jsx("div", { style: {
                        flex: 1,
                        height: '1px',
                        background: '#e2e8f0',
                    } }), _jsx("span", { style: {
                        fontSize: '12px',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        fontWeight: '500',
                    }, children: "or connect with" }), _jsx("div", { style: {
                        flex: 1,
                        height: '1px',
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
                    bg: 'rgba(66,133,244,0.08)',
                    border: 'rgba(66,133,244,0.25)',
                    hover: 'rgba(66,133,244,0.15)',
                    shadow: 'rgba(66,133,244,0.25)',
                    href: '/login',
                },
                {
                    name: 'LinkedIn',
                    icon: _jsx(LinkedInIcon, {}),
                    bg: 'rgba(10,102,194,0.08)',
                    border: 'rgba(10,102,194,0.25)',
                    hover: 'rgba(10,102,194,0.15)',
                    shadow: 'rgba(10,102,194,0.25)',
                    href: '/login',
                },
                {
                    name: 'Facebook',
                    icon: _jsx(FacebookIcon, {}),
                    bg: 'rgba(24,119,242,0.08)',
                    border: 'rgba(24,119,242,0.25)',
                    hover: 'rgba(24,119,242,0.15)',
                    shadow: 'rgba(24,119,242,0.25)',
                    href: '/login',
                },
            ].map(social => (_jsx(SocialButton, { ...social }, social.name))) })] }));
export default AuthLinkGrid;
