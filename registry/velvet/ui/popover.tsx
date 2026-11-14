"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Velvet Popover (built on Radix Popover)
 *
 * API-compatible with shadcn's Popover (Popover, PopoverTrigger,
 * PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle,
 * PopoverDescription). It grows out of its trigger on the smooth spring
 * (the transform origin follows the side it opens on) and fades away fast.
 *
 *   <Popover>
 *     <PopoverTrigger asChild><Button>Share</Button></PopoverTrigger>
 *     <PopoverContent>
 *       <PopoverHeader>
 *         <PopoverTitle>Share link</PopoverTitle>
 *         <PopoverDescription>Anyone with the link can view.</PopoverDescription>
 *       </PopoverHeader>
 *       …
 *     </PopoverContent>
 *   </Popover>
 */

/** Surface and motion shared by popovers and menus. */
export const floatingSurface = cn(
  "z-50 rounded-xl bg-card text-card-foreground shadow-e3 outline-none dark:bg-surface-container-high",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.9]",
  "data-[state=open]:duration-[396ms] data-[state=open]:ease-(--ease-spring)",
  "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
  "data-[state=closed]:duration-100 data-[state=closed]:ease-(--ease-standard)"
)

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverClose(props: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

function PopoverContent({ className, align = "center", sideOffset = 6, collisionPadding = 8, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          "flex w-72 max-w-[calc(100vw-1rem)] flex-col gap-4 p-4 origin-(--radix-popover-content-transform-origin)",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="popover-title" className={cn("type-title-md", className)} {...props} />
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="popover-description" className={cn("type-body-sm text-muted-foreground", className)} {...props} />
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription }
