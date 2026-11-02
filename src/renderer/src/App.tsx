import { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUnreadMail } from './hooks/useUnreadMail';
import { ConversationList } from './components/ConversationList';
import { MailContent } from './components/MailContent';
import { Toolbar } from './components/Toolbar';
import { Login } from './components/Login';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { MailMessage } from './types/mail';

const LS_KEY = 'mailmon-excluded-folders';

function loadExcluded(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveExcluded(s: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]));
}

let toastSeq = 0;

function MailApp() {
  const { account, logout } = useAuth();
  const { messages, folders, loading, error, lastRefreshed, markingIds, refetch, markAsRead, markManyAsRead } =
    useUnreadMail();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [excludedFolders, setExcludedFolders] = useState<Set<string>>(loadExcluded);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const visibleMessages = messages.filter((m) => !excludedFolders.has(m.folderName));

  const selectedMessage: MailMessage | null =
    visibleMessages.find((m) => m.id === selectedId) ?? null;

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const handleToggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearIds = useCallback((ids: string[]) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setSelectedId((prev) => (prev && ids.includes(prev) ? null : prev));
  }, []);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markAsRead(id);
      clearIds([id]);
      addToast('1 message marked as read');
    },
    [markAsRead, clearIds, addToast],
  );

  const handleMarkConversationRead = useCallback(
    async (ids: string[]) => {
      await markManyAsRead(ids);
      clearIds(ids);
      addToast(`${ids.length} message${ids.length !== 1 ? 's' : ''} marked as read`);
    },
    [markManyAsRead, clearIds, addToast],
  );

  const handleBatchMarkRead = useCallback(async () => {
    const ids = Array.from(checkedIds);
    await markManyAsRead(ids);
    clearIds(ids);
    addToast(`${ids.length} message${ids.length !== 1 ? 's' : ''} marked as read`);
  }, [checkedIds, markManyAsRead, clearIds, addToast]);

  const handleToggleFolder = useCallback((folder: string) => {
    setExcludedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      saveExcluded(next);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = visibleMessages.map((m) => m.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => checkedIds.has(id));
    if (allSelected) setCheckedIds(new Set());
    else setCheckedIds(new Set(allIds));
  }, [visibleMessages, checkedIds]);

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold text-sm">MailMon</span>
          {visibleMessages.length > 0 && (
            <span className="bg-white text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {visibleMessages.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-200 text-xs hidden sm:block">{account?.username}</span>
          <button
            onClick={() => logout()}
            className="px-2.5 py-1 text-xs border border-blue-400 hover:bg-blue-700 rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-200 overflow-hidden">
          <Toolbar
            checkedCount={checkedIds.size}
            totalCount={visibleMessages.length}
            loading={loading}
            lastRefreshed={lastRefreshed}
            folders={folders}
            excludedFolders={excludedFolders}
            onBatchMarkRead={handleBatchMarkRead}
            onRefresh={refetch}
            onToggleFolder={handleToggleFolder}
            onSelectAll={handleSelectAll}
          />
          <ConversationList
            messages={visibleMessages}
            selectedId={selectedId}
            checkedIds={checkedIds}
            markingIds={markingIds}
            onSelect={handleSelect}
            onToggleCheck={handleToggleCheck}
            onMarkRead={handleMarkRead}
            onMarkConversationRead={handleMarkConversationRead}
          />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <MailContent message={selectedMessage} markingIds={markingIds} onMarkRead={handleMarkRead} onAddToast={addToast} />
        </div>
      </div>

      <Toast messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function App(): React.JSX.Element {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MailApp /> : <Login />;
}

export default App
