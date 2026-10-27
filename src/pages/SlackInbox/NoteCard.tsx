import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Tooltip } from '../../components/Tooltip'
import '../../components/Table/Table.css'
import { Icon } from '../../icons'
import type { IconName } from '../../icons/iconData'
import { NoteComposer } from './NoteComposer'
import type { NoteAttachment } from './NoteComposer'
import { downloadAll } from './downloadAll'
import { fileIcon, fileLabel } from './fileTypes'
import './NoteCard.css'

type Props = {
  author: string
  text: string
  attachments: NoteAttachment[]
  time: string
  onSave: (text: string) => void
  onDelete: () => void
}

/**
 * A saved note in Activity & Notes: the author, the text, the attached files and the time.
 * Hovering the note shows Edit and Delete in the Table's row-action pill; hovering a file shows a download button.
 * Delete asks to confirm over the note. Edit swaps the note for an editor without the files (they can't change while editing).
 * Not in the Storybook; built from Avatar, Button, Tooltip, Icon, the Table row-action styles and tokens.
 */
export function NoteCard({ author, text, attachments, time, onSave, onDelete }: Props) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
  const [draft, setDraft] = useState(text)
  const [modalOpen, setModalOpen] = useState(false)

  const header = (
    <div className="note-card__author">
      <Avatar initial={author.charAt(0).toUpperCase()} title={author} size="small" color="red" />
      <span className="note-card__name">{author}</span>
    </div>
  )

  if (mode === 'edit') {
    const cancel = () => { setDraft(text); setModalOpen(false); setMode('view') }
    const save = () => { onSave(draft.trim()); setModalOpen(false); setMode('view') }
    const editor = (expand?: () => void) => (
      <NoteComposer
        editing text={draft} onTextChange={setDraft} attachments={attachments}
        onAttach={() => {}} onRemoveAttachment={() => {}} onRetryAttachment={() => {}} onCancel={cancel} onSave={save} onExpand={expand}
      />
    )
    return (
      <div className="note-card">
        {header}
        <div className="note-card__edit">{editor(() => setModalOpen(true))}</div>
        {modalOpen && (
          <div className="note-modal-scrim">
            <Modal title="Edit note" width={500} onClose={() => setModalOpen(false)}>{editor()}</Modal>
          </div>
        )}
      </div>
    )
  }

  const actions: { icon: IconName; label: string; onClick: () => void }[] = [
    // Only a note with more than one file gets Download all, which saves them together as a ZIP.
    ...(attachments.length > 1 ? [{ icon: 'download' as IconName, label: 'Download all', onClick: () => { void downloadAll(attachments) } }] : []),
    { icon: 'edit', label: 'Edit', onClick: () => { setDraft(text); setMode('edit') } },
    { icon: 'delete', label: 'Delete', onClick: () => setMode('confirm') },
  ]

  return (
    <div className="note-card">
      {header}
      {text && <div className="note-card__text">{text}</div>}
      {attachments.length > 0 && (
        <div className="note-card__files">
          {attachments.map((a) => (
            <Tooltip key={a.id} content={fileLabel(a.name, a.size)} portal>
              <a className="note-card__file" href={a.url} download={a.name} aria-label={`Download ${a.name}`}>
                <img className="note-card__file-icon" src={fileIcon(a.name, a.mime)} width="30" height="30" alt="" />
                <span className="note-card__file-download"><Icon name="download" size={16} /></span>
              </a>
            </Tooltip>
          ))}
        </div>
      )}
      <span className="note-card__time">{time}</span>

      {/* The same pill of icon buttons as the Table's row actions. */}
      <div className="hot-table__actions note-card__actions" role="group" aria-label="Note actions">
        {actions.map((a) => (
          <span key={a.label} className="hot-table__action-wrap">
            <Tooltip content={a.label} placement="top">
              <Button iconOnly variant="ghost" size="xs" className="hot-table__action" aria-label={a.label} onClick={a.onClick}>
                <Icon name={a.icon} size={16} />
              </Button>
            </Tooltip>
          </span>
        ))}
      </div>

      {mode === 'confirm' && (
        <div className="note-card__confirm" role="alertdialog" aria-label="Delete this note?">
          <span className="note-card__confirm-text">Delete this note?</span>
          <div className="note-card__confirm-buttons">
            <Button variant="secondary" size="sm" onClick={() => setMode('view')}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  )
}
