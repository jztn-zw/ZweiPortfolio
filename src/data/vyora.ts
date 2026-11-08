import { Camera, PanelsTopLeft, Printer } from 'lucide-react'

export const vyoraFeatures = [
  {
    title: 'Capture, review, retake',
    icon: Camera,
    description: 'Set the countdown, take a photo session, and retake individual shots before confirming the finished strip.',
  },
  {
    title: 'Make the strip your own',
    icon: PanelsTopLeft,
    description: 'Choose an included frame or import a custom template. Finished strips stay in the local photo library.',
  },
  {
    title: 'Bring it to the booth',
    icon: Printer,
    description: 'Print saved strips, run a guest booth, and connect approved guest displays on the same local network.',
  },
] as const

export const vyoraStackLayers = [
  {
    id: 'desktop',
    title: 'Windows desktop app',
    description: 'Electron runs the app, React and TypeScript build the interface, and SQLite stores the local library.',
    tools: ['Electron', 'React', 'TypeScript', 'SQLite'],
  },
  {
    id: 'website',
    title: 'Website',
    description: 'React and TypeScript build the website, Vite bundles it, and Cloudflare Workers hosts it.',
    tools: ['React', 'TypeScript', 'Vite', 'Cloudflare Workers'],
  },
  {
    id: 'releases',
    title: 'Packaging & downloads',
    description: 'Electron Forge and NSIS create the Windows installer, which is distributed through GitHub Releases.',
    tools: ['Electron Forge', 'NSIS', 'GitHub Releases'],
  },
] as const
