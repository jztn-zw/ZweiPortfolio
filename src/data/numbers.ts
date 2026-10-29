import { capabilities, projects } from './portfolio'

// Only shipped work contributes to the project and technology totals.
export const completedProjects = projects.filter(project => project.status?.toLowerCase() === 'completed')
export const projectTechnologies = [...new Set(completedProjects.flatMap(project => project.technologies))]
export const workflowTools = capabilities.find(capability => capability.artwork === 'automation')?.technologies ?? []
