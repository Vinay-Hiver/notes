import { useEffect, useRef, useState } from 'react'
import { MAX_FILES, MAX_TOTAL_BYTES } from './fileTypes'
import type { NoteAttachment } from './NoteComposer'

/** A file that wasn't added, and the limit it would have broken. */
export type RejectedFile = { name: string; size: number; limit: 'count' | 'size' }

// Simulated upload: about 1.2 s plus 0.3 s per MB, at most 5 s.
const durationFor = (bytes: number) => Math.min(5000, 1200 + (bytes / (1024 * 1024)) * 300)
// To show a failure, a file whose name contains "fail" fails on its first try (at 60%). Retry then succeeds.
const failsFirstTry = (name: string) => /fail/i.test(name)

/**
 * The files on the note being written (PRD R1, R3, R4): picking several at once, the 10-file and 24 MB limits,
 * a simulated upload with progress for each file, failure, retry and removal.
 * `simulateFailures` (the prototype switch at the top of the page) makes every new upload fail on its first try.
 */
export function useNoteAttachments(simulateFailures = false) {
  const [files, setFiles] = useState<NoteAttachment[]>([])
  const [rejected, setRejected] = useState<RejectedFile[]>([])
  const timers = useRef(new Map<string, number>())

  const stop = (id: string) => { clearInterval(timers.current.get(id)); timers.current.delete(id) }
  useEffect(() => () => { timers.current.forEach((t) => clearInterval(t)) }, [])

  const patch = (id: string, change: Partial<NoteAttachment>) => setFiles((all) => all.map((f) => (f.id === id ? { ...f, ...change } : f)))

  const upload = (id: string, size: number, fail: boolean) => {
    stop(id)
    const step = (100 * 100) / durationFor(size)
    let progress = 0
    patch(id, { status: 'uploading', progress: 0 })
    timers.current.set(id, window.setInterval(() => {
      progress = Math.min(100, progress + step)
      if (fail && progress >= 60) { stop(id); patch(id, { status: 'failed', progress }); return }
      if (progress >= 100) { stop(id); patch(id, { status: 'done', progress: 100 }); return }
      patch(id, { progress })
    }, 100))
  }

  /** Adds files in the order picked until the next one would break a limit; that one and the rest are rejected. */
  const attach = (picked: File[]) => {
    let count = files.length
    let total = files.reduce((sum, f) => sum + f.size, 0)
    const added: NoteAttachment[] = []
    const out: RejectedFile[] = []
    let stoppedBy: RejectedFile['limit'] | undefined
    picked.forEach((file, i) => {
      const limit = count + 1 > MAX_FILES ? 'count' : total + file.size > MAX_TOTAL_BYTES ? 'size' : undefined
      stoppedBy ??= limit
      if (stoppedBy) { out.push({ name: file.name, size: file.size, limit: stoppedBy }); return }
      count += 1
      total += file.size
      added.push({ id: `${file.name}-${Date.now()}-${i}`, name: file.name, size: file.size, mime: file.type, url: URL.createObjectURL(file), status: 'uploading', progress: 0 })
    })
    setFiles((f) => [...f, ...added])
    added.forEach((a) => upload(a.id, a.size, simulateFailures || failsFirstTry(a.name)))
    if (out.length) setRejected(out)
  }

  const retry = (id: string) => { const f = files.find((x) => x.id === id); if (f) upload(id, f.size, false) }
  const remove = (id: string) => { stop(id); setFiles((all) => all.filter((f) => f.id !== id)) }
  const clear = () => { timers.current.forEach((t) => clearInterval(t)); timers.current.clear(); setFiles([]) }

  return { files, attach, retry, remove, clear, rejected, clearRejected: () => setRejected([]) }
}
