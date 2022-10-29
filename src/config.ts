import { relative } from 'path'
import { Plugin, UserConfig, ConfigEnv } from 'vite'
import { Options } from './types'
import createDebugger from 'debug'

const debug = createDebugger('vite-plugin-shopify:config')

function resolveInput (config: Options): string | string[] | undefined {
  return config.input
}

export default function VitePluginShopifyConfig (options: Options): Plugin {
  return {
    name: 'vite-plugin-shopify',
    config: function (config: UserConfig, _env: ConfigEnv): UserConfig {
      const assetsDir = './'
      const outDir = relative(options.themeRoot as string, 'assets')
      const base = './'
      const host = config.server?.host ?? 'localhost'
      const port = config.server?.port ?? 5173
      const https = config.server?.https ?? false
      const socketProtocol = https === true ? 'wss' : 'ws'
      const protocol = https === true ? 'https:' : 'http:'
      const origin = `${protocol}//${host as string}:${port}`
      const strictPort = config.server?.strictPort ?? true
      const defaultAliases: Record<string, string> = {
        '@': '/resources/js'
      }

      debug({ outDir, host, https, port, protocol, strictPort, origin, socketProtocol, config, options })

      return {
        base,
        publicDir: false,
        server: {
          host,
          https,
          port,
          origin,
          strictPort,
          hmr: {
            host: host as string,
            port,
            protocol: socketProtocol
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
          assetsDir,
          manifest: true,
          outDir,
          rollupOptions: {
            input: config.build?.rollupOptions?.input ?? resolveInput(options)
          }
        }
      }
    }
  }
}
