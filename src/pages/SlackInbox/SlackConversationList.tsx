import { Avatar } from '../../components/Avatar'
import { Icon } from '../../icons'
import type { IconName } from '../../icons/iconData'
import type { SlackConversation } from './slackChats'
import './SlackConversationList.css'

type Props = { conversations: SlackConversation[]; selectedId?: string; onSelect: (id: string) => void; title: string; icon: IconName }

/** The list of Slack conversations: avatar, name, date, a preview line and a #channel chip. */
export function SlackConversationList({ conversations, selectedId, onSelect, title, icon }: Props) {
  return (
    <div className="slack-list">
      <div className="slack-list__header"><Icon name={icon} size={16} /><span>{title}</span></div>
      {conversations.map((c) => (
        <button key={c.id} type="button" className="slack-list__item" onClick={() => onSelect(c.id)}>
          <div className={`slack-list__inner ${c.id === selectedId ? 'is-selected' : ''}`}>
            <div className="slack-list__top">
              <Avatar initial={c.name.charAt(0).toUpperCase()} title={c.name} size="small" color={c.avatarColor} showStatus status="online" />
              <span className="slack-list__name">{c.name}</span>
              <span className="slack-list__date">{c.date}</span>
            </div>
            <div className="slack-list__preview">
              <span>{c.preview}</span>
            </div>
            <span className="slack-list__chip">#{c.channel}</span>
          </div>
        </button>
      ))}
      {conversations.length === 0 && <div className="slack-list__empty">No conversations in this view</div>}
    </div>
  )
}
