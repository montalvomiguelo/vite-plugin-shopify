import { relative } from 'path'
import { Plugin, UserConfig, ConfigEnv } from 'vite'
import { Options } from './types'
import createDebugger from 'debug'

const debug = createDebugger('vite-plugin-shopify:config')

export default function config (options: Required<Options>): Plugin {
  return {
    name: 'vite-plugin-shopify:config',
    config: function (config: UserConfig, _env: ConfigEnv): UserConfig {
      const host = config.server?.host ?? 'localhost'
      const port = config.server?.port ?? 5173
      const https = config.server?.https ?? false
      const socketProtocol = https === true ? 'wss' : 'ws'
      const protocol = https === true ? 'https:' : 'http:'
      const origin = config.server?.origin ?? `${protocol}//${host as string}:${port}`
      const defaultAliases: Record<string, string> = {
        '@': '/resources/js'
      }

      debug({ host, https, port, protocol, origin, socketProtocol, config, options })

      return {
        base: config.base ?? './',
        publicDir: config.publicDir ?? false,
        server: {
          host,
          https,
          port,
          origin,
          strictPort: config.server?.strictPort ?? true,
          hmr: config.server?.hmr === false
            ? false
            : {
                host: host as string,
                port,
                protocol: socketProtocol,
                ...config.server?.hmr === true ? {} : config.server?.hmr
              }
        },
        resolve: {
          alias: Array.isArray(config.resolve?.alias)
            ? [
                ...config.resolve?.alias ?? [],
                ...Object.keys(defaultAliases).map(alias => ({
                  find: alias,
                  replacement: defaultAliases[alias]
                }))
              ]
            : {
                ...defaultAliases,
                ...config.resolve?.alias
              }
        },
        build: {
          assetsDir: config.build?.assetsDir ?? './',
          manifest: config.build?.manifest ?? true,
          outDir: config.build?.outDir ?? relative(options.themeRoot, 'assets'),
          rollupOptions: {
            input: config.build?.rollupOptions?.input ?? options.input
          }
        }
      }
    }
  }
}
