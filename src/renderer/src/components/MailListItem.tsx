import React from 'react';
import type { MailMessage } from '../types/mail';

interface Props {
  message: MailMessage;
  isSelected: boolean;
  isChecked: boolean;
  isMarking: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export function MailListItem({
  message,
  isSelected,
  isChecked,
  isMarking,
  onSelect,
  onToggleCheck,
  onMarkRead,
}: Props) {
  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead(message.id);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleCheck(message.id);
  };

  return (
    <div
      onClick={() => onSelect(message.id)}
      className={`group relative flex items-start gap-2 px-3 py-3 cursor-pointer border-b border-gray-200 hover:bg-blue-50 transition-colors ${
        isSelected ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheck}
        onClick={(e) => e.stopPropagation()}
        className="mt-1 shrink-0 accent-blue-600"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-gray-500 truncate">{message.folderName}</span>
          <span className="text-xs text-gray-400 shrink-0">
            {new Date(message.receivedDateTime).toLocaleDateString()}
          </span>
        </div>
        <p className="font-semibold text-sm text-gray-900 truncate leading-tight mt-0.5">
          {message.subject || '(no subject)'}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{message.from.emailAddress.address}</p>
      </div>

      {/* Hover mark-as-read button */}
      <button
        onClick={handleMarkRead}
        disabled={isMarking}
        title="Mark as read"
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-full p-1 hover:bg-green-50 hover:border-green-400 shadow-sm disabled:opacity-60"
      >
        {isMarking ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
