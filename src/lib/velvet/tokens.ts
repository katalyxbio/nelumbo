/**
 * Velvet static tokens: everything that does not depend on the color scheme.
 * Shape, depth, motion, type and the tactile utilities.
 *
 * Emitted twice by scripts/build-theme.ts:
 *  - as CSS into src/styles/velvet.css (used by the docs site)
 *  - as cssVars/css into registry.json (installed by `shadcn add`)
 */
import { COLOR_ROLE_NAMES } from "./scheme"

// ---------------------------------------------------------------------------
// Motion: physically based springs, rendered to CSS linear() easing.
// ---------------------------------------------------------------------------
function spring({ stiffness, damping, mass = 1, samples = 48 }: { stiffness: number; damping: number; mass?: number; samples?: number }) {
  // Simulate x'' = (-k(x-1) - c x') / m from x=0, find settle time, sample.
  const dt = 1 / 1000
  let x = 0
  let vel = 0
  const trace: number[] = []
  let t = 0
  let still = 0
  while (t < 3) {
    const a = (-stiffness * (x - 1) - damping * vel) / mass
    vel += a * dt
    x += vel * dt
    trace.push(x)
    t += dt
    still = Math.abs(x - 1) < 0.001 && Math.abs(vel) < 0.01 ? still + 1 : 0
    if (still > 30) break
  }
  const pts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const v = trace[Math.round((i / samples) * (trace.length - 1))]
    pts.push(+v.toFixed(4) + "")
  }
  pts[0] = "0"
  pts[pts.length - 1] = "1"
  return { easing: `linear(${pts.join(", ")})`, durationMs: Math.round(trace.length) }
}

export const springs = {
  /** Critically damped-ish. Default for UI movement. */
  smooth: spring({ stiffness: 260, damping: 30 }),
  /** Slight overshoot. Press release, toggles, chips. */
  bouncy: spring({ stiffness: 380, damping: 22 }),
  /** Snappy, small overshoot. Micro feedback. */
  snappy: spring({ stiffness: 600, damping: 36 }),
}

// ---------------------------------------------------------------------------
// Theme tokens (go into Tailwind's `@theme inline`).
// ---------------------------------------------------------------------------
const mix = (pct: number) => `color-mix(in oklch, var(--shadow-color) ${pct}%, transparent)`

export const themeTokens: Record<string, string> = {
  // fonts are left to the host project; Velvet only refines usage
  // radius: soft, derived from one knob (--radius)
  "radius-xs": "calc(var(--radius) - 8px)",
  "radius-sm": "calc(var(--radius) - 6px)",
  "radius-md": "calc(var(--radius) - 4px)",
  "radius-lg": "var(--radius)",
  "radius-xl": "calc(var(--radius) + 6px)",
  "radius-2xl": "calc(var(--radius) + 12px)",
  "radius-3xl": "calc(var(--radius) + 20px)",
  // text fields stay tight next to pill buttons (6px at the default --radius)
  "radius-field": "calc(var(--radius) - 8px)",
  // checkboxes: the field radius scaled to an 18px box (3px by default), so they look alike
  "radius-control": "calc(var(--radius-field) / 2)",

  // elevation: two-layer tinted shadows (contact + ambient)
  "shadow-e1": `0 1px 2px 0 ${mix(7)}, 0 1px 3px 0 ${mix(4)}`,
  "shadow-e2": `0 1px 2px 0 ${mix(6)}, 0 4px 12px -2px ${mix(9)}`,
  "shadow-e3": `0 2px 4px -1px ${mix(6)}, 0 12px 28px -6px ${mix(13)}`,
  "shadow-e4": `0 4px 8px -2px ${mix(7)}, 0 22px 44px -10px ${mix(17)}`,
  "shadow-e5": `0 8px 16px -4px ${mix(8)}, 0 36px 72px -16px ${mix(24)}`,
  "inset-shadow-highlight": "inset 0 1px 0 0 color-mix(in oklch, white 16%, transparent)",
  "inset-shadow-well": `inset 0 1px 2px 0 ${mix(8)}`,

  // motion
  "ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "ease-emphasized": "cubic-bezier(0.3, 0, 0, 1)",
  "ease-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",
  "ease-accelerate": "cubic-bezier(0.3, 0, 0.8, 0.15)",
  "ease-spring": springs.smooth.easing,
  "ease-spring-bouncy": springs.bouncy.easing,
  "ease-spring-snappy": springs.snappy.easing,
}

// type roles, Material naming with tighter, optical tracking
const type: [string, string, string, string, string][] = [
  // name, size, line-height, tracking, weight
  ["display-lg", "3.5rem", "1.04", "-0.035em", "600"],
  ["display-md", "2.75rem", "1.08", "-0.03em", "600"],
  ["display-sm", "2.25rem", "1.1", "-0.027em", "600"],
  ["headline-lg", "2rem", "1.15", "-0.024em", "600"],
  ["headline-md", "1.75rem", "1.2", "-0.021em", "600"],
  ["headline-sm", "1.5rem", "1.25", "-0.018em", "600"],
  ["title-lg", "1.25rem", "1.35", "-0.014em", "600"],
  ["title-md", "1.0625rem", "1.4", "-0.011em", "560"],
  ["title-sm", "0.9375rem", "1.4", "-0.006em", "560"],
  ["body-lg", "1.0625rem", "1.6", "-0.011em", "400"],
  ["body-md", "0.9375rem", "1.55", "-0.006em", "400"],
  ["body-sm", "0.8125rem", "1.5", "0em", "400"],
  ["label-lg", "0.875rem", "1.25", "-0.003em", "520"],
  ["label-md", "0.8125rem", "1.25", "0.004em", "520"],
  ["label-sm", "0.75rem", "1.2", "0.02em", "520"],
]

// every color role becomes a Tailwind color: bg-surface-container-high, etc.
for (const name of COLOR_ROLE_NAMES) themeTokens[`color-${name}`] = `var(--${name})`

// ---------------------------------------------------------------------------
// Utilities and base layer, as a nested CSS object (shadcn registry format).
// ---------------------------------------------------------------------------
type CssTree = { [key: string]: string | CssTree }

export const cssTree: CssTree = {
  "@layer base": {
    "*": { "@apply border-border outline-ring/50": {} },
    // Material Symbols: slightly lighter grade on dark backgrounds reduces glare
    ".dark": { "--icon-grad": "-25" },
    body: {
      "@apply bg-background text-foreground": {},
      "font-feature-settings": '"cv11", "ss01"',
      "-webkit-font-smoothing": "antialiased",
      "text-rendering": "optimizeLegibility",
    },
  },
  // Material's state layer, quieter: an overlay of the content color that
  // sits beneath the label, so text stays crisp.
  "@utility state-layer": {
    position: "relative",
    isolation: "isolate",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "0",
      "z-index": "-1",
      "border-radius": "inherit",
      "background-color": "currentColor",
      opacity: "0",
      "pointer-events": "none",
      transition: "opacity 160ms var(--ease-standard)",
    },
    "@media (hover: hover)": {
      "&:hover::after": { opacity: "0.07" },
    },
    "&:focus-visible::after": { opacity: "0.1" },
    "&:active::after": { opacity: "0.12", "transition-duration": "40ms" },
    "&:disabled::after, &[aria-disabled='true']::after": { opacity: "0" },
  },
  // Tactile press: quick compress, spring back on release.
  "@utility tactile": {
    // Uses the `scale` property (not transform) so it composes with
    // translate/rotate utilities. Opt out per element with [--press-scale:1].
    transition: [
      `scale ${springs.bouncy.durationMs}ms var(--ease-spring-bouncy)`,
      `padding ${springs.bouncy.durationMs}ms var(--ease-spring-bouncy)`,
      `width ${springs.bouncy.durationMs}ms var(--ease-spring-bouncy)`,
      "box-shadow 200ms var(--ease-standard)",
      "background-color 200ms var(--ease-standard)",
      "border-color 200ms var(--ease-standard)",
      "border-radius 260ms var(--ease-spring)",
      "color 200ms var(--ease-standard)",
    ].join(", "),
    "&:active:not(:disabled)": {
      scale: "var(--press-scale, 0.97)",
      "transition-duration": "90ms",
      "transition-timing-function": "var(--ease-standard)",
    },
    "@media (prefers-reduced-motion: reduce)": {
      "&:active:not(:disabled)": { scale: "none" },
      transition: "none",
    },
  },
}

// Type roles ship as `type-*` utilities rather than Tailwind `text-*` sizes:
// stock tailwind-merge (shadcn's cn) can't tell `type-label-lg` from a text
// color and would silently drop one of them.
for (const [n, size, lh, ls, w] of type) {
  cssTree[`@utility type-${n}`] = {
    "font-size": size,
    "line-height": lh,
    "letter-spacing": ls,
    "font-weight": w,
  }
}

export function cssTreeToString(tree: CssTree, indent = ""): string {
  const out: string[] = []
  for (const [sel, body] of Object.entries(tree)) {
    if (typeof body === "string") {
      out.push(`${indent}${sel}: ${body};`)
    } else if (Object.keys(body).length === 0) {
      // shadcn convention: { "@apply ...": {} } is a bare at-rule statement
      out.push(`${indent}${sel};`)
    } else {
      out.push(`${indent}${sel} {\n${cssTreeToString(body, indent + "  ")}\n${indent}}`)
    }
  }
  return out.join("\n")
}
