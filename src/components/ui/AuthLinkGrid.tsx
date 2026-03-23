const EXTERNAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sarvar-sharipov-4bb187332/?skipRedirect=true',
    description: 'Sarvar Sharipov',
  },
  {
    label: 'Google',
    href: 'https://www.google.com/',
    description: 'Search and tools',
  },
  {
    label: 'Facebook',
    href: 'https://hackathon.mbabm.uz/en',
    description: 'Hackathon MBA BM',
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
          data-platform={link.label.toLowerCase()}
        >
          <span className="auth-outbound-links__copy">
            <strong>{link.label}</strong>
            <small>{link.description}</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  </div>
)

export default AuthLinkGrid
