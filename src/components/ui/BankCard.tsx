import { useState } from 'react'
import { formatCurrency } from '../../utils/helpers'

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

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{
        width: 'clamp(240px,80vw,280px)',
        height: 160,
        flexShrink: 0,
        perspective: '1000px',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transform: flipped
          ? 'rotateY(180deg)'
          : 'rotateY(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* FRONT FACE */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          padding: '18px 20px',
          background:
            'linear-gradient(135deg,#0a1628 0%,#1e3a6e 60%,#2563eb 100%)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 130, height: 130, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontWeight: 800, fontSize: 15,
            }}>
              Finly
            </span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {type === 'CASH' ? '💵 Cash' : '💳 Card'}
            </span>
          </div>
          <div style={{
            fontSize: 13, letterSpacing: '0.15em', opacity: 0.7,
          }}>
            •••• •••• •••• ••••
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            <div>
              <div style={{
                fontSize: 10, opacity: 0.5,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Balance
              </div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                {formatCurrency(balance, currency)}
              </div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {currency}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          padding: '20px',
          background:
            'linear-gradient(135deg,#0f2040 0%,#0a1628 100%)',
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
          <div style={{ fontSize: 12, opacity: 0.5 }}>
            Account holder
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
          <div style={{
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
