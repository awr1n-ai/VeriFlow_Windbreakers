"use client"

import {
  Banknote,
  Check,
  CircuitBoard,
  FileSignature,
  Landmark,
  Loader2,
  ShieldQuestion,
  X,
} from "lucide-react"

import { Progress } from "@/app/components/ui/progress"
import { cn } from "@/app/lib/utils"
import type { StageId, StageState } from "./types"

interface VerificationTimelineProps {
  stages: StageState[]
}

const STAGE_ICONS: Record<StageId, typeof Banknote> = {
  funded: Banknote,
  working: CircuitBoard,
  receipt: FileSignature,
  verified: ShieldQuestion,
  settled: Landmark,
}

function statusLabel(status: StageState["status"]) {
  switch (status) {
    case "success":
      return "Complete"
    case "failure":
      return "Failed"
    case "active":
      return "In progress"
    default:
      return "Pending"
  }
}

export function VerificationTimeline({ stages }: VerificationTimelineProps) {
  const completedCount = stages.filter(
    (stage) => stage.status === "success" || stage.status === "failure"
  ).length
  const progressValue = (completedCount / stages.length) * 100

  return (
    <div className="space-y-5">
      <Progress
        value={progressValue}
        aria-label="Overall verification progress"
        className="h-1 bg-muted/60 [&>div]:bg-emerald-500 [&>div]:transition-all [&>div]:duration-500"
      />

      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
        {stages.map((stage, index) => {
          const StageIcon = STAGE_ICONS[stage.id]
          return (
            <li
              key={stage.id}
              className="flex flex-1 items-start gap-3 sm:flex-col sm:items-stretch sm:gap-0"
            >
              <div className="flex items-center sm:w-full">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                    stage.status === "success" &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    stage.status === "failure" &&
                      "border-destructive bg-destructive text-destructive-foreground",
                    stage.status === "active" &&
                      "border-amber-400 bg-amber-400/15 text-amber-300 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]",
                    stage.status === "pending" &&
                      "border-border text-muted-foreground/60"
                  )}
                >
                  {stage.status === "success" && (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {stage.status === "failure" && (
                    <X className="h-4 w-4" aria-hidden="true" />
                  )}
                  {stage.status === "active" && (
                    <Loader2
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  {stage.status === "pending" && (
                    <StageIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden h-0.5 flex-1 transition-colors duration-500 sm:block",
                    index === stages.length - 1 && "sm:hidden",
                    stage.status === "success" || stage.status === "failure"
                      ? "bg-emerald-500/60"
                      : "bg-border"
                  )}
                />
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="text-sm font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
                <p
                  className={cn(
                    "mt-1 text-xs font-medium transition-colors duration-300",
                    stage.status === "success" && "text-emerald-400",
                    stage.status === "failure" && "text-destructive",
                    stage.status === "active" && "text-amber-300",
                    stage.status === "pending" && "text-muted-foreground/70"
                  )}
                >
                  {statusLabel(stage.status)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
