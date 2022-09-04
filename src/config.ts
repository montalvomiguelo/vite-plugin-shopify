import { join } from 'path'
import { ENTRYPOINT_TYPES_REGEX } from './constants'

export function filterEntrypointsForRollup (entrypoints: string[]): string[] {
  return entrypoints.filter(file => ENTRYPOINT_TYPES_REGEX.test(file))
}

export const projectRoot = process.cwd()
export const sourceCodeDir = join(projectRoot, 'frontend')
export const root = join(sourceCodeDir, 'entrypoints')
