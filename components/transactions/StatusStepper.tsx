"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusProses } from "@prisma/client"
import { STATUS_LABELS, STATUS_ORDER } from "@/types"

interface StatusStepperProps {
  currentStatus: StatusProses
  className?: string
}

export function StatusStepper({ currentStatus, className }: StatusStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className={cn("w-full py-6", className)}>
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-10" />
        {/* Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
        />

        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const label = STATUS_LABELS[status]

          return (
            <div key={status} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background",
                  isCompleted && "bg-primary border-primary text-white",
                  isActive && "border-primary text-primary ring-4 ring-primary/20 scale-110",
                  !isCompleted && !isActive && "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isActive ? (
                  <Circle className="h-2 w-2 fill-current" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile Stepper (Vertical) */}
      <div className="flex md:hidden flex-col gap-4">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const label = STATUS_LABELS[status]

          return (
            <div key={status} className="flex items-center gap-4">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10 bg-background",
                    isCompleted && "bg-primary border-primary text-white",
                    isActive && "border-primary text-primary ring-4 ring-primary/20",
                    !isCompleted && !isActive && "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <Circle className="h-1.5 w-1.5 fill-current" />
                  ) : (
                    <span className="text-[10px] font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-8 w-0.5 h-4 bg-muted -z-10",
                      isCompleted && "bg-primary"
                    )} 
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="text-[10px] text-primary/70 animate-pulse">
                    Sedang berlangsung...
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
