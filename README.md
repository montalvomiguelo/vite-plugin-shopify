# vite-plugin-shopify

Vite plugin for developing Shopify themes.

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'

export default defineConfig({
  plugins: [
    shopify([
      'resources/css/theme.css',
      'resources/js/theme.ts'
    ])
  ]
})
```

## Options

```ts
export interface Options {
  input?: string | string[]
  themeRoot?: string
}
```

## Loading your scripts and styles

```liquid
{%- liquid
  # The Vite client script
  render 'vite-client'

  # The tag for a given entrypoint
  render 'vite-tag' with 'resources/css/theme.css'
  render 'vite-tag' with 'resources/js/theme.ts'
-%}
```

```liquid

{%- liquid
  # The URL for a given asset
  render 'vite-asset' with 'resources/js/theme.ts'
-%}
```