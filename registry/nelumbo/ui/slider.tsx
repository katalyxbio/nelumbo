"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Slider (Material 3 Expressive style, built on Radix Slider)
 *
 *   <Slider aria-label="Volume" defaultValue={[40]} />
 *   <Slider aria-label="Price" defaultValue={[20, 80]} valueLabel formatValue={(v) => `$${v}`} />
 *   <Slider aria-label="Rating" max={5} step={1} marks />
 *   <Slider aria-label="Brightness" size="lg" icon="light_mode" />
 *
 * A thick rounded track and a slim bar handle with a gap on both sides. The
 * track is drawn by Nelumbo (not Radix's Range), one segment per span between
 * handles, so the gaps follow the handles exactly. Press the handle and it
 * thins; drag or tab to it and, with `valueLabel`, a bubble shows the value.
 *
 * - Two values make a range; each handle is named "<label>, minimum/maximum".
 * - `marks`: a dot for every step (keep it to coarse steps).
 * - `size`: default (16px track) or lg (40px track). lg can carry an `icon`
 *   inside the active track; it hops past the handle when there is no room.
 * - `color`: "default" (black, white in dark mode) or "brand".
 *
 * Horizontal only.
 */
type SliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "color" | "orientation"> & {
  size?: "default" | "lg"
  color?: "default" | "brand"
  marks?: boolean
  valueLabel?: boolean
  formatValue?: (value: number) => string
  icon?: IconName
}

const SIZES = {
  // track height, handle height, outer and inner corner radius
  default: "h-11 [--track-h:1rem] [--outer-r:0.5rem] [--inner-r:2px]",
  lg: "h-[3.25rem] [--track-h:2.5rem] [--outer-r:0.75rem] [--inner-r:4px]",
}

const COLORS = {
  default: "[--active:var(--primary)] [--on-active:var(--primary-foreground)]",
  brand: "[--active:var(--brand)] [--on-active:var(--brand-foreground)]",
}

// The handle is 4px wide. Radix keeps it inside the track, so its center sits
// at p% of (width - 4px) plus 2px. Segments stop GAP short of a handle center.
const HANDLE = 4
const GAP = 6
const center = (pct: number) => `calc((100% - ${HANDLE}px) * ${pct / 100} + ${HANDLE / 2}px)`

function Slider({
  className,
  size = "default",
  color = "default",
  marks = false,
  valueLabel = false,
  formatValue = String,
  icon,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  onPointerDown,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: SliderProps) {
  const [inner, setInner] = React.useState(() => defaultValue ?? [min])
  const values = value ?? inner
  // While a pointer drags, the focused handle thins and shows its value.
  const [dragging, setDragging] = React.useState(false)
  React.useEffect(() => {
    if (!dragging) return
    const stop = () => setDragging(false)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
  }, [dragging])
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100
  const ps = values.map(pct).sort((a, b) => a - b)
  const range = values.length > 1

  // Spans between the track ends and the handles: [from%, to%, active, gap at start, gap at end]
  const edges = [0, ...ps, 100]
  const spans = edges.slice(1).map((to, i) => {
    const from = edges[i]
    const active = range ? i > 0 && i < ps.length : i === 0
    return { from, to, active, gapStart: i > 0, gapEnd: i < ps.length }
  })

  const stepCount = (max - min) / step
  const marksAt = marks && stepCount <= 100 ? Array.from({ length: Math.floor(stepCount) + 1 }, (_, i) => pct(min + i * step)) : []
  const nearHandle = (p: number) => ps.some((h) => Math.abs(h - p) < 1e-6)
  const isActive = (p: number) => (range ? p > ps[0] && p < ps[ps.length - 1] : p < ps[0])

  const thumbName = (i: number) =>
    ariaLabel ? (range ? `${ariaLabel}, ${i === 0 ? "minimum" : i === values.length - 1 ? "maximum" : `value ${i + 1}`}` : ariaLabel) : undefined

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      data-dragging={dragging || undefined}
      onPointerDown={(e) => {
        if (!disabled) setDragging(true)
        onPointerDown?.(e)
      }}
      onValueChange={(v) => {
        setInner(v)
        onValueChange?.(v)
      }}
      className={cn(
        "group/slider relative flex w-full touch-none items-center select-none",
        // the handle glides between steps; while dragging it only smooths a little
        "[&>span:has(>[data-slot=slider-thumb])]:transition-[left] [&>span:has(>[data-slot=slider-thumb])]:duration-200 [&>span:has(>[data-slot=slider-thumb])]:ease-(--ease-standard)",
        "data-dragging:[&>span:has(>[data-slot=slider-thumb])]:duration-75 motion-reduce:[&>span:has(>[data-slot=slider-thumb])]:transition-none",
        SIZES[size],
        COLORS[color],
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative h-(--track-h) grow">
        {spans.map((s, i) => (
          <span
            key={i}
            data-slot={s.active ? "slider-range" : "slider-rest"}
            className={cn(
              "absolute inset-y-0 @container transition-[left,right] duration-200 ease-(--ease-standard) group-data-dragging/slider:duration-75 motion-reduce:transition-none",
              s.active ? "bg-(--active)" : "bg-surface-container-highest",
              s.gapStart ? "rounded-l-(--inner-r)" : "rounded-l-(--outer-r)",
              s.gapEnd ? "rounded-r-(--inner-r)" : "rounded-r-(--outer-r)"
            )}
            style={{
              left: s.gapStart ? `calc(${center(s.from)} + ${GAP}px)` : 0,
              right: s.gapEnd ? `calc(100% - ${center(s.to)} + ${GAP}px)` : 0,
            }}
          >
            {/* lg icon: inside the active track when it fits, else just past the handle */}
            {icon && !range && i === 0 && (
              <>
                <Icon
                  name={icon}
                  size={24}
                  className="absolute top-1/2 left-2 hidden -translate-y-1/2 text-(--on-active) @min-[2.75rem]:block"
                />
                <Icon
                  name={icon}
                  size={24}
                  className="absolute top-1/2 left-[calc(100%+2*var(--gap)+0.5rem)] z-10 -translate-y-1/2 text-muted-foreground @min-[2.75rem]:hidden"
                  style={{ "--gap": `${GAP}px` } as React.CSSProperties}
                />
              </>
            )}
          </span>
        ))}

        {/* step marks, or a stop dot at each end without a handle */}
        {(marks ? marksAt : range ? [0, 100] : [100])
          .filter((p) => !nearHandle(p))
          .map((p) => (
            <span
              key={p}
              aria-hidden
              data-slot="slider-mark"
              className={cn(
                "pointer-events-none absolute top-1/2 size-1 -translate-1/2 rounded-full",
                isActive(p) ? "bg-(--on-active)" : "bg-(--active)"
              )}
              style={{
                left:
                  p === 0
                    ? "calc(var(--track-h) / 2)"
                    : p === 100
                      ? "calc(100% - var(--track-h) / 2)"
                      : `clamp(calc(var(--track-h) / 2), ${center(p)}, calc(100% - var(--track-h) / 2))`,
              }}
            />
          ))}
      </SliderPrimitive.Track>

      {values.map((v, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          aria-label={thumbName(i)}
          aria-labelledby={ariaLabel ? undefined : ariaLabelledby}
          aria-valuetext={formatValue(v)}
          className={cn(
            "group/thumb relative block w-1 rounded-full outline-none",
            size === "lg" ? "h-[3.25rem]" : "h-11",
            "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
            // generous hit area
            "after:absolute after:-inset-x-3 after:inset-y-0"
          )}
        >
          {/* the bar; thins while pressed */}
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-(--active)",
              "transition-[scale] duration-[396ms] ease-(--ease-spring-snappy) motion-reduce:transition-none",
              "group-data-dragging/slider:group-focus/thumb:scale-x-50"
            )}
          />
          {valueLabel && (
            <span
              aria-hidden
              data-slot="slider-value"
              className={cn(
                "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 grid h-10 min-w-12 -translate-x-1/2 place-items-center rounded-full px-3",
                "bg-inverse-surface type-label-lg text-inverse-foreground tabular-nums shadow-e2 dark:bg-foreground dark:text-background",
                "origin-bottom scale-0 opacity-0 transition-[scale,opacity] duration-150 ease-(--ease-standard)",
                "group-focus-visible/thumb:scale-100 group-focus-visible/thumb:opacity-100 group-data-dragging/slider:group-focus/thumb:scale-100 group-data-dragging/slider:group-focus/thumb:opacity-100",
                "group-focus-visible/thumb:duration-[519ms] group-focus-visible/thumb:ease-(--ease-spring-bouncy) group-data-dragging/slider:group-focus/thumb:duration-[519ms] group-data-dragging/slider:group-focus/thumb:ease-(--ease-spring-bouncy)",
                "motion-reduce:transition-none"
              )}
            >
              {formatValue(v)}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}


// lets FormItem recognise this control without importing it
Slider.formControl = "slider" as const

export { Slider, type SliderProps }
