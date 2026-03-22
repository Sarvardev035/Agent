import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { GlassCard, StatCard, AnimatedListItem } from '@/components/ui/ModernCards';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export function ModernDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 sm:px-6 lg:px-8 pt-8 pb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            >
              ✓ Active
            </motion.div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here's your financial overview.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            icon="💰"
            label="Total Balance"
            value="$24,580"
            change="+12.5%"
            isPositive={true}
            delay={0}
          />
          <StatCard
            icon="📈"
            label="Monthly Income"
            value="$8,400"
            change="+5.2%"
            isPositive={true}
            delay={0.1}
          />
          <StatCard
            icon="💸"
            label="Monthly Expense"
            value="$4,200"
            change="-3.1%"
            isPositive={false}
            delay={0.2}
          />
          <StatCard
            icon="🎯"
            label="Savings Goal"
            value="68%"
            change="+8.3%"
            isPositive={true}
            delay={0.3}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold text-slate-900 dark:text-white mb-6"
              >
                Recent Transactions
              </motion.h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {[
                  {
                    icon: '🍔',
                    title: 'Restaurant',
                    subtitle: 'Lunch at Downtown Cafe',
                    value: '-$45.00',
                    delay: 0.5,
                  },
                  {
                    icon: '🚕',
                    title: 'Transportation',
                    subtitle: 'Uber to Downtown',
                    value: '-$12.50',
                    delay: 0.6,
                  },
                  {
                    icon: '💳',
                    title: 'Salary',
                    subtitle: 'Monthly paycheck',
                    value: '+$4,200.00',
                    delay: 0.7,
                  },
                  {
                    icon: '🏠',
                    title: 'Rent Payment',
                    subtitle: 'Monthly rent',
                    value: '-$1,500.00',
                    delay: 0.8,
                  },
                ].map((tx, i) => (
                  <AnimatedListItem
                    key={i}
                    icon={tx.icon}
                    title={tx.title}
                    subtitle={tx.subtitle}
                    value={tx.value}
                    delay={tx.delay}
                  />
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="p-6 h-full">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold text-slate-900 dark:text-white mb-6"
              >
                Quick Actions
              </motion.h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {[
                  { icon: '📤', label: 'Send Money', delay: 0.5 },
                  { icon: '📥', label: 'Request Money', delay: 0.6 },
                  { icon: '💰', label: 'Add Income', delay: 0.7 },
                  { icon: '📊', label: 'View Reports', delay: 0.8 },
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: action.delay }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full px-4 py-3 rounded-lg
                      bg-gradient-to-r from-blue-500/20 to-purple-500/20
                      dark:from-blue-600/20 dark:to-purple-600/20
                      border border-blue-300/30 dark:border-blue-500/30
                      text-slate-900 dark:text-white font-medium
                      hover:from-blue-500/30 hover:to-purple-500/30
                      dark:hover:from-blue-600/30 dark:hover:to-purple-600/30
                      transition-all duration-200
                      flex items-center justify-between
                    `}
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span>{action.label}</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Bottom Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8"
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Spending by Category
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Food & Dining', amount: '$1,240', percentage: 45, color: 'from-orange-500 to-red-500' },
                { label: 'Transportation', amount: '$680', percentage: 25, color: 'from-blue-500 to-cyan-500' },
                { label: 'Entertainment', amount: '$450', percentage: 16, color: 'from-purple-500 to-pink-500' },
                { label: 'Utilities', amount: '$320', percentage: 14, color: 'from-green-500 to-emerald-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.amount}
                    </span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                    className="h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Financial Goals
            </h2>
            <div className="space-y-4">
              {[
                { goal: 'Emergency Fund', current: 8500, target: 10000, icon: '🏦' },
                { goal: 'Vacation', current: 3200, target: 5000, icon: '✈️' },
                { goal: 'Car Fund', current: 6800, target: 15000, icon: '🚗' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.goal}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        ${item.current.toLocaleString()} / ${item.target.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                    className="h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.current / item.target) * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
