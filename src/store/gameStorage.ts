import { Preferences } from '@capacitor/preferences'

const GAME_SNAPSHOT_KEY = 'camaleonte.active-game'

let writeQueue: Promise<void> = Promise.resolve()

function enqueueWrite(operation: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue
    .catch(() => {})
    .then(operation)
  return writeQueue
}

export async function readStoredGameSnapshot(): Promise<string | null> {
  await writeQueue.catch(() => {})
  const { value } = await Preferences.get({ key: GAME_SNAPSHOT_KEY })
  return value
}

export function writeStoredGameSnapshot(value: string): Promise<void> {
  return enqueueWrite(() => Preferences.set({ key: GAME_SNAPSHOT_KEY, value }))
}

export function clearStoredGameSnapshot(): Promise<void> {
  return enqueueWrite(() => Preferences.remove({ key: GAME_SNAPSHOT_KEY }))
}
