'use client'

import { useState } from 'react'
import { useStudioStore } from '@/store'
import { PANTONE_COLORS } from '@/data/pantone'
import { ColorStory, ColorStoryEntry } from '@/types'

export default function ColorStoryPanel() {
  const {
    colorStories,
    activeColorStoryId,
    addColorStory,
    updateColorStory,
    removeColorStory,
    setActiveColorStory,
    activePantoneCode,
    activePantoneHex,
  } = useStudioStore()

  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const activeStory = colorStories.find((s) => s.id === activeColorStoryId)

  const createStory = () => {
    if (!newName.trim()) return
    const story: ColorStory = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      entries: [],
      createdAt: Date.now(),
    }
    addColorStory(story)
    setActiveColorStory(story.id)
    setNewName('')
    setCreating(false)
  }

  const addCurrentColor = () => {
    if (!activeStory || !activePantoneCode) return
    const entry: ColorStoryEntry = {
      id: crypto.randomUUID(),
      pantoneCode: activePantoneCode,
    }
    updateColorStory(activeStory.id, {
      entries: [...activeStory.entries, entry],
    })
  }

  const removeEntry = (entryId: string) => {
    if (!activeStory) return
    updateColorStory(activeStory.id, {
      entries: activeStory.entries.filter((e) => e.id !== entryId),
    })
  }

  const updateEntryLabel = (entryId: string, label: string) => {
    if (!activeStory) return
    updateColorStory(activeStory.id, {
      entries: activeStory.entries.map((e) =>
        e.id === entryId ? { ...e, label } : e
      ),
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>Color Story</span>
        <button
          onClick={() => setCreating(true)}
          className="text-[10px] text-neutral-500 hover:text-neutral-200 transition-colors"
          title="New story"
        >
          + New
        </button>
      </div>

      {/* Create new */}
      {creating && (
        <div className="px-3 py-2 border-b border-neutral-800/60 space-y-2 fade-in">
          <input
            autoFocus
            type="text"
            placeholder="Story name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createStory(); if (e.key === 'Escape') setCreating(false) }}
            className="studio-input text-xs"
          />
          <div className="flex gap-2">
            <button onClick={createStory} className="flex-1 bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-medium py-1 rounded transition-colors">
              Create
            </button>
            <button onClick={() => setCreating(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs py-1 rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Story selector */}
      {colorStories.length > 0 && (
        <div className="px-3 py-2 border-b border-neutral-800/60">
          <select
            value={activeColorStoryId ?? ''}
            onChange={(e) => setActiveColorStory(e.target.value || null)}
            className="blend-select"
          >
            <option value="">Select a story...</option>
            {colorStories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Active story */}
      {activeStory ? (
        <div className="flex-1 overflow-y-auto">
          {/* Story header */}
          <div className="px-3 py-2 border-b border-neutral-800/40">
            <p className="text-xs font-medium text-neutral-200">{activeStory.name}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              {activeStory.entries.length} color{activeStory.entries.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Add current color */}
          <div className="px-3 py-2 border-b border-neutral-800/40">
            <button
              onClick={addCurrentColor}
              disabled={!activePantoneCode}
              className="w-full flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded px-2 py-1.5 transition-all disabled:opacity-40"
            >
              <div
                className="w-5 h-5 rounded border border-neutral-700 shrink-0"
                style={{ background: activePantoneHex }}
              />
              <span className="text-xs text-neutral-400 hover:text-neutral-200">
                Add current color
              </span>
              <span className="ml-auto text-neutral-600 text-xs">+</span>
            </button>
          </div>

          {/* Entries */}
          <div className="py-1">
            {activeStory.entries.length === 0 ? (
              <p className="text-center text-neutral-600 text-xs py-6">
                Add colors to your story
              </p>
            ) : (
              activeStory.entries.map((entry, idx) => {
                const color = PANTONE_COLORS.find((c) => c.code === entry.pantoneCode)
                if (!color) return null
                return (
                  <StoryEntry
                    key={entry.id}
                    entry={entry}
                    color={color}
                    index={idx}
                    onRemove={() => removeEntry(entry.id)}
                    onLabelChange={(label) => updateEntryLabel(entry.id, label)}
                  />
                )
              })
            )}
          </div>

          {/* Palette preview */}
          {activeStory.entries.length > 0 && (
            <div className="px-3 py-3 border-t border-neutral-800/40">
              <p className="text-[10px] text-neutral-500 mb-2">Palette Preview</p>
              <div className="flex rounded-lg overflow-hidden h-8 border border-neutral-800">
                {activeStory.entries.map((entry) => {
                  const color = PANTONE_COLORS.find((c) => c.code === entry.pantoneCode)
                  if (!color) return null
                  return (
                    <div
                      key={entry.id}
                      className="flex-1"
                      style={{ background: color.hex }}
                      title={color.name}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-neutral-600 text-center px-4">
            {colorStories.length === 0
              ? 'Create a color story to build your palette narrative'
              : 'Select a story to edit it'}
          </p>
        </div>
      )}

      {/* Delete story */}
      {activeStory && (
        <div className="border-t border-neutral-800/60 px-3 py-2">
          <button
            onClick={() => {
              removeColorStory(activeStory.id)
              setActiveColorStory(null)
            }}
            className="text-xs text-neutral-600 hover:text-red-400 transition-colors"
          >
            Delete story
          </button>
        </div>
      )}
    </div>
  )
}

function StoryEntry({
  entry,
  color,
  index,
  onRemove,
  onLabelChange,
}: {
  entry: ColorStoryEntry
  color: { name: string; hex: string; code: string }
  index: number
  onRemove: () => void
  onLabelChange: (label: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(entry.label ?? '')

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800/30 group transition-colors">
      <span className="text-[10px] text-neutral-600 w-4 font-mono">{index + 1}</span>
      <div
        className="w-6 h-6 rounded border border-neutral-700 shrink-0"
        style={{ background: color.hex }}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => { onLabelChange(val); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onLabelChange(val); setEditing(false) } }}
            className="studio-input text-[10px] py-0 h-4"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left w-full"
          >
            <p className="text-[10px] text-neutral-300 truncate">
              {entry.label || color.name}
            </p>
            <p className="text-[9px] text-neutral-600 font-mono">{color.code}</p>
          </button>
        )}
      </div>
      <button
        onClick={onRemove}
        className="hidden group-hover:block text-neutral-600 hover:text-red-400 transition-colors text-xs"
      >
        ×
      </button>
    </div>
  )
}