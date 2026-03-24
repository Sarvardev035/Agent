import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, Sparkles, Wrench, TerminalSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { aiChatService } from '../../services/ai-chat.service';
import { accountsApi } from '../../api/accountsApi';
import { categoriesService } from '../../services/categories.service';
import { expensesApi } from '../../api/expensesApi';
import { incomeApi } from '../../api/incomeApi';
import { debtsApi } from '../../api/debtsApi';
import { statsApi } from '../../api/statsApi';
import { unwrap } from '../../api/axios';
import { budgetService } from '../../services/budget.service';
import { sounds } from '../../lib/sounds';
import { safeArray } from '../../lib/helpers';
const BOT_RULES = [
    {
        keywords: ['add expense', 'new expense', 'spend', 'spent'],
        response: `To add an expense:
1. Click "Expenses" in the sidebar
2. Click the "+ Add Expense" button
3. Fill in: Amount, Date, Category, Account
4. Click "Save expense"
Your account balance updates automatically! 💸`,
        action: { label: 'Go to Expenses', path: '/expenses' },
    },
    {
        keywords: ['add income', 'got paid', 'salary', 'received'],
        response: `To add income:
1. Click "Income" in the sidebar  
2. Click "+ Add Income"
3. Fill in: Amount, Date, Category, Account
4. Save — your balance increases automatically! 💰`,
        action: { label: 'Go to Income', path: '/income' },
    },
    {
        keywords: ['transfer', 'move money', 'send money'],
        response: `To transfer between accounts:
1. Go to "Transfers" page
2. Click "+ New Transfer"
3. Select From Account and To Account
4. Enter amount and date
5. Save — both balances update instantly! ↔️`,
        action: { label: 'Go to Transfers', path: '/transfers' },
    },
    {
        keywords: ['debt', 'loan', 'borrow', 'lend', 'owe'],
        response: `To track debts:
1. Go to "Debts" page
2. Click "+ Add Debt"
3. Choose type:
   • "I Owe" (DEBT) = you borrowed from someone
   • "Owed to Me" (RECEIVABLE) = you lent to someone
4. When paid, click "Repay" to mark it settled 🤝`,
        action: { label: 'Go to Debts', path: '/debts' },
    },
    {
        keywords: ['budget', 'limit', 'plan', 'spending limit'],
        response: `To set a budget:
1. Go to "Budget" page
2. Set your monthly income goal
3. Set spending limits per category
4. System warns you when approaching limits 🎯`,
        action: { label: 'Go to Budget', path: '/budget' },
    },
    {
        keywords: ['account', 'card', 'wallet', 'cash'],
        response: `To manage accounts:
1. Go to "Accounts" page
2. Click "+ Add Account"
3. Choose type: Cash or Bank Card
4. Set currency (UZS, USD, EUR)
5. Enter initial balance 💳`,
        action: { label: 'Go to Accounts', path: '/accounts' },
    },
    {
        keywords: ['category', 'categories'],
        response: `To manage categories:
1. Go to "Categories" page
2. Switch between Expense/Income tabs
3. Default categories are auto-created
4. Add custom categories anytime 📂`,
        action: { label: 'Go to Categories', path: '/categories' },
    },
    {
        keywords: ['statistics', 'stats', 'chart', 'analytics', 'report'],
        response: `View your financial reports:
1. Go to "Statistics" page
2. Select period: Daily/Weekly/Monthly/Yearly
3. See: Income vs Expenses chart
4. Category ranking bars and balance trends
5. Balance trend over time 📊`,
        action: { label: 'Go to Statistics', path: '/statistics' },
    },
    {
        keywords: ['calendar', 'history', 'transactions by date'],
        response: `View transactions by date:
1. Go to "Calendar" page
2. Click any date to see transactions
3. Green dot = income that day
4. Red dot = expense that day 📅`,
        action: { label: 'Go to Calendar', path: '/calendar' },
    },
    {
        keywords: ['help', 'what can you do', 'features', 'how'],
        response: `I can help you with:
💸 Adding expenses & income
↔️ Transferring between accounts  
🤝 Tracking debts & loans
🎯 Setting budgets & limits
📊 Viewing financial statistics
📅 Calendar transaction view
💳 Managing accounts & cards
📂 Managing categories

Just type what you want to do!`,
    },
];
const QUICK_SUGGESTIONS = [
    'Add an expense',
    'Track a debt',
    'Set a budget',
    'View statistics',
];
const getBotResponse = (input) => {
    const lower = input.toLowerCase();
    const rule = BOT_RULES.find(r => r.keywords.some(k => lower.includes(k)));
    return rule
        ? rule.response
        : `I'm not sure about that. Try asking:
- "How do I add an expense?"
- "How do I track a debt?"
- "How do I set a budget?"
- "What features do you have?"`;
};
const WEATHER_CODE_LABELS = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};
const Chatbot = () => {
    const navigate = useNavigate();
    const isCompactLayout = useMediaQuery('(max-width: 1024px)');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: '0',
            role: 'assistant',
            text: 'Hi! I am your Finly guide. Ask me how to add expenses, move money, track debts, set budgets, or check your statistics. Or continue using the powerful Telegram bot for even faster access! 🤖',
            showTelegramButton: true,
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [userSummary, setUserSummary] = useState('');
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    useEffect(() => {
        let cancelled = false;
        const numeric = (val) => (Number.isFinite(val) ? val : 0);
        const loadSummary = async () => {
            try {
                const [summaryRes, debtsRes] = await Promise.allSettled([statsApi.summary(), debtsApi.getAll()]);
                const summaryData = summaryRes.status === 'fulfilled' ? unwrap(summaryRes.value) || {} : {};
                const debts = debtsRes.status === 'fulfilled' ? safeArray(unwrap(debtsRes.value)) : [];
                const openDebts = debts.filter(d => String(d.status || 'OPEN').toUpperCase() !== 'CLOSED');
                const debtTotal = openDebts.reduce((sum, debt) => sum + Number(debt.amount || 0), 0);
                const balance = numeric(Number(summaryData.totalBalance ?? summaryData.balance ?? 0));
                const income = numeric(Number(summaryData.totalIncome ?? summaryData.monthlyIncome ?? 0));
                const expenses = numeric(Number(summaryData.totalExpense ?? summaryData.monthlyExpense ?? 0));
                const summaryText = [
                    `Balance ${balance.toFixed(2)}`,
                    `Income ${income.toFixed(2)}`,
                    `Expenses ${expenses.toFixed(2)}`,
                    openDebts.length ? `Open debts ${openDebts.length} totaling ${debtTotal.toFixed(2)}` : null,
                ]
                    .filter(Boolean)
                    .join('; ');
                if (!cancelled)
                    setUserSummary(summaryText);
            }
            catch {
                if (!cancelled)
                    setUserSummary('');
            }
        };
        loadSummary();
        return () => {
            cancelled = true;
        };
    }, []);
    const resolveAccountId = async (accountHint) => {
        const response = await accountsApi.getAll();
        const accounts = safeArray(response.data);
        if (!accounts.length)
            return null;
        if (!accountHint)
            return accounts.length === 1 ? String(accounts[0]?.id ?? '') : null;
        const hint = accountHint.toLowerCase().trim();
        if (hint === 'cash' || hint.includes('wallet')) {
            const cash = accounts.find((acc) => String(acc.type || '').toUpperCase() === 'CASH');
            if (cash?.id)
                return String(cash.id);
        }
        const exact = accounts.find((acc) => String(acc.name || '').toLowerCase() === hint);
        if (exact?.id)
            return String(exact.id);
        const fuzzy = accounts.find((acc) => String(acc.name || '').toLowerCase().includes(hint));
        return fuzzy?.id ? String(fuzzy.id) : null;
    };
    const resolveExpenseCategoryId = async (categoryHint) => {
        const response = await categoriesService.getByType('EXPENSE');
        const categories = safeArray(response.data);
        if (!categories.length)
            return null;
        if (!categoryHint) {
            const fallback = categories.find((c) => String(c.name || '').toLowerCase() === 'other');
            return String((fallback || categories[0])?.id ?? '');
        }
        const hint = categoryHint.toLowerCase().trim();
        const exact = categories.find((cat) => String(cat.name || '').toLowerCase() === hint);
        if (exact?.id)
            return String(exact.id);
        const fuzzy = categories.find((cat) => String(cat.name || '').toLowerCase().includes(hint));
        if (fuzzy?.id)
            return String(fuzzy.id);
        const fallback = categories.find((c) => String(c.name || '').toLowerCase() === 'other');
        return String((fallback || categories[0])?.id ?? '');
    };
    const resolveIncomeCategoryId = async (categoryHint) => {
        const response = await categoriesService.getByType('INCOME');
        const categories = safeArray(response.data);
        if (!categories.length)
            return null;
        if (!categoryHint) {
            const fallback = categories.find((c) => String(c.name || '').toLowerCase() === 'other');
            return String((fallback || categories[0])?.id ?? '');
        }
        const hint = categoryHint.toLowerCase().trim();
        const exact = categories.find((cat) => String(cat.name || '').toLowerCase() === hint);
        if (exact?.id)
            return String(exact.id);
        const fuzzy = categories.find((cat) => String(cat.name || '').toLowerCase().includes(hint));
        if (fuzzy?.id)
            return String(fuzzy.id);
        const fallback = categories.find((c) => String(c.name || '').toLowerCase() === 'other');
        return String((fallback || categories[0])?.id ?? '');
    };
    const handleUtilityQuery = async (messageText) => {
        const lower = messageText.toLowerCase().trim();
        const lastDaysMatch = lower.match(/last\s+(\d{1,3})\s+day/);
        const wantsExpenseHistory = /(expense|spent|spending)/.test(lower)
            && (Boolean(lastDaysMatch) || /recent|today|yesterday/.test(lower));
        if (wantsExpenseHistory) {
            const days = Math.max(1, Math.min(365, Number(lastDaysMatch?.[1] || 5)));
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - (days - 1));
            const toIso = (d) => d.toISOString().slice(0, 10);
            const [expensesRes, accountsRes] = await Promise.all([
                expensesApi.getAll({ startDate: toIso(start), endDate: toIso(end) }),
                accountsApi.getAll(),
            ]);
            const expenses = safeArray(unwrap(expensesRes));
            const accounts = safeArray(accountsRes.data);
            const accountMap = new Map(accounts.map((a) => [String(a.id), String(a.name || 'Unknown account')]));
            if (!expenses.length) {
                return `No expenses found in the last ${days} day(s).`;
            }
            const ordered = [...expenses].sort((a, b) => {
                const aDate = new Date(a.expenseDate || a.date || 0).getTime();
                const bDate = new Date(b.expenseDate || b.date || 0).getTime();
                return bDate - aDate;
            });
            const total = ordered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            const lines = ordered.slice(0, 12).map((item) => {
                const date = String(item.expenseDate || item.date || '').slice(0, 10) || 'N/A';
                const accountName = accountMap.get(String(item.accountId || '')) || 'Unknown account';
                const amount = Number(item.amount || 0);
                const currency = String(item.currency || 'USD');
                const description = String(item.description || 'Expense');
                return `- ${date} | ${description} | ${amount} ${currency} | ${accountName}`;
            });
            return [
                `Expenses for the last ${days} day(s):`,
                ...lines,
                `Total: ${total.toFixed(2)}`,
            ].join('\n');
        }
        if (/weather|temperature|forecast/.test(lower)) {
            const cityMatch = lower.match(/(?:in|for)\s+([a-z\s\-]{2,40})/i);
            const city = (cityMatch?.[1] || 'Tashkent').trim();
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoJson = await geoRes.json().catch(() => ({}));
            const place = safeArray(geoJson?.results)?.[0];
            if (!place) {
                return `I could not find weather location for "${city}".`;
            }
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m`);
            const weatherJson = await weatherRes.json().catch(() => ({}));
            const current = weatherJson?.current || {};
            const temp = Number(current.temperature_2m);
            const code = Number(current.weather_code);
            const wind = Number(current.wind_speed_10m);
            const label = WEATHER_CODE_LABELS[code] || 'Unknown conditions';
            return `Weather in ${place.name}: ${label}, ${Number.isFinite(temp) ? `${temp}°C` : 'N/A'}, wind ${Number.isFinite(wind) ? `${wind} km/h` : 'N/A'}.`;
        }
        return null;
    };
    const runAction = async (action) => {
        if (action.type === 'NONE')
            return null;
        const data = action.data || action.payload || {};
        if (action.type === 'NAVIGATE' && action.path) {
            navigate(action.path);
            sounds.click();
            toast.success(`Opened ${action.path}`);
            return `Opened ${action.path}`;
        }
        if (action.type === 'ADD_EXPENSE') {
            const amount = Number(data.amount);
            const expenseDate = data.expenseDate || new Date().toISOString().slice(0, 10);
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error('Please tell the expense amount (for example: 12000 UZS).');
            }
            const accountId = await resolveAccountId(data.accountHint);
            if (!accountId)
                throw new Error('Please tell me which account/card you used for this expense.');
            const categoryId = await resolveExpenseCategoryId(data.categoryHint);
            if (!categoryId)
                throw new Error('No expense category found.');
            await expensesApi.create({
                amount,
                expenseDate,
                description: data.description || 'Added via Finly AI Assistant',
                categoryId,
                accountId,
                currency: data.currency || 'USD',
            });
            sounds.expense();
            toast.success('Expense added successfully');
            return 'Expense recorded successfully.';
        }
        if (action.type === 'ADD_INCOME') {
            const amount = Number(data.amount);
            const incomeDate = data.incomeDate || data.expenseDate || new Date().toISOString().slice(0, 10);
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error('Please tell the income amount (for example: 250000 UZS).');
            }
            const accountId = await resolveAccountId(data.accountHint);
            if (!accountId)
                throw new Error('Please tell me which account/card should receive this income.');
            const categoryId = await resolveIncomeCategoryId(data.categoryHint);
            if (!categoryId)
                throw new Error('No income category found.');
            await incomeApi.create({
                amount,
                incomeDate,
                description: data.description || 'Added via Finly AI Assistant',
                categoryId,
                accountId,
                currency: data.currency || 'USD',
            });
            sounds.notification();
            toast.success('Income added successfully');
            return 'Income recorded successfully.';
        }
        if (action.type === 'ADD_DEBT') {
            const amount = Number(data.amount ?? data.depositAmount);
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error('Please tell the debt amount.');
            }
            if (!String(data.personName || '').trim()) {
                throw new Error('Whom is this debt with? Please share the person name.');
            }
            const accountId = await resolveAccountId(data.accountHint);
            if (!accountId)
                throw new Error('Please tell me which account/card this debt used.');
            const dueDate = data.dueDate;
            if (!dueDate) {
                throw new Error('Please provide a deadline for this debt (for example: next Monday or 2026-03-30).');
            }
            await debtsApi.create({
                personName: data.personName || 'Unknown person',
                amount,
                currency: data.currency || 'USD',
                accountId,
                description: data.description || 'Added via Finly AI Assistant',
                dueDate,
                type: data.debtType || 'DEBT',
            });
            const daysLeft = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            sounds.notification();
            toast.success(`Debt added successfully (${daysLeft} day(s) left)`);
            return `Debt recorded. Deadline in ${daysLeft} day(s).`;
        }
        if (action.type === 'UPDATE_SAVINGS') {
            const deposit = Number(data.depositAmount ?? data.amount);
            if (!Number.isFinite(deposit) || deposit <= 0) {
                throw new Error('AI could not detect a valid savings amount.');
            }
            toast.success(`Savings update noted for ${data.goalName || 'your goal'}: ${deposit}`);
            return 'Savings update recorded.';
        }
        if (action.type === 'SET_BUDGET') {
            const limit = Number(data.budgetLimit ?? data.amount ?? data.depositAmount);
            if (!Number.isFinite(limit) || limit <= 0) {
                throw new Error('AI could not detect a valid budget limit.');
            }
            const categoryId = await resolveExpenseCategoryId(data.budgetCategory || data.categoryHint);
            if (!categoryId)
                throw new Error('No budget category found.');
            const today = new Date();
            await budgetService.create({
                categoryId,
                type: 'MONTHLY',
                monthlyLimit: limit,
                year: today.getFullYear(),
                month: today.getMonth() + 1,
            });
            sounds.notification();
            toast.success('Budget updated successfully');
            return 'Budget limit saved.';
        }
        if (action.type === 'ANALYZE_STATS') {
            const query = data.statsQuery || 'spending_habits';
            window.dispatchEvent(new CustomEvent('show-stats', { detail: query }));
            navigate('/statistics');
            sounds.notification();
            toast.success('Showing statistics insights');
            return `Statistics analysis requested for ${query.replace('_', ' ')}.`;
        }
        return null;
    };
    const handleSendMessage = (text) => {
        const messageText = (text || inputValue).trim();
        if (!messageText || isTyping)
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: messageText,
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setShowSuggestions(false);
        setIsTyping(true);
        setTimeout(async () => {
            try {
                const utilityReply = await handleUtilityQuery(messageText);
                if (utilityReply) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            text: utilityReply,
                        },
                    ]);
                    return;
                }
                const aiResult = await aiChatService.respond(messageText, userSummary);
                const fallback = getBotResponse(messageText);
                const displayText = (aiResult?.reply && aiResult.reply.trim()) ? aiResult.reply : fallback;
                const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: displayText,
                    // Suggest Telegram on second interaction
                    showTelegramButton: messages.length <= 2,
                };
                const actionOutcome = await runAction(aiResult.action);
                const toolCallMessage = aiResult.action.type !== 'NONE' && actionOutcome
                    ? {
                        id: (Date.now() + 2).toString(),
                        role: 'tool',
                        text: actionOutcome,
                        toolName: 'ai-action',
                    }
                    : null;
                setMessages(prev => [...prev, assistantMessage, ...(toolCallMessage ? [toolCallMessage] : [])]);
            }
            catch (error) {
                sounds.error();
                toast.error('I need a bit more detail before I can execute that.');
                const message = error instanceof Error ? error.message : 'Unexpected AI error';
                setMessages(prev => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        text: `I couldn't complete that automatically. ${message}`,
                    },
                ]);
            }
            finally {
                setIsTyping(false);
            }
        }, 520);
    };
    const openTelegramBot = () => {
        window.open('https://t.me/Finly_smart_bot', '_blank');
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), type: "button", style: {
                    position: 'fixed',
                    bottom: isCompactLayout ? 86 : 24,
                    right: isCompactLayout ? 16 : 24,
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 14px 34px rgba(30, 64, 175, 0.38)',
                    zIndex: 1000,
                    animation: isOpen ? 'none' : 'pulseFloat 3.4s ease-in-out infinite',
                    transition: 'transform 0.18s ease, box-shadow 0.2s ease',
                }, onMouseEnter: e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(30, 64, 175, 0.42)';
                }, onMouseLeave: e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 14px 34px rgba(30, 64, 175, 0.38)';
                }, children: isOpen ? _jsx(X, { size: 24 }) : _jsx(MessageCircle, { size: 24 }) }), isOpen && (_jsxs("div", { className: "ledger-enter", style: {
                    position: 'fixed',
                    bottom: isCompactLayout ? 154 : 96,
                    right: isCompactLayout ? 12 : 24,
                    width: isCompactLayout ? 'calc(100vw - 24px)' : 'min(410px, calc(100vw - 24px))',
                    height: isCompactLayout ? 'min(560px, calc(100vh - 190px))' : 'min(620px, calc(100vh - 128px))',
                    background: 'linear-gradient(165deg, rgba(255,255,255,0.84), rgba(225,240,255,0.7))',
                    borderRadius: 22,
                    boxShadow: '0 28px 65px rgba(15,23,42,0.18), 0 16px 30px rgba(30,64,175,0.16)',
                    border: '1px solid rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(18px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(130%)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }, children: [_jsxs("div", { style: {
                            background: 'linear-gradient(135deg, rgba(30,64,175,0.96) 0%, rgba(3,105,161,0.95) 100%)',
                            color: '#e2ecff',
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.16)',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: {
                                            width: 34,
                                            height: 34,
                                            borderRadius: 11,
                                            background: 'rgba(255,255,255,0.2)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(255,255,255,0.24)',
                                        }, children: _jsx(Bot, { size: 18 }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 800, fontSize: 14, lineHeight: 1.1 }, children: "Finly Guide" }), _jsxs("div", { style: { fontSize: 11, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx(Sparkles, { size: 12 }), "Streaming replies"] })] })] }), _jsx("button", { onClick: () => setIsOpen(false), type: "button", style: {
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 10,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: 6,
                                    display: 'inline-flex',
                                }, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { style: {
                            flex: 1,
                            overflow: 'auto',
                            padding: 14,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                        }, children: [messages.map(msg => (_jsx("div", { children: msg.role === 'user' ? (_jsx("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        marginBottom: 2,
                                    }, children: _jsx("div", { style: {
                                            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                                            color: '#fff',
                                            borderRadius: 14,
                                            padding: '10px 12px',
                                            maxWidth: '86%',
                                            wordBreak: 'break-word',
                                            fontSize: 13.5,
                                            whiteSpace: 'pre-wrap',
                                            boxShadow: '0 10px 22px rgba(30,64,175,0.25)',
                                        }, children: msg.text }) })) : msg.role === 'assistant' ? (_jsxs("div", { style: { display: 'flex', justifyContent: 'flex-start', gap: 8 }, children: [_jsx("span", { style: {
                                                width: 28,
                                                height: 28,
                                                borderRadius: 10,
                                                background: 'rgba(30,64,175,0.12)',
                                                color: '#1d4ed8',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }, children: _jsx(Bot, { size: 16 }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                                        background: 'rgba(255,255,255,0.7)',
                                                        borderRadius: 14,
                                                        padding: '10px 12px',
                                                        fontSize: 13.5,
                                                        whiteSpace: 'pre-wrap',
                                                        color: '#0f172a',
                                                        border: '1px solid rgba(214,227,255,0.88)',
                                                        backdropFilter: 'blur(8px)',
                                                        WebkitBackdropFilter: 'blur(8px)',
                                                    }, children: msg.text }), msg.showTelegramButton && (_jsxs("button", { onClick: openTelegramBot, type: "button", className: "banking-pulse", style: {
                                                        marginTop: 10,
                                                        background: 'linear-gradient(135deg, #0088cc, #00a8e8)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 10,
                                                        padding: '10px 14px',
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                    }, children: [_jsx("span", { children: "\uD83D\uDCAC" }), " Join Telegram Bot (@Finly_smart_bot)"] }))] })] })) : (_jsx("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        paddingLeft: 36,
                                    }, children: _jsxs("div", { style: {
                                            width: '100%',
                                            background: 'rgba(224,235,255,0.65)',
                                            border: '1px dashed rgba(96,165,250,0.75)',
                                            borderRadius: 12,
                                            padding: '8px 10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: '#1e3a8a',
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }, children: [_jsx(Wrench, { size: 14 }), _jsx("span", { style: { opacity: 0.8 }, children: msg.toolName || 'tool' }), _jsx("span", { style: { opacity: 0.55 }, children: "\u2022" }), _jsx("span", { children: msg.text })] }) })) }, msg.id))), isTyping && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: {
                                            width: 28,
                                            height: 28,
                                            borderRadius: 10,
                                            background: 'rgba(30,64,175,0.12)',
                                            color: '#1d4ed8',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }, children: _jsx(TerminalSquare, { size: 16 }) }), _jsx("div", { style: {
                                            borderRadius: 12,
                                            padding: '9px 12px',
                                            background: 'rgba(255,255,255,0.72)',
                                            border: '1px solid rgba(214,227,255,0.88)',
                                            color: '#1e3a8a',
                                            fontSize: 12.5,
                                        }, children: "Agent is typing..." })] })), _jsx("div", { ref: messagesEndRef })] }), showSuggestions && messages.length === 1 && (_jsx("div", { style: { padding: '10px 12px', borderTop: '1px solid rgba(214,227,255,0.82)' }, children: _jsx("div", { style: {
                                display: 'flex',
                                gap: 7,
                                flexWrap: 'wrap',
                            }, children: QUICK_SUGGESTIONS.map(suggestion => (_jsx("button", { onClick: () => handleSendMessage(suggestion), type: "button", style: {
                                    background: 'rgba(255,255,255,0.72)',
                                    border: '1px solid rgba(214,227,255,0.95)',
                                    borderRadius: 10,
                                    padding: '7px 10px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#1e3a8a',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }, children: suggestion }, suggestion))) }) })), _jsxs("div", { style: {
                            display: 'flex',
                            gap: 8,
                            padding: 12,
                            borderTop: '1px solid rgba(214,227,255,0.82)',
                            background: 'rgba(245,250,255,0.82)',
                        }, children: [_jsx("input", { type: "text", value: inputValue, onChange: e => setInputValue(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSendMessage(), placeholder: "Ask your finance assistant...", style: {
                                    flex: 1,
                                    border: '1px solid rgba(191,219,254,0.9)',
                                    borderRadius: 10,
                                    padding: '10px 11px',
                                    fontSize: 13.5,
                                    outline: 'none',
                                    background: 'rgba(255,255,255,0.9)',
                                } }), _jsx("button", { onClick: () => handleSendMessage(), type: "button", style: {
                                    background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '9px 11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 24px rgba(30,64,175,0.28)',
                                }, children: _jsx(Send, { size: 16 }) })] })] })), _jsx("style", { children: `
        @keyframes pulseFloat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.04);
          }
        }

        @media (max-width: 640px) {
          .ledger-enter {
            right: 12px !important;
            bottom: 84px !important;
            width: calc(100vw - 24px) !important;
            height: min(72vh, 560px) !important;
          }
        }
      ` })] }));
};
export default Chatbot;
