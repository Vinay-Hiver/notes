/** Dummy Slack conversations for the two Slack inboxes, ported from the slack-teams-connector prototype. */
export type SlackInboxId = 'slack1'

export type AvatarColor = 'lightBlue' | 'red' | 'orange' | 'yellow' | 'green' | 'purple' | 'violet'

export type SlackMessage = { id?: string; kind: 'incoming' | 'agent-text'; text: string; time: string; reactions?: Record<string, number> }

export type SlackConversation = {
  id: string
  view: 'Unassigned' | 'Mine' | 'All Assigned' | 'Closed'
  name: string
  email: string
  phone: string
  avatarColor: AvatarColor
  channel: string
  date: string
  preview: string
  messages: SlackMessage[]
}

export const slackInboxes: { id: SlackInboxId; name: string; channel: string }[] = [
  { id: 'slack1', name: 'My-Slack-Inbox', channel: 'support' },
]

const NAMES = [
  'Esther Howard', 'Leslie Alexander', 'Jenny Wilson', 'Priya Nair', 'Marcus Lee', 'Sofia Reyes', 'Daniel Kim', 'Grace Okafor',
  'Tom Becker', 'Hana Sato', 'Liam Walsh', 'Ava Patel', 'Noah Khan', 'Arlene McCoy', 'Guy Hawkins', 'Courtney Henry',
  'Darlene Robertson', 'Eleanor Pena', 'Floyd Miles', 'Jerome Bell', 'Devon Lane', 'Kathryn Murphy', 'Jacob Jones', 'Kristin Watson',
]
const COLORS: AvatarColor[] = ['lightBlue', 'red', 'purple', 'green', 'yellow', 'violet', 'orange']
const PREVIEWS = [
  'Need help with account setup',
  'My order has been delayed, can you check?',
  'Following up on my previous ticket',
  'Is the pro plan available monthly?',
  'The chat widget is not loading on mobile',
  'Can we get a demo for our team next week?',
  'Interested in upgrading to the enterprise tier',
  'Thanks for the quick help earlier!',
  'How do I reset my password?',
  'Please rate the chat',
]
const DATES = ['Jul 19', 'Jul 23', 'Jul 22', 'Jul 21', 'Jul 20']

// A single conversation, in Mine.
const views: [SlackConversation['view'], number][] = [['Mine', 1]]

let n = 0
const build = (inbox: (typeof slackInboxes)[number]): SlackConversation[] =>
  views.flatMap(([view, count]) =>
    Array.from({ length: count }, (_, i) => {
      const idx = n++
      const name = NAMES[idx % NAMES.length]
      const preview = PREVIEWS[idx % PREVIEWS.length]
      const date = DATES[idx % DATES.length]
      return {
        id: `${inbox.id}-${view.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        view,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+1 (555) 01${String(10 + (idx % 90)).padStart(2, '0')}`,
        avatarColor: COLORS[idx % COLORS.length],
        channel: inbox.channel,
        date,
        preview,
        messages: [
          { kind: 'incoming', text: preview, time: `${date}, 10:0${i + 1} AM` },
          { kind: 'agent-text', text: 'Sure, happy to help with that!', time: `${date}, 10:0${i + 2} AM` },
        ],
      } satisfies SlackConversation
    }),
  )

export const slackChats: Record<SlackInboxId, SlackConversation[]> = { slack1: build(slackInboxes[0]) }
