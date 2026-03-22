const EXTERNAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sarvar-sharipov-4bb187332/?skipRedirect=true',
  },
  {
    label: 'Google',
    href: 'https://www.google.com/',
  },
  {
    label: 'Facebook',
    href: 'https://hackathon.mbabm.uz/en',
  },
]

const AuthLinkGrid = () => (
  <div className="auth-outbound-links">
    <div className="auth-outbound-links__title">External links</div>
    <div className="auth-outbound-links__grid">
      {EXTERNAL_LINKS.map(link => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="auth-outbound-links__item"
        >
          <span>{link.label}</span>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  </div>
)

export default AuthLinkGrid
