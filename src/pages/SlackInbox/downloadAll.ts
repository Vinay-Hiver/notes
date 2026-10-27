import JSZip from 'jszip'
import type { NoteAttachment } from './NoteComposer'

/** Puts every attachment of a note in one ZIP file and downloads it. Repeated names get " (2)", " (3)" so none is lost. */
export async function downloadAll(attachments: NoteAttachment[], zipName = 'note-attachments.zip') {
  const zip = new JSZip()
  const used = new Map<string, number>()
  await Promise.all(attachments.map(async (a) => {
    const n = (used.get(a.name) ?? 0) + 1
    used.set(a.name, n)
    const dot = a.name.lastIndexOf('.')
    const name = n === 1 ? a.name : dot > 0 ? `${a.name.slice(0, dot)} (${n})${a.name.slice(dot)}` : `${a.name} (${n})`
    zip.file(name, await (await fetch(a.url)).blob())
  }))
  const url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: zipName })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
