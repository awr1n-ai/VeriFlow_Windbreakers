"use client"

import { Rabbit, Turtle } from "lucide-react"

import { cn } from "@/app/lib/utils"
import type { AgentType } from "./types"

interface AgentOption {
  value: AgentType
  label: string
  description: string
  icon: typeof Rabbit
  selectedClasses: string
  iconClasses: string
}

const OPTIONS: AgentOption[] = [
  {
    value: "good",
    label: "Good agent",
    description: "Submits a correct solution",
    icon: Rabbit,
    selectedClasses: "border-emerald-500/50 bg-emerald-500/10",
    iconClasses: "text-emerald-400",
  },
  {
    value: "lazy",
    label: "Lazy agent",
    description: "Cuts corners and fails tests",
    icon: Turtle,
    selectedClasses: "border-amber-500/50 bg-amber-500/10",
    iconClasses: "text-amber-400",
  },
]

interface AgentSelectorProps {
  value: AgentType
  onChange: (value: AgentType) => void
  disabled?: boolean
}

export function AgentSelector({ value, onChange, disabled }: AgentSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Agent type"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-start gap-3 rounded-md border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? option.selectedClasses
                : "border-input hover:bg-muted/50"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                selected ? option.iconClasses : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
