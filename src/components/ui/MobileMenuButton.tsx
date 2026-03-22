interface MobileMenuButtonProps {
  open: boolean
}

const lineStyle = {
  width: 20,
  height: 2,
  borderRadius: 999,
  background: 'currentColor',
  transition: 'transform 0.35s ease, opacity 0.25s ease, width 0.35s ease',
  transformOrigin: 'center',
} as const

const MobileMenuButton = ({ open }: MobileMenuButtonProps) => (
  <span
    className={`mobile-menu-button${open ? ' is-open' : ''}`}
  >
    <span style={{ ...lineStyle }} />
    <span style={{ ...lineStyle, width: open ? 20 : 14, marginLeft: open ? 0 : 6 }} />
    <span style={{ ...lineStyle }} />
  </span>
)

export default MobileMenuButton
