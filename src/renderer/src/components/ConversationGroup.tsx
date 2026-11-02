import React, { useRef } from 'react';
import type { MailMessage } from '../types/mail';
import { MailListItem } from './MailListItem';

interface Props {
  messages: MailMessage[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedId: string | null;
  checkedIds: Set<string>;
  markingIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onMarkRead: (id: string) => void;
  onMarkConversationRead: (ids: string[]) => void;
}

export function ConversationGroup({
  messages,
  isExpanded,
  onToggleExpand,
  selectedId,
  checkedIds,
  markingIds,
  onSelect,
  onToggleCheck,
  onMarkRead,
  onMarkConversationRead,
}: Props) {
  const sorted = [...messages].sort(
    (a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime(),
  );
  const latest = sorted[0];
  const ids = messages.map((m) => m.id);
  const isMulti = messages.length > 1;

  const checkedCount = ids.filter((id) => checkedIds.has(id)).length;
  const isAllChecked = checkedCount === ids.length;
  const isSomeChecked = checkedCount > 0 && !isAllChecked;
  const isAnySelected = ids.includes(selectedId ?? '');

  const folderNames = [...new Set(messages.map((m) => m.folderName))].join(', ');

  const checkboxRef = useRef<HTMLInputElement>(null);
  // Set indeterminate imperatively
  React.useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = isSomeChecked;
  }, [isSomeChecked]);

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (isAllChecked) {
      ids.forEach((id) => { if (checkedIds.has(id)) onToggleCheck(id); });
    } else {
      ids.forEach((id) => { if (!checkedIds.has(id)) onToggleCheck(id); });
    }
  };

  const handleHeaderClick = () => {
    if (isMulti) onToggleExpand();
    else onSelect(ids[0]);
  };

  const handleMarkConversationRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkConversationRead(ids);
  };

  const isSelected = !isMulti && isAnySelected;

  return (
    <div className={`border-b border-gray-200 ${isSelected ? 'border-l-4 border-l-blue-500' : ''}`}>
      {/* Group header */}
      <div
        onClick={handleHeaderClick}
        className={`group relative flex items-start gap-2 px-3 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
          isSelected ? 'bg-blue-100' : isAnySelected && isMulti ? 'bg-blue-50' : ''
        }`}
      >
        {/* Checkbox */}
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isAllChecked}
          onChange={handleToggleAll}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 shrink-0 accent-blue-600"
        />

        {/* Expand arrow (multi only) */}
        {isMulti && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 mt-1 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs text-gray-500 truncate">{folderNames}</span>
            <div className="flex items-center gap-1 shrink-0">
              {isMulti && (
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {messages.length}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(latest.receivedDateTime).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="font-semibold text-sm text-gray-900 truncate leading-tight mt-0.5">
            {latest.subject || '(no subject)'}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {latest.from.emailAddress.name || latest.from.emailAddress.address}
          </p>
        </div>

        {/* Hover mark-all-read button */}
        {(() => {
          const isAnyMarking = ids.some((id) => markingIds.has(id));
          return (
            <button
              onClick={handleMarkConversationRead}
              disabled={isAnyMarking}
              title={isMulti ? 'Mark all as read' : 'Mark as read'}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-full p-1 hover:bg-green-50 hover:border-green-400 shadow-sm disabled:opacity-60"
            >
              {isAnyMarking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })()}
      </div>

      {/* Expanded individual messages */}
      {isMulti && isExpanded && (
        <div className="border-l-2 border-blue-200 ml-8">
          {sorted.map((msg) => (
            <MailListItem
              key={msg.id}
              message={msg}
              isSelected={msg.id === selectedId}
              isChecked={checkedIds.has(msg.id)}
              isMarking={markingIds.has(msg.id)}
              onSelect={onSelect}
              onToggleCheck={onToggleCheck}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
