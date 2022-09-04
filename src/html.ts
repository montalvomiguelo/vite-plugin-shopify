import { join, relative } from 'path'
import fs from 'fs'
import { projectRoot, root } from './config'
import type { Plugin, ResolvedConfig, Manifest } from 'vite'
import { ENTRYPOINT_TYPES_REGEX, CSS_EXTENSIONS_REGEX, CLIENT_SCRIPT_PATH } from './constants'
import { Input } from './types'
import createDebugger from 'debug'

let config: ResolvedConfig
const debug = createDebugger('vite-plugin-shopify:html')

export default function VitePluginShopifyHtml (): Plugin {
  let entrypoints: Input

  return {
    name: 'vite-plugin-shopify-html',
    enforce: 'post',
    configResolved (resolvedConfig) {
      config = resolvedConfig
      entrypoints = config.build?.rollupOptions?.input as Input
      debug({ entrypoints })
    },
    configureServer (server) {
      writeSnippetFile(
        'vite-tag.liquid',
        viteTags(entrypoints)
      )

      writeSnippetFile(
        'vite-client.liquid',
        viteClient()
      )

      server.watcher.on('add', path => {
        if (!ENTRYPOINT_TYPES_REGEX.test(path)) {
          return
        }

        entrypoints[relative(root, path)] = path
        debug({ entrypoints })
        writeSnippetFile(
          'vite-tag.liquid',
          viteTags(entrypoints)
        )
      })

      server.watcher.on('unlink', path => {
        const { [relative(root, path)]: _, ...rest } = entrypoints
        entrypoints = rest
        debug({ entrypoints })
        writeSnippetFile(
          'vite-tag.liquid',
          viteTags(entrypoints)
        )
      })
    },
    closeBundle () {
      const manifestFilePath = join(projectRoot, 'assets', 'manifest.json')

      const manifest = JSON.parse(
        fs.readFileSync(manifestFilePath, 'utf-8')
      ) as Manifest

      debug({ manifest })

      const viteTags = Object.keys(manifest).map(chunkName => {
        const chunk = manifest[chunkName]
        const { isEntry, src, imports, file } = chunk

        if (!config.build.cssCodeSplit && src === 'style.css') {
          return `{%- if vite-tag == '${src}' -%}\n  ${makeLinkTag({ rel: 'stylesheet', href: getAssetUrl(file) })}\n{%- endif -%}`
        }

        if (isEntry === undefined) {
          return ''
        }

        if (config.build.cssCodeSplit && CSS_EXTENSIONS_REGEX.test(src as string)) {
          return `{%- if vite-tag == '${src as string}' -%}\n  ${makeLinkTag({ rel: 'stylesheet', href: getAssetUrl(file) })}\n{%- endif -%}`
        }

        const assetTags = [
          makeScriptTag({ src: getAssetUrl(file), type: 'module', crossorigin: 'anonymous' })
        ]

        if (imports !== undefined) {
          imports.forEach(file => assetTags.push(makeLinkTag({ href: getAssetUrl(manifest[file].file), rel: 'modulepreload', as: 'script', crossorigin: 'anonymous' })))
        }

        return `{%- if vite-tag == '${src as string}' -%}\n  ${assetTags.join('\n  ')}\n{%- endif -%}`
      }).filter(Boolean).join('\n\n')

      writeSnippetFile('vite-tag.liquid', viteTags)
      writeSnippetFile('vite-client.liquid', '')
    }
  }
}

function writeSnippetFile (filename: string, content: string): void {
  return fs.writeFileSync(join(projectRoot, 'snippets', filename), content)
}

function viteClient (): string {
  return makeScriptTag({ src: getAssetUrl(CLIENT_SCRIPT_PATH), type: 'module' })
}

function viteTags (entrypoints: Input): string {
  return `${Object.keys(entrypoints)
    .map(viteTag)
    .join('\n\n')}`
}

function viteTag (entrypoint: string): string {
  return `{%- if vite-tag == '${entrypoint}' -%}\n  ${CSS_EXTENSIONS_REGEX.test(entrypoint)
      ? makeLinkTag({ href: getAssetUrl(entrypoint), rel: 'stylesheet' })
      : makeScriptTag({ src: getAssetUrl(entrypoint), type: 'module' })}\n{%- endif -%}`
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

function getAssetUrl (asset: string): string {
  if (config.command === 'serve') {
    const protocol = config?.server?.https === true ? 'https:' : 'http:'
    const host = config?.server?.host as string
    const port = config?.server?.port as number

    return `${protocol}//${host}:${port.toString()}/${asset}`
  }

  return `{{ '${asset}' | asset_url }}`
}
