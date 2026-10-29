import './GreenWayArtwork.css'

export default function GreenWayArtwork() {
  return (
    <div className="greenway-artwork">
      <div className="greenway-device-glow" aria-hidden="true" />
      <div className="greenway-device-shadow" aria-hidden="true" />
      <svg className="greenway-route" viewBox="0 0 400 330" fill="none" aria-hidden="true">
        <ellipse cx="203" cy="173" rx="125" ry="122" stroke="#b3d2bd" strokeOpacity=".16" />
        <ellipse cx="203" cy="173" rx="147" ry="143" stroke="#b3d2bd" strokeOpacity=".07" />
        <path d="M28 48V28h20m304 0h20v20M28 282v20h20m304 0h20v-20" stroke="#9adcb2" strokeOpacity=".4" />
        <path d="m25 65 97 32 45-43 88 14 39-37m-275 177 103-11 49 71 107-20 90 34M70 0l42 110-51 83 44 137M290 0l-15 112 74 71-30 147" stroke="#81b89b" strokeOpacity=".12" />
        <path d="m50 195 63-29 40 20 48-65 65 16 61-53" stroke="#93d3a7" strokeOpacity=".45" strokeWidth="1.5" strokeDasharray="4 5" />
        <path className="greenway-route-signal" d="m50 195 63-29 40 20 48-65 65 16 61-53" pathLength="100" stroke="#c0edce" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 93" />
        <circle cx="50" cy="195" r="7" fill="#123e2c" stroke="#9adcb2" /><circle cx="50" cy="195" r="2" fill="#9adcb2" />
        <path d="M327 72c-7 0-12 5-12 12 0 9 12 20 12 20s12-11 12-20c0-7-5-12-12-12Z" fill="#145b39" stroke="#9adcb2" /><circle cx="327" cy="84" r="4" stroke="#c9edcf" />
      </svg>
      <div className="greenway-web">
        <div className="greenway-web-chrome" aria-hidden="true">
          <span /><span /><span />
          <div className="greenway-web-address"><svg viewBox="0 0 12 12" fill="none"><rect x="3" y="5" width="6" height="5" rx="1" stroke="currentColor" /><path d="M4 5V3a2 2 0 0 1 4 0v2" stroke="currentColor" /></svg><span>greenway-candelaria.vercel.app</span></div>
          <svg className="greenway-window-icon" viewBox="0 0 12 12" fill="none"><path d="M3 9 9 3M4 3h5v5" stroke="currentColor" /></svg>
        </div>
        <div className="greenway-web-screen">
          <img src="/images/greenway-web.webp" alt="GreenWay web homepage with collection schedules, truck tracking, and a green community illustration" width="1920" height="1020" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="greenway-phone">
        <img src="/images/greenway-welcome.webp" alt="GreenWay welcome screen with its leaf-truck logo, pickup days, waste reports, and illustrated collection truck" width="922" height="2048" loading="lazy" decoding="async" />
        <span className="greenway-phone-camera" aria-hidden="true" />
      </div>
    </div>
  )
}
