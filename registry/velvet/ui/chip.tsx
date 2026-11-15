"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Chips: compact controls for actions, filters and entered values.
 *
 *   <Chip icon="event">Add to calendar</Chip>                    assist
 *   <Chip variant="suggestion">Sounds good</Chip>                suggestion
 *   <FilterChip selected={on} onSelectedChange={setOn}>Vegan</FilterChip>
 *   <InputChip avatar="/maya.jpg" onRemove={…}>Maya Lin</InputChip>
 *   <ChipGroup aria-label="Cuisine">…</ChipGroup>
 *
 * All chips are 32px tall with the small radius, so they read as a family
 * with text fields rather than with pill buttons. The hit area extends to
 * 40px. Icons are 18px.
 *
 * - Chip: an action. `variant` "assist" (default, usually with an icon) or
 *   "suggestion" (a reply or query, usually text only). `elevated` lifts it
 *   off busy surfaces (images, maps).
 * - FilterChip: a toggle (aria-pressed). When selected it fills in and a
 *   check slides in; if it has an icon, the icon turns into the check.
 *   `trailingIcon="arrow_drop_down"` for a chip that opens a menu.
 * - InputChip: a value the user entered, with a remove button. Backspace or
 *   Delete on the remove button removes it too.
 * - `color="brand"` on FilterChip uses the accent container when selected.
 */

const base = [
  "group/chip relative inline-flex h-8 shrink-0 items-center rounded-sm whitespace-nowrap select-none type-label-lg",
  "[--icon-size:18px] [--icon-opsz:20]",
  // 40px hit area
  "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
]

const button = "tactile state-layer cursor-pointer"

const surface = (elevated?: boolean) =>
  elevated
    ? "border border-transparent bg-surface-container-low shadow-e1 hover:shadow-e2 dark:bg-surface-container-high"
    : "border border-outline-variant bg-transparent hover:border-outline"

/* ----------------------------------------------------------------------- */

type ChipProps = React.ComponentProps<"button"> & {
  variant?: "assist" | "suggestion"
  icon?: IconName
  trailingIcon?: IconName
  elevated?: boolean
  asChild?: boolean
}

function Chip({ className, variant = "assist", icon, trailingIcon, elevated, asChild = false, children, ...props }: ChipProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="chip"
      data-variant={variant}
      type={asChild ? undefined : "button"}
      className={cn(
        base,
        button,
        surface(elevated),
        "gap-2 px-4 text-foreground",
        icon && "pl-2",
        trailingIcon && "pr-2",
        className
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon && <Icon name={icon} className={variant === "assist" ? "text-foreground" : "text-muted-foreground"} />}
          {children}
          {trailingIcon && <Icon name={trailingIcon} className="text-muted-foreground" />}
        </>
      )}
    </Comp>
  )
}

/* ----------------------------------------------------------------------- */

type FilterChipProps = Omit<React.ComponentProps<"button">, "color"> & {
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  icon?: IconName
  trailingIcon?: IconName
  elevated?: boolean
  color?: "default" | "brand"
}

const SELECTED = {
  default: "data-selected:border-transparent data-selected:bg-secondary data-selected:text-secondary-foreground",
  brand: "data-selected:border-transparent data-selected:bg-brand-container data-selected:text-brand-container-foreground",
}

function FilterChip({
  className,
  selected,
  defaultSelected = false,
  onSelectedChange,
  icon,
  trailingIcon,
  elevated,
  color = "default",
  onClick,
  children,
  ...props
}: FilterChipProps) {
  const [inner, setInner] = React.useState(defaultSelected)
  const on = selected ?? inner

  return (
    <button
      type="button"
      data-slot="filter-chip"
      data-selected={on || undefined}
      aria-pressed={on}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        setInner(!on)
        onSelectedChange?.(!on)
      }}
      className={cn(
        base,
        button,
        surface(elevated),
        "pr-4 text-muted-foreground hover:text-foreground data-selected:hover:shadow-e1",
        SELECTED[color],
        icon ? "pl-2" : "pl-4 data-selected:pl-2",
        trailingIcon && "pr-2",
        className
      )}
      {...props}
    >
      {icon ? (
        // the icon turns into a check
        <span className="mr-2 grid">
          <Icon
            name={icon}
            className="col-start-1 row-start-1 transition-[opacity,scale] duration-200 group-data-selected/chip:scale-50 group-data-selected/chip:opacity-0"
          />
          <Icon
            name="check"
            weight={600}
            className="col-start-1 row-start-1 scale-50 opacity-0 transition-[opacity,scale] duration-200 group-data-selected/chip:scale-100 group-data-selected/chip:opacity-100"
          />
        </span>
      ) : (
        // the check slides in from zero width
        <span
          aria-hidden
          className={cn(
            "grid grid-cols-[0fr] group-data-selected/chip:grid-cols-[1fr]",
            "transition-[grid-template-columns] duration-[727ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none"
          )}
        >
          <span className="flex overflow-hidden">
            <Icon
              name="check"
              weight={600}
              className="mr-2 scale-50 opacity-0 transition-[opacity,scale] duration-200 group-data-selected/chip:scale-100 group-data-selected/chip:opacity-100"
            />
          </span>
        </span>
      )}
      {children}
      {trailingIcon && <Icon name={trailingIcon} className="ml-2" />}
    </button>
  )
}

/* ----------------------------------------------------------------------- */

type InputChipProps = React.ComponentProps<"span"> & {
  /** Image URL, or initials / any node, shown in a 24px circle. A string counts as a URL if it has a "/" or ".". */
  avatar?: string | React.ReactNode
  icon?: IconName
  onRemove?: () => void
  /** Accessible name of the remove button. Defaults to "Remove <text>". */
  removeLabel?: string
  disabled?: boolean
}

function InputChip({ className, avatar, icon, onRemove, removeLabel, disabled, children, ...props }: InputChipProps) {
  const text = typeof children === "string" ? children : undefined
  return (
    <span
      data-slot="input-chip"
      aria-disabled={disabled || undefined}
      className={cn(
        base,
        "gap-2 border border-outline-variant pr-4 pl-3 text-foreground",
        avatar ? "pl-1" : icon && "pl-2",
        onRemove && "pr-1",
        className
      )}
      {...props}
    >
      {avatar &&
        (typeof avatar === "string" && /[/.]/.test(avatar) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-6 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="grid size-6 place-items-center rounded-full bg-secondary type-label-sm text-secondary-foreground">
            {avatar}
          </span>
        ))}
      {!avatar && icon && <Icon name={icon} className="text-muted-foreground" />}
      {children}
      {onRemove && (
        <button
          type="button"
          data-slot="input-chip-remove"
          aria-label={removeLabel ?? (text ? `Remove ${text}` : "Remove")}
          disabled={disabled}
          onClick={onRemove}
          onKeyDown={(e) => {
            if (e.key === "Backspace" || e.key === "Delete") {
              e.preventDefault()
              onRemove()
            }
          }}
          className={cn(
            "state-layer relative grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground",
            "before:absolute before:-inset-2 before:content-['']",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          )}
        >
          <Icon name="close" />
        </button>
      )}
    </span>
  )
}

/* ----------------------------------------------------------------------- */

type ChipGroupProps = React.ComponentProps<"div"> & {
  /** One scrolling row instead of wrapping lines. */
  scroll?: boolean
}

/** Lays chips out with an 8px gap. Give it an aria-label when it holds filters. */
function ChipGroup({ className, scroll = false, ...props }: ChipGroupProps) {
  return (
    <div
      role="group"
      data-slot="chip-group"
      className={cn(
        "flex gap-2",
        scroll ? "-mx-1 max-w-[calc(100%+0.5rem)] min-w-0 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex-wrap",
        className
      )}
      {...props}
    />
  )
}

export { Chip, FilterChip, InputChip, ChipGroup, type ChipProps, type FilterChipProps, type InputChipProps, type ChipGroupProps }
