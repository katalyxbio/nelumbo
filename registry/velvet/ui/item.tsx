"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Velvet Item, a drop-in for shadcn's Item set
 *
 *   <ItemGroup>
 *     <Item asChild>
 *       <a href="/settings/display">
 *         <ItemMedia variant="icon"><Icon name="palette" /></ItemMedia>
 *         <ItemContent>
 *           <ItemTitle>Display</ItemTitle>
 *           <ItemDescription>Dark theme, blue accent</ItemDescription>
 *         </ItemContent>
 *         <ItemActions><Icon name="chevron_right" /></ItemActions>
 *       </a>
 *     </Item>
 *   </ItemGroup>
 *
 * Same exports and props as shadcn: Item (variant "default" | "outline" |
 * "muted", size "default" | "sm", asChild), ItemGroup, ItemSeparator, ItemMedia
 * (variant "default" | "icon" | "image"), ItemContent, ItemTitle,
 * ItemDescription, ItemActions, ItemHeader, ItemFooter. It shares List's
 * paddings, type and state layer. Velvet adds:
 *
 * - ItemGroup is a tonal segmented surface, like List variant="segmented": each
 *   Item is a tile 2px from the next, with the group's outer corners rounded.
 *   `variant="plain"` leaves the items loose.
 * - Interactive items (asChild, onClick, or `interactive`) get a state layer and
 *   the same press squeeze as buttons. `selected` fills the item with secondary.
 * - "outline" is a ring in outline-variant, drawn inside the item (no border),
 *   so stacked outline items never double a line.
 * - ItemMedia "icon" sits the glyph on a tonal tile (drawn by the wrapper, the
 *   Icon itself is never padded).
 * - ItemGroup is a plain container (no list roles, so an item can be a link).
 * - ItemSeparator is spacing: it starts a new group of tiles. No line.
 */

type GroupVariant = "segmented" | "plain"
const ItemGroupContext = React.createContext<GroupVariant | null>(null)

type ItemGroupProps = React.ComponentProps<"div"> & { variant?: GroupVariant }

function ItemGroup({ className, variant = "segmented", ...props }: ItemGroupProps) {
  return (
    <ItemGroupContext.Provider value={variant}>
      <div
        data-slot="item-group"
        data-variant={variant}
        className={cn(
          "group/item-group flex w-full flex-col",
          variant === "segmented" ? "gap-0.5" : "gap-2",
          // outlined items are rings, so give them air instead of stacking the rings
          "has-[>[data-variant=outline]]:gap-2",
          className
        )}
        {...props}
      />
    </ItemGroupContext.Provider>
  )
}

/** Spacing between groups of tiles. The tiles on either side take their outer corners. */
function ItemSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="item-separator"
      className={cn(
        "h-3 shrink-0 [&+[data-segment]]:rounded-t-2xl [[data-segment]:has(+&)]:rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
}

const itemVariants = cva(
  [
    "group/item relative flex flex-wrap items-center text-foreground outline-none",
    "[--icon-size:24px] [--icon-opsz:24]",
    "transition-[background-color,box-shadow,border-radius] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
    "data-selected:bg-secondary data-selected:text-secondary-foreground",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40 data-disabled:pointer-events-none data-disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "rounded-xl shadow-[inset_0_0_0_1px_var(--outline-variant)]",
        muted: "bg-surface-container dark:bg-surface-container-high",
      },
      size: {
        default: "min-h-14 gap-4 px-4 py-2",
        sm: "min-h-11 gap-3 px-3 py-1.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ItemProps = React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & {
    asChild?: boolean
    /** Force the interactive look (state layer and press). Implied by asChild and onClick. */
    interactive?: boolean
    selected?: boolean
  }

function Item({ className, variant = "default", size = "default", asChild = false, interactive, selected, onClick, ...props }: ItemProps) {
  const group = React.useContext(ItemGroupContext)
  const Comp = asChild ? Slot.Root : "div"
  const live = interactive ?? (asChild || onClick !== undefined)
  // inside a segmented group the default and muted items are tiles; outlined ones keep their ring
  const tile = group === "segmented" && variant !== "outline"
  const segment = tile || undefined

  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      data-selected={selected || undefined}
      data-interactive={live || undefined}
      data-segment={segment}
      onClick={onClick}
      className={cn(
        itemVariants({ variant, size }),
        tile
          ? "rounded-xs bg-surface-container first:rounded-t-2xl last:rounded-b-2xl dark:bg-surface-container-high"
          : variant !== "outline" && "rounded-xl",
        live && "state-layer tactile cursor-pointer [--press-scale:0.985]",
        className
      )}
      {...props}
    />
  )
}

const mediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 text-muted-foreground group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        // a tonal tile around the glyph; the wrapper draws it, the Icon span stays unpadded
        icon: [
          "size-10 rounded-xl bg-surface-container-highest text-foreground",
          "group-data-selected/item:bg-secondary-foreground group-data-selected/item:text-secondary",
          "transition-[background-color,color,border-radius] duration-300 ease-(--ease-spring) motion-reduce:transition-none",
          "group-data-[interactive]/item:group-hover/item:rounded-full",
          "[--icon-size:20px] [--icon-opsz:20]",
        ],
        image: "size-10 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof mediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(mediaVariants({ variant }), className)} {...props} />
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col py-1", className)} {...props} />
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit max-w-full items-center gap-2 type-body-lg text-foreground",
        "group-data-selected/item:text-secondary-foreground",
        // an interactive item's link or button covers the whole item
        "[&>a]:after:absolute [&>a]:after:inset-0 [&>a]:after:rounded-[inherit] [&>a]:after:content-['']",
        "[&>button]:after:absolute [&>button]:after:inset-0 [&>button]:after:rounded-[inherit] [&>button]:after:content-['']",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 type-body-md text-muted-foreground",
        "group-data-selected/item:text-secondary-foreground/80",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Trailing controls. They sit above a stretched link so they stay clickable. */
function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("relative z-[1] flex shrink-0 items-center gap-2 text-muted-foreground", className)} {...props} />
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  type ItemProps,
  type ItemGroupProps,
}
