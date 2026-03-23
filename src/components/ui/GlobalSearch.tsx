import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { formatCurrency } from '../../lib/currency'
import { safeArray } from '../../lib/helpers'

interface SearchResult {
  id: string
  type: 'expense' | 'income' | 'transfer' | 'debt' | 'account'
  title: string
  subtitle: string
  amount?: number
  currency?: string
  path: string
  icon: string
}

interface GlobalSearchProps {
  onOpenChange?: (open: boolean) => void
}

const HISTORY_KEY = 'finly_search_history'

const loadHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as string[]
  } catch (error) {
    console.error(error)
    return []
  }
}

const saveToHistory = (query: string) => {
  if (!query.trim()) return
  const h = loadHistory()
  const updated = [query, ...h.filter(q => q !== query)].slice(0, 5)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY)
}

export const GlobalSearch = ({ onOpenChange }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>(loadHistory)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const isMobile = windowWidth <= 768
  const isTablet = windowWidth > 768 && windowWidth <= 1024
  const closedSize = isMobile ? 36 : 40
  const openWidth = isMobile ? `${Math.max(220, windowWidth - 80)}px` : isTablet ? '280px' : '380px'
  const dropdownWidth = isMobile ? `${Math.max(240, windowWidth - 24)}px` : isTablet ? '300px' : '420px'
  const fontSize = isMobile ? 13 : 14
  const iconSize = isMobile ? 16 : 18

  const showDropdown = open && (query.length > 0 || history.length > 0)

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 280)
    } else {
      setQuery('')
      setResults([])
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const parseRows = useMemo(
    () => ({
      expenses: (rows: any[], lower: string): SearchResult[] =>
        rows
          .filter(
            e =>
              e.description?.toLowerCase().includes(lower) ||
              String(e.amount).includes(lower) ||
              e.currency?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .map(e => ({
            id: String(e.id),
            type: 'expense' as const,
            title: e.description || 'Expense',
            subtitle: `${e.expenseDate || e.date || '-'} · Expense`,
            amount: e.amount,
            currency: e.currency,
            path: '/expenses',
            icon: '📉',
          })),
      incomes: (rows: any[], lower: string): SearchResult[] =>
        rows
          .filter(
            e =>
              e.description?.toLowerCase().includes(lower) ||
              String(e.amount).includes(lower) ||
              e.currency?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .map(e => ({
            id: String(e.id),
            type: 'income' as const,
            title: e.description || 'Income',
            subtitle: `${e.incomeDate || e.date || '-'} · Income`,
            amount: e.amount,
            currency: e.currency,
            path: '/income',
            icon: '📈',
          })),
      transfers: (rows: any[], lower: string): SearchResult[] =>
        rows
          .filter(e => e.description?.toLowerCase().includes(lower) || String(e.amount).includes(lower))
          .slice(0, 3)
          .map(e => ({
            id: String(e.id),
            type: 'transfer' as const,
            title: e.description || 'Transfer',
            subtitle: `${e.transferDate || e.date || '-'} · Transfer`,
            amount: e.amount,
            currency: e.currency,
            path: '/transfers',
            icon: '↔️',
          })),
      debts: (rows: any[], lower: string): SearchResult[] =>
        rows
          .filter(
            e =>
              e.personName?.toLowerCase().includes(lower) ||
              e.description?.toLowerCase().includes(lower) ||
              String(e.amount).includes(lower)
          )
          .slice(0, 3)
          .map(e => ({
            id: String(e.id),
            type: 'debt' as const,
            title: e.personName || 'Debt',
            subtitle: `${e.dueDate || '-'} · ${e.type === 'DEBT' ? 'I owe' : 'Owed to me'}`,
            amount: e.amount,
            currency: e.currency,
            path: '/debts',
            icon: '🤝',
          })),
      accounts: (rows: any[], lower: string): SearchResult[] =>
        rows
          .filter(
            e =>
              e.name?.toLowerCase().includes(lower) ||
              e.type?.toLowerCase().includes(lower) ||
              e.currency?.toLowerCase().includes(lower) ||
              String(e.balance).includes(lower)
          )
          .slice(0, 3)
          .map(e => ({
            id: String(e.id),
            type: 'account' as const,
            title: e.name || 'Account',
            subtitle: `${e.type || '-'} · ${e.currency || '-'}`,
            amount: e.balance,
            currency: e.currency,
            path: '/accounts',
            icon: e.type === 'CASH' ? '💵' : '💳',
          })),
    }),
    []
  )

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(async () => {
        try {
          const lower = q.toLowerCase()
          const [expRes, incRes, trnRes, debtRes, accRes] = await Promise.allSettled([
            api.get('/api/expenses'),
            api.get('/api/incomes'),
            api.get('/api/transfers'),
            api.get('/api/debts'),
            api.get('/api/accounts'),
          ])

          const all: SearchResult[] = [
            ...parseRows.expenses(safeArray<any>(expRes.status === 'fulfilled' ? expRes.value.data : []), lower),
            ...parseRows.incomes(safeArray<any>(incRes.status === 'fulfilled' ? incRes.value.data : []), lower),
            ...parseRows.transfers(safeArray<any>(trnRes.status === 'fulfilled' ? trnRes.value.data : []), lower),
            ...parseRows.debts(safeArray<any>(debtRes.status === 'fulfilled' ? debtRes.value.data : []), lower),
            ...parseRows.accounts(safeArray<any>(accRes.status === 'fulfilled' ? accRes.value.data : []), lower),
          ]

          setResults(all)
          saveToHistory(q)
          setHistory(loadHistory())
        } catch (error) {
          console.error(error)
          setResults([])
        } finally {
          setLoading(false)
        }
      }, 1500)
    },
    [parseRows]
  )

  useEffect(() => {
    if (query) {
      void performSearch(query)
    } else {
      setResults([])
      setLoading(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    navigate(result.path)
    setOpen(false)
    setQuery('')
  }

  const highlightMatch = (text: string) => {
    if (!query || !text.toLowerCase().includes(query.toLowerCase())) return text
    return text.split(new RegExp(`(${query})`, 'gi')).map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={`${part}-${idx}`}
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#7c3aed',
            borderRadius: 3,
            padding: '0 1px',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: open ? openWidth : `${closedSize}px`,
          height: closedSize,
          background: open ? 'var(--card-bg)' : 'rgba(124,58,237,0.12)',
          border: open ? '1.5px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.25)',
          borderRadius: 20,
          overflow: 'hidden',
          transition:
            'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: open ? '0 0 0 3px rgba(124,58,237,0.12), 0 4px 20px rgba(0,0,0,0.1)' : 'none',
          cursor: open ? 'text' : 'pointer',
        }}
        onClick={() => {
          if (!open) setOpen(true)
        }}
      >
        <div
          style={{
            width: closedSize,
            height: closedSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onClick={e => {
            e.stopPropagation()
            if (open && query) {
              void performSearch(query)
            } else {
              setOpen(prev => !prev)
            }
          }}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transition: 'transform 0.3s ease',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search transactions, accounts..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize,
            color: 'var(--text-1)',
            fontFamily: 'inherit',
            opacity: open ? 1 : 0,
            paddingRight: 8,
            transition: 'opacity 0.2s ease 0.1s',
          }}
        />

        {open && query && (
          <button
            onClick={e => {
              e.stopPropagation()
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              marginRight: 6,
              background: 'var(--surface-2)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: dropdownWidth,
            maxWidth: isMobile ? '100vw' : 440,
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'searchDropIn 0.2s ease-out',
          }}
        >
          {loading && (
            <div style={{ padding: '16px 16px 8px' }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Searching</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#7c3aed',
                        animation: 'waveDot 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              {[80, 60, 70].map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, width: `${w}%`, borderRadius: 4, marginBottom: 5 }} />
                    <div className="skeleton" style={{ height: 10, width: '50%', borderRadius: 4 }} />
                  </div>
                  <div className="skeleton" style={{ height: 12, width: 60, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div
                style={{
                  padding: '10px 16px 6px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {results.map((r, i) => (
                  <div
                    key={`${r.type}-${r.id}-${i}`}
                    onClick={() => handleSelect(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--surface-2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background:
                          r.type === 'income'
                            ? '#ecfdf5'
                            : r.type === 'expense'
                              ? '#fff1f2'
                              : r.type === 'transfer'
                                ? '#eff6ff'
                                : r.type === 'debt'
                                  ? '#fffbeb'
                                  : '#f5f3ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {r.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {highlightMatch(r.title)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.subtitle}</div>
                    </div>

                    {r.amount !== undefined && (
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          color: r.type === 'income' ? '#10b981' : r.type === 'expense' ? '#ef4444' : 'var(--text-1)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {r.type === 'income' ? '+' : ''}
                        {formatCurrency(r.amount, r.currency)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>No results for "{query}"</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Try amount, description, person, or account name</div>
            </div>
          )}

          {!loading && !query && history.length > 0 && (
            <div>
              <div
                style={{
                  padding: '10px 16px 6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Recent searches
                </span>
                <button
                  onClick={() => {
                    clearHistory()
                    setHistory([])
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                  type="button"
                >
                  Clear
                </button>
              </div>
              {history.map((h, i) => (
                <div
                  key={`${h}-${i}`}
                  onClick={() => setQuery(h)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface-2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--text-3)' }}>🕐</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{h}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>↗</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

