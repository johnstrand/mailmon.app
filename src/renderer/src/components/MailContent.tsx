import { useState } from 'react';
import type { MailMessage } from '../types/mail';
import { CreateTodoModal } from './CreateTodoModal';

interface Props {
  message: MailMessage | null;
  markingIds: Set<string>;
  onMarkRead: (id: string) => void;
  onAddToast: (text: string) => void;
}

export function MailContent({ message, markingIds, onMarkRead, onAddToast }: Props) {
  const [showTodo, setShowTodo] = useState(false);

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a message to read
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              {message.subject || '(no subject)'}
            </h2>
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">{message.from.emailAddress.name || message.from.emailAddress.address}</span>
              <span className="text-gray-400 ml-1">&lt;{message.from.emailAddress.address}&gt;</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              {new Date(message.receivedDateTime).toLocaleString()}
              <span className="ml-2 text-blue-500">{message.mailbox}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Create To-Do button */}
            <button
              onClick={() => setShowTodo(true)}
              title="Create To-Do task"
              className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>

            {/* Mark as read button */}
            <button
              onClick={() => onMarkRead(message.id)}
              disabled={markingIds.has(message.id)}
              title="Mark as read"
              className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-md transition-colors"
            >
              {markingIds.has(message.id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {message.body.contentType === 'html' ? (
          <iframe
            srcDoc={/<head[\s>]/i.test(message.body.content)
              ? message.body.content.replace(/<head([^>]*)>/i, '<head$1><base target="_blank">')
              : `<base target="_blank">${message.body.content}`}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="w-full h-full min-h-[400px] bg-white rounded border border-gray-200"
            title="Mail body"
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white rounded border border-gray-200 p-4 h-full">
            {message.body.content}
          </pre>
        )}
      </div>

      {showTodo && (
        <CreateTodoModal
          message={message}
          onSuccess={(listName) => {
            setShowTodo(false);
            onAddToast(`Task created in "${listName}"`);
          }}
          onClose={() => setShowTodo(false)}
        />
      )}
    </div>
  );
}

