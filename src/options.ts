import type { Options } from './types'

export function resolveOptions (config: Options): Options {
  if (typeof config === 'undefined') {
    throw new Error('vite-plugin-shopify: missing configuration.')
  }

  if (typeof config === 'string' || Array.isArray(config)) {
    config = { input: config }
  }

  if (typeof config.input === 'undefined') {
    throw new Error('vite-plugin-shopify: missing configuration for "input".')
  }

  if (typeof config.themeRoot === 'string') {
    config.themeRoot = config.themeRoot.trim().replace(/^\/+/, '')

    if (config.themeRoot === '') {
      throw new Error('themeRoot must be a directory. E.g. \'shopify\'.')
    }
  }

  return {
    input: config.input,
    themeRoot: config.themeRoot ?? process.cwd()
  }
}
