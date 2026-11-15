import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Kbd
 *
 * Drop-in for shadcn's Kbd and KbdGroup, drawn as a small keycap: a raised
 * tonal key with a darker lower edge. This is the one keycap the rest of
 * Nelumbo uses (CommandShortcut and the menu shortcuts are built on it).
 *
 *   <Kbd>Esc</Kbd>
 *   <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
 *   <KbdShortcut>⌘⇧P</KbdShortcut>          // "⌘⇧P" or "Ctrl+Shift+K" become separate caps
 *
 * - `variant`: "default" (a tonal key) or "inverse", for dark surfaces. A Kbd
 *   inside a tooltip switches to inverse by itself.
 * - `KbdShortcut` takes a shortcut string and draws one cap per key. Screen
 *   readers hear the whole string once ("Ctrl+Shift+K") instead of the keys
 *   one by one. `splitKeys` is the parser, exported for custom layouts.
 */

const keycap = cn(
  "inline-flex h-6 min-w-6 select-none items-center justify-center rounded-[0.4375rem] px-1.5 font-sans type-label-sm",
  "[--cap-edge:var(--outline-variant)]",
  "shadow-[inset_0_-1.5px_0_var(--cap-edge)]"
)

const VARIANTS = {
  default: "bg-surface-container-lowest text-muted-foreground dark:bg-surface-container-highest",
  // follows the surface it sits on: translucent currentColor, so it works on black and on white
  inverse:
    "bg-[color-mix(in_oklab,currentColor_16%,transparent)] text-inherit [--cap-edge:color-mix(in_oklab,currentColor_30%,transparent)]",
}

type KbdProps = React.ComponentProps<"kbd"> & { variant?: keyof typeof VARIANTS }

function Kbd({ className, variant = "default", ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-variant={variant}
      className={cn(
        keycap,
        VARIANTS[variant],
        // inside a tooltip: a smaller cap in inverse colors
        "in-data-[slot=tooltip-content]:h-5 in-data-[slot=tooltip-content]:min-w-5 in-data-[slot=tooltip-content]:rounded-md in-data-[slot=tooltip-content]:px-1",
        "in-data-[slot=tooltip-content]:bg-[color-mix(in_oklab,currentColor_16%,transparent)] dark:in-data-[slot=tooltip-content]:bg-[color-mix(in_oklab,currentColor_16%,transparent)] in-data-[slot=tooltip-content]:text-inherit in-data-[slot=tooltip-content]:[--cap-edge:color-mix(in_oklab,currentColor_30%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />
}

/** "⌘⇧P" → ⌘ ⇧ P, "Ctrl+Shift+K" → Ctrl Shift K, "Esc" → Esc. */
function splitKeys(shortcut: string): string[] {
  const t = shortcut.trim()
  if (t.includes("+") && t.length > 1) return t.split("+").map((k) => k.trim()).filter(Boolean)
  const keys: string[] = []
  let rest = t.replace(/\s+/g, "")
  while (rest && "⌘⇧⌥⌃".includes(rest[0])) {
    keys.push(rest[0])
    rest = rest.slice(1)
  }
  if (rest) keys.push(rest)
  return keys
}

type KbdShortcutProps = React.ComponentProps<"span"> & { variant?: KbdProps["variant"] }

/** A shortcut drawn as separate keycaps, announced once as the full string. */
function KbdShortcut({ children, variant, ...props }: KbdShortcutProps) {
  const keys = typeof children === "string" ? splitKeys(children) : null
  return (
    <KbdGroup {...props}>
      {keys ? (
        <>
          <span className="sr-only">{children}</span>
          {keys.map((k, i) => (
            <Kbd key={i} aria-hidden variant={variant}>
              {k}
            </Kbd>
          ))}
        </>
      ) : (
        <Kbd variant={variant}>{children}</Kbd>
      )}
    </KbdGroup>
  )
}

export { Kbd, KbdGroup, KbdShortcut, splitKeys, type KbdProps }
