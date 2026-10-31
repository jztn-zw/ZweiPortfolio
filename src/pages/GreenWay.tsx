import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GraphicMark from '../components/GraphicMark'
import SurfaceSignal from '../components/SurfaceSignal'
import GreenWayStackSignal from '../components/GreenWayStackSignal'
import { projects } from '../data/portfolio'
import { greenwayFeatures as features, greenwayStackLayers as stackLayers } from '../data/greenway'
import './GreenWay.css'

function ShowcaseFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [failed, setFailed] = useState(false)
  const [requested, setRequested] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const userPaused = useRef(false)
  const visible = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const sync = () => {
      if (!visible.current || document.hidden) { video.pause(); return }
      if (!userPaused.current) void video.play().catch(() => { /* The play control remains available if autoplay is blocked. */ })
    }
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      visible.current = entries[0].isIntersecting
      if (visible.current) setRequested(true)
      sync()
    }, { rootMargin: '150px' }) : null
    if (observer) observer.observe(video)
    else { visible.current = true; setRequested(true) }
    document.addEventListener('visibilitychange', sync)
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause() }
  }, [])

  useEffect(() => {
    if (requested && visible.current && !userPaused.current && !document.hidden) {
      void videoRef.current?.play().catch(() => { /* Allow a manual play gesture. */ })
    }
  }, [requested])

  async function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (!video.paused) { userPaused.current = true; video.pause(); return }
    userPaused.current = false
    if (!requested) { setRequested(true); return }
    setFailed(false)
    try {
      if (video.error) video.load()
      await video.play()
    } catch {
      setFailed(true)
    }
  }

  return <figure className="greenway-case-film" aria-labelledby="greenway-film-title">
    <div className="greenway-film-heading eyebrow"><span id="greenway-film-title"><i aria-hidden="true" />GREENWAY / THE SHOWCASE</span><span>WEB + MOBILE <GraphicMark variant="weave" /></span></div>
    <div className="greenway-film-screen">
      <video ref={videoRef} src={requested ? '/videos/greenway-showcase.mp4' : undefined} loop muted={muted} controls={false} playsInline disablePictureInPicture preload="none" poster="/images/greenway-showcase-poster.jpg" width="1920" height="1080" aria-label="GreenWay project showcase" aria-describedby="greenway-film-summary" onPlay={() => setPlaying(true)} onPlaying={() => { setPlaying(true); setBuffering(false); setFailed(false) }} onWaiting={() => setBuffering(true)} onPause={() => { setPlaying(false); setBuffering(false) }} onError={() => { if (requested) { setFailed(true); setBuffering(false) } }}>
        Your browser cannot play this video. Open the film using the link below.
      </video>
      <svg className="greenway-film-edge" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><rect x=".5" y=".5" width="99" height="99" pathLength="1" vectorEffect="non-scaling-stroke" /></svg>
      {requested && buffering && !failed && <span className="greenway-film-buffering eyebrow" role="status">Buffering video…</span>}
        <div className="greenway-film-controls"><button className="greenway-film-control" type="button" onClick={() => { void togglePlayback() }} aria-label={playing ? 'Pause GreenWay showcase' : 'Play GreenWay showcase'} title={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}</button><button className="greenway-film-control" type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? 'Unmute GreenWay showcase' : 'Mute GreenWay showcase'} title={muted ? 'Sound off' : 'Sound on'}>{muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}</button></div>
    </div>
    <figcaption id="greenway-film-summary" className="sr-only">A closer look at collection schedules, truck tracking, reports, and local updates through the resident mobile experience.</figcaption>
    {failed && <p className="greenway-film-error" role="status">The film couldn’t play here. <a href="/videos/greenway-showcase.mp4" target="_blank" rel="noopener noreferrer">Open the video directly <span className="sr-only">in a new tab</span><ArrowUpRight size={14} aria-hidden="true" /></a></p>}
  </figure>
}

export default function GreenWay() {
  const project = projects.find(project => project.artwork === 'greenway')

  if (!project) {
    return <><SiteHeader isHome={false} /><main className="greenway-case page-width"><h1 id="greenway-title" tabIndex={-1}>Project unavailable.</h1><a className="page-back-button" href="/">Back to Home</a></main><Footer /></>
  }

  const additionalTools = project.technologies.filter(tech => !stackLayers.some(layer => layer.tools.some(tool => tool === tech)))

  return <div id="/projects/greenway" className="greenway-case-page">
    <a className="skip-link" href="#greenway-content">Skip to content</a>
    <SiteHeader isHome={false} />
    <main id="greenway-content" className="greenway-case page-width" tabIndex={-1}>
      <div className="greenway-case-breadcrumb">
        <a className="page-back-button" href="/"><ArrowLeft size={16} aria-hidden="true" />Back to Home</a>
        <span className="eyebrow greenway-project-label">SELECTED WORK <span aria-hidden="true">/</span> GREENWAY</span>
      </div>

      <section className="greenway-case-hero" aria-labelledby="greenway-title">
        <div>
          <p className="eyebrow greenway-case-kicker"><span>PROJECT SPOTLIGHT</span><GraphicMark variant="weave" /></p>
          <h1 id="greenway-title" tabIndex={-1}>{project.title}<span>.</span></h1>
          <p className="greenway-case-tagline">A cleaner routine.<br />A connected community.</p>
        </div>
        <div className="greenway-case-intro">
          <p>{project.description}</p>
          {project.liveUrl && <a className="greenway-case-live" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Explore live site <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
      </section>

      <dl className="greenway-case-facts">
        <div><dt>MY ROLE</dt><dd>Full-Stack Developer</dd></div>
        <div><dt>PLATFORMS</dt><dd>Web &amp; Mobile</dd></div>
        <div><dt>BUILT FOR</dt><dd>Candelaria, Quezon</dd></div>
        <div><dt>PROJECT STATUS</dt><dd className="greenway-case-status"><i aria-hidden="true" />{project.status}</dd></div>
      </dl>

      <div className="greenway-case-brief">
        <ShowcaseFilm />
        <section className="greenway-case-overview" aria-labelledby="greenway-overview-title">
          <div><p className="eyebrow greenway-case-kicker"><span className="greenway-section-index">01 /</span> THE IDEA</p><h2 id="greenway-overview-title">LESS GUESSWORK.<br />MORE CONNECTION<span>.</span></h2></div>
          <div className="greenway-case-prose"><p className="greenway-case-lead">The right information.<br />Right when it matters.</p><p>Residents shouldn’t have to guess when collection happens or where to raise a concern. GreenWay brings the collection routine into one connected web and mobile platform.</p><p>Built for Candelaria, Quezon, it connects everyday resident needs with schedules, collection updates, and the Municipal Environment and Natural Resources Office.</p></div>
        </section>
      </div>

      <section className="greenway-case-features" aria-labelledby="greenway-features-title">
        <div>
          <p className="eyebrow greenway-case-kicker"><span className="greenway-section-index">02 /</span> THE EXPERIENCE</p>
          <h2 id="greenway-features-title">BUILT AROUND<br />THE EVERYDAY<span>.</span></h2>
          <ol className="greenway-case-feature-list">
            {features.map(({ title, icon: Icon, description }, index) => <li key={title} data-hover-surface="feature"><SurfaceSignal kind="feature" /><Icon size={21} strokeWidth={1.4} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div><span className="greenway-case-feature-index eyebrow" aria-hidden="true">0{index + 1}</span></li>)}
          </ol>
        </div>
        <figure className="greenway-case-product">
          <div className="greenway-product-stage" data-hover-surface="product">
            <SurfaceSignal kind="product" />
            <div className="greenway-product-grid" aria-hidden="true" />
            <div className="greenway-case-window">
              <div className="greenway-case-window-bar" aria-hidden="true"><span /><span /><span /><i>greenway-candelaria.vercel.app</i></div>
              <div className="greenway-case-web-canvas"><img src="/images/greenway-web.webp" alt="GreenWay web homepage with collection schedules, truck tracking, and app access" width="1920" height="1020" loading="lazy" decoding="async" /></div>
            </div>
            <div className="greenway-case-phone"><img src="/images/greenway-welcome.webp" alt="GreenWay mobile welcome screen with pickup days, waste reports, and account access" width="922" height="2048" loading="lazy" decoding="async" /></div>
            <span className="greenway-product-coordinate eyebrow" aria-hidden="true">WEB ↔ MOBILE</span>
          </div>
          <figcaption className="eyebrow"><span>ONE PLATFORM. EVERY SCREEN.</span><GraphicMark variant="weave" /></figcaption>
        </figure>
      </section>

      <section className="greenway-case-stack" aria-labelledby="greenway-stack-title">
        <div className="greenway-stack-heading"><div><p className="eyebrow greenway-case-kicker"><span className="greenway-section-index">03 /</span> UNDER THE HOOD</p><h2 id="greenway-stack-title">THE TOOLS.<br />THE CONNECTIONS<span>.</span></h2></div><p>From the resident interface to the services behind it, a shared stack connects web, mobile, maps, and media.</p></div>
        <div className="greenway-stack-board" aria-label="GreenWay technology stack">
          <div className="greenway-stack-board-top eyebrow"><span>THE BUILD / SYSTEM STACK</span><span>{String(project.technologies.length).padStart(2, '0')} TECHNOLOGIES<GraphicMark variant="weave" /></span></div>
          {stackLayers.map(layer => {
            const tools = project.technologies.filter(tech => layer.tools.some(tool => tool === tech))
            if (!tools.length) return null
            return <section className="greenway-stack-layer" key={layer.id} aria-labelledby={`greenway-stack-${layer.id}`}><div className="greenway-stack-layer-label"><GraphicMark variant={layer.mark} /><h3 id={`greenway-stack-${layer.id}`}>{layer.title}</h3></div><ul aria-label={`${layer.title} technologies`}>{tools.map(tech => <li key={tech}>{tech}</li>)}</ul><GreenWayStackSignal kind={layer.id} /></section>
          })}
          {additionalTools.length > 0 && <section className="greenway-stack-layer" aria-labelledby="greenway-stack-additional"><div className="greenway-stack-layer-label"><GraphicMark variant="chevrons" /><h3 id="greenway-stack-additional">Additional tools</h3></div><ul aria-label="Additional technologies">{additionalTools.map(tech => <li key={tech}>{tech}</li>)}</ul><GreenWayStackSignal kind="additional" /></section>}
        </div>
      </section>

      <section className="greenway-case-next" aria-labelledby="greenway-next-title">
        <div><p className="eyebrow greenway-case-kicker">TAKE A CLOSER LOOK <GraphicMark variant="weave" /></p><h2 id="greenway-next-title">MEET GREENWAY<span>.</span></h2><p>Explore the web experience for yourself.</p></div>
        <div>{project.liveUrl && <a className="greenway-case-live" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit live site <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}<a className="page-back-button" href="/"><ArrowLeft size={16} aria-hidden="true" />Back to Home</a></div>
      </section>
    </main>
    <Footer topHref="/projects/greenway" />
  </div>
}
