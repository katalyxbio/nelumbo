"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { KbdShortcut } from "@/registry/nelumbo/ui/kbd"

/**
 * Nelumbo Tooltip (built on Radix Tooltip)
 *
 * API-compatible with shadcn's Tooltip (TooltipProvider, Tooltip,
 * TooltipTrigger, TooltipContent), plus:
 *  - `shortcut` on TooltipContent: keys shown after the label, e.g. "⌘B".
 *  - `variant="rich"`: a larger card with TooltipTitle and a sentence or two,
 *    for explaining a control. Keep it to text; anything you can click
 *    belongs in a Popover.
 *
 * Plain tooltips are small dark labels (light in dark mode) with the field
 * radius. They pop in with the snappy spring. A Tooltip works on its own;
 * wrap a toolbar (or the app) in one TooltipProvider so moving between
 * tooltips skips the delay.
 *
 *   <Tooltip>
 *     <TooltipTrigger asChild><IconButton icon="format_bold" label="Bold" /></TooltipTrigger>
 *     <TooltipContent shortcut="⌘B">Bold</TooltipContent>
 *   </Tooltip>
 */
const HasProvider = React.createContext(false)

function TooltipProvider({ delayDuration = 400, skipDelayDuration = 300, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProvider.Provider value={true}>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
    </HasProvider.Provider>
  )
}

/** Works on its own; inside a TooltipProvider it shares that provider's delays. */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  return React.useContext(HasProvider) ? root : <TooltipProvider>{root}</TooltipProvider>
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const VARIANTS = {
  plain: "flex items-center gap-2 rounded-field bg-inverse-surface px-2 py-1 type-label-md text-inverse-foreground dark:bg-foreground dark:text-background",
  rich: "flex max-w-72 flex-col gap-1 rounded-xl bg-card px-4 pt-3 pb-3.5 type-body-sm text-muted-foreground shadow-e3 dark:bg-surface-container-high",
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: keyof typeof VARIANTS
  shortcut?: string
}

function TooltipContent({ className, variant = "plain", shortcut, sideOffset = 6, collisionPadding = 8, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-variant={variant}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 w-fit max-w-[calc(100vw-1rem)] text-balance transition-none origin-(--radix-tooltip-content-transform-origin)",
          VARIANTS[variant],
          "animate-in fade-in-0 zoom-in-[0.85] duration-[396ms] ease-(--ease-spring-snappy)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100 data-[state=closed]:ease-(--ease-standard)",
          className
        )}
        {...props}
      >
        {children}
        {shortcut && (
          <KbdShortcut data-slot="tooltip-shortcut" className="inline-flex items-center gap-0.5">
            {shortcut}
          </KbdShortcut>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

/** Heading inside a rich tooltip. */
function TooltipTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="tooltip-title" className={cn("type-title-sm text-card-foreground", className)} {...props} />
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipTitle, type TooltipContentProps }
