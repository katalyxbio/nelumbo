"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Resizable (built on react-resizable-panels)
 *
 * shadcn's API, so shadcn code works unchanged:
 *
 *   <ResizablePanelGroup direction="horizontal" className="min-h-48">  // give it a height: min-h-*, or a parent with a height
 *     <ResizablePanel defaultSize={30}>One</ResizablePanel>
 *     <ResizableHandle withHandle />
 *     <ResizablePanel>Two</ResizablePanel>
 *   </ResizablePanelGroup>
 *
 * Nelumbo look: there is no divider line. Panels are rounded tonal surfaces
 * and the gap between them is 10px of whatever is behind. The handle is a
 * small grip pill (outline-variant) that grows and turns primary with a
 * spring while it is hovered, pressed or focused by keyboard.
 *
 * - `withHandle`: show the grip all the time. Without it the gap is quiet and
 *   the grip appears only while the pointer is over it or it has focus.
 * - Keyboard: Tab to a handle, then arrow keys resize (Home/End to the
 *   limits, Enter collapses a collapsible panel). It is a `separator` with
 *   aria-valuenow; give it an aria-label when a panel's purpose isn't obvious.
 * - Panels are `rounded-2xl bg-surface-container-high`. Override with
 *   className: use `bg-transparent rounded-none` on a panel that only holds
 *   another group, as in a nested layout.
 * - Reduced motion removes the grip animation.
 */

function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  )
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("overflow-auto rounded-2xl bg-surface-container-high", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group/handle relative flex w-2.5 shrink-0 cursor-col-resize items-center justify-center outline-none",
        "data-[panel-group-direction=vertical]:h-2.5 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize",
        // a wider invisible hit area than the visible gap
        "after:absolute after:inset-y-0 after:-inset-x-1.5 data-[panel-group-direction=vertical]:after:-inset-y-1.5 data-[panel-group-direction=vertical]:after:inset-x-0",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="resizable-grip"
        className={cn(
          "pointer-events-none block rounded-full bg-outline-variant [--long:2rem] [--short:0.25rem]",
          "h-(--long) w-(--short) group-data-[panel-group-direction=vertical]/handle:h-(--short) group-data-[panel-group-direction=vertical]/handle:w-(--long)",
          "transition-[width,height,background-color,opacity] duration-500 ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !withHandle && "opacity-0",
          // hover, drag (library state) and keyboard focus: grow and turn primary
          "group-hover/handle:opacity-100 group-hover/handle:bg-primary group-hover/handle:[--long:3rem] group-hover/handle:[--short:0.375rem]",
          "group-data-[resize-handle-state=hover]/handle:opacity-100 group-data-[resize-handle-state=hover]/handle:bg-primary group-data-[resize-handle-state=hover]/handle:[--long:3rem] group-data-[resize-handle-state=hover]/handle:[--short:0.375rem]",
          "group-data-[resize-handle-state=drag]/handle:opacity-100 group-data-[resize-handle-state=drag]/handle:bg-primary group-data-[resize-handle-state=drag]/handle:[--long:3.5rem] group-data-[resize-handle-state=drag]/handle:[--short:0.375rem]",
          "group-focus-visible/handle:opacity-100 group-focus-visible/handle:bg-primary group-focus-visible/handle:[--long:3rem] group-focus-visible/handle:[--short:0.375rem]",
          "group-focus-visible/handle:outline-2 group-focus-visible/handle:outline-offset-2 group-focus-visible/handle:outline-ring"
        )}
      />
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
