import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Zap } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'auto' as const, label: 'Auto', icon: Zap },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2.5 rounded-lg backdrop-blur-xl
          bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10
          hover:bg-white/20 dark:hover:bg-white/10
          transition-all duration-200
        `}
      >
        {theme === 'light' && <Sun size={20} className="text-amber-500" />}
        {theme === 'dark' && <Moon size={20} className="text-indigo-400" />}
        {theme === 'auto' && <Zap size={20} className="text-blue-500" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`
                absolute right-0 top-full mt-2 z-50
                rounded-xl backdrop-blur-xl
                bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20
                shadow-xl overflow-hidden
              `}
            >
              {themes.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setTheme(t.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3
                      text-sm font-medium transition-all duration-200
                      ${
                        theme === t.value
                          ? 'bg-white/30 dark:bg-white/20 text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/15'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{t.label}</span>
                    {theme === t.value && (
                      <motion.div
                        layoutId="activeTheme"
                        className="ml-auto w-2 h-2 rounded-full bg-blue-500"
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
