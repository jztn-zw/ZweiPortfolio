import { useState } from 'react'
import Hero from '../components/Hero'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import ProjectsSection from '../components/ProjectsSection'
import CapabilitiesSection from '../components/CapabilitiesSection'
import ProjectDialog from '../components/ProjectDialog'
import JourneySection from '../components/JourneySection'
import AboutSection from '../components/AboutSection'
import ContactSection from '../components/ContactSection'
import '../components/GraphicDetails.css'
import '../components/DisciplineStrip.css'
import type { Project } from '../data/portfolio'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div id="home" aria-hidden="true" />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <div className="discipline-strip" aria-hidden="true">
          <div className="discipline-strip-viewport page-width">
            <div className="discipline-strip-track">
              <span>DESIGN THINKING</span><i className="discipline-divider" />
              <span>CLEAN CODE</span><i className="discipline-divider" />
              <span>DIGITAL EXPERIENCES</span><i className="discipline-divider" />
              <span>CONTINUOUS EXPLORATION</span><i className="discipline-divider" />
            </div>
          </div>
        </div>
        <ProjectsSection onSelect={setSelectedProject} />
        <CapabilitiesSection />
        <JourneySection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      {selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </>
  )
}
