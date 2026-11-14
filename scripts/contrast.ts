/**
 * Contrast audit for Velvet color roles (WCAG 2.1).
 *
 *   npm run contrast                 # audit many seeds, both themes, all vibrances
 *   npm run contrast -- --seed "#0f766e"
 *
 * Exits non-zero if any required pair fails, so it can run in CI.
 */
import { wcagContrast } from "culori"
import { buildScheme } from "../src/lib/velvet/scheme"

type Pair = { fg: string; bg: string; min: number; use: string }

const SURFACES = [
  "background",
  "card",
  "popover",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
]

const pairs: Pair[] = []
const text = (fg: string, bgs: string[], use: string) => bgs.forEach((bg) => pairs.push({ fg, bg, min: 4.5, use }))
const ui = (fg: string, bgs: string[], use: string) => bgs.forEach((bg) => pairs.push({ fg, bg, min: 3, use }))

// Body and secondary text on every surface
text("foreground", [...SURFACES, "muted", "surface-dim", "surface-bright"], "body text")
text("muted-foreground", [...SURFACES, "muted"], "secondary text")

// "on" colors on their fills
for (const r of ["primary", "secondary", "accent", "destructive", "tertiary", "success", "warning", "sidebar-primary", "sidebar-accent"])
  text(`${r}-foreground`, [r], "label on fill")
for (const r of ["primary", "tertiary", "destructive", "success", "warning"])
  text(`${r}-container-foreground`, [`${r}-container`], "label on container")
text("sidebar-foreground", ["sidebar"], "sidebar text")
text("inverse-foreground", ["inverse-surface"], "snackbar / tooltip text")
text("inverse-primary", ["inverse-surface"], "snackbar action")

// Accent colors used as text (links, ghost/elevated buttons, status text)
text("primary", [...SURFACES, "secondary", "primary-container"], "accent text")
text("tertiary", ["background", "card"], "accent text")
text("destructive", ["background", "card", "destructive-container"], "error text")
text("success", ["background", "card", "success-container"], "status text")
text("warning", ["background", "card", "warning-container"], "status text")

// Non-text UI (WCAG 1.4.11): control boundaries, focus ring, filled shapes, charts
ui("input", ["background", "card"], "input border")
ui("outline", ["background", "card", "surface-container-low"], "outline button / control border")
ui("ring", ["background", "card"], "focus ring")
ui("primary", ["background", "card"], "filled control vs page")
for (let i = 1; i <= 5; i++) ui(`chart-${i}`, ["background", "card"], "chart mark")

const SEEDS = [
  "#5b5bd6", "#0f7c86", "#4f7a3a", "#b86e00", "#a4384f", "#5f6670", // docs presets
  "#ffff00", "#00ffff", "#ff00ff", "#00ff00", "#ff0000", "#0000ff", // extremes
  "#101010", "#f5f5f5", "#808080", "#84cc16", "#f97316", "#ec4899", "#8b5cf6", "#0ea5e9", "#14b8a6", "#eab308",
]
const VIBRANCES = [0.5, 1, 1.4]

const args = process.argv.slice(2)
const i = args.indexOf("--seed")
const seeds = i >= 0 ? [args[i + 1]] : SEEDS

type Fail = { key: string; worst: number; min: number; use: string; where: string; count: number }
const fails = new Map<string, Fail>()
let checked = 0

for (const seed of seeds)
  for (const vibrance of VIBRANCES) {
    const s = buildScheme({ seed, vibrance })
    for (const mode of ["light", "dark"] as const)
      for (const p of pairs) {
        const r = wcagContrast(s[mode][p.fg], s[mode][p.bg])
        checked++
        if (r < p.min) {
          const key = `${mode}  ${p.fg} on ${p.bg}`
          const f = fails.get(key)
          if (!f) fails.set(key, { key, worst: r, min: p.min, use: p.use, where: `${seed} v${vibrance}`, count: 1 })
          else {
            f.count++
            if (r < f.worst) Object.assign(f, { worst: r, where: `${seed} v${vibrance}` })
          }
        }
      }
  }

const runs = seeds.length * VIBRANCES.length
console.log(`Checked ${pairs.length} pairs x 2 themes x ${runs} seed/vibrance combos (${checked} checks).\n`)
if (!fails.size) {
  console.log("All pairs pass WCAG 2.1 AA.")
} else {
  const rows = [...fails.values()].sort((a, b) => a.worst / a.min - b.worst / b.min)
  console.log(`${rows.length} pairs fail somewhere:\n`)
  for (const f of rows)
    console.log(
      `${f.key.padEnd(62)} worst ${f.worst.toFixed(2)} (needs ${f.min})  fails ${String(f.count).padStart(2)}/${runs}  [${f.use}; worst at ${f.where}]`
    )
  process.exitCode = 1
}
