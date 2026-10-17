import { existsSync, lstatSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Social/marketing previews belong to the web/PWA, but are not used in the
// Android runtime. Prune only the assets copied by Capacitor, never public/dist.
export const PROMOTIONAL_ASSETS = [
  'preview.png',
  'camaleonte-3-2-ratio.png',
  'camaleonte-square.png',
]

export function pruneAndroidAssets(assetsDirectory) {
  if (!existsSync(join(assetsDirectory, 'index.html'))) {
    throw new Error(`Capacitor assets missing from ${assetsDirectory}; run cap sync first.`)
  }

  const removed = []
  for (const name of PROMOTIONAL_ASSETS) {
    const path = join(assetsDirectory, name)
    if (!existsSync(path)) continue

    const stat = lstatSync(path)
    if (!stat.isFile()) {
      throw new Error(`Refusing to delete non-file promotional asset: ${path}`)
    }

    unlinkSync(path)
    removed.push({ name, bytes: stat.size })
  }
  return removed
}

const scriptPath = fileURLToPath(import.meta.url)
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const assetsDirectory = resolve(dirname(scriptPath), '..', 'android', 'app', 'src', 'main', 'assets', 'public')
  const removed = pruneAndroidAssets(assetsDirectory)
  const totalBytes = removed.reduce((sum, asset) => sum + asset.bytes, 0)
  console.log(`Android packaging: excluded ${removed.length} marketing asset(s) (${totalBytes} bytes before compression)`)
}
