/**
 * Velvet color engine.
 *
 * One seed color -> tonal palettes (HCT, same color space as Material You)
 * -> every shadcn CSS variable plus Velvet's extra roles, for light and dark.
 *
 * Velvet is deliberately calmer than Material's "tonal spot" scheme:
 * primary chroma is capped, neutrals carry only a whisper of the seed hue,
 * and surfaces step in small tone increments so layers read as soft depth
 * rather than flat color blocks.
 *
 * Pure and isomorphic: used by the CLI generator and by the docs' live picker.
 */
import {
  Blend,
  Hct,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities"
import { converter } from "culori"

export type SchemeOptions = {
  /** Seed color as hex, e.g. "#5b5bd6". */
  seed: string
  /** Chroma multiplier. 0.6 = muted, 1 = balanced, 1.3 = vivid. */
  vibrance?: number
}

type PaletteKey =
  | "primary"
  | "secondary"
  | "tertiary"
  | "neutral"
  | "neutralVariant"
  | "error"
  | "success"
  | "warning"

/** [role, palette, light tone, dark tone] */
type Role = [string, PaletteKey, number, number]

// ---------------------------------------------------------------------------
// Role map. Names on the left are the CSS variables (without "--").
// The first block is the stock shadcn contract; everything after is Velvet.
// ---------------------------------------------------------------------------
const ROLES: Role[] = [
  // shadcn contract
  ["background", "neutral", 98.5, 7],
  ["foreground", "neutral", 10, 93],
  ["card", "neutral", 100, 10],
  ["card-foreground", "neutral", 10, 93],
  ["popover", "neutral", 100, 13],
  ["popover-foreground", "neutral", 10, 93],
  ["primary", "primary", 40, 80],
  ["primary-foreground", "primary", 100, 20],
  ["secondary", "secondary", 91, 26],
  ["secondary-foreground", "secondary", 12, 90],
  ["muted", "neutral", 95, 15],
  ["muted-foreground", "neutralVariant", 42, 72],
  ["accent", "secondary", 94, 20],
  ["accent-foreground", "secondary", 12, 90],
  ["destructive", "error", 42, 72],
  ["destructive-foreground", "error", 100, 14],
  ["border", "neutralVariant", 90, 22],
  // 3:1 against page and card (WCAG 1.4.11): the border is what identifies the field
  ["input", "neutralVariant", 60, 45],
  ["ring", "primary", 55, 72],
  ["sidebar", "neutral", 97, 9],
  ["sidebar-foreground", "neutral", 10, 93],
  ["sidebar-primary", "primary", 40, 80],
  ["sidebar-primary-foreground", "primary", 100, 20],
  ["sidebar-accent", "secondary", 92, 20],
  ["sidebar-accent-foreground", "secondary", 12, 90],
  ["sidebar-border", "neutralVariant", 90, 20],
  ["sidebar-ring", "primary", 55, 72],

  // Velvet: containers (Material's tonal fills, tuned softer)
  ["primary-container", "primary", 91, 28],
  ["primary-container-foreground", "primary", 12, 92],
  ["tertiary", "tertiary", 42, 80],
  ["tertiary-foreground", "tertiary", 100, 20],
  ["tertiary-container", "tertiary", 92, 28],
  ["tertiary-container-foreground", "tertiary", 12, 92],
  ["destructive-container", "error", 93, 26],
  ["destructive-container-foreground", "error", 14, 92],
  ["success", "success", 40, 78],
  ["success-foreground", "success", 100, 16],
  ["success-container", "success", 93, 24],
  ["success-container-foreground", "success", 14, 92],
  // amber reads as text only when darkened, so the fill takes a white label
  ["warning", "warning", 42, 82],
  ["warning-foreground", "warning", 100, 16],
  ["warning-container", "warning", 93, 24],
  ["warning-container-foreground", "warning", 18, 92],

  // Velvet: surface ladder. Light climbs down from white, dark climbs up.
  ["surface-dim", "neutral", 92, 6],
  ["surface-bright", "neutral", 99, 22],
  ["surface-container-lowest", "neutral", 100, 5],
  ["surface-container-low", "neutral", 97, 10],
  ["surface-container", "neutral", 95, 12],
  ["surface-container-high", "neutral", 93, 16],
  ["surface-container-highest", "neutral", 91, 20],
  ["inverse-surface", "neutral", 20, 90],
  ["inverse-foreground", "neutral", 95, 20],
  ["inverse-primary", "primary", 80, 40],

  // Velvet: lines and depth
  ["outline", "neutralVariant", 58, 52],
  ["outline-variant", "neutralVariant", 86, 28],
  ["shadow-color", "neutral", 12, 0],
  ["scrim", "neutral", 6, 0],
]

const CHART_HUE_OFFSETS = [0, 50, 160, 230, 300]

const toOklch = converter("oklch")

function css(argb: number): string {
  const c = toOklch(hexFromArgb(argb))!
  const l = c.l.toFixed(3)
  const ch = c.c.toFixed(3)
  const h = (c.h ?? 0).toFixed(1)
  return `oklch(${l} ${ch} ${h})`
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const wrap = (h: number) => ((h % 360) + 360) % 360

export function buildPalettes({ seed, vibrance = 1 }: SchemeOptions) {
  const seedArgb = argbFromHex(seed)
  const s = Hct.fromInt(seedArgb)
  const v = clamp(vibrance, 0.4, 1.6)
  const tp = (h: number, c: number) => TonalPalette.fromHueAndChroma(wrap(h), c)
  const harmonized = (hex: string) => Hct.fromInt(Blend.harmonize(argbFromHex(hex), seedArgb)).hue

  return {
    seed: s,
    palettes: {
      primary: tp(s.hue, clamp(s.chroma, 30, 46) * v),
      secondary: tp(s.hue, 12 * v),
      tertiary: tp(s.hue + 55, 24 * v),
      neutral: tp(s.hue, 3.5),
      neutralVariant: tp(s.hue, 7),
      error: tp(harmonized("#d92d20"), 62),
      success: tp(harmonized("#1f9d55"), 38),
      warning: tp(harmonized("#e5a000"), 52),
    } satisfies Record<PaletteKey, TonalPalette>,
  }
}

export type Scheme = {
  light: Record<string, string>
  dark: Record<string, string>
}

export function buildScheme(options: SchemeOptions): Scheme {
  const { palettes, seed } = buildPalettes(options)
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  for (const [name, key, lt, dt] of ROLES) {
    light[name] = css(palettes[key].tone(lt))
    dark[name] = css(palettes[key].tone(dt))
  }

  CHART_HUE_OFFSETS.forEach((offset, i) => {
    const p = TonalPalette.fromHueAndChroma(wrap(seed.hue + offset), 40)
    light[`chart-${i + 1}`] = css(p.tone(58))
    dark[`chart-${i + 1}`] = css(p.tone(72))
  })

  return { light, dark }
}

/** Tonal ramp for display in docs. */
export const DOC_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100]

export function paletteRamps(options: SchemeOptions) {
  const { palettes } = buildPalettes(options)
  return Object.fromEntries(
    Object.entries(palettes).map(([k, p]) => [k, DOC_TONES.map((t) => ({ tone: t, color: css(p.tone(t)) }))])
  ) as Record<PaletteKey, { tone: number; color: string }[]>
}

export const COLOR_ROLE_NAMES = [
  ...ROLES.map(([n]) => n),
  ...CHART_HUE_OFFSETS.map((_, i) => `chart-${i + 1}`),
]

export function schemeToCss(scheme: Scheme, { radius = "0.875rem" } = {}): string {
  const block = (sel: string, vars: Record<string, string>, extra = "") =>
    `${sel} {\n${extra}${Object.entries(vars)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n")}\n}`
  return [block(":root", scheme.light, `  --radius: ${radius};\n`), block(".dark", scheme.dark)].join("\n\n")
}
