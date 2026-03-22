import { useState } from 'react'
import { ArrowUpRight, Bitcoin } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface BankCardProps {
  name: string
  last4?: string | number
  balance: number
  currency: string
  type: 'BANK_CARD' | 'CASH'
  accountId?: string
  institution?: string
  productType?: string
}

const BankCard = ({ name, balance, currency, type }: BankCardProps) => {
  const [flipped, setFlipped] = useState(false)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  return (
    <div
      onMouseEnter={canHover ? () => setFlipped(true) : undefined}
      onMouseLeave={canHover ? () => setFlipped(false) : undefined}
      style={{
        width: '100%',
        maxWidth: 320,
        height: 160,
        flexShrink: 0,
        perspective: '1000px',
        margin: '0 auto',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transform: canHover && flipped
          ? 'rotateY(180deg)'
          : 'rotateY(0deg)',
        transition: canHover ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}>

        {/* FRONT FACE */}
        <div className="plastic-account-card" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 22,
          padding: '18px 18px 16px',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -28, right: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', left: -18, bottom: 38,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span className="plastic-account-card__brand">
              <Bitcoin size={16} />
              Finly
            </span>
            <span className="plastic-account-card__type">
              {type === 'CASH' ? 'Cash reserve' : 'Plastic account'}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, letterSpacing: '0.15em', opacity: 0.78 }}>
              •••• •••• •••• ••••
            </div>
            <ArrowUpRight size={18} style={{ opacity: 0.7 }} />
          </div>
          <div className="plastic-account-card__footer">
            <div style={{ minWidth: 0 }}>
              <div className="plastic-account-card__footer-label">
                Account
              </div>
              <div className="plastic-account-card__footer-name">
                {name}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="plastic-account-card__footer-label">
                Balance
              </div>
              <div className="balance-large" style={{ fontSize: 18 }}>
                {formatCurrency(balance, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="plastic-account-card plastic-account-card--back" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 22,
          padding: '20px',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Finly plastic
          </div>
          <div style={{
            fontSize: 16, fontWeight: 700, textAlign: 'center',
          }}>
            {name}
          </div>
          <div style={{
            marginTop: 8, fontSize: 13, opacity: 0.6,
          }}>
            {type === 'CASH' ? 'Cash Wallet' : 'Bank Card'}
          </div>
          <div className="balance" style={{
            fontSize: 15, fontWeight: 700, color: '#a78bfa',
          }}>
            {formatCurrency(balance, currency)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankCard
