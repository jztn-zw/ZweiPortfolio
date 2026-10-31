import { CalendarDays, MapPinned, MessageSquareText } from 'lucide-react'

export const greenwayFeatures = [
  { title: 'Know your collection day.', icon: CalendarDays, description: 'A weekly guide and collection calendar make it easier to prepare the right waste for pickup.' },
  { title: 'See where the truck is.', icon: MapPinned, description: 'Map-based tracking helps residents follow collection progress in their community.' },
  { title: 'Keep the conversation going.', icon: MessageSquareText, description: 'Report waste concerns, follow their progress, and find local announcements in one place.' },
]

export const greenwayStackLayers = [
  { id: 'interface', title: 'Web & mobile', mark: 'modules', tools: ['React', 'React Native', 'TypeScript', 'Tailwind CSS', 'Expo'] },
  { id: 'services', title: 'Services & data', mark: 'connection', tools: ['Node.js', 'Express', 'MySQL', 'Socket.IO'] },
  { id: 'media', title: 'Maps & media', mark: 'globe', tools: ['Leaflet', 'MapLibre', 'Cloudinary'] },
] as const
