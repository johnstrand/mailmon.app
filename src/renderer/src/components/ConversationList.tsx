import { useState, useMemo } from 'react';
import type { MailMessage } from '../types/mail';
import { ConversationGroup } from './ConversationGroup';

interface Props {
  messages: MailMessage[];
  selectedId: string | null;
  checkedIds: Set<string>;
  markingIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onMarkRead: (id: string) => void;
  onMarkConversationRead: (ids: string[]) => void;
}

export function ConversationList({
  messages,
  selectedId,
  checkedIds,
  markingIds,
  onSelect,
  onToggleCheck,
  onMarkRead,
  onMarkConversationRead,
}: Props) {
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  const conversations = useMemo(() => {
    const map = new Map<string, MailMessage[]>();
    for (const msg of messages) {
      const key = msg.conversationId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(msg);
    }
    return [...map.entries()]
      .map(([conversationId, msgs]) => ({ conversationId, msgs }))
      .sort((a, b) => {
        const latestA = Math.max(...a.msgs.map((m) => new Date(m.receivedDateTime).getTime()));
        const latestB = Math.max(...b.msgs.map((m) => new Date(m.receivedDateTime).getTime()));
        return latestB - latestA;
      });
  }, [messages]);

  const handleToggleExpand = (conversationId: string) => {
    setExpandedConversations((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) next.delete(conversationId);
      else next.add(conversationId);
      return next;
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No unread messages
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(({ conversationId, msgs }) => (
        <ConversationGroup
          key={conversationId}
          messages={msgs}
          isExpanded={expandedConversations.has(conversationId)}
          onToggleExpand={() => handleToggleExpand(conversationId)}
          selectedId={selectedId}
          checkedIds={checkedIds}
          markingIds={markingIds}
          onSelect={onSelect}
          onToggleCheck={onToggleCheck}
          onMarkRead={onMarkRead}
          onMarkConversationRead={onMarkConversationRead}
        />
      ))}
    </div>
  );
}
