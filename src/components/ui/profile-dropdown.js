import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Check, ChevronUp, BarChart3, Settings, Grid3X3, Crown, DoorOpen, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
export const ProfileDropdown = ({ userName = "User Name", userEmail = "user@example.com", userRole = "Product Designer", userImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23667eea' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em'%3E%3C/text%3E%3C/svg%3E", onActivityLog, onSettings, onIntegrations, onUpgrade, onSignOut, }) => {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("finly_theme");
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }
    }, []);
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("finly_theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };
    if (!mounted) {
        return null;
    }
    const menuItems = [
        { icon: _jsx(BarChart3, { className: "w-5 h-5" }), label: "Activity log", onClick: onActivityLog },
        { icon: _jsx(Settings, { className: "w-5 h-5" }), label: "Settings", onClick: onSettings },
        { icon: _jsx(Grid3X3, { className: "w-5 h-5" }), label: "Integrations", onClick: onIntegrations },
        {
            icon: _jsx(Crown, { className: "w-5 h-5" }),
            label: "Upgrade to Pro",
            action: true,
            actionLabel: "Upgrade",
            onClick: onUpgrade,
        },
        {
            icon: _jsx(DoorOpen, { className: "w-5 h-5" }),
            label: "Sign out",
            danger: true,
            onClick: onSignOut,
        },
    ];
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md mx-auto overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700", children: [_jsx(motion.div, { className: "p-6 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-200 cursor-pointer", onClick: () => setIsOpen(!isOpen), transition: { duration: 0.2 }, children: _jsxs("div", { className: "flex items-center", children: [_jsx(motion.div, { className: "relative w-12 h-12 mr-4 rounded-full overflow-hidden flex-shrink-0", whileHover: { scale: 1.05 }, transition: { type: "spring", stiffness: 400, damping: 10 }, children: _jsx("div", { className: "w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center", children: userImage ? (_jsx("img", { src: userImage, alt: userName, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-white font-bold text-lg", children: initials })) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-lg font-bold text-neutral-900 dark:text-white truncate", children: userName }), _jsx(motion.div, { className: "flex-shrink-0 flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full", whileHover: { scale: 1.1 }, transition: { type: "spring", stiffness: 400, damping: 10 }, children: _jsx(Check, { className: "w-3 h-3 text-white" }) })] }), _jsxs("p", { className: "text-neutral-500 dark:text-neutral-400 text-sm truncate", children: [userRole, " \u2022 ", userEmail] })] }), _jsx(motion.button, { className: "text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-2", onClick: (e) => {
                                    e.stopPropagation();
                                    setIsOpen(!isOpen);
                                }, whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 }, children: _jsx(motion.div, { animate: { rotate: isOpen ? 0 : 180 }, transition: { duration: 0.3 }, children: _jsx(ChevronUp, { className: "w-5 h-5" }) }) })] }) }), _jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, children: [_jsx("div", { className: "p-6 border-b border-neutral-200 dark:border-neutral-700", children: _jsxs(motion.div, { className: "rounded-xl p-5 overflow-hidden relative transition-transform duration-300 hover:scale-[1.02]", style: {
                                        background: theme === "light"
                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            : "linear-gradient(135deg, #1e3a8a 0%, #5b21b6 100%)",
                                    }, transition: { type: "spring", stiffness: 300, damping: 15 }, children: [_jsxs("div", { className: "flex justify-between mb-12", children: [_jsx("div", { className: "text-white/80", children: _jsx("svg", { fill: "currentColor", width: "32px", height: "32px", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.025-1.154-.229-1.729-.764-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z" }) }) }), _jsx("div", { className: "text-white/60", children: _jsx("svg", { fill: "currentColor", width: "48px", height: "48px", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M16.539 9.186a4.155 4.155 0 0 0-1.451-.251c-1.6 0-2.73.806-2.738 1.963-.01.85.803 1.329 1.418 1.613.631.292.842.476.84.737-.004.397-.504.577-.969.577-.639 0-.988-.089-1.525-.312l-.199-.093-.227 1.332c.389.162 1.09.301 1.814.313 1.701 0 2.813-.801 2.826-2.032.014-.679-.426-1.192-1.352-1.616-.563-.275-.912-.459-.912-.738 0-.247.299-.511.924-.511a2.95 2.95 0 0 1 1.213.229l.15.067.227-1.287-.039.009zm4.152-.143h-1.25c-.389 0-.682.107-.852.493l-2.404 5.446h1.701l.34-.893 2.076.002c.049.209.199.891.199.891h1.5l-1.31-5.939zm-10.642-.05h1.621l-1.014 5.942H9.037l1.012-5.944v.002zm-4.115 3.275.168.825 1.584-4.05h1.717l-2.551 5.931H5.139l-1.4-5.022a.339.339 0 0 0-.149-.199 6.948 6.948 0 0 0-1.592-.589l.022-.125h2.609c.354.014.639.125.734.503l.57 2.729v-.003zm12.757.606.646-1.662c-.008.018.133-.343.215-.566l.111.513.375 1.714H18.69v.001h.001z" }) }) })] }), _jsxs("div", { className: "flex items-center mb-6", children: [_jsx("div", { className: "font-mono text-white/90 text-sm", children: userName }), _jsx("div", { className: "ml-auto font-mono text-white/70 text-sm", children: "12/26" })] }), _jsx("div", { className: "font-mono text-xl tracking-[0.2em] text-white font-semibold", children: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4242" })] }) }), _jsx("div", { className: "p-4 border-b border-neutral-200 dark:border-neutral-700", children: _jsxs("div", { className: "flex gap-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1", children: [_jsxs(motion.button, { className: cn("flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-all", theme === "light"
                                                ? "bg-white dark:bg-neutral-600 shadow-sm text-neutral-900 dark:text-white"
                                                : "text-neutral-500 dark:text-neutral-400"), onClick: () => handleThemeChange("light"), whileHover: { scale: theme !== "light" ? 1.03 : 1 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 17 }, children: [_jsx(Sun, { className: `w-4 h-4 ${theme === "light" ? "text-amber-500" : ""}` }), _jsx("span", { className: "hidden sm:inline", children: "Light" })] }), _jsxs(motion.button, { className: cn("flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-all", theme === "dark"
                                                ? "bg-neutral-600 shadow-sm text-white"
                                                : "text-neutral-500 dark:text-neutral-400"), onClick: () => handleThemeChange("dark"), whileHover: { scale: theme !== "dark" ? 1.03 : 1 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 17 }, children: [_jsx(Moon, { className: `w-4 h-4 ${theme === "dark" ? "text-indigo-300" : ""}` }), _jsx("span", { className: "hidden sm:inline", children: "Dark" })] })] }) }), _jsx("div", { className: "p-4 space-y-2 border-b border-neutral-200 dark:border-neutral-700", children: menuItems.map((item, index) => (_jsxs(motion.button, { onClick: item.onClick, className: cn("w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200", item.danger
                                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 active:bg-neutral-200 dark:active:bg-neutral-700"), whileTap: { scale: 0.98 }, transition: { type: "spring", stiffness: 400, damping: 17 }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "flex-shrink-0", children: item.icon }), _jsx("span", { className: "text-sm font-medium", children: item.label })] }), item.action && (_jsx(motion.button, { onClick: (e) => {
                                                e.stopPropagation();
                                                item.onClick?.();
                                            }, className: "px-3 py-1 rounded-md bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 text-black dark:text-white font-medium text-xs whitespace-nowrap", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: item.actionLabel }))] }, index))) }), _jsxs("div", { className: "p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-200", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(motion.div, { className: "w-6 h-6 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0", whileHover: { scale: 1.1, rotate: 10 }, transition: { type: "spring", stiffness: 400, damping: 10 }, children: _jsx("div", { className: "w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" }) }), _jsx("span", { className: "text-neutral-900 dark:text-white font-medium text-sm", children: "Finly" })] }), _jsx("div", { className: "text-neutral-500 dark:text-neutral-400 text-xs", children: "v1.0" })] })] })) })] }) }));
};
export default ProfileDropdown;
