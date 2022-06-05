import { posix, basename } from 'path'
import { ENTRYPOINT_TYPES_REGEX } from './constants'
import { Entrypoints } from './types'

export function filterEntrypointsForRollup (entrypoints: Entrypoints): Entrypoints {
  return entrypoints.filter(([_name, filename]) => ENTRYPOINT_TYPES_REGEX.test(filename))
}

export function outputOptions (assetsDir: string) {
  const outputFileName = (ext: string) => ({ name }: { name: string }) => {
    const shortName = basename(name).split('.')[0]
    return posix.join(assetsDir, `${shortName}.[hash].${ext}`)
  }

  return {
    entryFileNames: outputFileName('js'),
    chunkFileNames: outputFileName('js'),
    assetFileNames: outputFileName('[ext]')
  }
}
