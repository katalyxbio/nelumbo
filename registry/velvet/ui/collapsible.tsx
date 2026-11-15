"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Collapsible (built on Radix Collapsible)
 *
 * API-compatible with shadcn's Collapsible (Collapsible, CollapsibleTrigger,
 * CollapsibleContent), so shadcn code works unchanged:
 *
 *   <Collapsible>
 *     <CollapsibleTrigger asChild><Button variant="ghost">Details</Button></CollapsibleTrigger>
 *     <CollapsibleContent>…</CollapsibleContent>
 *   </Collapsible>
 *
 * Velvet additions:
 *
 *   <CollapsibleTrigger chevron className="...">Show 3 more</CollapsibleTrigger>
 *   <CollapsibleTrigger asChild>
 *     <Button variant="secondary">Advanced <CollapsibleChevron /></Button>
 *   </CollapsibleTrigger>
 *
 * - Content opens with a height animation and a fade (the accordion's
 *   approach, so the two feel alike) and closes a little faster. Reduced
 *   motion keeps only a short fade.
 * - `chevron` on CollapsibleTrigger adds a trailing chevron; pass an icon
 *   name to use another glyph. With `asChild`, place <CollapsibleChevron />
 *   yourself. Either way it turns on a spring while the content opens.
 * - Keyboard (Radix): Enter and Space toggle. The trigger carries
 *   aria-expanded and aria-controls.
 */

const CSS = `
@keyframes vlv-col-down { from { height: 0; opacity: 0 } to { height: var(--radix-collapsible-content-height); opacity: 1 } }
@keyframes vlv-col-up { from { height: var(--radix-collapsible-content-height); opacity: 1 } to { height: 0; opacity: 0 } }
@keyframes vlv-col-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes vlv-col-fade-out { from { opacity: 1 } to { opacity: 0 } }
.vlv-col-content { overflow: hidden }
.vlv-col-content[data-state="open"] { animation: vlv-col-down 420ms var(--ease-emphasized) }
.vlv-col-content[data-state="closed"] { animation: vlv-col-up 280ms var(--ease-standard) }
@media (prefers-reduced-motion: reduce) {
  .vlv-col-content[data-state="open"] { animation: vlv-col-fade-in 120ms linear }
  .vlv-col-content[data-state="closed"] { animation: vlv-col-fade-out 120ms linear }
}
`

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return (
    <>
      <style href="velvet-collapsible" precedence="default">
        {CSS}
      </style>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </>
  )
}

/** A chevron that turns when its CollapsibleTrigger is open. */
function CollapsibleChevron({ name = "keyboard_arrow_down", className, ...props }: Omit<React.ComponentProps<typeof Icon>, "name"> & { name?: IconName }) {
  return (
    <Icon
      data-collapsible-chevron=""
      name={name}
      className={cn(
        "transition-transform duration-500 ease-spring-bouncy group-data-[state=open]/collapsible-trigger:rotate-180 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  /** Add a trailing chevron (or another icon) that turns when open. */
  chevron?: boolean | IconName
}

function CollapsibleTrigger({ className, chevron, children, asChild, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      asChild={asChild}
      className={cn(
        "group/collapsible-trigger cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        chevron && !asChild && "state-layer inline-flex items-center gap-1 rounded-full px-3 py-1.5 type-label-lg text-foreground",
        className
      )}
      {...props}
    >
      {chevron && !asChild ? (
        <>
          {children}
          <CollapsibleChevron name={typeof chevron === "string" ? chevron : undefined} />
        </>
      ) : (
        children
      )}
    </CollapsiblePrimitive.CollapsibleTrigger>
  )
}

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" className={cn("vlv-col-content", className)} {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevron }
