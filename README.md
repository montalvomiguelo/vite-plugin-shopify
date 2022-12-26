# vite-plugin-shopify

Vite plugin for developing Shopify themes.

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
  input: string | string[]
  themeRoot?: string
}
```

## Snippet Helpers

```liquid
{%- liquid
  # Render a script tag that includes the Vite client
  render 'vite-client'

  # Render tags that include the given entry
  render 'vite-tag' with 'resources/css/theme.css'
  render 'vite-tag' with 'resources/js/theme.ts'
-%}
```
