import { CalendarDays, MapPinned, MessageSquareText } from 'lucide-react'

export const greenwayFeatures = [
  { title: 'Know your collection day.', icon: CalendarDays, description: 'A weekly guide and collection calendar make it easier to prepare the right waste for pickup.' },
  { title: 'See where the truck is.', icon: MapPinned, description: 'Map-based tracking helps residents follow collection progress in their community.' },
  { title: 'Keep the conversation going.', icon: MessageSquareText, description: 'Report waste concerns, follow their progress, and find local announcements in one place.' },
]

export const greenwayStackLayers = [
  {
    id: 'interface',
    title: 'Website',
    mark: 'modules',
    signal: 'interface',
    tools: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Radix UI', 'React Router', 'TanStack Query', 'Zustand'],
  },
  {
    id: 'services',
    title: 'API & database',
    mark: 'connection',
    signal: 'services',
    tools: ['Node.js', 'TiDB (MySQL-compatible)', 'Express', 'mysql2', 'Socket.IO', 'JWT', 'Zod'],
  },
  {
    id: 'mobile',
    title: 'Mobile apps',
    mark: 'modules',
    signal: 'interface',
    tools: ['React Native', 'Expo', 'Expo Router', 'Expo Location', 'Expo Notifications', 'Expo SecureStore'],
  },
  {
    id: 'media',
    title: 'Maps & media',
    mark: 'globe',
    signal: 'media',
    tools: ['Leaflet', 'MapLibre React Native', 'OpenStreetMap', 'OpenFreeMap', 'OSRM', 'Cloudinary'],
  },
  {
    id: 'deployment',
    title: 'Deployment',
    mark: 'connection',
    signal: 'additional',
    tools: ['Vercel', 'Render', 'EAS'],
  },
] as const
