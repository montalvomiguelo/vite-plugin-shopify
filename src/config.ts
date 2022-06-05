import { posix, basename } from 'path'
import { ENTRYPOINT_TYPES_REGEX } from './constants'
import type { OutputOptions, PreRenderedChunk, PreRenderedAsset } from 'rollup'
import { Entrypoints } from './types'

export function filterEntrypointsForRollup (entrypoints: Entrypoints): Entrypoints {
  return entrypoints.filter(([_name, filename]) => ENTRYPOINT_TYPES_REGEX.test(filename))
}

export function outputOptions (assetsDir: string): OutputOptions {
  const outputFileName = (ext: string) => (chunkInfo: PreRenderedChunk | PreRenderedAsset) => {
    const shortName = basename(chunkInfo.name as string).split('.')[0]
    return posix.join(assetsDir, `${shortName}.[hash].${ext}`)
  }

  return {
    entryFileNames: outputFileName('js'),
    chunkFileNames: outputFileName('js'),
    assetFileNames: outputFileName('[ext]')
  }
}
