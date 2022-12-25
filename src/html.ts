import { join } from 'path'
import fs from 'fs'
import type { Plugin, ResolvedConfig, Manifest } from 'vite'
import { CLIENT_SCRIPT_PATH, CSS_EXTENSIONS_REGEX, KNOWN_CSS_EXTENSIONS } from './constants'
import { Options } from './types'
import createDebugger from 'debug'

const debug = createDebugger('vite-plugin-shopify:html')

export default function VitePluginShopifyHtml (options: Options): Plugin {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-shopify-html',
    enforce: 'post',
    configResolved (resolvedConfig) {
      config = resolvedConfig
    },
    configureServer (_server) {
      const serverUrl = devServerUrl(config)

      writeSnippetFile(
        'vite-tag.liquid',
        themeCheckDisable(['UndefinedObject'])
          .concat('\n')
          .concat(viteTagsDevelopment(serverUrl)),
        options.themeRoot as string
      )

      writeSnippetFile(
        'vite-client.liquid',
        themeCheckDisable(['RemoteAsset'])
          .concat('\n')
          .concat(makeScriptTag({ src: `${serverUrl}/${CLIENT_SCRIPT_PATH}`, type: 'module' })),
        options.themeRoot as string
      )
    },
    closeBundle () {
      const manifestFilePath = join(options.themeRoot as string, 'assets', 'manifest.json')

      const manifest = JSON.parse(
        fs.readFileSync(manifestFilePath, 'utf-8')
      ) as Manifest

      const viteTags = themeCheckDisable(['UndefinedObject'])
        .concat('\n\n')
        .concat(viteTagsProduction(manifest, config))

      writeSnippetFile('vite-tag.liquid', viteTags, options.themeRoot as string)
      writeSnippetFile('vite-client.liquid', '', options.themeRoot as string)
    }
  }
}

function liquidSnippet (entry: string, statements: string): string {
  return `{%- if vite-tag == '${entry}' -%}\n  ${statements}\n{%- endif -%}`
}

function writeSnippetFile (filename: string, content: string, themeRoot: string): void {
  return fs.writeFileSync(join(themeRoot, 'snippets', filename), content)
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

function viteTagsProduction (manifest: Manifest, config: ResolvedConfig): string {
  debug({ manifest })

  return Object.keys(manifest).map(chunkName => {
    const chunk = manifest[chunkName]
    const { isEntry, src, imports, css, file } = chunk

    if (src === 'style.css' && !config.build?.cssCodeSplit) {
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
      imports.forEach(importee => {
        const chunk = manifest[importee]
        const { css } = chunk

        assetTags.push(makeLinkTag({ href: assetCdnUrl(chunk.file), rel: 'modulepreload', as: 'script', crossorigin: 'anonymous' }))

        if (css == null) {
          return
        }

        css.forEach(file => assetTags.push(makeLinkTag({ rel: 'stylesheet', href: assetCdnUrl(file) })))
      })
    }

    if (css !== undefined) {
      css.forEach(file => assetTags.push(makeLinkTag({ rel: 'stylesheet', href: assetCdnUrl(file) })))
    }

    return liquidSnippet(src as string, assetTags.join('\n  '))
  }).filter(Boolean).join('\n\n')
}

function viteTagsDevelopment (serverUrl: string): string {
  return `{%- liquid
  assign css_extensions = '${KNOWN_CSS_EXTENSIONS.join('|')}' | split: '|'
  assign file_name = vite-tag | split: '/' | last
  assign file_extension = file_name | split: '.' | last
  assign is_css = false
  if css_extensions contains file_extension
    assign is_css = true
  endif
  assign file_url = vite-tag | prepend: '/' | prepend: '${serverUrl}'
-%}
{%- if is_css -%}
  ${makeLinkTag({ href: '{{ file_url }}', rel: 'stylesheet' })}
{%- else -%}
  ${makeScriptTag({ src: '{{ file_url }}', type: 'module' })}
{%- endif -%}`
}

function themeCheckDisable (checks: string[]): string {
  return `{%- # theme-check-disable ${checks.join(',')} -%}`
}
