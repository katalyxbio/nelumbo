"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/registry/nelumbo/ui/button"
import { MenuKeycaps } from "@/registry/nelumbo/ui/dropdown-menu"

/**
 * Nelumbo InputGroup
 *
 * API-compatible with shadcn's InputGroup. The whole group is ONE Nelumbo
 * field: the same filled surface, small radius, hover / focus / invalid
 * treatment and 1px-to-2px active line as Input, with addons living inside it.
 *
 *   <InputGroup>
 *     <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
 *     <InputGroupInput aria-label="Website" placeholder="nelumbo.dev" />
 *     <InputGroupAddon align="inline-end"><InputGroupText>.com</InputGroupText></InputGroupAddon>
 *   </InputGroup>
 *
 *   <InputGroup>   // search with a keycap hint
 *     <InputGroupAddon><Icon name="search" /></InputGroupAddon>
 *     <InputGroupInput aria-label="Search" placeholder="Search" />
 *     <InputGroupAddon align="inline-end"><InputGroupKeys>⌘K</InputGroupKeys></InputGroupAddon>
 *   </InputGroup>
 *
 *   <InputGroup>   // chat composer
 *     <InputGroupTextarea aria-label="Message" placeholder="Ask anything" />
 *     <InputGroupAddon align="block-end">
 *       <InputGroupButton size="icon-sm" variant="ghost" aria-label="Attach"><Icon name="add" /></InputGroupButton>
 *       <InputGroupButton className="ms-auto" size="icon-sm" aria-label="Send"><Icon name="arrow_upward" /></InputGroupButton>
 *     </InputGroupAddon>
 *   </InputGroup>
 *
 * - `InputGroupAddon align`: inline-start (default), inline-end, block-start,
 *   block-end. Block addons turn the group into a column (toolbars above or
 *   below a textarea). Addons can sit anywhere in the JSX; `align` decides
 *   where they draw. Clicking an addon (not a button in it) focuses the control.
 * - The group looks at its control: `aria-invalid` on the InputGroupInput /
 *   InputGroupTextarea (or `data-invalid` on the group) turns it invalid,
 *   `disabled` on the control dims it.
 * - An InputGroupInput has no floating label, so give it an `aria-label`.
 *   Reach for Input with `icon` and `trailing` first; use a group when the
 *   addons are text, keycaps, buttons or a toolbar.
 */

function InputGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group",
        "relative flex h-10 w-full min-w-0 items-center rounded-field",
        "[--icon-size:18px] [--icon-opsz:20]",
        "bg-surface-container-high dark:bg-surface-container-highest",
        "transition-colors duration-200 ease-(--ease-standard) motion-reduce:transition-none",
        "hover:bg-surface-container-highest dark:hover:bg-surface-bright",
        // focus: only the control lights the group up, not a button inside it
        "has-[[data-slot=input-group-control]:focus-visible]:bg-surface-container-highest dark:has-[[data-slot=input-group-control]:focus-visible]:bg-surface-bright",
        // invalid
        "data-invalid:bg-destructive-container/60 dark:data-invalid:bg-destructive-container/40",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:bg-destructive-container/60 dark:has-[[data-slot=input-group-control][aria-invalid=true]]:bg-destructive-container/40",
        // disabled
        "data-disabled:pointer-events-none data-disabled:opacity-40 has-[[data-slot=input-group-control]:disabled]:opacity-40",
        // block addons stack the group; the textarea case grows with content
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col",
        "has-[>[data-align=block-start]]:items-stretch has-[>[data-align=block-end]]:items-stretch has-[>textarea]:h-auto",
        // a control next to an addon gives up its own padding on that side
        "has-[>[data-align=inline-start]]:[&>input]:ps-2 has-[>[data-align=inline-end]]:[&>input]:pe-2",
        "has-[>[data-align=block-start]]:[&>input]:h-10 has-[>[data-align=block-end]]:[&>input]:h-10",
        "has-[>[data-align=block-start]]:[&>textarea]:pt-1 has-[>[data-align=block-end]]:[&>textarea]:pb-1",
        className
      )}
      {...props}
    >
      {children}
      {/* active line: 1px at rest, 2px on focus or error (clipped to the radius) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-field">
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 h-px bg-input transition-[height,background-color] duration-200",
            "group-hover/input-group:bg-foreground",
            "group-has-[[data-slot=input-group-control]:focus-visible]/input-group:h-0.5 group-has-[[data-slot=input-group-control]:focus-visible]/input-group:bg-primary",
            "group-has-[[data-slot=input-group-control][aria-invalid=true]]/input-group:h-0.5 group-has-[[data-slot=input-group-control][aria-invalid=true]]/input-group:bg-destructive",
            "group-data-invalid/input-group:h-0.5 group-data-invalid/input-group:bg-destructive"
          )}
        />
      </span>
    </div>
  )
}

const addonVariants = cva(
  [
    "flex shrink-0 cursor-text items-center gap-2 py-1.5 text-muted-foreground select-none",
    "type-label-lg [&>svg:not([class*='size-'])]:size-(--icon-size)",
    "group-has-[[data-slot=input-group-control][aria-invalid=true]]/input-group:[&>[data-slot=icon]]:text-destructive",
  ],
  {
    variants: {
      align: {
        "inline-start": "order-first ps-3 has-[>button]:ps-1.5 has-[>[data-slot=input-group-keys]]:ps-2",
        "inline-end": "order-last pe-3 has-[>button]:pe-1.5 has-[>[data-slot=input-group-keys]]:pe-2.5",
        "block-start": "order-first w-full justify-start px-3 pt-2.5 pb-1 has-[>button]:px-2",
        "block-end": "order-last w-full justify-start px-3 pt-0 pb-2.5 has-[>button]:px-2 has-[>button]:pb-2",
      },
    },
    defaultVariants: { align: "inline-start" },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  onClick,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof addonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(addonVariants({ align }), className)}
      onClick={(e) => {
        onClick?.(e)
        if ((e.target as HTMLElement).closest("button, a, select")) return
        const control = e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")
        control?.focus()
      }}
      {...props}
    />
  )
}

/** Tonal pill button for inside a group. Same props as Button; default type="button". */
const inputGroupButtonSizes = ["xs", "sm", "icon-xs", "icon-sm"] as const
type InputGroupButtonProps = Omit<ButtonProps, "size"> & { size?: (typeof inputGroupButtonSizes)[number] }

function InputGroupButton({ className, type = "button", variant = "secondary", size = "xs", ...props }: InputGroupButtonProps) {
  return (
    <Button
      data-slot="input-group-button"
      type={type}
      variant={variant}
      size={size}
      className={cn("shadow-none hover:shadow-none", className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("flex items-center gap-2 type-body-md whitespace-nowrap text-muted-foreground [&_svg:not([class*='size-'])]:size-(--icon-size)", className)}
      {...props}
    />
  )
}

/** Keycap hint ("⌘K", "Ctrl+Enter"), drawn like the shortcuts in menus. */
function InputGroupKeys({ className, ...props }: Omit<React.ComponentProps<"span">, "slot">) {
  return <MenuKeycaps slot="input-group-keys" className={cn("ml-0 pl-0", className)} {...props} />
}

const controlBase = cn(
  "min-w-0 flex-1 bg-transparent text-foreground outline-none type-body-md",
  "placeholder:text-muted-foreground disabled:cursor-not-allowed"
)

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(controlBase, "h-full px-3 [&::-webkit-search-cancel-button]:hidden", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, rows = 1, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      rows={rows}
      className={cn(controlBase, "field-sizing-content max-h-48 min-h-10 w-full resize-none px-3 py-2.5 leading-6", className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupKeys,
  InputGroupInput,
  InputGroupTextarea,
}
export type { InputGroupButtonProps }
