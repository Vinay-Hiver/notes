import { useLayoutEffect, useRef } from 'react'
import { Button } from '../../components/Button'
import { Tooltip } from '../../components/Tooltip'
import { Icon } from '../../icons'
import { MAX_FILES, fileIcon, fileLabel } from './fileTypes'
import './NoteComposer.css'

/** An attached file. `url` is a local link to the file, used to download it from a saved note. */
export type NoteAttachment = { id: string; name: string; size: number; mime: string; url: string }

type Props = {
  text: string
  onTextChange: (text: string) => void
  attachments: NoteAttachment[]
  /** Every file the person picked; the parent checks the size and the 5-file limit. */
  onAttach: (files: File[]) => void
  onRemoveAttachment: (id: string) => void
  onCancel: () => void
  onSave: () => void
  /** Shows the "Open in new" button that continues the note in a modal. Left out inside the modal. */
  onExpand?: () => void
  /** The height in px to grow from when the editor opens, for example the one-line "Add a note" field. */
  growFrom?: number
  /** Editing a saved note: its files are hidden and can't be changed, and the button reads Save. */
  editing?: boolean
}

/**
 * The note editor with multiple attachments: a text area, up to 5 files shown by their type icon, and a toolbar with
 * Open in new, Emoji, Attach, Cancel and Add. Hovering a file shows its name and size and a button to remove it.
 * Not in the Storybook: the editor box and the attachment tile are built here from tokens, Button, Tooltip and Icon.
 */
export function NoteComposer({ text, onTextChange, attachments, onAttach, onRemoveAttachment, onCancel, onSave, onExpand, growFrom, editing }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const full = attachments.length >= MAX_FILES

  // The text area grows with the note up to 5 lines (max-height in the CSS), then scrolls.
  useLayoutEffect(() => {
    const el = input.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  // Grows smoothly from the one-line field's height to the full editor when it opens.
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !growFrom || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const height = el.offsetHeight
    Object.assign(el.style, { height: `${growFrom}px`, minHeight: '0', overflow: 'hidden' })
    void el.offsetHeight
    Object.assign(el.style, { transition: 'height 200ms ease-out', height: `${height}px` })
    const done = () => Object.assign(el.style, { height: '', minHeight: '', overflow: '', transition: '' })
    // Only the editor's own height change ends the animation, not a transition inside it.
    const onEnd = (e: TransitionEvent) => { if (e.target === el) done() }
    el.addEventListener('transitionend', onEnd)
    // A fallback in case the transition never ends, so the editor is never left clipped.
    const timer = setTimeout(done, 300)
    // Clearing the styles here also matters in development, where React runs this twice.
    return () => { el.removeEventListener('transitionend', onEnd); clearTimeout(timer); done() }
  }, [growFrom])

  return (
    <div className={`note-composer${editing ? ' note-composer--edit' : ''}`} ref={root}>
      <textarea ref={input} className="note-composer__input" value={text} autoFocus placeholder="Add a note..." onChange={(e) => onTextChange(e.target.value)} />
      <div className="note-composer__bottom">
        {!editing && attachments.length > 0 && (
          <div className="note-composer__files">
            {attachments.map((a) => (
              <Tooltip key={a.id} content={fileLabel(a.name, a.size)} portal>
                <div className="note-composer__file" tabIndex={0}>
                  <img src={fileIcon(a.name, a.mime)} width="30" height="30" alt="" />
                  <button type="button" className="note-composer__remove" aria-label={`Remove ${a.name}`} onClick={() => onRemoveAttachment(a.id)}>
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
        <div className="note-composer__toolbar">
          {onExpand && <Button iconOnly variant="ghost" size="xs" aria-label="Open in new" onClick={onExpand}><Icon name="open" size={16} /></Button>}
          <Button iconOnly variant="ghost" size="xs" aria-label="Emoji"><Icon name="emoji" size={16} /></Button>
          {editing ? (
            <Button iconOnly variant="ghost" size="xs" aria-label="Attach files" disabled><Icon name="attachment" size={16} /></Button>
          ) : full ? (
            // A disabled button gets no hover, so the tooltip sits on a wrapper around it.
            <Tooltip content={`You can attach up to ${MAX_FILES} files`} portal>
              <span className="note-composer__attach-limit" tabIndex={0}>
                <Button iconOnly variant="ghost" size="xs" aria-label="Attach files" disabled><Icon name="attachment" size={16} /></Button>
              </span>
            </Tooltip>
          ) : (
            <Button iconOnly variant="ghost" size="xs" aria-label="Attach files" onClick={() => fileInput.current?.click()}><Icon name="attachment" size={16} /></Button>
          )}
          <input
            ref={fileInput} type="file" multiple hidden
            onChange={(e) => { onAttach(Array.from(e.target.files ?? [])); e.target.value = '' }}
          />
          <span className="note-composer__spacer" />
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={!text.trim() && attachments.length === 0}>{editing ? 'Save' : 'Add'}</Button>
        </div>
      </div>
    </div>
  )
}
