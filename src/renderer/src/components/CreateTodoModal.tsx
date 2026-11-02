import { useState } from 'react'
import { useTodoLists } from '../hooks/useTodoLists'
import { getGraphClient } from '../graphClient'
import type { MailMessage } from '../types/mail'

interface Props {
  message: MailMessage
  onSuccess: (listName: string) => void
  onClose: () => void
}

export function CreateTodoModal({ message, onSuccess, onClose }: Props): React.JSX.Element {
  const { lists, loading: listsLoading } = useTodoLists()

  const [title, setTitle] = useState(message.subject || '')
  const [listId, setListId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminder, setReminder] = useState('')
  const [importBody, setImportBody] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-select first list once loaded
  useState(() => {
    if (lists.length > 0 && !listId) setListId(lists[0].id)
  })

  const selectedListName = lists.find((l) => l.id === listId)?.displayName ?? ''

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!listId) return
    setSubmitting(true)
    setError(null)

    // Strip HTML tags for body note
    const plainBody =
      message.body.contentType === 'html'
        ? new DOMParser().parseFromString(message.body.content, 'text/html').body.innerText
        : message.body.content

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task: Record<string, any> = { title }

    if (importBody) {
      task.body = { content: plainBody, contentType: 'text' }
    }
    if (dueDate) {
      task.dueDateTime = { dateTime: `${dueDate}T00:00:00`, timeZone: 'UTC' }
    }
    if (reminder) {
      task.reminderDateTime = {
        dateTime: new Date(reminder).toISOString().replace('Z', ''),
        timeZone: 'UTC'
      }
      task.isReminderOn = true
    }

    try {
      const client = getGraphClient()
      await client.api(`/me/todo/lists/${listId}/tasks`).post(task)
      onSuccess(selectedListName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">Create To-Do task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* List */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To-Do list</label>
            {listsLoading ? (
              <p className="text-xs text-gray-400">Loading lists…</p>
            ) : (
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>
                  Select a list…
                </option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Due date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reminder <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Import body */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={importBody}
              onChange={(e) => setImportBody(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Import email body as note</span>
          </label>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || listsLoading || !listId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {submitting ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
