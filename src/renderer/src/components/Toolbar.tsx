import { FolderFilter } from './FolderFilter';

interface Props {
  checkedCount: number;
  totalCount: number;
  loading: boolean;
  lastRefreshed: Date | null;
  folders: string[];
  excludedFolders: Set<string>;
  onBatchMarkRead: () => void;
  onRefresh: () => void;
  onToggleFolder: (folder: string) => void;
  onSelectAll: () => void;
}

export function Toolbar({ checkedCount, totalCount, loading, lastRefreshed, folders, excludedFolders, onBatchMarkRead, onRefresh, onToggleFolder, onSelectAll }: Props) {
  const allSelected = totalCount > 0 && checkedCount === totalCount;
  const someSelected = checkedCount > 0 && checkedCount < totalCount;

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 gap-2">
      <div className="flex items-center gap-2">
        {/* Select all / deselect all */}
        <button
          onClick={onSelectAll}
          disabled={totalCount === 0}
          title={allSelected ? 'Deselect all' : 'Select all'}
          className="flex items-center justify-center w-8 h-8 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {allSelected ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm9.707 4.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3z" clipRule="evenodd" />
            </svg>
          ) : someSelected ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 7a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="14" height="14" rx="1" />
            </svg>
          )}
        </button>

        <button
          onClick={onBatchMarkRead}
          disabled={checkedCount === 0}
          title={checkedCount > 0 ? `Mark ${checkedCount} selected as read` : 'Mark as read'}
          className="relative flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
          {checkedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {checkedCount}
            </span>
          )}
        </button>
        <FolderFilter
          folders={folders}
          excludedFolders={excludedFolders}
          onToggleFolder={onToggleFolder}
        />
      </div>

      <div className="flex items-center gap-2">
        {lastRefreshed && (
          <span className="text-xs text-gray-400 hidden sm:block">
            Updated {lastRefreshed.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          className="flex items-center justify-center w-8 h-8 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
