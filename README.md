# vite-plugin-shopify

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
  render 'vite-client'
  render 'vite-tag' with 'resources/css/theme.css'
  render 'vite-tag' with 'resources/js/theme.ts'
-%}
```