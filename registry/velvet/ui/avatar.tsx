"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Velvet Avatar (built on Radix Avatar; shadcn's API works as is)
 *
 *   <Avatar src="/maya.jpg" name="Maya Kowalski" />          // image, initials until it loads
 *   <Avatar name="Maya Kowalski" color="auto" size="lg" />    // tinted initials
 *   <Avatar>                                                  // shadcn style
 *     <AvatarImage src="/maya.jpg" alt="Maya Kowalski" />
 *     <AvatarFallback>MK</AvatarFallback>
 *   </Avatar>
 *   <AvatarGroup max={3}>{people.map(...)}</AvatarGroup>
 *
 * - `name`: unless you pass your own AvatarImage/AvatarFallback, renders
 *   the image (if `src`) and initials, and names the avatar for screen
 *   readers. Other children, like an AvatarBadge, still render.
 * - `size`: xs 24, sm 32, default 40, lg 56, xl 80.
 * - `shape`: "circle" or "rounded" (for teams, projects and bots).
 * - `color`: the initials' background. "neutral" (default), a palette color,
 *   or "auto", which picks one from the name so each person keeps theirs.
 * - AvatarBadge: a status dot (online, away, busy, offline) or a small icon
 *   at the corner, cut out from the background with a ring.
 */

const SIZES = {
  xs: "size-6 text-[0.625rem] [--badge:8px] [--ring:1.5px]",
  sm: "size-8 text-xs [--badge:10px] [--ring:2px]",
  default: "size-10 text-sm [--badge:12px] [--ring:2px]",
  lg: "size-14 text-xl [--badge:14px] [--ring:2.5px]",
  xl: "size-20 text-[1.75rem] [--badge:18px] [--ring:3px]",
}

const COLORS = {
  neutral: "[--av-bg:var(--secondary)] [--av-fg:var(--secondary-foreground)]",
  brand: "[--av-bg:var(--brand-container)] [--av-fg:var(--brand-container-foreground)]",
  red: "[--av-bg:var(--red-container)] [--av-fg:var(--red-container-foreground)]",
  orange: "[--av-bg:var(--orange-container)] [--av-fg:var(--orange-container-foreground)]",
  amber: "[--av-bg:var(--amber-container)] [--av-fg:var(--amber-container-foreground)]",
  green: "[--av-bg:var(--green-container)] [--av-fg:var(--green-container-foreground)]",
  cyan: "[--av-bg:var(--cyan-container)] [--av-fg:var(--cyan-container-foreground)]",
  blue: "[--av-bg:var(--blue-container)] [--av-fg:var(--blue-container-foreground)]",
  purple: "[--av-bg:var(--purple-container)] [--av-fg:var(--purple-container-foreground)]",
  pink: "[--av-bg:var(--pink-container)] [--av-fg:var(--pink-container-foreground)]",
}
const AUTO = ["red", "orange", "amber", "green", "cyan", "blue", "purple", "pink"] as const

type AvatarSize = keyof typeof SIZES
type AvatarColor = keyof typeof COLORS | "auto"

/** A stable palette color for a name. */
function colorFor(name: string): keyof typeof COLORS {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) | 0
  return AUTO[Math.abs(h) % AUTO.length]
}

/** "Maya Kowalski" → "MK", "Release bot" → "RB", "Ana" → "A". */
function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ""
  const last = words.length > 1 ? words[words.length - 1][0] : ""
  return (first + last).toUpperCase()
}

const GroupContext = React.createContext<{ size?: AvatarSize; shape?: "circle" | "rounded" } | null>(null)

type AvatarProps = Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "color"> & {
  size?: AvatarSize
  shape?: "circle" | "rounded"
  color?: AvatarColor
  /** Used for the initials, the auto color and the accessible name. */
  name?: string
  /** Image URL, when you don't pass children. */
  src?: string
}

function Avatar({ className, size, shape, color = "neutral", name, src, children, ...props }: AvatarProps) {
  const group = React.useContext(GroupContext)
  const s = size ?? group?.size ?? "default"
  const sh = shape ?? group?.shape ?? "circle"
  const tone = color === "auto" ? (name ? colorFor(name) : "neutral") : color
  // With a name and no image or fallback of your own, it draws them; other
  // children (an AvatarBadge) still render.
  const own = React.Children.toArray(children).some((c) => React.isValidElement(c) && (c.type === AvatarImage || c.type === AvatarFallback))
  const simple = name !== undefined && !own
  // a lone avatar is one image; with a badge, name it in text so the status is heard too
  const labelled = simple && React.Children.count(children) === 0

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={s}
      data-shape={sh}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? name : undefined}
      className={cn(
        "group/avatar relative inline-flex shrink-0 align-middle select-none",
        "[--radius-avatar:9999px] data-[shape=rounded]:[--radius-avatar:30%]",
        SIZES[s],
        COLORS[tone],
        className
      )}
      {...props}
    >
      {simple ? (
        <>
          {src && <AvatarImage src={src} alt="" />}
          <AvatarFallback aria-hidden>{initials(name)}</AvatarFallback>
          {!labelled && <span className="sr-only">{name}</span>}
          {children}
        </>
      ) : (
        children
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full rounded-(--radius-avatar) object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "grid size-full place-items-center rounded-(--radius-avatar) bg-(--av-bg) leading-none font-medium tracking-wide text-(--av-fg)",
        "[&_[data-slot=icon]]:[--icon-size:55%]",
        className
      )}
      {...props}
    />
  )
}

const STATUS = {
  online: { className: "bg-success", label: "Online" },
  away: { className: "bg-warning", label: "Away" },
  busy: { className: "bg-destructive", label: "Busy" },
  offline: { className: "bg-surface-container-highest shadow-[inset_0_0_0_2px_var(--outline)]", label: "Offline" },
}

type AvatarBadgeProps = React.ComponentProps<"span"> & {
  status?: keyof typeof STATUS
  /** Where the badge sits; bottom right by default. */
  position?: "bottom" | "top"
}

/**
 * A status dot at the avatar's corner. Pass `status`, or your own content
 * (a small icon) as children. The status is spoken: "Online".
 */
function AvatarBadge({ className, status, position = "bottom", children, ...props }: AvatarBadgeProps) {
  const st = status ? STATUS[status] : null
  return (
    <span
      data-slot="avatar-badge"
      role={st ? "img" : undefined}
      aria-label={st?.label}
      className={cn(
        "absolute right-0 grid size-(--badge) place-items-center rounded-full",
        // a ring in the surface color cuts the badge out of the avatar
        "shadow-[0_0_0_var(--ring)_var(--avatar-ring,var(--background))]",
        position === "bottom" ? "bottom-0" : "top-0",
        "group-data-[shape=rounded]/avatar:translate-x-1/4 group-data-[shape=rounded]/avatar:data-[pos=bottom]:translate-y-1/4 group-data-[shape=rounded]/avatar:data-[pos=top]:-translate-y-1/4",
        st ? st.className : "bg-primary text-primary-foreground [&_[data-slot=icon]]:[--icon-size:75%]",
        className
      )}
      data-pos={position}
      {...props}
    >
      {children}
    </span>
  )
}

type AvatarGroupProps = React.ComponentProps<"div"> & {
  size?: AvatarSize
  shape?: "circle" | "rounded"
  /** Show at most this many; the rest become a "+N" avatar. */
  max?: number
  /** Accessible name for the "+N" avatar; gets the hidden count. */
  overflowLabel?: (hidden: number) => string
}

/**
 * Overlapping avatars, each cut out from the next with a ring. Set the
 * ring to the surface behind it with `--avatar-ring` (defaults to the page
 * background).
 */
function AvatarGroup({ className, size = "default", shape, max, overflowLabel = (n) => `${n} more`, children, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const shown = max !== undefined && items.length > max ? items.slice(0, Math.max(0, max)) : items
  const hidden = items.length - shown.length
  const ctx = React.useMemo(() => ({ size, shape }), [size, shape])

  return (
    <GroupContext.Provider value={ctx}>
      <div
        data-slot="avatar-group"
        role="group"
        className={cn(
          "flex items-center",
          size === "xs" || size === "sm" ? "-space-x-1.5" : size === "default" ? "-space-x-2.5" : "-space-x-4",
          "*:data-[slot=avatar]:shadow-[0_0_0_var(--ring)_var(--avatar-ring,var(--background))]",
          "*:data-[slot=avatar]:rounded-(--radius-avatar)",
          className
        )}
        {...props}
      >
        {shown}
        {hidden > 0 && (
          <Avatar role="img" aria-label={overflowLabel(hidden)}>
            <AvatarFallback aria-hidden className="bg-surface-container-highest text-foreground">
              +{hidden}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </GroupContext.Provider>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, initials, colorFor, type AvatarProps }
