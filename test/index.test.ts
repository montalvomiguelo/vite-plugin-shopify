import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import shopify from '../src/index'
import fs from 'fs/promises'

describe('vite-plugin-shopify', () => {
  it('runs as expected', async () => {
    await build({
      plugins: [
        shopify({
          input: [
            'test/__fixtures__/resources/css/theme.css',
            'test/__fixtures__/resources/js/theme.js'
          ],
          themeRoot: 'test/__fixtures__'
        })
      ]
    })

    const tagsHtml = await fs.readFile('test/__fixtures__/snippets/vite-tag.liquid', { encoding: 'utf8' })
    const clientHtml = await fs.readFile('test/__fixtures__/snippets/vite-client.liquid', { encoding: 'utf8' })

    expect(tagsHtml).toMatchSnapshot()
    expect(clientHtml).toMatchSnapshot()
  })
})
