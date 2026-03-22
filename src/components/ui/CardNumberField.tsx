import { ChangeEvent } from 'react'
import { CARD_NUMBER_LENGTH, sanitizeCardNumber } from '../../lib/security'

interface CardNumberFieldProps {
  value: string
  error?: string | null
  onChange: (value: string) => void
}

const CardNumberField = ({ value, error, onChange }: CardNumberFieldProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeCardNumber(e.target.value))
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor="cardNumber"
        style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
      >
        Card Number *
      </label>
      <input
        id="cardNumber"
        name="cardNumber"
        type="text"
        inputMode="numeric"
        autoComplete="cc-number"
        pattern="[0-9]*"
        maxLength={CARD_NUMBER_LENGTH}
        value={value}
        onChange={handleChange}
        placeholder="Enter 16-digit card number"
        aria-invalid={Boolean(error)}
        aria-describedby="card-number-feedback"
        style={{
          width: '100%',
          height: 44,
          padding: '0 14px',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border)'}`,
          borderRadius: 10,
          fontSize: 14,
          background: error ? '#fef2f2' : 'var(--surface)',
          color: 'var(--text-1)',
          letterSpacing: '0.08em',
        }}
      />
      <p
        id="card-number-feedback"
        style={{
          margin: '6px 0 0',
          minHeight: 18,
          color: error ? '#dc2626' : 'var(--text-3)',
          fontSize: 12,
        }}
      >
        {error ?? `Digits only. Enter exactly ${CARD_NUMBER_LENGTH} numbers and do not start with 0.`}
      </p>
    </div>
  )
}

export default CardNumberField
