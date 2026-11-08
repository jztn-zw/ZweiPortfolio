import type { ProjectCollection } from './portfolio'

export const projectCollections = [
  {
    id: 'automation',
    index: '02',
    title: 'Automation',
    description: 'Workflows and integrations that take repetitive tasks off your hands.',
    topics: ['Workflows', 'Integrations'],
  },
  {
    id: 'web-mobile',
    index: '01',
    title: 'Web & Mobile',
    description: 'Websites and applications built around the people who use them.',
    topics: ['Websites', 'Applications'],
  },
  {
    id: 'tools',
    index: '03',
    title: 'Tools & Experiments',
    description: 'Small developer tools, API projects, and ideas I’m trying out.',
    topics: ['Dev tools', 'Prototypes'],
  },
] as const satisfies readonly { id: ProjectCollection; index: string; title: string; description: string; topics: readonly string[] }[]

export type Collection = (typeof projectCollections)[number]
