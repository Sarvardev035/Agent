import { CreditCard, Wallet, WalletCards } from 'lucide-react'
import { formatCurrency } from '../../lib/currency'

interface BankCardProps {
  name: string
  last4: string | number
  balance: number
  currency: string
  type: 'BANK_CARD' | 'CASH'
  accountId?: string
  institution?: string
  productType?: string
}

const typeIcon = {
  BANK_CARD: CreditCard,
  CASH: Wallet,
}

const BankCard = ({ name, last4, balance, currency, type, accountId, institution, productType }: BankCardProps) => {
  const Icon = typeIcon[type]
  const handleCopy = () => {
    const number = `•••• •••• •••• ${last4}`
    navigator.clipboard?.writeText(number).catch(() => {})
  }

  return (
    <div className="flip-card" style={{ width: 280, height: 168 }}>
      <div className="flip-card-inner" style={{ width: '100%', height: '100%' }}>
        {/* Front */}
        <div
          className="flip-card-front"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
            padding: 18,
            color: '#fff',
            background: 'linear-gradient(135deg, #0a1628, #1e3a6e, #2563eb)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--sh-lg)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              top: -30,
              right: -20,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 800, letterSpacing: '-0.01em', fontSize: 18 }}>Finly</div>
              {institution && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{institution}</span>
              )}
            </div>
            <Icon size={20} aria-label={productType ?? type} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              aria-hidden
              style={{
                width: 46,
                height: 32,
                borderRadius: 6,
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.3))',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
              }}
            />
            <div style={{ fontSize: 18, letterSpacing: '0.14em' }}>•••• •••• •••• {last4}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>CARDHOLDER</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>BALANCE</div>
              <div className="tabular" style={{ fontWeight: 800, fontSize: 18 }}>
                {formatCurrency(balance, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="flip-card-back"
          onClick={handleCopy}
          role="button"
          aria-label="Copy masked card number"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
            padding: 18,
            color: '#fff',
            background: 'linear-gradient(135deg, #0a1628, #0f2040, #1a3a6b)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--sh-lg)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%)',
              backgroundSize: '12px 12px',
              opacity: 0.4,
            }}
          />
          <div style={{ fontSize: 12, opacity: 0.8 }}>Account #{accountId ?? '—'}</div>
          <div style={{ marginTop: 18, fontSize: 13, opacity: 0.8 }}>Current balance</div>
          <div className="tabular" style={{ fontSize: 26, fontWeight: 800 }}>
            {formatCurrency(balance, currency)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Type: {(productType ?? type).toString().toLowerCase()} • Institution: {institution ?? 'Finly'}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>
            Tap to copy number •••• •••• •••• {last4}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankCard
