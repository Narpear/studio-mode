'use client'

import { useStudioStore } from '@/store'

export default function HistoryPanel() {
  const { history, historyIndex, jumpToHistory, undoHistory, redoHistory } = useStudioStore()

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>History</span>
        <div className="flex items-center gap-1">
          <button
            onClick={undoHistory}
            disabled={historyIndex <= 0}
            className="text-[10px] text-neutral-500 hover:text-neutral-200 disabled:opacity-30 transition-colors px-1"
            title="Undo"
          >
            ↩
          </button>
          <button
            onClick={redoHistory}
            disabled={historyIndex >= history.length - 1}
            className="text-[10px] text-neutral-500 hover:text-neutral-200 disabled:opacity-30 transition-colors px-1"
            title="Redo"
          >
            ↪
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {history.length === 0 && (
          <div className="text-center text-neutral-600 text-xs py-8 px-4">
            No history yet.<br />Start editing to record actions.
          </div>
        )}

        {/* Initial state */}
        {history.length > 0 && (
          <button
            onClick={() => jumpToHistory(0)}
            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 ${
              historyIndex === -1
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-500 hover:bg-neutral-800/40 hover:text-neutral-300'
            }`}
          >
            <span className="w-4 h-4 rounded bg-neutral-700 flex items-center justify-center text-[8px] shrink-0">
              ⊙
            </span>
            Initial State
          </button>
        )}

        {history.map((entry, idx) => (
          <button
            key={entry.id}
            onClick={() => jumpToHistory(idx)}
            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 group ${
              historyIndex === idx
                ? 'bg-neutral-800 text-neutral-100'
                : idx > historyIndex
                ? 'text-neutral-600 hover:bg-neutral-800/20'
                : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-300'
            }`}
          >
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[8px] shrink-0 ${
              historyIndex === idx ? 'bg-[#7ec845] text-black' : 'bg-neutral-800 text-neutral-500'
            }`}>
              {idx + 1}
            </span>
            <span className="truncate flex-1">{entry.label}</span>
            <span className="text-[9px] text-neutral-600 shrink-0 font-mono">
              {formatTime(entry.timestamp)}
            </span>
          </button>
        ))}
      </div>

      <div className="border-t border-neutral-800/60 px-3 py-2">
        <p className="text-[10px] text-neutral-600">
          {history.length} action{history.length !== 1 ? 's' : ''} recorded
        </p>
      </div>
    </div>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}