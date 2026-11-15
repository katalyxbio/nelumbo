/**
 * Nelumbo color engine.
 *
 * Neutral first: the interface is black, white and true grays. Color comes
 * from a curated accent palette, used where it carries meaning (status, tags,
 * charts, focus), and one accent is the brand.
 *
 * Every tone is picked in HCT (Material's color space, where tone tracks
 * lightness), so contrast holds for any accent: `npm run contrast` proves it.
 *
 * Pure and isomorphic: used by the CLI generator and the docs' live controls.
 */
import { Hct, TonalPalette, argbFromHex, hexFromArgb } from "@material/material-color-utilities"
import { converter } from "culori"

// ---------------------------------------------------------------------------
// Accent palette. Anchors set each hue; chroma is normalized so the set
// reads as one family rather than eight unrelated brand colors.
// ---------------------------------------------------------------------------
export const ACCENTS = {
  blue: "#2563eb",
  cyan: "#0891b2",
  green: "#16a34a",
  amber: "#d97706",
  orange: "#ea580c",
  red: "#dc2626",
  pink: "#db2777",
  purple: "#7c3aed",
} as const

export type AccentName = keyof typeof ACCENTS
export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[]

export type Neutral = "pure" | "warm" | "cool"

export type SchemeOptions = {
  /** Brand accent: a palette name or any hex. Drives focus ring and `brand` roles. */
  brand?: AccentName | string
  /** Gray temperature. "pure" has zero chroma: real black and white. */
  neutral?: Neutral
  /** Accent chroma multiplier. 0.6 = muted, 1 = balanced, 1.3 = vivid. */
  vibrance?: number
}

const NEUTRAL_TINT: Record<Neutral, { hue: number; chroma: number }> = {
  pure: { hue: 0, chroma: 0 },
  warm: { hue: 70, chroma: 2.5 },
  cool: { hue: 250, chroma: 3 },
}

/** [role, palette, light tone, dark tone] */
type Role = [string, string, number, number]

// Tones for each accent's four roles. Solid at 42 keeps the color usable as
// text on the page (4.5:1) and lets a white label sit on it.
const accentRoles = (name: string, palette = name): Role[] => [
  [name, palette, 42, 78],
  [`${name}-foreground`, palette, 100, 14],
  [`${name}-container`, palette, 94, 24],
  [`${name}-container-foreground`, palette, 24, 90],
]

const ROLES: Role[] = [
  // ---- shadcn contract: all neutral ---------------------------------------
  ["background", "neutral", 99, 6],
  ["foreground", "neutral", 10, 95],
  ["card", "neutral", 100, 9],
  ["card-foreground", "neutral", 10, 95],
  ["popover", "neutral", 100, 12],
  ["popover-foreground", "neutral", 10, 95],
  ["primary", "neutral", 10, 95],
  ["primary-foreground", "neutral", 100, 10],
  ["secondary", "neutral", 91, 23],
  ["secondary-foreground", "neutral", 10, 95],
  ["muted", "neutral", 96, 14],
  ["muted-foreground", "neutralVariant", 42, 70],
  ["accent", "neutral", 95, 18],
  ["accent-foreground", "neutral", 10, 95],
  ["border", "neutralVariant", 90, 20],
  // 3:1 against page and card (WCAG 1.4.11): the border is what identifies the field
  ["input", "neutralVariant", 60, 45],
  ["ring", "brand", 50, 70],
  ["sidebar", "neutral", 98, 8],
  ["sidebar-foreground", "neutral", 10, 95],
  ["sidebar-primary", "neutral", 10, 95],
  ["sidebar-primary-foreground", "neutral", 100, 10],
  ["sidebar-accent", "neutral", 93, 18],
  ["sidebar-accent-foreground", "neutral", 10, 95],
  ["sidebar-border", "neutralVariant", 90, 18],
  ["sidebar-ring", "brand", 50, 70],
  // shadcn's destructive = the red accent
  ["destructive", "red", 42, 72],
  ["destructive-foreground", "red", 100, 14],
  ["destructive-container", "red", 94, 24],
  ["destructive-container-foreground", "red", 24, 90],

  // ---- Nelumbo: neutral container (FAB, Material-style containers) --------
  ["primary-container", "neutral", 90, 25],
  ["primary-container-foreground", "neutral", 10, 95],

  // ---- Nelumbo: brand + status, from the accent palette --------------------
  ...accentRoles("brand"),
  ...accentRoles("success", "green"),
  ...accentRoles("warning", "amber"),
  ...ACCENT_NAMES.flatMap((n) => accentRoles(n)),

  // ---- Nelumbo: surface ladder. Light steps down from white, dark steps up.
  ["surface-dim", "neutral", 94, 5],
  ["surface-bright", "neutral", 99, 22],
  ["surface-container-lowest", "neutral", 100, 4],
  ["surface-container-low", "neutral", 98, 9],
  ["surface-container", "neutral", 96, 11],
  ["surface-container-high", "neutral", 94, 15],
  ["surface-container-highest", "neutral", 92, 19],
  ["inverse-surface", "neutral", 15, 92],
  ["inverse-foreground", "neutral", 96, 15],
  ["inverse-primary", "brand", 80, 40],

  // ---- Nelumbo: lines and depth -------------------------------------------
  ["outline", "neutralVariant", 58, 52],
  ["outline-variant", "neutralVariant", 88, 26],
  ["shadow-color", "neutral", 0, 0],
  ["scrim", "neutral", 0, 0],
]

const CHARTS: [AccentName, number, number][] = [
  ["blue", 55, 72],
  ["green", 58, 74],
  ["amber", 56, 78],
  ["purple", 55, 72],
  ["pink", 58, 74],
]

const toOklch = converter("oklch")

function css(argb: number): string {
  const c = toOklch(hexFromArgb(argb))!
  return `oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function accentPalette(hex: string, vibrance: number) {
  const h = Hct.fromInt(argbFromHex(hex))
  return TonalPalette.fromHueAndChroma(h.hue, clamp(h.chroma, 36, 60) * vibrance)
}

/** Chroma (HCT) a light container may carry; the softest accents sit near this. */
const CONTAINER_CHROMA = 12

function softTone(p: TonalPalette, tone: number) {
  return TonalPalette.fromHueAndChroma(p.hue, Math.min(p.chroma, CONTAINER_CHROMA)).tone(tone)
}

export function resolveBrand(brand: SchemeOptions["brand"] = "blue") {
  return brand in ACCENTS ? ACCENTS[brand as AccentName] : brand
}

export function buildPalettes({ brand, neutral = "pure", vibrance = 1 }: SchemeOptions = {}) {
  const v = clamp(vibrance, 0.4, 1.6)
  const tint = NEUTRAL_TINT[neutral]
  const palettes: Record<string, TonalPalette> = {
    neutral: TonalPalette.fromHueAndChroma(tint.hue, tint.chroma),
    neutralVariant: TonalPalette.fromHueAndChroma(tint.hue, tint.chroma * 1.6),
    brand: accentPalette(resolveBrand(brand), v),
  }
  for (const n of ACCENT_NAMES) palettes[n] = accentPalette(ACCENTS[n], v)
  return palettes
}

export type Scheme = {
  light: Record<string, string>
  dark: Record<string, string>
}

export function buildScheme(options: SchemeOptions = {}): Scheme {
  const palettes = buildPalettes(options)
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  for (const [name, key, lt, dt] of ROLES) {
    // Light containers are pale tints. Some hues (green above all) hold far more
    // chroma at that tone than others, so cap it: every tint reads equally soft.
    const soft = name.endsWith("-container") && key !== "neutral"
    light[name] = css(soft ? softTone(palettes[key], lt) : palettes[key].tone(lt))
    dark[name] = css(palettes[key].tone(dt))
  }
  CHARTS.forEach(([hue, lt, dt], i) => {
    light[`chart-${i + 1}`] = css(palettes[hue].tone(lt))
    dark[`chart-${i + 1}`] = css(palettes[hue].tone(dt))
  })
  return { light, dark }
}

/** Tonal ramps for the docs. */
export const DOC_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100]

export function paletteRamps(options: SchemeOptions = {}) {
  const p = buildPalettes(options)
  const keys = ["neutral", ...ACCENT_NAMES]
  return Object.fromEntries(keys.map((k) => [k, DOC_TONES.map((t) => ({ tone: t, color: css(p[k].tone(t)) }))])) as Record<
    string,
    { tone: number; color: string }[]
  >
}

export const COLOR_ROLE_NAMES = [...ROLES.map(([n]) => n), ...CHARTS.map((_, i) => `chart-${i + 1}`)]

export function schemeToCss(scheme: Scheme, { radius = "0.875rem" } = {}): string {
  const block = (sel: string, vars: Record<string, string>, extra = "") =>
    `${sel} {\n${extra}${Object.entries(vars)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n")}\n}`
  return [block(":root", scheme.light, `  --radius: ${radius};\n`), block(".dark", scheme.dark)].join("\n\n")
}
