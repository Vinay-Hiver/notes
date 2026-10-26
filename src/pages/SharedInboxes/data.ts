import type { IconName } from '../../icons/iconData'
import type { SubNavChannelId } from '../../patterns/SubNav/data'

/** How an email inbox is connected to its mailbox. */
export type AccountType = 'Outlook User Account' | 'Outlook Shared Mailbox' | 'Forwarding Mailbox' | 'Distribution List or Microsoft 365 Group'

export type Inbox = {
  id: string
  name: string
  /** Only email inboxes have an address; it shows under the heading of their settings and in the list. */
  email?: string
  /** Only email inboxes have one; it shows in the list. */
  accountType?: AccountType
}

export type InboxChannel = {
  id: SubNavChannelId
  /** The name in the Shared Inboxes sub-nav and the page heading, for example "Chat Inboxes". */
  label: string
  /** One inbox of this channel, for the "Create ..." button, for example "Chat Inbox". */
  singular: string
  icon: IconName
  inboxes: Inbox[]
}

/** The channels in the Shared Inboxes sub-nav, in order, each with four example inboxes. */
export const sharedInboxChannels: InboxChannel[] = [
  {
    id: 'email', label: 'Email Inboxes', singular: 'Email Inbox', icon: 'mailbox',
    inboxes: [
      { id: 'email-1', name: 'Customer Support', email: 'support@acme.com', accountType: 'Outlook User Account' },
      { id: 'email-2', name: 'Sales Enquiries', email: 'sales@acme.com', accountType: 'Outlook Shared Mailbox' },
      { id: 'email-3', name: 'Billing', email: 'billing@acme.com', accountType: 'Forwarding Mailbox' },
      { id: 'email-4', name: 'Partnerships', email: 'partners@acme.com', accountType: 'Distribution List or Microsoft 365 Group' },
    ],
  },
  {
    id: 'slack', label: 'Slack Inboxes', singular: 'Slack Inbox', icon: 'slack',
    inboxes: [
      { id: 'slack-1', name: 'Support requests' },
      { id: 'slack-2', name: 'Bug reports' },
      { id: 'slack-3', name: 'Feature requests' },
      { id: 'slack-4', name: 'Customer success' },
    ],
  },
  {
    id: 'chat', label: 'Chat Inboxes', singular: 'Chat Inbox', icon: 'chatinbox',
    inboxes: [
      { id: 'chat-1', name: 'Website chat' },
      { id: 'chat-2', name: 'Pricing page chat' },
      { id: 'chat-3', name: 'Help center chat' },
      { id: 'chat-4', name: 'In-app chat' },
    ],
  },
  {
    id: 'whatsapp', label: 'WhatsApp Inboxes', singular: 'WhatsApp Inbox', icon: 'whatsapp',
    inboxes: [
      { id: 'whatsapp-1', name: 'Support line' },
      { id: 'whatsapp-2', name: 'Order updates' },
      { id: 'whatsapp-3', name: 'Sales team' },
      { id: 'whatsapp-4', name: 'VIP customers' },
    ],
  },
  {
    id: 'voice', label: 'Voice Inboxes', singular: 'Voice Inbox', icon: 'voice',
    inboxes: [
      { id: 'voice-1', name: 'Main support line' },
      { id: 'voice-2', name: 'Sales hotline' },
      { id: 'voice-3', name: 'Escalations' },
      { id: 'voice-4', name: 'After-hours line' },
    ],
  },
  {
    id: 'sms', label: 'SMS Inboxes', singular: 'SMS Inbox', icon: 'sms',
    inboxes: [
      { id: 'sms-1', name: 'Delivery alerts' },
      { id: 'sms-2', name: 'Appointment reminders' },
      { id: 'sms-3', name: 'Support texts' },
      { id: 'sms-4', name: 'Promotions' },
    ],
  },
]
