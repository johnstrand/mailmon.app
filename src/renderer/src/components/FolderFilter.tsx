import { useState, useRef, useEffect } from 'react';

interface Props {
  folders: string[];
  excludedFolders: Set<string>;
  onToggleFolder: (folder: string) => void;
}

export function FolderFilter({ folders, excludedFolders, onToggleFolder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hiddenCount = excludedFolders.size;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded transition-colors ${
          hiddenCount > 0
            ? 'text-blue-700 border-blue-400 bg-blue-50 hover:bg-blue-100'
            : 'text-gray-600 border-gray-300 hover:bg-gray-100'
        }`}
        title={`${folders.length - hiddenCount} of ${folders.length} folders visible`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <span className="font-mono">{folders.length - hiddenCount}/{folders.length}</span>
      </button>

      {open && folders.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Show folders
          </div>
          {folders.map((folder) => {
            const visible = !excludedFolders.has(folder);
            return (
              <label
                key={folder}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggleFolder(folder)}
                  className="accent-blue-600"
                />
                <span className="truncate">{folder}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
