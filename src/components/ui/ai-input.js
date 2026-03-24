"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cx } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const ColorOrb = ({ dimension = "192px", className, tones, spinDuration = 20, }) => {
    const fallbackTones = {
        base: "oklch(95% 0.02 264.695)",
        accent1: "oklch(75% 0.15 350)",
        accent2: "oklch(80% 0.12 200)",
        accent3: "oklch(78% 0.14 280)",
    };
    const palette = { ...fallbackTones, ...tones };
    const dimValue = parseInt(dimension.replace("px", ""), 10);
    const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4);
    const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5);
    const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1);
    const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2);
    const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%";
    const adjustedContrast = dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength;
    return (_jsx("div", { className: cn("color-orb", className), style: {
            width: dimension,
            height: dimension,
            "--base": palette.base,
            "--accent1": palette.accent1,
            "--accent2": palette.accent2,
            "--accent3": palette.accent3,
            "--spin-duration": `${spinDuration}s`,
            "--blur": `${blurStrength}px`,
            "--contrast": adjustedContrast,
            "--dot": `${pixelDot}px`,
            "--shadow": `${shadowRange}px`,
            "--mask": maskRadius,
        }, children: _jsx("style", { children: `
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      ` }) }));
};
const SPEED_FACTOR = 1;
const FormContext = React.createContext({});
const useFormContext = () => React.useContext(FormContext);
export function MorphPanel() {
    const wrapperRef = React.useRef(null);
    const textareaRef = React.useRef(null);
    const [showForm, setShowForm] = React.useState(false);
    const [successFlag, setSuccessFlag] = React.useState(false);
    const triggerClose = React.useCallback(() => {
        setShowForm(false);
        textareaRef.current?.blur();
    }, []);
    const triggerOpen = React.useCallback(() => {
        setShowForm(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        });
    }, []);
    const handleSuccess = React.useCallback(() => {
        triggerClose();
        setSuccessFlag(true);
        setTimeout(() => setSuccessFlag(false), 1500);
    }, [triggerClose]);
    React.useEffect(() => {
        function clickOutsideHandler(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target) && showForm) {
                triggerClose();
            }
        }
        document.addEventListener("mousedown", clickOutsideHandler);
        return () => document.removeEventListener("mousedown", clickOutsideHandler);
    }, [showForm, triggerClose]);
    const ctx = React.useMemo(() => ({ showForm, successFlag, triggerOpen, triggerClose }), [showForm, successFlag, triggerOpen, triggerClose]);
    return (_jsx("div", { className: "flex items-center justify-center", style: { width: FORM_WIDTH, height: FORM_HEIGHT }, children: _jsx(motion.div, { ref: wrapperRef, "data-panel": true, className: cx("bg-background relative bottom-8 z-3 flex flex-col items-center overflow-hidden border max-sm:bottom-5"), initial: false, animate: {
                width: showForm ? FORM_WIDTH : "auto",
                height: showForm ? FORM_HEIGHT : 44,
                borderRadius: showForm ? 14 : 20,
            }, transition: {
                type: "spring",
                stiffness: 550 / SPEED_FACTOR,
                damping: 45,
                mass: 0.7,
                delay: showForm ? 0 : 0.08,
            }, children: _jsxs(FormContext.Provider, { value: ctx, children: [_jsx(DockBar, {}), _jsx(InputForm, { ref: textareaRef, onSuccess: handleSuccess })] }) }) }));
}
function DockBar() {
    const { showForm, triggerOpen } = useFormContext();
    return (_jsx("footer", { className: "mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none", children: _jsxs("div", { className: "flex items-center justify-center gap-2 px-3 max-sm:h-10 max-sm:px-2", children: [_jsx("div", { className: "flex w-fit items-center gap-2", children: _jsx(AnimatePresence, { mode: "wait", children: showForm ? (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 0 }, exit: { opacity: 0 }, className: "h-5 w-5" }, "blank")) : (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, children: _jsx(ColorOrb, { dimension: "24px", tones: { base: "oklch(22.64% 0 0)" } }) }, "orb")) }) }), _jsx(Button, { type: "button", className: "flex h-fit flex-1 justify-end rounded-full px-2 !py-0.5", variant: "ghost", onClick: triggerOpen, children: _jsx("span", { className: "truncate", children: "Ask AI" }) })] }) }));
}
const FORM_WIDTH = 360;
const FORM_HEIGHT = 200;
function InputForm({ ref, onSuccess }) {
    const { triggerClose, showForm } = useFormContext();
    const btnRef = React.useRef(null);
    async function handleSubmit(e) {
        e.preventDefault();
        onSuccess();
    }
    function handleKeys(e) {
        if (e.key === "Escape")
            triggerClose();
        if (e.key === "Enter" && e.metaKey) {
            e.preventDefault();
            btnRef.current?.click();
        }
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "absolute bottom-0", style: { width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "all" : "none" }, children: [_jsx(AnimatePresence, { children: showForm && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }, className: "flex h-full flex-col p-1", children: [_jsxs("div", { className: "flex justify-between py-1", children: [_jsx("p", { className: "text-foreground z-2 ml-[38px] flex items-center gap-[6px] select-none", children: "AI Input" }), _jsxs("button", { type: "submit", ref: btnRef, className: "text-foreground right-4 mt-1 flex -translate-y-[3px] cursor-pointer items-center justify-center gap-1 rounded-[12px] bg-transparent pr-1 text-center select-none", children: [_jsx(KeyHint, { children: "\u2318" }), _jsx(KeyHint, { className: "w-fit", children: "Enter" })] })] }), _jsx("textarea", { ref: ref, placeholder: "Ask me anything...", name: "message", className: "h-full w-full resize-none scroll-py-2 rounded-md p-4 outline-0", required: true, onKeyDown: handleKeys, spellCheck: false })] })) }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, className: "absolute top-2 left-3", children: _jsx(ColorOrb, { dimension: "24px", tones: { base: "oklch(22.64% 0 0)" } }) })) })] }));
}
function KeyHint({ children, className }) {
    return (_jsx("kbd", { className: cx("text-foreground flex h-6 w-fit items-center justify-center rounded-sm border px-[6px] font-sans", className), children: children }));
}
export default MorphPanel;
