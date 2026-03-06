'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStudioStore } from '@/store'
import { PANTONE_COLORS } from '@/data/pantone'
import { ColorStory } from '@/types'

export default function CollectionsPage() {
  const router = useRouter()
  const {
    colorStories,
    addColorStory,
    removeColorStory,
    setActiveColorStory,
  } = useStudioStore()

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSeason, setNewSeason] = useState('')

  const createStory = () => {
    if (!newName.trim()) return
    const story: ColorStory = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      season: newSeason.trim() || undefined,
      entries: [],
      createdAt: Date.now(),
    }
    addColorStory(story)
    setActiveColorStory(story.id)
    setNewName('')
    setNewSeason('')
    setCreating(false)
  }

  const openInStudio = (id: string) => {
    setActiveColorStory(id)
    router.push('/studio')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-neutral-500 hover:text-neutral-200 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-neutral-800" />
          <h1 className="text-sm font-semibold">Color Stories</h1>
          <span className="text-[10px] text-neutral-600 font-mono">
            {colorStories.length} collection{colorStories.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Color Story
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        {/* Create form */}
        {creating && (
          <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-5 max-w-md fade-in">
            <h3 className="text-sm font-medium text-neutral-200 mb-3">New Color Story</h3>
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                placeholder="Story name (e.g. Spring 2026)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createStory(); if (e.key === 'Escape') setCreating(false) }}
                className="studio-input text-sm"
              />
              <input
                type="text"
                placeholder="Season / collection (optional)"
                value={newSeason}
                onChange={(e) => setNewSeason(e.target.value)}
                className="studio-input text-sm"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={createStory}
                  className="flex-1 bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {colorStories.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl">
              🎨
            </div>
            <p className="text-neutral-500 text-sm text-center">
              No color stories yet.<br />
              Create one to build your seasonal palette narrative.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="bg-[#7ec845] hover:bg-[#6ab535] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Create your first story
            </button>
          </div>
        )}

        {/* Stories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onOpen={() => openInStudio(story.id)}
              onDelete={() => removeColorStory(story.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function StoryCard({
  story,
  onOpen,
  onDelete,
}: {
  story: ColorStory
  onOpen: () => void
  onDelete: () => void
}) {
  const colors = story.entries
    .map((e) => PANTONE_COLORS.find((c) => c.code === e.pantoneCode))
    .filter(Boolean)

  return (
    <div className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl overflow-hidden transition-all">
      {/* Palette strip */}
      <div className="h-16 flex">
        {colors.length > 0 ? (
          colors.map((c, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ background: c!.hex }}
              title={c!.name}
            />
          ))
        ) : (
          <div className="flex-1 bg-neutral-800 flex items-center justify-center">
            <span className="text-neutral-600 text-xs">No colors yet</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-medium text-white">{story.name}</h3>
            {story.season && (
              <p className="text-[10px] text-neutral-500 mt-0.5">{story.season}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all text-sm"
          >
            ×
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-600">
            {story.entries.length} color{story.entries.length !== 1 ? 's' : ''} · {formatDate(story.createdAt)}
          </span>
          <button
            onClick={onOpen}
            className="text-xs text-[#7ec845] hover:text-[#9ed865] transition-colors font-medium"
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}