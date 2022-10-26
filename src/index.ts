import type { PluginOption } from 'vite'
import type { Options } from './types'
import { resolveOptions } from './options'
import config from './config'
import html from './html'

export default function VitePluginShopify (userOptions: string | string[] | Options): PluginOption[] {
  const options = resolveOptions(userOptions as Options)

  return [
    config(options),
    html(options)
  ]
}
