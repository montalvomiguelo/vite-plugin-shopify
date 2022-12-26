import type { Options } from './types'

export function resolveOptions (config: string | string[] | Options): Required<Options> {
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
      throw new Error('vite-plugin-shopify: themeRoot must be a subdirectory. E.g. \'shopify\'.')
    }
  }

  return {
    input: config.input,
    themeRoot: config.themeRoot ?? process.cwd()
  }
}
