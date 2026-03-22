import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  action?: { label: string; path: string }
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
4. Set currency (UZS, USD, EUR, RUB)
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      text: 'Hi! I\'m your Finly assistant 👋\n\nHow can I help you manage your finances today?',
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
    if (!messageText) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setShowSuggestions(false)

    setTimeout(() => {
      const { response, action } = getBotResponse(messageText)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response,
        action,
      }
      setMessages(prev => [...prev, botMessage])
    }, 300)
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
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(124, 58, 237, 0.4)',
          zIndex: 1000,
          animation: isOpen ? 'none' : 'bounce 0.6s ease-in-out',
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 320,
            height: 480,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              color: '#fff',
              padding: 16,
              fontWeight: 800,
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Finly Assistant 🤖</span>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 0,
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
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        background: '#7c3aed',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '8px 12px',
                        maxWidth: '85%',
                        wordBreak: 'break-word',
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      🤖
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          background: '#f1f5f9',
                          borderRadius: 12,
                          padding: '8px 12px',
                          fontSize: 13,
                          whiteSpace: 'pre-wrap',
                          color: '#0f172a',
                        }}
                      >
                        {msg.text}
                      </div>
                      {msg.action && (
                        <button
                          onClick={() => handleActionClick(msg.action!.path)}
                          type="button"
                          style={{
                            marginTop: 6,
                            background: '#7c3aed',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 10px',
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
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {QUICK_SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    type="button"
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0f172a',
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
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              type="button"
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  )
}

export default Chatbot
