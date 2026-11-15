"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants, withLabels } from "@/registry/nelumbo/ui/toggle"
import { IconButton, type IconButtonProps } from "@/registry/nelumbo/ui/icon-button"
import { Fab, type FabProps } from "@/registry/nelumbo/ui/fab"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/nelumbo/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/registry/nelumbo/ui/dropdown-menu"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Toolbar (Material 3 Expressive; no shadcn equivalent)
 *
 * A row (or column) of actions on Radix Toolbar: role="toolbar", one tab stop,
 * arrow keys rove between the buttons (Home / End jump to the ends), and
 * aria-orientation follows `orientation`. Always give it an `aria-label`.
 *
 *  - `variant`: "docked" is a full-width 64px bar at the bottom of a surface,
 *    items spread evenly. "floating" is a rounded pill raised above content
 *    (shadow-e3), items packed.
 *  - `orientation`: "horizontal" | "vertical". A vertical floating toolbar sits
 *    at a screen edge; set `edge="end"` when it is on the trailing edge, so
 *    tooltips open inward and it hides toward that edge.
 *  - `color`: "standard" (surface container), "vibrant" (inverse, a black pill
 *    in light mode) or "brand" (the accent container).
 *
 * Parts: ToolbarButton (an IconButton; `toggle` for a pressed state with the
 * shape morph; shows its label as a tooltip), ToolbarToggleGroup +
 * ToolbarToggleItem (connected Nelumbo toggle group), ToolbarSeparator (space,
 * no line), ToolbarFab (a FAB paired next to the bar; it is rendered outside
 * the role="toolbar" element, so it is its own tab stop).
 *
 * Collapse: `collapsed` + `collapse`. "shrink" folds every item that is not
 * `keep` away on a spring, leaving a small pill; "hide" slides the bar out of
 * view (it becomes inert). Drive it from scroll with useToolbarCollapse().
 *
 * Overflow: `overflow` measures the available room and moves the items that do
 * not fit into a "More" menu. Children must then be ToolbarButton and
 * ToolbarSeparator elements. Toggles that can overflow need a controlled
 * `pressed` so the menu can show the state. Without `overflow`, build the menu
 * yourself: put a DropdownMenu trigger in a ToolbarButton `asChild`-style, as
 * the Overflow section of the docs shows.
 *
 * @example
 * <Toolbar aria-label="Text formatting" variant="floating">
 *   <ToolbarButton icon="undo" label="Undo" onClick={undo} />
 *   <ToolbarSeparator />
 *   <ToolbarButton toggle icon="format_bold" label="Bold" pressed={bold} onPressedChange={setBold} />
 *   <ToolbarToggleGroup type="single" aria-label="Alignment" defaultValue="left">
 *     <ToolbarToggleItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToolbarToggleItem>
 *     <ToolbarToggleItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToolbarToggleItem>
 *   </ToolbarToggleGroup>
 *   <ToolbarFab icon="edit" label="Compose" />
 * </Toolbar>
 */

type ToolbarVariant = "docked" | "floating"
type ToolbarColor = "standard" | "vibrant" | "brand"
type ToolbarOrientation = "horizontal" | "vertical"
type ToolbarCollapse = "shrink" | "hide"
type ToolbarEdge = "start" | "end"

type ToolbarContextValue = {
  variant: ToolbarVariant
  color: ToolbarColor
  orientation: ToolbarOrientation
  edge: ToolbarEdge
  /** shrink mode: items that are not `keep` fold away */
  folded: boolean
  /** measuring copy of the items (overflow): plain buttons, no roving focus */
  measure: boolean
}

const ToolbarContext = React.createContext<ToolbarContextValue>({
  variant: "floating",
  color: "standard",
  orientation: "horizontal",
  edge: "start",
  folded: false,
  measure: false,
})

const useToolbar = () => React.useContext(ToolbarContext)

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const surface: Record<ToolbarColor, Record<ToolbarVariant, string>> = {
  standard: { docked: "bg-surface-container-high text-foreground dark:bg-surface-container-highest", floating: "bg-surface-container-high text-foreground dark:bg-surface-container-highest" },
  vibrant: { docked: "bg-inverse-surface text-inverse-foreground", floating: "bg-inverse-surface text-inverse-foreground" },
  brand: { docked: "bg-brand-container text-brand-container-foreground", floating: "bg-brand-container text-brand-container-foreground" },
}

// ToolbarButton: transparent until pressed; pressed turns inverse (strong)
const buttonColor: Record<ToolbarColor, string> = {
  standard: "text-foreground data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground",
  vibrant: "text-inverse-foreground data-[state=on]:bg-inverse-foreground data-[state=on]:text-inverse-surface",
  brand: "text-brand-container-foreground data-[state=on]:bg-brand-container-foreground data-[state=on]:text-brand-container",
}

// Group items sit on quiet tiles so the group reads as one object
const groupItemColor: Record<ToolbarColor, string> = {
  standard:
    "bg-surface-container-highest text-foreground hover:text-foreground data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground dark:bg-surface-bright dark:data-[state=on]:bg-inverse-surface",
  vibrant:
    "bg-inverse-foreground/15 text-inverse-foreground hover:text-inverse-foreground data-[state=on]:bg-inverse-foreground data-[state=on]:text-inverse-surface",
  brand:
    "bg-brand-container-foreground/10 text-brand-container-foreground hover:text-brand-container-foreground data-[state=on]:bg-brand-container-foreground data-[state=on]:text-brand-container",
}

const fabColor: Record<ToolbarColor, FabProps["color"]> = { standard: "solid", vibrant: "brand", brand: "solid" }

// ---------------------------------------------------------------------------
// Shell: every item sits in one, so collapsing animates the item's room
// (grid track 1fr -> 0fr) instead of snapping, whatever the item is.
// ---------------------------------------------------------------------------
function Shell({ hidden, children, className }: { hidden: boolean; children: React.ReactNode; className?: string }) {
  const { orientation } = useToolbar()
  const vertical = orientation === "vertical"
  return (
    <div
      data-slot="toolbar-item"
      data-hidden={hidden || undefined}
      inert={hidden || undefined}
      className={cn(
        "group/item grid shrink-0 transition-[grid-template-columns,grid-template-rows,opacity,margin] duration-400 ease-(--ease-spring) motion-reduce:transition-none",
        vertical ? "grid-rows-[1fr] data-hidden:-my-0.5 data-hidden:grid-rows-[0fr]" : "grid-cols-[1fr] data-hidden:-mx-0.5 data-hidden:grid-cols-[0fr]",
        "data-hidden:opacity-0",
        className
      )}
    >
      {/* clip with a 4px margin while open, so focus rings are not cut off */}
      <div className="min-h-0 min-w-0 overflow-clip [overflow-clip-margin:0.25rem] group-data-hidden/item:[overflow-clip-margin:0px]">{children}</div>
    </div>
  )
}

function useTipSide() {
  const { orientation, edge } = useToolbar()
  return orientation === "vertical" ? (edge === "end" ? "left" : "right") : "top"
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
type ToolbarProps = Omit<React.ComponentProps<typeof ToolbarPrimitive.Root>, "color" | "orientation"> & {
  variant?: ToolbarVariant
  color?: ToolbarColor
  orientation?: ToolbarOrientation
  /** Which screen edge a vertical toolbar sits on (tooltip side, hide direction). */
  edge?: ToolbarEdge
  /** Collapse state, usually from useToolbarCollapse(). */
  collapsed?: boolean
  /** "shrink" folds away items that are not `keep`; "hide" slides the bar out. Default "shrink" (floating), "hide" (docked). */
  collapse?: ToolbarCollapse
  /** Move items that do not fit into a "More" menu. Children must be ToolbarButton / ToolbarSeparator. */
  overflow?: boolean
  /** Accessible name of the overflow button. */
  overflowLabel?: string
  /** Classes for the layout wrapper that holds the bar and its FAB. */
  layoutClassName?: string
}

function Toolbar({
  variant = "floating",
  color = "standard",
  orientation = "horizontal",
  edge = "start",
  collapsed = false,
  collapse,
  overflow = false,
  overflowLabel = "More",
  className,
  layoutClassName,
  children,
  ref,
  ...props
}: ToolbarProps) {
  const vertical = orientation === "vertical"
  const mode: ToolbarCollapse = variant === "docked" ? "hide" : (collapse ?? "shrink")
  const hidden = collapsed && mode === "hide"
  const folded = collapsed && mode === "shrink"

  // FABs sit beside the bar, outside role="toolbar"
  const all = React.Children.toArray(children)
  const fabs = all.filter((c) => React.isValidElement(c) && c.type === ToolbarFab)
  const items = all.filter((c) => !(React.isValidElement(c) && c.type === ToolbarFab))

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const layoutRef = React.useRef<HTMLDivElement | null>(null)
  const measureRef = React.useRef<HTMLDivElement | null>(null)
  const [count, setCount] = React.useState(items.length)
  const itemCount = items.length

  React.useLayoutEffect(() => {
    if (!overflow) return
    const layout = layoutRef.current
    const m = measureRef.current
    const root = rootRef.current
    if (!layout || !m || !root) return
    const GAP = 4
    const MORE = 40
    const compute = () => {
      const sizes = Array.from(m.children).map((k) => (vertical ? (k as HTMLElement).offsetHeight : (k as HTMLElement).offsetWidth))
      const cs = getComputedStyle(root)
      const pad = vertical ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const fabEl = layout.querySelector<HTMLElement>("[data-slot=toolbar-fab]")
      const fabSize = fabEl ? (vertical ? fabEl.offsetHeight : fabEl.offsetWidth) + 8 : 0
      const avail = (vertical ? layout.clientHeight : layout.clientWidth) - fabSize - pad
      const total = sizes.reduce((a, b) => a + b, 0) + GAP * Math.max(0, sizes.length - 1)
      let next = sizes.length
      if (total > avail) {
        let used = MORE
        next = 0
        for (const s of sizes) {
          if (used + GAP + s > avail) break
          used += GAP + s
          next++
        }
      }
      // never end the visible run on a separator
      while (next > 0 && next < sizes.length && React.isValidElement(items[next - 1]) && (items[next - 1] as React.ReactElement).type === ToolbarSeparator) next--
      setCount(next)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(layout)
    ro.observe(m)
    return () => ro.disconnect()
    // items identity changes every render; its length and the orientation are what matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflow, vertical, itemCount])

  const visible = overflow ? items.slice(0, count) : items
  const rest = overflow ? items.slice(count) : []

  const ctx: ToolbarContextValue = { variant, color, orientation, edge, folded, measure: false }

  return (
    <ToolbarContext.Provider value={ctx}>
      <TooltipProvider>
        <div
          ref={layoutRef}
          data-slot="toolbar-layout"
          className={cn(
            "relative flex items-center gap-2",
            vertical ? "flex-col" : "flex-row",
            overflow ? (vertical ? "h-full min-h-0" : "w-full min-w-0") : variant === "docked" ? "w-full" : vertical ? "h-fit" : "w-fit max-w-full",
            variant === "floating" && !vertical && "justify-center",
            variant === "floating" && vertical && "justify-center",
            layoutClassName
          )}
        >
          <ToolbarPrimitive.Root
            ref={(n) => {
              rootRef.current = n
              if (typeof ref === "function") ref(n)
              else if (ref) ref.current = n
            }}
            data-slot="toolbar"
            data-variant={variant}
            data-color={color}
            data-collapsed={collapsed || undefined}
            data-hidden={hidden || undefined}
            orientation={orientation}
            inert={hidden || undefined}
            className={cn(
              "group/toolbar relative flex min-h-0 min-w-0 items-center gap-1 select-none",
              "transition-[translate,opacity,scale] duration-500 ease-(--ease-spring) motion-reduce:transition-none",
              vertical ? "w-16 flex-col py-3" : "h-16 px-3",
              variant === "floating" ? "rounded-full shadow-e3" : cn("rounded-none", vertical ? "h-full justify-around" : "w-full justify-around px-4"),
              variant === "floating" && (vertical ? "h-fit max-h-full" : "w-fit max-w-full"),
              surface[color][variant],
              hidden && "pointer-events-none opacity-0",
              hidden && (vertical ? (edge === "end" ? "translate-x-[calc(100%+1.5rem)]" : "-translate-x-[calc(100%+1.5rem)]") : "translate-y-[calc(100%+1.5rem)]"),
              className
            )}
            {...props}
          >
            {visible}
            {rest.length > 0 && <OverflowMenu items={rest} label={overflowLabel} />}
          </ToolbarPrimitive.Root>
          {fabs}
          {overflow && (
            <ToolbarContext.Provider value={{ ...ctx, measure: true, folded: false }}>
              <div
                ref={measureRef}
                aria-hidden
                inert
                className={cn("pointer-events-none invisible absolute top-0 left-0 flex gap-1", vertical ? "h-max flex-col" : "w-max")}
              >
                {items}
              </div>
            </ToolbarContext.Provider>
          )}
        </div>
      </TooltipProvider>
    </ToolbarContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// ToolbarButton
// ---------------------------------------------------------------------------
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

type ToolbarButtonProps = DistributiveOmit<IconButtonProps, "variant" | "shape"> & {
  /** Stays visible when the toolbar collapses ("shrink"). */
  keep?: boolean
  /** Keys shown in the tooltip, e.g. "⌘B". */
  shortcut?: string
}

function ToolbarButton({ keep = false, shortcut, className, ...props }: ToolbarButtonProps) {
  const { color, folded, measure } = useToolbar()
  const tipSide = useTipSide()
  const hidden = folded && !keep
  const cls = cn(buttonColor[color], className)

  if (measure) {
    return (
      <Shell hidden={false}>
        <IconButton {...(props as IconButtonProps)} tabIndex={-1} className={cls} />
      </Shell>
    )
  }

  return (
    <Shell hidden={hidden}>
      <Tooltip>
        {/* the tooltip trigger is the shell: a toggle button owns its own data-state */}
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <ToolbarPrimitive.Button asChild>
              <IconButton {...(props as IconButtonProps)} className={cls} />
            </ToolbarPrimitive.Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side={tipSide} shortcut={shortcut}>
          {props.label}
        </TooltipContent>
      </Tooltip>
    </Shell>
  )
}

// ---------------------------------------------------------------------------
// ToolbarToggleGroup
// ---------------------------------------------------------------------------
const connectedGroup = [
  "gap-0.5 *:[--press-scale:1]",
  "*:[--btn-radius-start:calc(var(--btn-h)/5)] *:[--btn-radius-end:calc(var(--btn-h)/5)]",
  "*:first:[--btn-radius-start:var(--btn-radius)] *:last:[--btn-radius-end:var(--btn-radius)]",
  "[&>[data-state=on]]:[--btn-radius-start:calc(var(--btn-h)/2)] [&>[data-state=on]]:[--btn-radius-end:calc(var(--btn-h)/2)]",
  "[&>[data-state=on]]:[--btn-px-delta:0.375rem]",
  "*:active:[--btn-px-delta:0.5rem]",
  "[&:has(>:active)>:not(:active)]:[--btn-px-delta:-0.125rem]",
]

type ToolbarToggleGroupProps = React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup> & { keep?: boolean }

/**
 * Nelumbo's connected toggle group inside a toolbar: the selected item swells
 * and its neighbours give way. In a vertical toolbar the items stack as
 * separate pills. One tab stop with the other toolbar items, arrows move on.
 */
function ToolbarToggleGroup({ className, keep = false, children, ...props }: ToolbarToggleGroupProps) {
  const { orientation, folded, measure } = useToolbar()
  const vertical = orientation === "vertical"
  const hidden = folded && !keep
  const group = measure ? (
    <div data-slot="toolbar-toggle-group" className={cn("flex w-fit items-center", vertical ? "flex-col gap-1" : connectedGroup, className)}>
      {children}
    </div>
  ) : (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn("flex w-fit items-center rounded-none", vertical ? "flex-col gap-1" : connectedGroup, className)}
      {...(props as React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>)}
    >
      {children}
    </ToolbarPrimitive.ToggleGroup>
  )
  return <Shell hidden={hidden}>{group}</Shell>
}

function ToolbarToggleItem({ className, children, ...props }: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem>) {
  const { color, measure } = useToolbar()
  if (measure) {
    return (
      <button type="button" tabIndex={-1} className={cn(toggleVariants({ variant: "default", size: "default" }), groupItemColor[color], className)}>
        {withLabels(children)}
      </button>
    )
  }
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      className={cn(toggleVariants({ variant: "default", size: "default" }), groupItemColor[color], className)}
      {...props}
    >
      {withLabels(children)}
    </ToolbarPrimitive.ToggleItem>
  )
}

// ---------------------------------------------------------------------------
// ToolbarSeparator: space, never a line
// ---------------------------------------------------------------------------
function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { orientation, folded, measure } = useToolbar()
  const vertical = orientation === "vertical"
  const cls = cn(
    "shrink-0 bg-transparent transition-[width,height,margin,opacity] duration-400 ease-(--ease-spring) motion-reduce:transition-none",
    vertical ? "h-2 w-full" : "h-full w-2",
    folded && (vertical ? "-my-0.5 h-0 opacity-0" : "-mx-0.5 w-0 opacity-0"),
    className
  )
  if (measure) return <div data-slot="toolbar-separator" className={cls} />
  return <ToolbarPrimitive.Separator data-slot="toolbar-separator" className={cls} {...props} />
}

// ---------------------------------------------------------------------------
// ToolbarFab: a FAB paired with the bar (rendered beside it by <Toolbar>)
// ---------------------------------------------------------------------------
function ToolbarFab({ color, size = "default", ...props }: FabProps) {
  const ctx = useToolbar()
  if (ctx.measure) return null
  return <Fab data-slot="toolbar-fab" color={color ?? fabColor[ctx.color]} size={size} {...props} />
}

// ---------------------------------------------------------------------------
// Overflow menu
// ---------------------------------------------------------------------------
function OverflowMenu({ items, label }: { items: React.ReactNode[]; label: string }) {
  const { orientation, color, edge } = useToolbar()
  const vertical = orientation === "vertical"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarPrimitive.Button asChild>
          <IconButton icon={vertical ? "more_vert" : "more_horiz"} label={label} className={cn(buttonColor[color], "data-[state=open]:bg-foreground/10")} />
        </ToolbarPrimitive.Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={vertical ? (edge === "end" ? "left" : "right") : "top"} align={vertical ? "start" : "end"} className="min-w-52">
        {items.map((el, i) => {
          if (!React.isValidElement(el)) return null
          if (el.type === ToolbarSeparator) return <DropdownMenuSeparator key={i} />
          const p = el.props as ToolbarButtonProps & { pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (v: boolean) => void; onClick?: React.MouseEventHandler }
          if (el.type === ToolbarButton && p.toggle) {
            const on = p.pressed ?? p.defaultPressed ?? false
            return (
              <DropdownMenuItem key={i} role="menuitemcheckbox" aria-checked={on} disabled={p.disabled} onSelect={() => p.onPressedChange?.(!on)}>
                {p.icon && <Icon name={p.icon} />}
                {p.label}
                {on && <Icon name="check" className="ms-auto" />}
              </DropdownMenuItem>
            )
          }
          if (el.type === ToolbarButton) {
            return (
              <DropdownMenuItem key={i} disabled={p.disabled} onSelect={() => p.onClick?.(undefined as never)}>
                {p.icon && <Icon name={p.icon} />}
                {p.label}
              </DropdownMenuItem>
            )
          }
          return null
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// useToolbarCollapse: collapse while scrolling down, return when scrolling up
// ---------------------------------------------------------------------------
/**
 * Returns `collapsed` for <Toolbar collapsed>. Pass the scroll container's ref
 * (or nothing, to follow the window). Collapses on scroll down past
 * `threshold`, comes back on scroll up or at the top.
 */
function useToolbarCollapse(ref?: React.RefObject<HTMLElement | null>, { threshold = 12 }: { threshold?: number } = {}) {
  const [collapsed, setCollapsed] = React.useState(false)
  React.useEffect(() => {
    const el = ref?.current ?? null
    const pos = () => (el ? el.scrollTop : window.scrollY)
    const target: HTMLElement | Window = el ?? window
    let last = pos()
    const onScroll = () => {
      const y = pos()
      if (Math.abs(y - last) > threshold) setCollapsed(y > last && y > 24)
      if (y < 8) setCollapsed(false)
      last = y
    }
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => target.removeEventListener("scroll", onScroll)
  }, [ref, threshold])
  return collapsed
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarSeparator,
  ToolbarFab,
  useToolbarCollapse,
  type ToolbarProps,
  type ToolbarButtonProps,
}
