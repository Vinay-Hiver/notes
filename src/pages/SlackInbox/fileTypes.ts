import doc from '../../assets/file-icons/doc.svg'
import docx from '../../assets/file-icons/docx.svg'
import image from '../../assets/file-icons/image.svg'
import mov from '../../assets/file-icons/mov.svg'
import mp4 from '../../assets/file-icons/mp4.svg'
import pdf from '../../assets/file-icons/pdf.svg'
import ppt from '../../assets/file-icons/ppt.svg'
import rar from '../../assets/file-icons/rar.svg'
import txt from '../../assets/file-icons/txt.svg'
import xls from '../../assets/file-icons/xls.svg'
import zip from '../../assets/file-icons/zip.svg'

/** The most files one note can carry, and their largest combined size (PRD R3: 10 files, 24 MB). */
export const MAX_FILES = 10
export const MAX_TOTAL_BYTES = 24 * 1024 * 1024

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

const byExtension: Record<string, string> = {
  pdf, doc, docx, txt, zip, rar, mp4, mov,
  ppt, pptx: ppt, xls, xlsx: xls, csv: xls,
  ...Object.fromEntries(imageExtensions.map((e) => [e, image])),
}

/** The 30×30 file-type icon for a file, by its extension and then its type. Unknown files use the text icon. */
export function fileIcon(name: string, mime = ''): string {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
  if (byExtension[ext]) return byExtension[ext]
  if (mime.startsWith('image/')) return image
  if (mime.startsWith('video/')) return mp4
  return txt
}

/** Whether a file is an image, so its tile can show the picture itself instead of an icon. */
export function isImage(name: string, mime = ''): boolean {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
  return mime.startsWith('image/') || imageExtensions.includes(ext)
}

/** A size the way the designs write it: "7 Bytes", "139 KB", "1.5 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
}

/** "[file name] • [size]". A name longer than `max` is cut in the middle so the format stays: "long_file_na....jpg". */
export function fileLabel(name: string, bytes: number, max = 24): string {
  return `${shortName(name, max)} • ${formatSize(bytes)}`
}

function shortName(name: string, max: number): string {
  if (name.length <= max) return name
  const dot = name.lastIndexOf('.')
  // Keep the extension (".jpg") when there is a short one; otherwise cut the end.
  const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : ''
  return `${name.slice(0, Math.max(1, max - ext.length - 3))}...${ext}`
}
