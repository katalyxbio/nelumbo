"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { floatingSurface } from "@/registry/nelumbo/ui/popover"

/**
 * Nelumbo Hover Card (built on Radix HoverCard)
 *
 * API-compatible with shadcn's HoverCard (HoverCard, HoverCardTrigger,
 * HoverCardContent), so shadcn code works unchanged:
 *
 *   <HoverCard>
 *     <HoverCardTrigger asChild><a href="/maya">@maya</a></HoverCardTrigger>
 *     <HoverCardContent>
 *       <p>Maya Kowalski, Product design</p>
 *     </HoverCardContent>
 *   </HoverCard>
 *
 * - The card uses the popover's surface (raised, elevation 3) and springs
 *   out of the trigger: scale and fade from the edge it grows from, then a
 *   quick fade on close. Opens on pointer hover and on keyboard focus of the trigger; closes on
 *   leave, blur or Escape. It is a preview only: the same information must
 *   be reachable another way, and it never holds the only way to act.
 * - The card is a labelled region ("Preview"); pass `aria-label` to name it.
 * - Defaults differ from Radix: `openDelay` 250ms, `closeDelay` 120ms.
 * - Content: `align` "center", `sideOffset` 8, `collisionPadding` 8, w-72.
 */

function HoverCard({ openDelay = 250, closeDelay = 120, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        role="region"
        aria-label="Preview"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          "w-72 max-w-[calc(100vw-1rem)] origin-(--radix-hover-card-content-transform-origin) p-4 type-body-md",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
