import { AI_API_BASE_URL, AI_API_KEY, AI_MODEL } from '../lib/config';
import { telegramService } from './telegram.service';
const SYSTEM_PROMPT = `
You are the Finly AI Executive. You have full control to manage:
- TRANSACTIONS (Income/Expense)
- DEBTS (Lending/Borrowing)
- SAVINGS (Goals/Targets)
- BUDGETS (Limits/Analysis)

DATE LOGIC:
- Today is ${new Date().toLocaleDateString()}. 
- If the user says "Next Monday", calculate that date in YYYY-MM-DD format.

TOOLS:
1. ADD_EXPENSE:
  Payload: { "amount": number, "description": string, "account": string, "category": string, "expenseDate": "YYYY-MM-DD" }

2. ADD_INCOME:
  Payload: { "amount": number, "description": string, "account": string, "category": string, "incomeDate": "YYYY-MM-DD" }

1. ADD_DEBT: Use this for "I gave money to X" (LOAN) or "I took money from X" (DEBT).
   Payload: { "title": string, "amount": number, "type": "LOAN" | "DEBT", "person": string, "dueDate": "YYYY-MM-DD" }

2. UPDATE_SAVINGS: { "goalName": string, "depositAmount": number }

3. SET_BUDGET: { "category": string, "limit": number, "period": "MONTHLY" }

4. ANALYZE_STATS: { "query": "spending_habits" | "debt_risk" | "savings_progress" }

IMPORTANT:
- If user asks outside finance (e.g. weather/general chat), reply naturally and set action.type to "NONE".
- If required transaction details are missing, ask a follow-up question and set action.type to "NONE".

RESPONSE FORMAT (json only):
- Return valid json only.
- Do not include markdown fences.
- Do not include explanatory text outside json.
{
  "reply": "I've noted that Sardor owes you 50,000. I'll remind you next Monday.",
  "action": { "type": "ADD_DEBT", "payload": { ... } }
}
`.trim();
const extractJson = (text) => {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first)
        return '';
    return text.slice(first, last + 1);
};
const toNumber = (value) => {
    const num = typeof value === 'string' ? Number(value.trim()) : typeof value === 'number' ? value : NaN;
    return Number.isFinite(num) ? num : undefined;
};
const formatIsoDate = (date) => date.toISOString().slice(0, 10);
const normalizeRelativeDate = (input) => {
    if (!input)
        return undefined;
    const raw = input.trim();
    if (!raw)
        return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw))
        return raw;
    const lower = raw.toLowerCase();
    const today = new Date();
    if (lower === 'today')
        return formatIsoDate(today);
    if (lower === 'tomorrow') {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return formatIsoDate(d);
    }
    const nextMatch = lower.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
    if (nextMatch) {
        const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(nextMatch[1]);
        const currentDay = today.getDay();
        const daysAhead = (7 - currentDay + targetDay) % 7 || 7;
        const d = new Date(today);
        d.setDate(d.getDate() + daysAhead);
        return formatIsoDate(d);
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime()))
        return formatIsoDate(parsed);
    return undefined;
};
const normalizeDebtType = (value) => {
    if (!value)
        return undefined;
    const v = value.toString().toUpperCase();
    if (v === 'RECEIVABLE' || v === 'LOAN')
        return 'RECEIVABLE';
    if (v === 'DEBT')
        return 'DEBT';
    return undefined;
};
const normalizeActionType = (rawType, payload) => {
    const type = String(rawType || '').trim().toUpperCase();
    if (!type)
        return 'NONE';
    const explicitMap = {
        NAVIGATE: 'NAVIGATE',
        OPEN_PAGE: 'NAVIGATE',
        GO_TO_PAGE: 'NAVIGATE',
        ADD_EXPENSE: 'ADD_EXPENSE',
        CREATE_EXPENSE: 'ADD_EXPENSE',
        NEW_EXPENSE: 'ADD_EXPENSE',
        ADD_INCOME: 'ADD_INCOME',
        CREATE_INCOME: 'ADD_INCOME',
        NEW_INCOME: 'ADD_INCOME',
        ADD_DEBT: 'ADD_DEBT',
        CREATE_DEBT: 'ADD_DEBT',
        UPDATE_SAVINGS: 'UPDATE_SAVINGS',
        SET_BUDGET: 'SET_BUDGET',
        ANALYZE_STATS: 'ANALYZE_STATS',
        NONE: 'NONE',
    };
    if (explicitMap[type])
        return explicitMap[type];
    // Some models return generic transaction types such as UPDATE_TRANSACTION.
    if (type === 'UPDATE_TRANSACTION' || type === 'ADD_TRANSACTION' || type === 'CREATE_TRANSACTION') {
        const transactionType = String(payload.transactionType || payload.kind || '').toLowerCase();
        if (transactionType.includes('income'))
            return 'ADD_INCOME';
        if (transactionType.includes('expense'))
            return 'ADD_EXPENSE';
        if (transactionType.includes('debt') || transactionType.includes('loan'))
            return 'ADD_DEBT';
        const signedAmount = toNumber(payload.amount);
        if (Number.isFinite(signedAmount) && signedAmount < 0)
            return 'ADD_EXPENSE';
        return 'ADD_EXPENSE';
    }
    return 'NONE';
};
const normalizeAction = (action) => {
    if (!action || typeof action !== 'object')
        return { type: 'NONE' };
    const payload = (action.payload || action.data || {});
    const data = {
        title: payload.title,
        amount: toNumber(payload.amount),
        currency: payload.currency,
        description: payload.description || payload.title,
        expenseDate: normalizeRelativeDate(payload.expenseDate || payload.date),
        incomeDate: normalizeRelativeDate(payload.incomeDate || payload.date),
        categoryHint: payload.categoryHint || payload.category,
        accountHint: payload.accountHint || payload.account,
        personName: payload.personName || payload.person,
        debtType: normalizeDebtType(payload.type || payload.debtType),
        dueDate: normalizeRelativeDate(payload.dueDate || payload.due_date),
        goalName: payload.goalName || payload.goal,
        depositAmount: toNumber(payload.depositAmount ?? payload.amount),
        budgetCategory: payload.category || payload.categoryHint,
        budgetLimit: toNumber(payload.limit ?? payload.monthlyLimit),
        budgetPeriod: payload.period,
        statsQuery: payload.query,
    };
    return {
        type: normalizeActionType(action.type, payload),
        path: action.path,
        data,
        payload: data,
    };
};
const formatMoney = (amount, currency) => {
    if (!Number.isFinite(amount || NaN))
        return 'N/A';
    return `${amount} ${currency || 'USD'}`;
};
const buildAddDebtTelegramMessage = (action) => {
    const data = action.data || action.payload || {};
    if (action.type !== 'ADD_DEBT')
        return null;
    const person = data.personName || 'Unknown person';
    const amount = formatMoney(data.amount, data.currency);
    const date = data.dueDate || normalizeRelativeDate('today') || 'N/A';
    return ['<b>New Debt Recorded</b>', `<b>Person:</b> ${person}`, `<b>Amount:</b> ${amount}`, `<b>Date:</b> ${date}`].join('\n');
};
export const handleAIAction = async (action) => {
    if (!action || typeof action !== 'object')
        return null;
    const payload = (action.payload || action.data || {});
    if (payload.amount !== undefined)
        payload.amount = Number(payload.amount);
    if (payload.limit !== undefined)
        payload.limit = Number(payload.limit);
    if (payload.depositAmount !== undefined)
        payload.depositAmount = Number(payload.depositAmount);
    switch (action.type) {
        case 'ADD_DEBT': {
            const res = await fetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: payload.title || `Loan to ${payload.person || payload.personName || 'Unknown person'}`,
                    amount: payload.amount,
                    type: payload.type || 'LOAN',
                    person: payload.person || payload.personName,
                    dueDate: normalizeRelativeDate(payload.dueDate || payload.date),
                    status: 'PENDING',
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`ADD_DEBT failed: ${res.status} ${text}`);
            }
            const person = payload.person || payload.personName || 'Unknown person';
            const amount = Number.isFinite(payload.amount) ? payload.amount : 0;
            await telegramService.sendMessage(`✅ <b>Success!</b>\nI added a debt of ${amount} UZS for <b>${person}</b>.`);
            return 'Debt recorded.';
        }
        case 'ANALYZE_STATS':
            window.dispatchEvent(new CustomEvent('show-stats', { detail: payload.query }));
            return 'Statistics analysis requested.';
        case 'SET_BUDGET': {
            const res = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: payload.category || payload.categoryHint,
                    limit: payload.limit,
                    period: payload.period || 'MONTHLY',
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`SET_BUDGET failed: ${res.status} ${text}`);
            }
            return 'Budget updated.';
        }
        case 'UPDATE_SAVINGS': {
            const res = await fetch('/api/savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goalName: payload.goalName,
                    depositAmount: payload.depositAmount ?? payload.amount,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`UPDATE_SAVINGS failed: ${res.status} ${text}`);
            }
            return 'Savings updated.';
        }
        default:
            return null;
    }
};
export const aiChatService = {
    isConfigured: () => AI_API_KEY.trim().length > 0,
    async respond(userText, userSummary) {
        if (!this.isConfigured()) {
            return {
                reply: 'AI key is not configured yet. Add VITE_AI_API_KEY in .env.local and restart the app.',
                action: { type: 'NONE' },
            };
        }
        const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
                model: AI_MODEL,
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'system', content: `CURRENT_USER_DATA: ${userSummary?.trim() || 'Not provided'}` },
                    { role: 'user', content: userText },
                ],
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`AI request failed: ${res.status} ${text}`);
        }
        const payload = await res.json();
        const content = String(payload?.choices?.[0]?.message?.content ?? '');
        const parsed = JSON.parse(extractJson(content) || '{}');
        const action = normalizeAction(parsed?.action);
        if (action.type === 'ADD_DEBT') {
            const message = buildAddDebtTelegramMessage(action);
            if (message) {
                telegramService.sendMessage(message).catch(err => {
                    console.error('[ai-chat] telegram notification failed', err);
                });
            }
        }
        return {
            reply: parsed?.reply || 'Done. Tell me what you want to do next.',
            action: action || { type: 'NONE' },
        };
    },
    handleAction: handleAIAction,
};
