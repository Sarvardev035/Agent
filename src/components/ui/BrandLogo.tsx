import { Link } from 'react-router-dom'
import { Bitcoin } from 'lucide-react'

interface BrandLogoProps {
  compact?: boolean
}

const BrandLogo = ({ compact = false }: BrandLogoProps) => (
  <Link
    to="/dashboard"
    className="brand-logo"
    aria-label="Go to dashboard"
    data-button-reset="true"
    style={{ gap: compact ? 0 : 10, justifyContent: compact ? 'center' : 'flex-start' }}
  >
    <span className="brand-logo__coin">
      <span className="brand-logo__coin-core">
        <Bitcoin size={compact ? 16 : 18} strokeWidth={2.3} />
      </span>
    </span>
    {!compact && <span className="brand-logo__wordmark">Finly</span>}
  </Link>
)

export default BrandLogo
