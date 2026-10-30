import { ArrowUpRight } from 'lucide-react'
import { contactContent, portfolio } from '../data/portfolio'
import { SectionLabel } from './SectionHeading'
import './ContactSection.css'

function SocialBrandIcon({ network }: { network: 'github' | 'linkedin' }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    {network === 'github' ? (
      <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.524.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.652.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.624-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ) : (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z" />
    )}
  </svg>
}

function ContactEnvelope() {
  return <span className="contact-primary-icon" aria-hidden="true">
    <svg viewBox="0 0 32 28" fill="none" focusable="false">
      <rect x="4" y="6" width="24" height="17" rx="1" />
      <path className="contact-envelope-flap" d="m4 7 12 9L28 7" />
      <path className="contact-envelope-fold" d="m4 23 8-8m16 8-8-8" />
      <path className="contact-envelope-signal" d="M10 2h12" pathLength="1" />
    </svg>
  </span>
}

export default function ContactSection() {
  const email = portfolio.contacts.find(contact => contact.id === 'email')
  const emailAddress = email?.url?.replace(/^mailto:/, '')
  const emailAt = emailAddress?.indexOf('@') ?? -1
  const socialContacts = portfolio.contacts.filter(contact => contact.id !== 'email')

  return (
    <section id="contact" className="contact-finale page-width" aria-labelledby="contact-title">
      <div className="contact-finale-label">
        <SectionLabel number="05" label="GET IN TOUCH" />
      </div>

      <div className="contact-finale-grid">
        <div className="contact-finale-heading">
          <p className="contact-finale-question">{contactContent.question}</p>
          <h2 id="contact-title"><span>{contactContent.heading[0]}</span><span className="red">{contactContent.heading[1]}</span></h2>
          <div className="contact-primary-wrap">
            {email?.url ? (
              <a href={email.url} className="contact-primary">
                <ContactEnvelope />
                <span className="contact-primary-copy">
                  <span className="contact-primary-label">{contactContent.primaryLabel}</span>
                  {emailAddress && <span className="contact-primary-address">{emailAt > 0 ? <>{emailAddress.slice(0, emailAt)}<wbr />{emailAddress.slice(emailAt)}</> : emailAddress}</span>}
                </span>
                <span className="contact-action-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
              </a>
            ) : (
              <>
                <button type="button" className="contact-primary" disabled aria-describedby="contact-coming-soon">{contactContent.primaryLabel}<ArrowUpRight size={21} /></button>
                <p id="contact-coming-soon" className="contact-coming-soon">Contact details coming soon.</p>
              </>
            )}
          </div>
        </div>

        <div className="contact-finale-copy">
          {contactContent.paragraphs.map((paragraph, index) => <p className={index === 0 ? 'contact-finale-lead' : undefined} key={paragraph}>{paragraph}</p>)}

          <div className="contact-availability">
            <span className="eyebrow">AVAILABILITY</span>
            <p><span className="contact-availability-dot" aria-hidden="true" />{portfolio.availability}</p>
          </div>

          <div className="contact-social-heading eyebrow"><span>FIND ME ELSEWHERE</span><span aria-hidden="true">↗</span></div>
          <div className="contact-social-links" role="group" aria-label="Social profiles">
            {socialContacts.map(contact => {
              if (contact.id === 'email') return null
              return contact.url ? (
                <a href={contact.url} className="contact-social-link" key={contact.id} target="_blank" rel="noopener noreferrer">
                  <SocialBrandIcon network={contact.id} /><span>{contact.label}</span>
                  <span className="contact-action-arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <button type="button" className="contact-social-link" key={contact.id} disabled aria-label={`${contact.label} — Coming soon`} title={`${contact.label} details coming soon`}><SocialBrandIcon network={contact.id} /><span>{contact.label}</span><span className="contact-social-soon">SOON</span></button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
