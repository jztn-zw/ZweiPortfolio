// Personal details supplied by Jaztin.
// Leave contact URLs null until real destinations are available.
export type Contact = {
  id: 'github' | 'linkedin' | 'email'
  label: string
  url: string | null
}

export const portfolio = {
  name: 'Jaztin Abram Contreras',
  shortName: 'Jaztin',
  resumeUrl: '/documents/JaztinAbramContrerasCV.pdf',
  nameLines: ['Jaztin Abram', 'Contreras'],
  role: 'Full-Stack Developer',
  location: 'Quezon, Philippines',
  availability: 'Open to Opportunities',
  introduction: 'I build modern web and mobile applications, turning ideas into functional digital solutions.',
  description: 'Driven by curiosity and logical thinking, I enjoy solving problems, understanding how systems work, and exploring the possibilities of AI.',
  contacts: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/jztn-zw' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/jaztin-abram-contreras-58508b446/' },
    { id: 'email', label: 'Email', url: 'mailto:jaztinabramcontreras@gmail.com' },
  ] as Contact[],
}

export const contactContent = {
  question: 'Have something in mind?',
heading: ['Let’s make', 'it happen'],
  paragraphs: [
    'Have a project idea, an opportunity, or just want to connect?',
    "I'm always open to exploring new ideas, collaborating on meaningful projects, and learning through new challenges.",
    "Whether it's web development, automation, networking, or something entirely new, feel free to reach out.",
  ],
  primaryLabel: 'Send an Email',
  footerVerse: {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ which strengtheneth me.',
    translation: 'KJV',
  },
} as const

// Public personal facts shared by Jaztin for the portfolio chat.
export const personalProfile = {
  favoriteFood: ['Adobo', 'Giniling'],
  hobbies: ['Basketball', 'Volleyball', 'Gaming', 'Playing instruments'],
  instruments: ['Electric guitar', 'Bass', 'Acoustic guitar'],
  games: { favorite: 'Mobile Legends', sometimes: 'Roblox', alsoPlays: ['Valorant'] },
  musicTaste: 'My music taste is varied; I listen to whatever catches my ear rather than sticking to one genre.',
  personality: 'I’m a little shy at first. Once I feel comfortable talking with someone, I become playful and makulit. I’m naturally curious and ask lots of questions about how things work.',
  learningStyle: 'I learn best by trying things myself. Hands-on experience helps me understand and adapt more easily than explanations alone.',
  basketball: { playingStyle: 'Midrange shooter', idol: 'LeBron James', nickname: 'The King', personalGoat: true },
  favoriteVerse: contactContent.footerVerse,
} as const

export const aboutMe = {
  quote: 'Everything has a logic behind it. I just enjoy figuring out how it works.',
  introduction: "I'm a 4th-year Bachelor of Science in Computer Science student with an interest in understanding how things work and turning ideas into functional solutions.",
  focus: 'full-stack development, automation, and networking',
  exploration: 'I enjoy exploring technologies, solving problems, and finding smarter ways to build and improve systems.',
  learning: "I'm continuously learning, experimenting, and developing my skills through hands-on projects and new challenges.",
  details: [
    { id: 'location', label: 'Location', value: portfolio.location },
    { id: 'currently', label: 'Currently', value: '4th-Year BS Computer Science Student' },
    { id: 'focus', label: 'Focus', value: 'Building practical software solutions for real-world needs' },
    { id: 'interests', label: 'Interests', value: 'Software Development • AI • Technology • Problem-Solving' },
  ],
} as const

export type ProjectCollection = 'web-mobile' | 'automation' | 'tools'

export type Project = {
  id: string
  title: string
  category: string
  collection: ProjectCollection
  listed: boolean
  description: string
  technologies: string[]
  artwork: 'terrain' | 'orbit' | 'structure' | 'greenway'
  status?: string
  liveUrl?: string
  detailsUrl?: string
  minimalDetailsUrl?: string
}

export const projects: Project[] = [
  {
    id: 'everwell',
    title: 'Everwell Veterinary Clinic',
    category: 'WORDPRESS & INQUIRY AUTOMATION',
    collection: 'automation',
    listed: true,
    description: 'A WordPress clinic demo with a GoHighLevel contact form and a draft workflow to record inquiries, notify the team, and send confirmation emails.',
    technologies: ['WordPress', 'GHL'],
    artwork: 'orbit',
    status: 'Portfolio demo · Workflow draft',
    detailsUrl: '/experience/projects/everwell',
    minimalDetailsUrl: '/projects/everwell',
  },
  {
    id: '002',
    title: 'GreenWay',
    category: 'WEB & MOBILE APPLICATION',
    collection: 'web-mobile',
    listed: true,
    description: 'A waste management platform for Candelaria, Quezon, with collection tracking, pickup schedules, and resident reports.',
    technologies: [
      'React', 'React Native', 'Node.js', 'TiDB (MySQL-compatible)',
      'TypeScript', 'Vite', 'Tailwind CSS', 'Radix UI', 'React Router',
      'TanStack Query', 'Zustand',
      'Express', 'mysql2', 'Socket.IO', 'JWT', 'Zod',
      'Expo', 'Expo Router', 'Expo Location', 'Expo Notifications', 'Expo SecureStore',
      'Leaflet', 'MapLibre React Native', 'OpenStreetMap', 'OpenFreeMap', 'OSRM', 'Cloudinary',
      'Vercel', 'Render', 'EAS',
    ],
    artwork: 'greenway',
    status: 'Completed',
    liveUrl: 'https://greenway-candelaria.vercel.app/',
    detailsUrl: '/experience/projects/greenway',
  },
  {
    id: 'vyora',
    title: 'VYORA',
    category: 'WINDOWS PHOTO BOOTH',
    collection: 'tools',
    listed: true,
    description: 'A Windows photo booth for capturing, retaking, saving, and printing custom photo strips.',
    technologies: [
      'Electron', 'React', 'TypeScript', 'SQLite', 'Vite',
      'Cloudflare Workers', 'Electron Forge', 'NSIS', 'GitHub Releases',
    ],
    artwork: 'structure',
    status: 'Live · In development',
    liveUrl: 'https://vyorabooth.vyora.workers.dev/',
    detailsUrl: '/experience/projects/vyora',
    minimalDetailsUrl: '/projects/vyora',
  },
]

export const listedProjects = projects.filter(project => project.listed)

// User-supplied capabilities, including the AI tools added to the portfolio.
export const capabilities = [
  {
    id: '01',
    title: 'Web, Mobile & Desktop',
    description: 'Websites, mobile apps, and Windows desktop experiences, from interface development to packaged releases.',
    technologies: [
      'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'React Router',
      'TanStack Query', 'Zustand', 'React Native', 'Expo',
      'Leaflet', 'MapLibre React Native', 'Vite', 'WordPress',
      'Electron', 'Electron Forge', 'NSIS', 'GitHub Releases',
    ],
    artwork: 'web',
  },
  {
    id: '02',
    title: 'Backend & Databases',
    description: 'APIs, live updates, databases, and cloud deployment that connect interfaces to working systems.',
    technologies: [
      'Node.js', 'Express', 'MySQL', 'TiDB', 'Supabase', 'Neon', 'MongoDB',
      'Socket.IO', 'Cloudinary', 'Vercel', 'Render', 'SQLite', 'Cloudflare Workers',
    ],
    artwork: 'fullstack',
  },
  {
    id: '03',
    title: 'AI & Workflow Automation',
    description: 'AI-assisted coding, workflow integrations, and CRM automation.',
    technologies: ['Codex', 'Claude Code', 'Antigravity', 'n8n', 'GHL'],
    artwork: 'automation',
  },
] as const

export const journey = {
  introduction: 'My journey began with creating digital graphics and gradually evolved into building functional web and mobile applications.',
  entries: [
    {
      id: 'capstone',
      date: '2026 — Present',
      dateMain: '2026',
      dateDetail: '— Present',
      title: 'Full-Stack Developer',
      context: 'GreenWay / Web & Mobile Development',
      description: 'Built a smart waste management platform with integrated tracking and notifications for the Municipality of Candelaria, Quezon.',
      category: 'Building',
      current: true,
    },
    {
      id: 'education',
      date: 'Current',
      dateMain: 'Now',
      dateDetail: 'Current',
      title: 'BS Computer Science — 4th Year',
      context: 'Manuel S. Enverga University Foundation – Candelaria, Inc. (MSEUF-CI)',
      description: 'Pursuing a Bachelor of Science in Computer Science, applying programming and software development concepts through academic and practical projects.',
      category: 'Learning',
      current: false,
    },
    {
      id: 'design',
      date: 'Around 2021',
      dateMain: '2021',
      dateDetail: 'Around',
      title: 'Gaming Graphics & Banner Design',
      context: 'Independent Creative Projects',
      description: 'Created gaming-related graphics and banners, gaining early experience in digital composition, typography, and visual design.',
      category: 'Creating',
      current: false,
    },
  ],
} as const
