import { describe, expect, it } from 'vitest'
import shopify from '../src/index'

describe('vite-plugin-shopify', () => {
  it('handles missing configuration', () => {
    expect(() => shopify()).toThrow('vite-plugin-shopify: missing configuration.')

    expect(() => shopify({})).toThrow('vite-plugin-shopify: missing configuration for "input".')
  })
})
