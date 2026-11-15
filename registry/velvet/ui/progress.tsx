"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Velvet progress indicators (Material 3 style, built on Radix Progress)
 *
 *   <Progress value={40} aria-label="Uploading" />            // linear, determinate
 *   <Progress aria-label="Loading" />                          // no value: indeterminate
 *   <Progress shape="wavy" value={60} aria-label="Syncing" />
 *   <CircularProgress value={72} aria-label="Storage used" />
 *   <CircularProgress shape="wavy" aria-label="Loading" />
 *
 * Determinate bars leave a small gap between the indicator and the track,
 * and a stop dot marks the end of the track, so the remaining amount reads
 * without relying on color. Leave out `value` (or pass null) when you
 * can't tell how long it will take.
 *
 * - `shape`: "flat" or "wavy". The wave travels while it works and suits
 *   longer, more expressive waits; flat suits dense UI.
 * - `color`: "default" (black, white in dark mode) or "brand".
 * - Progress `size`: "default" (4px) or "thick" (8px).
 * - CircularProgress `size` (px, default 40) and `thickness` (px, default 4).
 *
 * `value`, `max` and `getValueLabel` are Radix's, so shadcn's
 * `<Progress value={33} />` works unchanged. Give every indicator an
 * accessible name (aria-label or aria-labelledby).
 */

const GAP = 4 // px between the indicator and the track

const TONES = {
  default: "[--ind:var(--primary)] [--trk:var(--surface-container-highest)]",
  brand: "[--ind:var(--brand)] [--trk:var(--brand-container)]",
}

/* Keyframes ship with the component (React hoists and dedupes the tag), so
   nothing has to be added to the theme. */
const CSS = `
@keyframes vlv-bar-long { 0% { left: -35%; right: 100% } 60%, 100% { left: 100%; right: -90% } }
@keyframes vlv-bar-short { 0% { left: -200%; right: 100% } 60%, 100% { left: 107%; right: -8% } }
@keyframes vlv-wave { from { mask-position: 0 50% } to { mask-position: var(--wl) 50% } }
@keyframes vlv-arc {
  0% { stroke-dasharray: 1 200; stroke-dashoffset: 0 }
  50% { stroke-dasharray: 68 200; stroke-dashoffset: -14 }
  100% { stroke-dasharray: 68 200; stroke-dashoffset: -99 }
}
@keyframes vlv-turn { to { transform: rotate(360deg) } }
.vlv-bar-long { animation: vlv-bar-long 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite }
.vlv-bar-short { animation: vlv-bar-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite }
.vlv-wave { animation: vlv-wave var(--wave-speed, 1.1s) linear infinite }
.vlv-arc { animation: vlv-arc 1.5s ease-in-out infinite }
.vlv-turn { animation: vlv-turn 2s linear infinite; transform-origin: center }
@media (prefers-reduced-motion: reduce) {
  .vlv-wave { animation: none }
  .vlv-bar-long, .vlv-bar-short, .vlv-arc, .vlv-turn { animation-duration: 4s }
  .vlv-bar-short { animation-delay: 2.2s }
}
`

function Keyframes() {
  return (
    <style href="velvet-progress" precedence="default">
      {CSS}
    </style>
  )
}

function percent(value: number | null | undefined, max: number) {
  if (value == null || !Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, (value / (max || 100)) * 100))
}

/* ----------------------------------------------------------------- linear */

/** One wavelength of a sine stroke, tiled along the bar as a mask. */
function waveMask(wavelength: number, amplitude: number, thickness: number) {
  const h = thickness + amplitude * 2
  const m = h / 2
  const q = wavelength / 4
  // quadratic control points at twice the amplitude put the crest at the amplitude
  const d = `M${-wavelength} ${m} Q${-3 * q} ${m - amplitude * 2} ${-wavelength / 2} ${m} T0 ${m} T${wavelength / 2} ${m} T${wavelength} ${m} T${wavelength * 1.5} ${m} T${wavelength * 2} ${m}`
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${wavelength}' height='${h}' viewBox='0 0 ${wavelength} ${h}'><path d='${d}' fill='none' stroke='black' stroke-width='${thickness}'/></svg>`
  return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, height: h }
}

const LINEAR = {
  default: { t: 4, a: 3, wl: 40 },
  thick: { t: 8, a: 4, wl: 56 },
}

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "color"> & {
  color?: keyof typeof TONES
  shape?: "flat" | "wavy"
  size?: keyof typeof LINEAR
}

function Progress({ className, style, value, max = 100, color = "default", shape = "flat", size = "default", ...props }: ProgressProps) {
  const p = percent(value, max)
  const wavy = shape === "wavy"
  const { t, a, wl } = LINEAR[size]
  const wave = wavy ? waveMask(wl, a, t) : null
  const h = wave ? wave.height : t
  const determinate = p !== null

  const vars = {
    "--t": `${t}px`,
    "--h": `${h}px`,
    "--p": `${p ?? 0}%`,
    "--gap": p ? `${GAP}px` : "0px",
    "--wl": `${wl}px`,
    ...style,
  } as React.CSSProperties

  const waveStyle: React.CSSProperties | undefined = wave
    ? { maskImage: wave.image, maskSize: `${wl}px ${h}px`, maskRepeat: "repeat-x", WebkitMaskImage: wave.image, WebkitMaskSize: `${wl}px ${h}px`, WebkitMaskRepeat: "repeat-x" }
    : undefined

  const bar = "absolute inset-y-0 rounded-full bg-(--ind)"

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-shape={shape}
      value={determinate ? value : null}
      max={max}
      className={cn("relative h-(--h) w-full shrink-0", TONES[color], className)}
      style={vars}
      {...props}
    >
      <Keyframes />
      {/* track: after the indicator and the gap; a wavy indeterminate bar has none */}
      {!(wavy && !determinate) && (
        <span
          data-slot="progress-track"
          className={cn(
            "absolute top-1/2 right-0 h-(--t) -translate-y-1/2 rounded-full bg-(--trk)",
            "left-[calc(var(--p)+var(--gap))] transition-[left] duration-500 ease-(--ease-emphasized) motion-reduce:transition-none"
          )}
        />
      )}
      {/* stop dot: the end of the track, for determinate progress */}
      {determinate && p < 100 && (
        <span data-slot="progress-stop" className="absolute top-1/2 right-0 size-(--t) -translate-y-1/2 rounded-full bg-(--ind)" />
      )}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "absolute left-0 overflow-hidden",
          wavy ? "inset-y-0 vlv-wave" : "top-1/2 h-(--t) -translate-y-1/2 rounded-full",
          determinate
            ? cn("w-(--p) bg-(--ind) transition-[width] duration-500 ease-(--ease-emphasized) motion-reduce:transition-none", p === 0 && "invisible")
            : "w-full"
        )}
        style={waveStyle}
      >
        {!determinate && (
          <>
            <span className={cn(bar, "vlv-bar-long")} />
            <span className={cn(bar, "vlv-bar-short")} />
          </>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

/* --------------------------------------------------------------- circular */

type CircularProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "color"> & {
  color?: keyof typeof TONES
  shape?: "flat" | "wavy"
  /** Diameter in px. */
  size?: number
  /** Stroke width in px. */
  thickness?: number
}

/** A closed path around the center, starting at 12 o'clock and running clockwise. */
function ringPath(c: number, r: number, amplitude: number, waves: number) {
  const steps = Math.max(64, waves * 16)
  let d = ""
  for (let k = 0; k <= steps; k++) {
    const phi = (k / steps) * Math.PI * 2
    const rr = r + amplitude * Math.sin(waves * phi)
    const x = c + rr * Math.sin(phi)
    const y = c - rr * Math.cos(phi)
    d += `${k ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function CircularProgress({
  className,
  style,
  value,
  max = 100,
  color = "default",
  shape = "flat",
  size = 40,
  thickness = 4,
  ...props
}: CircularProgressProps) {
  const p = percent(value, max)
  const determinate = p !== null
  const wavy = shape === "wavy"
  const c = size / 2
  const amplitude = wavy ? Math.max(0.8, thickness * 0.3) : 0
  const r = c - thickness / 2 - amplitude
  const circumference = 2 * Math.PI * r
  const waves = Math.max(6, Math.round(circumference / (thickness * 3)))
  const ring = React.useMemo(() => ringPath(c, r, 0, 1), [c, r])
  const indicator = React.useMemo(() => (wavy ? ringPath(c, r, amplitude, waves) : ring), [wavy, c, r, amplitude, waves, ring])

  // gap between the ends of the indicator and the track, in pathLength units (round caps eat thickness/2 each side)
  const g = ((GAP + thickness) / circumference) * 100
  const trackLength = determinate ? 100 - p - (p > 0 ? 2 * g : 0) : 0
  const stroke = { fill: "none", strokeWidth: thickness, strokeLinecap: "round" as const }
  const ease = "transition-[stroke-dasharray,stroke-dashoffset] duration-500 ease-(--ease-emphasized) motion-reduce:transition-none"

  return (
    <ProgressPrimitive.Root
      data-slot="circular-progress"
      data-shape={shape}
      value={determinate ? value : null}
      max={max}
      className={cn("relative inline-grid shrink-0 place-items-center *:col-start-1 *:row-start-1", TONES[color], className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <Keyframes />
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden className={cn("overflow-visible", !determinate && "vlv-turn")}>
        {determinate && trackLength > 0 && (
          <path
            d={ring}
            pathLength={100}
            {...stroke}
            className={cn("stroke-(--trk)", ease)}
            strokeDasharray={`${trackLength} 200`}
            strokeDashoffset={p > 0 ? -(p + g) : 0}
          />
        )}
        <path
          data-slot="circular-progress-indicator"
          d={indicator}
          pathLength={100}
          {...stroke}
          className={cn("stroke-(--ind)", determinate ? cn(ease, p === 0 && "opacity-0") : "vlv-arc")}
          strokeDasharray={determinate ? `${p} 200` : undefined}
        />
      </svg>
      {props.children}
    </ProgressPrimitive.Root>
  )
}

export { Progress, CircularProgress, type ProgressProps, type CircularProgressProps }
