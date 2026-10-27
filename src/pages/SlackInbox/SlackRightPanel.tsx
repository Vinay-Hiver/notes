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
import { MAX_FILES, MAX_TOTAL_BYTES, fileLabel, formatSize } from './fileTypes'
import { useNoteAttachments } from './useNoteAttachments'
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
export function SlackRightPanel({ inboxName, c, simulateFailures }: { inboxName: string; c?: SlackConversation; simulateFailures?: boolean }) {
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
  const [notes, setNotes] = useState<SavedNote[]>([])
  // The note's files: limits, upload progress, failure and retry. `rejected` drives the limit modal.
  const { files, attach, retry, remove, clear, rejected, clearRejected } = useNoteAttachments(simulateFailures)

  const reset = () => { setComposing(false); setModalOpen(false); setDraft(''); clear() }
  const save = () => {
    setNotes((n) => [{ id: `note-${Date.now()}`, text: draft.trim(), attachments: files, time: nowTime() }, ...n])
    reset()
  }
  const composer = (expand?: () => void, growFrom?: number) => (
    <NoteComposer
      text={draft} onTextChange={setDraft} attachments={files}
      onAttach={attach} onRemoveAttachment={remove} onRetryAttachment={retry}
      onCancel={reset} onSave={save} onExpand={expand} growFrom={growFrom}
    />
  )
  // The limit modal names each file that wasn't added and the limit it would break (PRD R3).
  const sizeOnly = rejected.length > 0 && rejected.every((r) => r.limit === 'size')
  const countOnly = rejected.length > 0 && rejected.every((r) => r.limit === 'count')
  const limitTitle = sizeOnly ? `Attachments exceed the ${formatSize(MAX_TOTAL_BYTES)} limit`
    : countOnly ? `A note can hold up to ${MAX_FILES} files`
    : rejected.length === 1 ? 'This file couldn’t be attached' : 'Some files couldn’t be attached'

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

      {rejected.length > 0 && (
        <div className="note-modal-scrim">
          <Modal
            title={limitTitle} width={500}
            actions={<><Button variant="secondary" size="sm" onClick={clearRejected}>Cancel</Button><Button variant="primary" size="sm" onClick={clearRejected}>Got it</Button></>}
          >
            <ModalText>
              {/* One sentence per limit, then the files it applies to. Size lists the file sizes; count lists only names. */}
              {(['size', 'count'] as const).map((limit) => {
                const group = rejected.filter((r) => r.limit === limit)
                if (!group.length) return null
                const what = limit === 'size' ? `the ${formatSize(MAX_TOTAL_BYTES)} limit` : `the ${MAX_FILES}-file limit`
                return (
                  <div key={limit} className="note-limit-group">
                    <div className="note-limit-intro">
                      <span>{group.length === 1 ? 'This file will go over ' : 'These files will go over '}{what}:</span>
                      <ul className="note-limit-list">
                        {group.map((r, i) => <li key={`${r.name}-${i}`}>{limit === 'size' ? fileLabel(r.name, r.size, 40) : r.name}</li>)}
                      </ul>
                    </div>
                    {limit === 'size' && <span>For larger attachments, you can upload to Google Drive and link here.</span>}
                  </div>
                )
              })}
            </ModalText>
          </Modal>
        </div>
      )}
    </RightPanel>
  )
}
