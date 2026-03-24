import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalVariants } from '../../lib/animations';
const Modal = ({ open, onClose, title, subtitle, footer, children }) => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);
    useEffect(() => {
        if (open)
            document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const labelledBy = useMemo(() => (title ? `modal-title-${title}` : undefined), [title]);
    const panelVariants = isMobile
        ? {
            hidden: { opacity: 0, y: 120 },
            show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            exit: { opacity: 0, y: 120, transition: { duration: 0.18 } },
        }
        : modalVariants;
    if (!open)
        return null;
    return createPortal(_jsx(AnimatePresence, { children: open && (_jsxs(_Fragment, { children: [_jsx(motion.div, { role: "presentation", "aria-hidden": true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, style: {
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(12,16,30,0.34)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 90,
                    } }), _jsx(motion.div, { variants: panelVariants, initial: "hidden", animate: "show", exit: "exit", style: {
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: isMobile ? 'flex-end' : 'center',
                        justifyContent: 'center',
                        padding: isMobile ? '12px 12px 20px' : '24px 16px',
                        zIndex: 100,
                    }, children: _jsxs(motion.div, { role: "dialog", "aria-modal": "true", "aria-labelledby": labelledBy, "aria-describedby": subtitle ? `${labelledBy}-subtitle` : undefined, style: {
                            width: '100%',
                            maxWidth: isMobile ? undefined : 620,
                            background: 'var(--surface-strong)',
                            borderRadius: isMobile ? '20px 20px 0 0' : 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-glass)',
                            padding: 20,
                            margin: isMobile ? '0 auto' : undefined,
                            transformOrigin: 'center',
                            border: '1px solid var(--border)',
                            backdropFilter: 'blur(20px) saturate(145%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(145%)',
                            overflow: 'hidden',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }, children: [_jsxs("div", { children: [title && (_jsx("h3", { id: labelledBy, style: { margin: 0, fontSize: 18, fontWeight: 800 }, children: title })), subtitle && (_jsx("p", { id: `${labelledBy}-subtitle`, style: { margin: '4px 0 0', color: 'var(--text-2)', fontSize: 13, lineHeight: 1.4 }, children: subtitle }))] }), _jsx("button", { onClick: onClose, style: {
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--text-3)',
                                            padding: 6,
                                        }, "aria-label": "Close", type: "button", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { style: { marginTop: 12 }, children: children }), footer && _jsx("div", { style: { marginTop: 16 }, children: footer })] }) })] })) }), document.body);
};
export default Modal;
