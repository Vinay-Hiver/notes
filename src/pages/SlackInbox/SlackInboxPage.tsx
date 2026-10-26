import { useState } from 'react'
import type { IconName } from '../../icons/iconData'
import { ConversationsSidebar } from '../../patterns/ConversationsSidebar'
import type { ConversationsSidebarItem, ConversationsSidebarView } from '../../patterns/ConversationsSidebar'
import { channelViews, viewLibrary } from '../../patterns/ConversationsSidebar/data'
import { sampleSections } from '../../patterns/ConversationsSidebar/sampleData'
import { EmptyState } from '../../patterns/EmptyState'
import { MainNav } from '../../patterns/MainNav'
import { navSampleFooterItems, navSampleItems, navSampleUserMenu } from '../../patterns/MainNav/sampleData'
import { PageLayout } from '../../patterns/PageLayout'
import { SlackChatPanel } from './SlackChatPanel'
import { SlackConversationList } from './SlackConversationList'
import { SlackRightPanel } from './SlackRightPanel'
import { slackChats, slackInboxes } from './slackChats'
import type { SlackConversation, SlackInboxId } from './slackChats'
import './SlackInboxPage.css'

/** Which of the Slack conversations each sidebar view shows. Tags and Pending have none in the dummy data. */
const viewFilter: Record<string, SlackConversation['view'] | undefined> = { unassigned: 'Unassigned', mine: 'Mine', allAssigned: 'All Assigned', closed: 'Closed' }

const slackViews = (inbox: SlackInboxId): ConversationsSidebarView[] =>
  channelViews.slack.map((key) => {
    const v = viewLibrary[key]
    const count = viewFilter[key] ? slackChats[inbox].filter((c) => c.view === viewFilter[key]).length : 0
    return { id: `${inbox}-${v.id}`, label: v.label, icon: v.icon, count: v.hasCount ? count : undefined }
  })

/** The example sidebar, with its single Slack row swapped for the Slack inbox, and no other inboxes. */
const sections = sampleSections(true).map((section) => ({
  ...section,
  items: section.items.flatMap((item): ConversationsSidebarItem[] =>
    item.id === 'slack'
      ? slackInboxes.map((inbox, i) => ({ id: inbox.id, label: inbox.name, icon: 'slack' as IconName, views: slackViews(inbox.id), defaultExpanded: i === 0 }))
      : section.title === 'Shared Inbox' ? [] : [item],
  ),
}))

/** Slack inboxes inside Hiver Omni: a conversation list, the chat and the Slack details panel. */
export function SlackInboxPage() {
  const [value, setValue] = useState('slack1-mine')
  const [picked, setPicked] = useState<string>()

  const [inboxId, viewKey] = value.split('-') as [string, string]
  const inbox = slackInboxes.find((i) => i.id === inboxId)
  const viewLabel = viewLibrary[viewKey]?.label ?? ''
  const list = inbox ? slackChats[inbox.id].filter((c) => c.view === viewFilter[viewKey]) : []
  const conversation = list.find((c) => c.id === picked) ?? list[0]

  return (
    <div className="slack-inbox-page">
      <PageLayout
        variant="home"
        nav={<MainNav items={navSampleItems} footerItems={navSampleFooterItems} value="conversations" user={{ initial: 'M', name: 'Mark Scout' }} userMenu={navSampleUserMenu} />}
        sidebar={<ConversationsSidebar sections={sections} value={value} onChange={(id) => { setValue(id); setPicked(undefined) }} />}
        rightPanel={inbox ? <SlackRightPanel key={conversation?.id ?? value} inboxName={inbox.name} c={conversation} /> : undefined}
      >
        {inbox ? (
          <div className="slack-inbox-page__work">
            <SlackConversationList conversations={list} selectedId={conversation?.id} onSelect={setPicked} title={viewLabel} icon={viewLibrary[viewKey]?.icon ?? 'unassigned'} />
            {conversation
              ? <SlackChatPanel key={conversation.id} conversation={conversation} />
              : <div className="slack-inbox-page__empty"><EmptyState icon="conversations" title="No conversation selected" description="Pick a view with conversations to see the chat here." /></div>}
          </div>
        ) : (
          <div className="slack-inbox-page__empty"><EmptyState icon="conversations" title="Nothing here yet" description="Open one of the Slack inboxes to see its conversations." /></div>
        )}
      </PageLayout>
    </div>
  )
}
