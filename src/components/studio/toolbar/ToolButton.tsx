'use client'

import { useState } from 'react'
import { Tool } from '@/types'

interface ToolButtonProps {
  tool: Tool
  activeTool: Tool
  onClick: (tool: Tool) => void
  icon: React.ReactNode
  label: string
  description?: string
  shortcut?: string
}

export default function ToolButton({
  tool,
  activeTool,
  onClick,
  icon,
  label,
  description,
  shortcut,
}: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const isActive = activeTool === tool

  return (
    <div className="relative flex items-center justify-center">
      <button
        className={`tool-btn ${isActive ? 'active' : ''}`}
        onClick={() => onClick(tool)}
        aria-label={label}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {icon}
      </button>

      {showTooltip && (
        <div
          className="tooltip"
          style={{ left: '2.75rem', top: '50%', transform: 'translateY(-50%)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-neutral-100">{label}</span>
            {shortcut && <span className="kbd">{shortcut}</span>}
          </div>
          {description && (
            <div className="text-[10px] text-neutral-400 mt-0.5 max-w-48 whitespace-normal">
              {description}
            </div>
          )}
          {shortcut && (
            <span className="sr-only">Shortcut {shortcut}</span>
          )}
        </div>
      )}
    </div>
  )
}