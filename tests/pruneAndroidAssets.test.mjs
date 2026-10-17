import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PROMOTIONAL_ASSETS, pruneAndroidAssets } from '../scripts/prune-android-assets.mjs'

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'camaleonte-assets-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('excludes only marketing images, keeps game resources, and is idempotent', t => {
  const dir = fixture(t)
  writeFileSync(join(dir, 'index.html'), '<html></html>')
  mkdirSync(join(dir, 'assets'))
  writeFileSync(join(dir, 'assets', 'index.js'), 'console.log("game")')
  mkdirSync(join(dir, 'icons'))
  writeFileSync(join(dir, 'icons', 'icon-192.png'), 'icon')
  for (const name of PROMOTIONAL_ASSETS) writeFileSync(join(dir, name), name)

  const removed = pruneAndroidAssets(dir)
  assert.deepEqual(new Set(removed.map(item => item.name)), new Set(PROMOTIONAL_ASSETS))
  assert.equal(removed.length, 3)
  assert.ok(removed.every(item => item.bytes > 0))
  for (const name of PROMOTIONAL_ASSETS) assert.equal(existsSync(join(dir, name)), false)
  assert.equal(existsSync(join(dir, 'index.html')), true)
  assert.equal(existsSync(join(dir, 'assets', 'index.js')), true)
  assert.equal(existsSync(join(dir, 'icons', 'icon-192.png')), true)
  assert.deepEqual(pruneAndroidAssets(dir), [])
})

test('fails safely when Capacitor sync has not generated index.html', t => {
  const dir = fixture(t)
  writeFileSync(join(dir, PROMOTIONAL_ASSETS[0]), 'keep me')
  assert.throws(() => pruneAndroidAssets(dir), /run cap sync first/)
  assert.equal(existsSync(join(dir, PROMOTIONAL_ASSETS[0])), true)
})

test('refuses to delete unexpected directories', t => {
  const dir = fixture(t)
  writeFileSync(join(dir, 'index.html'), '<html></html>')
  mkdirSync(join(dir, PROMOTIONAL_ASSETS[0]))
  assert.throws(() => pruneAndroidAssets(dir), /Refusing to delete non-file/)
  assert.equal(existsSync(join(dir, PROMOTIONAL_ASSETS[0])), true)
})
