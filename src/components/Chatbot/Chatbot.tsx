import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Bot, Sparkles, Wrench, TerminalSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  text: string
  action?: { label: string; path: string }
  toolName?: string
}

interface BotRule {
  keywords: string[]
  response: string
  action?: { label: string; path: string }
}

const BOT_RULES: BotRule[] = [
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
4. Category breakdown pie chart
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
]

const QUICK_SUGGESTIONS = [
  'Add an expense',
  'Track a debt',
  'Set a budget',
  'View statistics',
]

const getBotResponse = (input: string): { response: string; action?: { label: string; path: string } } => {
  const lower = input.toLowerCase()
  const rule = BOT_RULES.find(r => r.keywords.some(k => lower.includes(k)))
  return rule
    ? { response: rule.response, action: rule.action }
    : {
        response: `I'm not sure about that. Try asking:
- "How do I add an expense?"
- "How do I track a debt?"
- "How do I set a budget?"
- "What features do you have?"`,
      }
}

const Chatbot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I am your Finly assistant. Ask me anything about expenses, income, budgets, debts, and reports.',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text?: string) => {
    const messageText = (text || inputValue).trim()
    if (!messageText || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setShowSuggestions(false)
    setIsTyping(true)

    setTimeout(() => {
      const { response, action } = getBotResponse(messageText)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response,
        action,
      }

      const toolCallMessage: ChatMessage | null = action
        ? {
            id: (Date.now() + 2).toString(),
            role: 'tool',
            text: `Ready action: navigate to ${action.path}`,
            toolName: 'navigate',
          }
        : null

      setMessages(prev => [...prev, assistantMessage, ...(toolCallMessage ? [toolCallMessage] : [])])
      setIsTyping(false)
    }, 520)
  }

  const handleActionClick = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 18px 40px rgba(30, 64, 175, 0.42)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 14px 34px rgba(30, 64, 175, 0.38)'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="ledger-enter"
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 'min(410px, calc(100vw - 24px))',
            height: 'min(620px, calc(100vh - 128px))',
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
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30,64,175,0.96) 0%, rgba(3,105,161,0.95) 100%)',
              color: '#e2ecff',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.24)',
                }}
              >
                <Bot size={18} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Finly AI Agent</div>
                <div style={{ fontSize: 11, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={12} />
                  Streaming replies
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                color: '#fff',
                cursor: 'pointer',
                padding: 6,
                display: 'inline-flex',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginBottom: 2,
                    }}
                  >
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                        color: '#fff',
                        borderRadius: 14,
                        padding: '10px 12px',
                        maxWidth: '86%',
                        wordBreak: 'break-word',
                        fontSize: 13.5,
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 10px 22px rgba(30,64,175,0.25)',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : msg.role === 'assistant' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8 }}>
                    <span
                      style={{
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
                      }}
                    >
                      <Bot size={16} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: 14,
                          padding: '10px 12px',
                          fontSize: 13.5,
                          whiteSpace: 'pre-wrap',
                          color: '#0f172a',
                          border: '1px solid rgba(214,227,255,0.88)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                      >
                        {msg.text}
                      </div>
                      {msg.action && (
                        <button
                          onClick={() => handleActionClick(msg.action!.path)}
                          type="button"
                          className="banking-pulse"
                          style={{
                            marginTop: 8,
                            background: 'linear-gradient(135deg, #1e3a8a, #0369a1)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 11px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {msg.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      paddingLeft: 36,
                    }}
                  >
                    <div
                      style={{
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
                      }}
                    >
                      <Wrench size={14} />
                      <span style={{ opacity: 0.8 }}>{msg.toolName || 'tool'}</span>
                      <span style={{ opacity: 0.55 }}>•</span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background: 'rgba(30,64,175,0.12)',
                    color: '#1d4ed8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TerminalSquare size={16} />
                </span>
                <div
                  style={{
                    borderRadius: 12,
                    padding: '9px 12px',
                    background: 'rgba(255,255,255,0.72)',
                    border: '1px solid rgba(214,227,255,0.88)',
                    color: '#1e3a8a',
                    fontSize: 12.5,
                  }}
                >
                  Agent is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(214,227,255,0.82)' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 7,
                  flexWrap: 'wrap',
                }}
              >
                {QUICK_SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    type="button"
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(214,227,255,0.95)',
                      borderRadius: 10,
                      padding: '7px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#1e3a8a',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 12,
              borderTop: '1px solid rgba(214,227,255,0.82)',
              background: 'rgba(245,250,255,0.82)',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your finance assistant..."
              style={{
                flex: 1,
                border: '1px solid rgba(191,219,254,0.9)',
                borderRadius: 10,
                padding: '10px 11px',
                fontSize: 13.5,
                outline: 'none',
                background: 'rgba(255,255,255,0.9)',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              type="button"
              style={{
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
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
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
      `}</style>
    </>
  )
}

export default Chatbot
