import GraphicMark from './GraphicMark'
import './SectionHeading.css'

type SectionLabelProps = { number: string; label: string }
type SectionHeadingProps = SectionLabelProps & { children: React.ReactNode }

export function SectionLabel({ number, label }: SectionLabelProps) {
  return <p className="section-kicker"><span className="section-kicker-number">{number}</span><span>{label}</span><GraphicMark variant="weave" /></p>
}

export default function SectionHeading({ number, label, children }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <SectionLabel number={number} label={label} />
      <h2>{children}</h2>
    </div>
  )
}
