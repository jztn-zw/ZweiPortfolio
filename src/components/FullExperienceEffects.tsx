import useScrollReveal from '../hooks/useScrollReveal'
import useAnimationVisibility from '../hooks/useAnimationVisibility'
import useSurfaceHover from '../hooks/useSurfaceHover'
import '../index.css'
import '../theme.css'
import '../theme-light.css'
import '../interaction-polish.css'
import '../performance.css'

export default function FullExperienceEffects({ page }: { page: string }) {
  useScrollReveal(page)
  useAnimationVisibility(page)
  useSurfaceHover(page)
  return null
}
