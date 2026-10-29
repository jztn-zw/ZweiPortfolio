// Personal details supplied by Jaztin. Projects and unprovided social profiles remain placeholders.
// Leave contact URLs null until real destinations are available.
export type Contact = {
  id: 'github' | 'linkedin' | 'email'
  label: string
  url: string | null
}

export const portfolio = {
  name: 'Jaztin Abram Contreras',
  shortName: 'Jaztin',
  nameLines: ['Jaztin Abram', 'Contreras'],
  role: 'Full-Stack Developer',
  location: 'Sariaya, Quezon, Philippines',
  availability: 'Open to Opportunities',
  introduction: 'I build modern web and mobile applications, turning ideas into functional digital solutions.',
  description: 'Driven by curiosity and logical thinking, I enjoy solving problems, understanding how systems work, and exploring the possibilities of AI.',
  contacts: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/jztn-zw' },
    { id: 'linkedin', label: 'LinkedIn', url: null },
    { id: 'email', label: 'Email', url: 'mailto:jaztinabramcontreras@gmail.com' },
  ] as Contact[],
}

export const contactContent = {
  question: 'Have something in mind?',
  heading: ['Let’s make', 'it happen.'],
  paragraphs: [
    'Have a project idea, an opportunity, or just want to connect?',
    "I'm always open to exploring new ideas, collaborating on meaningful projects, and learning through new challenges.",
    "Whether it's web development, automation, networking, or something entirely new, feel free to reach out.",
  ],
  primaryLabel: 'Get in Touch',
  footerVerse: {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ which strengtheneth me.',
    translation: 'KJV',
  },
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

export type Project = {
  id: string
  title: string
  category: string
  description: string
  technologies: string[]
  artwork: 'terrain' | 'orbit' | 'structure' | 'greenway'
  status?: string
  liveUrl?: string
  detailsUrl?: string
}

export const projects: Project[] = [
  { id: '001', title: '[PROJECT NAME]', category: '[PROJECT CATEGORY]', description: '[PROJECT DESCRIPTION]', technologies: ['[TECH STACK]'], artwork: 'terrain' },
  {
    id: '002',
    title: 'GreenWay',
    category: 'WEB & MOBILE APPLICATION',
    description: 'A waste management platform for Candelaria, Quezon, with collection tracking, pickup schedules, and resident reports.',
    technologies: ['React', 'React Native', 'Node.js', 'MySQL', 'TypeScript', 'Tailwind CSS', 'Express', 'Expo', 'Socket.IO', 'Leaflet', 'MapLibre', 'Cloudinary'],
    artwork: 'greenway',
    status: 'Completed',
    liveUrl: 'https://greenway-candelaria.vercel.app/',
    detailsUrl: '/projects/greenway',
  },
  { id: '003', title: '[PROJECT NAME]', category: '[PROJECT CATEGORY]', description: '[PROJECT DESCRIPTION]', technologies: ['[TECH STACK]'], artwork: 'structure' },
]

// User-supplied capabilities, including the AI tools added to the portfolio.
export const capabilities = [
  {
    id: '01',
    title: 'Frontend & Mobile Development',
    description: 'Responsive web and cross-platform mobile interfaces built for functionality, usability, and clear visual design.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'React Native', 'Expo'],
    artwork: 'web',
  },
  {
    id: '02',
    title: 'Backend & Databases',
    description: 'Backend application logic, APIs, and databases that connect interfaces to working systems.',
    technologies: ['Node.js', 'Express', 'MySQL'],
    artwork: 'fullstack',
  },
  {
    id: '03',
    title: 'AI & Workflow Automation',
    description: 'AI-assisted coding and connected workflows using Codex, Antigravity, and n8n.',
    technologies: ['Codex', 'Antigravity', 'n8n'],
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
