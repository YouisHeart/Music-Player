const DB_NAME = 'cyber-music-player'
const STORE = 'tracks'
const VERSION = 1

let databasePromise = null

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('INDEXED_DB_UNAVAILABLE'))
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(STORE)) {
          const store = database.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('addedAt', 'addedAt')
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('INDEXED_DB_OPEN_FAILED'))
      request.onblocked = () => reject(new Error('INDEXED_DB_BLOCKED'))
    })
  }
  return databasePromise
}

function runTransaction(mode, operation) {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE, mode)
        const store = transaction.objectStore(STORE)
        let result
        try {
          result = operation(store)
        } catch (error) {
          reject(error)
          return
        }
        transaction.oncomplete = () => resolve(result && 'result' in result ? result.result : result)
        transaction.onerror = () => reject(transaction.error ?? new Error('INDEXED_DB_TX_FAILED'))
        transaction.onabort = () => reject(transaction.error ?? new Error('INDEXED_DB_ABORTED'))
      }),
  )
}

export function getAllTrackRecords() {
  return runTransaction('readonly', (store) => store.getAll()).then((records) => records ?? [])
}

export function putTrackRecord(record) {
  return runTransaction('readwrite', (store) => store.put(record))
}

export function deleteTrackRecord(id) {
  return runTransaction('readwrite', (store) => store.delete(id))
}

export function clearTrackRecords() {
  return runTransaction('readwrite', (store) => store.clear())
}
