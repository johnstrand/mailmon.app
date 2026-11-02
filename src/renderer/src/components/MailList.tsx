import type { MailMessage } from '../types/mail';
import { MailListItem } from './MailListItem';

interface Props {
  messages: MailMessage[];
  selectedId: string | null;
  checkedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export function MailList({
  messages,
  selectedId,
  checkedIds,
  onSelect,
  onToggleCheck,
  onMarkRead,
}: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No unread messages
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((msg) => (
        <MailListItem
          key={msg.id}
          message={msg}
          isSelected={msg.id === selectedId}
          isChecked={checkedIds.has(msg.id)}
          isMarking={false}
          onSelect={onSelect}
          onToggleCheck={onToggleCheck}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
