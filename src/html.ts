import { join, relative } from 'path'
import fs from 'fs'
import { projectRoot, root } from './config'
import type { Plugin, ResolvedConfig, Manifest } from 'vite'
import { ENTRYPOINT_TYPES_REGEX, CSS_EXTENSIONS_REGEX, CLIENT_SCRIPT_PATH } from './constants'
import createDebugger from 'debug'

const debug = createDebugger('vite-plugin-shopify:html')

export default function VitePluginShopifyHtml (): Plugin {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-shopify-html',
    enforce: 'post',
    configResolved (resolvedConfig) {
      config = resolvedConfig
    },
    configureServer (server) {
      const entrypoints = config.build?.rollupOptions?.input as string[]
      const serverUrl = devServerUrl(config)

      const viteTags = (entrypoints: string[]): string[] => entrypoints.map(file => {
        const entryName = relative(root, file)

        debug({ entryName, entrypoints })

        const statements = CSS_EXTENSIONS_REGEX.test(entryName)
          ? makeLinkTag({ href: `${serverUrl}/${entryName}`, rel: 'stylesheet' })
          : makeScriptTag({ src: `${serverUrl}/${entryName}`, type: 'module' })

        return liquidSnippet(entryName, statements)
      })

      server.httpServer?.once('listening', () => {
        writeSnippetFile(
          'vite-tag.liquid',
          viteTags(entrypoints).join('\n\n')
        )

        writeSnippetFile(
          'vite-client.liquid',
          makeScriptTag({ src: `${serverUrl}/${CLIENT_SCRIPT_PATH}`, type: 'module' })
        )
      })

      server.watcher.on('add', path => {
        if (!ENTRYPOINT_TYPES_REGEX.test(path)) {
          return
        }

        entrypoints.push(path)

        writeSnippetFile(
          'vite-tag.liquid',
          viteTags(entrypoints).join('\n\n')
        )
      })

      server.watcher.on('unlink', path => {
        const index = entrypoints.indexOf(path)

        if (index === -1) {
          return
        }

        entrypoints.splice(index, 1)

        writeSnippetFile(
          'vite-tag.liquid',
          viteTags(entrypoints).join('\n\n')
        )
      })
    },
    closeBundle () {
      const manifestFilePath = join(projectRoot, 'assets', 'manifest.json')

      const manifest = JSON.parse(
        fs.readFileSync(manifestFilePath, 'utf-8')
      ) as Manifest

      const viteTags = Object.keys(manifest).map(chunkName => {
        const chunk = manifest[chunkName]
        const { isEntry, src, imports, css, file } = chunk

        debug({ chunkName, chunk })

        if (src === 'style.css') {
          if (config.build?.cssCodeSplit) {
            return ''
          }

          return liquidSnippet(src, makeLinkTag({ rel: 'stylesheet', href: assetCdnUrl(file) }))
        }

        if (isEntry === undefined) {
          return ''
        }

        if (CSS_EXTENSIONS_REGEX.test(src as string)) {
          if (!config.build?.cssCodeSplit) {
            return ''
          }

          return liquidSnippet(src as string, makeLinkTag({ rel: 'stylesheet', href: assetCdnUrl(file) }))
        }

        const assetTags = [
          makeScriptTag({ src: assetCdnUrl(file), type: 'module', crossorigin: 'anonymous' })
        ]

        if (imports !== undefined) {
          imports.forEach(file => assetTags.push(makeLinkTag({ href: assetCdnUrl(manifest[file].file), rel: 'modulepreload', as: 'script', crossorigin: 'anonymous' })))
        }

        if (css !== undefined) {
          css.forEach(file => assetTags.push(makeLinkTag({ rel: 'stylesheet', href: assetCdnUrl(file) })))
        }

        return liquidSnippet(src as string, assetTags.join('\n  '))
      }).filter(Boolean).join('\n\n')

      writeSnippetFile('vite-tag.liquid', viteTags)
      writeSnippetFile('vite-client.liquid', '')
    }
  }
}

function liquidSnippet (entry: string, statements: string): string {
  return `{%- if vite-tag == '${entry}' -%}\n  ${statements}\n{%- endif -%}`
}

function writeSnippetFile (filename: string, content: string): void {
  return fs.writeFileSync(join(projectRoot, 'snippets', filename), content)
}

function makeHtmlAttributes (attributes: Record<string, string>): string {
  if (attributes === undefined) {
    return ''
  }

  const keys = Object.keys(attributes)

  return keys.reduce((result, key) => {
    result += ` ${key}="${attributes[key]}"`
    return result
  }, '')
}

function makeLinkTag (attributes: Record<string, string>): string {
  return `<link${makeHtmlAttributes(attributes)}>`
}

function makeScriptTag (attributes: Record<string, string>): string {
  return `<script${makeHtmlAttributes(attributes)}></script>`
}

function assetCdnUrl (asset: string): string {
  return `{{ '${asset}' | asset_url }}`
}

function devServerUrl (config: ResolvedConfig): string {
  const protocol = config.server?.https === true ? 'https:' : 'http:'
  const host = config.server?.host as string
  const port = config.server?.port as number
  return `${protocol}//${host}:${port.toString()}`
}
