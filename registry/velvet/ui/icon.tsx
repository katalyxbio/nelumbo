import * as React from "react"
import type { MaterialSymbol } from "material-symbols"

import { cn } from "@/lib/utils"

/**
 * Velvet Icon: Material Symbols (Rounded) as a variable font.
 *
 * Each axis is a CSS variable, so parents can drive icons without touching
 * props: IconButton sets `--icon-fill: 1` when selected and the glyph fills
 * in with a transition.
 *
 *   --icon-size   font size (defaults to 1.25em; buttons override it)
 *   --icon-fill   0..1
 *   --icon-wght   100..700
 *   --icon-grad   -50..200 (Velvet uses -25 in dark mode to cut glare)
 *   --icon-opsz   20..48 optical size; match the rendered px size
 *
 * Loading the font: see `materialSymbolsUrl` below.
 */

export type IconName = MaterialSymbol

type IconProps = Omit<React.ComponentProps<"span">, "children"> & {
  name: IconName
  /** Filled glyph. Animates when toggled. */
  fill?: boolean
  /** Stroke weight, 100..700. Velvet default is 400. */
  weight?: number
  /** Fine weight adjustment without changing size, -50..200. */
  grade?: number
  /** Rendered size in px. Also sets the optical size axis. */
  size?: number
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string
}

function Icon({ name, fill, weight, grade, size, label, className, style, ...props }: IconProps) {
  const vars: Record<string, string | number> = {}
  if (fill !== undefined) vars["--icon-fill"] = fill ? 1 : 0
  if (weight !== undefined) vars["--icon-wght"] = weight
  if (grade !== undefined) vars["--icon-grad"] = grade
  if (size !== undefined) {
    vars["--icon-size"] = `${size}px`
    vars["--icon-opsz"] = Math.min(48, Math.max(20, size))
  }

  return (
    <span
      data-slot="icon"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      translate="no"
      className={cn(
        "inline-block shrink-0 text-center font-normal whitespace-nowrap normal-case not-italic select-none",
        // Box and line height are exactly 1em of the icon's own font size, so the
        // glyph is centered whatever unit --icon-size uses. Otherwise it drops and gets cut off.
        // Written as arbitrary properties so tailwind-merge can't drop them: it
        // treats a font-size class as overriding any earlier leading-* class.
        "[font-size:var(--icon-size,1.25em)] size-[1em] [line-height:1]",
        // Clip only sideways (hides the ligature text before the font loads);
        // never clip vertically, so nothing can crop the glyph.
        "overflow-x-clip overflow-y-visible",
        "[font-family:var(--icon-font,'Material_Symbols_Rounded')] [font-feature-settings:'liga'] [direction:ltr] [word-wrap:normal]",
        "[font-variation-settings:'FILL'_var(--icon-fill,0),'wght'_var(--icon-wght,400),'GRAD'_var(--icon-grad,0),'opsz'_var(--icon-opsz,24)]",
        "transition-[font-variation-settings] duration-300 ease-standard motion-reduce:transition-none",
        className
      )}
      style={{ ...vars, ...style } as React.CSSProperties}
      {...props}
    >
      {name}
    </span>
  )
}

/**
 * Google Fonts URL that serves only the glyphs you use (a few KB) with all
 * four variable axes. The full font is ~4.6 MB, so subset in production:
 *
 *   <link rel="stylesheet" href={materialSymbolsUrl(["favorite", "settings"])} />
 *
 * To self-host instead, `import "material-symbols/rounded.css"` once.
 */
function materialSymbolsUrl(names: readonly IconName[], family: "Rounded" | "Outlined" | "Sharp" = "Rounded") {
  const list = [...new Set(names)].sort().join(",")
  return (
    `https://fonts.googleapis.com/css2?family=Material+Symbols+${family}` +
    `:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${list}&display=block`
  )
}

export { Icon, materialSymbolsUrl, type IconProps }
