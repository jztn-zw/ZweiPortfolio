import { ArrowUpRight, CodeXml, Mail, SquareUserRound } from 'lucide-react'
import { contactContent, portfolio } from '../data/portfolio'
import { SectionLabel } from './SectionHeading'
import './ContactSection.css'

const socialIcons = { github: CodeXml, linkedin: SquareUserRound, email: Mail }

export default function ContactSection() {
  const email = portfolio.contacts.find(contact => contact.id === 'email')

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
              <a href={email.url} className="contact-primary">{contactContent.primaryLabel}<ArrowUpRight size={21} /></a>
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

          <div className="contact-social-links" role="group" aria-label="Social and email links">
            {portfolio.contacts.map(contact => {
              const Icon = socialIcons[contact.id]
              return contact.url ? (
                <a href={contact.url} className="contact-social-link" key={contact.id}><Icon size={17} /><span>{contact.label}</span><ArrowUpRight size={13} /></a>
              ) : (
                <button type="button" className="contact-social-link" key={contact.id} disabled aria-label={`${contact.label} — Coming soon`} title={`${contact.label} details coming soon`}><Icon size={17} /><span>{contact.label}</span><span className="contact-social-soon">SOON</span></button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
