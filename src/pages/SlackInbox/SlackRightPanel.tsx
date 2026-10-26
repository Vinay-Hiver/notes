import { useState } from 'react'
import { Tag } from '../../components/Tag'
import { Icon } from '../../icons'
import type { IconName } from '../../icons/iconData'
import { ActivityNotes, AssigneeField, RightPanel, RightPanelSection, RightPanelTop, StatusField } from '../../patterns/RightPanel'
import type { ActivityDay } from '../../patterns/RightPanel'
import type { ActivityEvent } from '../../patterns/RightPanel'
import { sampleAssignees, samples } from '../../patterns/RightPanel/data'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal, ModalText } from '../../components/Modal'
import { MAX_FILES, MAX_FILE_BYTES } from './fileTypes'
import { EmptyState } from '../../patterns/EmptyState'
import { NoteCard } from './NoteCard'
import { NoteComposer } from './NoteComposer'
import type { NoteAttachment } from './NoteComposer'
import type { SlackConversation } from './slackChats'

// The Storybook's sample people, with the signed-in agent (Praveen Borawar in the samples) shown as Mark Scout.
const people = sampleAssignees.map((p) => (p.value === 'praveen' ? { ...p, value: 'mark', label: 'Mark Scout (Me)' } : p))

type SavedNote = { id: string; text: string; attachments: NoteAttachment[]; time: string }

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

/** A row: [icon] [label] ...space... [value], styled by RightPanel.css. */
function Row({ icon, label, children, link }: { icon: IconName; label: string; children?: React.ReactNode; link?: boolean }) {
  return (
    <div className="hot-rp-field">
      <div className="hot-rp-field__label"><Icon name={icon} size={14} /><span>{label}</span></div>
      <div className={`hot-rp-field__value${link ? ' hot-rp-field__value--link' : ''}`}>{children}</div>
    </div>
  )
}

/**
 * The right panel for a Slack conversation, following the Storybook's Slack channel layout:
 * inbox name with Assignee, Status and Tags, then Customer details, Conversation details, Custom fields,
 * Previous Conversations and Activity & Notes. Custom fields and Previous Conversations start hidden.
 */
export function SlackRightPanel({ inboxName, c }: { inboxName: string; c?: SlackConversation }) {
  const [assignee, setAssignee] = useState('mark')
  const [status, setStatus] = useState<'open' | 'pending' | 'closed'>(c?.view === 'Closed' ? 'closed' : 'open')
  const [onlyNotes, setOnlyNotes] = useState(false)
  // Every Slack section is in the panel; Custom fields and Previous Conversations start unticked in Customize widgets.
  const [visibleIds, setVisibleIds] = useState(['contact', 'conversation', 'activity'])
  const customFields = samples.slack.customFields ?? []
  const previous = samples.slack.previousConversations ?? []
  // The Storybook's sample activity; the icon follows its meaning, as in the Storybook example.
  const history: ActivityDay[] = (samples.email.activity ?? []).map((d) => ({
    day: d.day,
    events: d.items.map((a) => ({ icon: /ticket/i.test(a.text) ? 'ticket' : 'user', text: a.text.replace('Praveen Borawar', 'Mark Scout'), time: a.time })),
  }))

  // The note being written, shared by the inline editor and the modal, and the notes saved so far.
  const [composing, setComposing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [files, setFiles] = useState<NoteAttachment[]>([])
  const [notes, setNotes] = useState<SavedNote[]>([])

  // Set when a picked file is over 1 MB; shows the size-limit modal.
  const [tooBig, setTooBig] = useState(false)

  const reset = () => { setComposing(false); setModalOpen(false); setDraft(''); setFiles([]) }
  // Files over 1 MB are left out (and the modal explains why); the rest are added up to 5 in total.
  const attach = (picked: File[]) => {
    const ok = picked.filter((f) => f.size <= MAX_FILE_BYTES)
    if (ok.length < picked.length) setTooBig(true)
    setFiles((f) => [
      ...f,
      ...ok.slice(0, MAX_FILES - f.length).map((file, i) => ({ id: `${file.name}-${Date.now()}-${i}`, name: file.name, size: file.size, mime: file.type, url: URL.createObjectURL(file) })),
    ])
  }
  const save = () => {
    setNotes((n) => [{ id: `note-${Date.now()}`, text: draft.trim(), attachments: files, time: nowTime() }, ...n])
    reset()
  }
  const composer = (expand?: () => void, growFrom?: number) => (
    <NoteComposer
      text={draft} onTextChange={setDraft} attachments={files}
      onAttach={attach}
      onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onCancel={reset} onSave={save} onExpand={expand} growFrom={growFrom}
    />
  )

  const noteEvents: ActivityEvent[] = notes.map((n) => ({
    id: n.id, icon: 'note', text: n.text || n.attachments[0]?.name || 'Note', time: n.time,
    card: (
      <NoteCard
        author="Mark Scout" text={n.text} attachments={n.attachments} time={n.time}
        onSave={(text) => setNotes((all) => all.map((x) => (x.id === n.id ? { ...x, text } : x)))}
        onDelete={() => setNotes((all) => all.filter((x) => x.id !== n.id))}
      />
    ),
  }))
  const all: ActivityDay[] = noteEvents.length ? [{ day: 'Today', events: noteEvents }, ...history] : history
  const days = onlyNotes
    ? all.map((d) => ({ ...d, events: d.events.filter((e) => e.icon === 'note') })).filter((d) => d.events.length)
    : all

  return (
    <RightPanel aria-label="Details" tabs={[{ id: 'shared-inbox', label: 'Shared Inbox', icon: 'sminbox' }]} customizeWidgets visibleIds={visibleIds} onVisibleChange={setVisibleIds}>
      <RightPanelTop title={inboxName}>
        <AssigneeField value={assignee} onChange={setAssignee} people={people} />
        <StatusField value={status} onChange={setStatus} />
        <Row icon="tag" label="Tags">
          <Tag color="violet" onRemove={() => {}} removeLabel="Remove Finance">Finance</Tag>
          {/* A clickable "Add" chip is not in the Storybook yet, so a Tag sits inside a plain button. */}
          <button type="button" aria-label="Add tag" style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
            <Tag iconLeft={<Icon name="add" size={14} />}>Add</Tag>
          </button>
        </Row>
      </RightPanelTop>

      <RightPanelSection id="contact" title="Customer details" icon="contact" defaultExpanded>
        <Row icon="user" label="Name">{c?.name ?? 'Empty'}</Row>
        <Row icon="mailbox" label="Email">{c?.email ?? 'Empty'}</Row>
        <Row icon="phone" label="Phone">{c?.phone ?? 'Empty'}</Row>
      </RightPanelSection>

      <RightPanelSection id="conversation" title="Conversation details" icon="conversation" defaultExpanded>
        <Row icon="hashnumber" label="Channel">{c ? `#${c.channel}` : 'Empty'}</Row>
        <Row icon="link" label="Slack Thread" link>{c ? 'Open thread' : 'Empty'}</Row>
        <Row icon="clock" label="Initiated at">{c ? `${c.date}, 2026 10:01 AM` : 'Empty'}</Row>
      </RightPanelSection>

      <RightPanelSection id="customFields" title="Custom fields" icon="text" defaultExpanded>
        {customFields.map((r) => <Row key={r.label} icon="text" label={r.label}>{r.value ?? 'Empty'}</Row>)}
      </RightPanelSection>

      <RightPanelSection id="previousConversations" title="Previous Conversations" icon="previousconversations" defaultExpanded>
        {previous.map((p, i) => <Row key={i} icon="conversation" label={c?.name ?? p.from}>{p.preview} · {p.date}</Row>)}
      </RightPanelSection>

      <RightPanelSection id="activity" title="Activity & Notes" icon="clock" defaultExpanded>
        <ActivityNotes
          days={days} onlyNotes={onlyNotes} onOnlyNotesChange={setOnlyNotes}
          compose={composing
            // Grows from the 40px Input it replaces.
            ? composer(() => setModalOpen(true), 40)
            : <Input fullWidth readOnly placeholder="Add a note" prefix={<Icon name="add" size={16} />} onFocus={() => setComposing(true)} onClick={() => setComposing(true)} />}
        />
        {days.length === 0 && <EmptyState icon="note" title="Have a thought?" description="Create a note to add context to this conversation." />}
      </RightPanelSection>

      {modalOpen && (
        <div className="note-modal-scrim">
          <Modal title="Add a note" width={500} onClose={() => setModalOpen(false)}>
            {composer()}
          </Modal>
        </div>
      )}

      {tooBig && (
        <div className="note-modal-scrim">
          <Modal
            title="Attachment size exceeds the 1 MB limit" width={500}
            actions={<><Button variant="secondary" size="sm" onClick={() => setTooBig(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={() => setTooBig(false)}>Got it</Button></>}
          >
            <ModalText>Please upload file less than 1 MB.<br />For larger attachments, you can upload to Google Drive and link here.</ModalText>
          </Modal>
        </div>
      )}
    </RightPanel>
  )
}
