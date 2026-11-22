import type { ProjectCollection } from './portfolio'

export const projectCollections = [
  {
    id: 'automation',
    index: '02',
    title: 'Automation',
    description: 'WordPress and GoHighLevel projects for contact forms, inquiry handling, and email workflows.',
    topics: ['Workflows', 'Integrations'],
  },
  {
    id: 'web-mobile',
    index: '01',
    title: 'Web & Mobile',
    description: 'React websites and mobile applications built around the people who use them.',
    topics: ['Websites', 'Applications'],
  },
  {
    id: 'tools',
    index: '03',
    title: 'Tools & Experiments',
    description: 'Windows desktop software, developer tools, and experiments that turn ideas into working applications.',
    topics: ['Dev tools', 'Prototypes'],
  },
] as const satisfies readonly { id: ProjectCollection; index: string; title: string; description: string; topics: readonly string[] }[]

export type Collection = (typeof projectCollections)[number]
