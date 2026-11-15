"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"

/**
 * Nelumbo Chart (built on Recharts 2.15)
 *
 * Drop-in for shadcn's Chart: ChartContainer, ChartTooltip,
 * ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle,
 * `useChart` and the `ChartConfig` type keep their names and props. Nelumbo
 * adds the look (faint horizontal grid, muted label-sm axes, a raised
 * popover tooltip, spring entry) and a few helpers.
 *
 *   const config = {
 *     desktop: { label: "Desktop" },                    // color defaults to chartColors[0]
 *     mobile:  { label: "Mobile", color: "var(--pink)" }, // or theme: { light, dark }
 *   } satisfies ChartConfig
 *
 *   function Example() {
 *     const motion = useChartAnimation()
 *     return (
 *       <ChartContainer config={config} aria-label="Visits by month, desktop and mobile" className="h-64 w-full">
 *         <BarChart data={data}>
 *           <CartesianGrid vertical={false} />
 *           <XAxis dataKey="month" tickLine={false} axisLine={false} />
 *           <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
 *           <ChartLegend content={<ChartLegendContent />} />
 *           <Bar dataKey="desktop" fill="var(--color-desktop)" radius={chartBarRadius} {...motion} />
 *           <Bar dataKey="mobile" fill="var(--color-mobile)" radius={chartBarRadius} {...motion} />
 *         </BarChart>
 *       </ChartContainer>
 *     )
 *   }
 *
 * - ChartContainer turns `config` into `--color-<key>` CSS variables (with
 *   light and dark themes) and makes the chart responsive. Keys with no
 *   color take the next entry of `chartColors`, Nelumbo's categorical accent
 *   roles in a fixed order (blue, orange, green, purple, pink, cyan, amber,
 *   red). They are contrast checked at 3:1 against the card in both themes.
 *   `aria-label` names the chart for screen readers (it becomes role="img"
 *   on the plot). Give every chart one that states what it shows.
 * - Interactive legend (a Nelumbo addition): pass `hiddenKeys` and
 *   `onToggle` (or use `useSeriesVisibility`) to ChartLegendContent and
 *   the chips turn series on and off. Set `hide` on the series.
 * - `useChartAnimation()` returns the animation props (duration, easing,
 *   and none for reduced motion) to spread on Bar, Area, Line, Pie and RadialBar.
 * - Helpers: `chartBarRadius`, `chartDot(key)`, `chartActiveDot(key)` (a dot
 *   with a surface ring) and `ChartGradient` (area fill).
 */

/** Nelumbo's categorical accent roles, in the order series should use them. */
export const chartColorNames = ["blue", "orange", "green", "purple", "pink", "cyan", "amber", "red"] as const
export const chartColors = chartColorNames.map((n) => `var(--${n})`)

/** Bars are full pills: Recharts clamps the radius to half the bar, so any bar size rounds fully. */
export const chartBarRadius = 999
/** Horizontal bars are pills too. */
export const chartBarRadiusHorizontal = 999
/** Stacked segments: each one rounds and a 3px surface-colored gap separates them. Spread on each stacked Bar. */
export const chartSegment = { radius: 8, stroke: "var(--chart-surface)", strokeWidth: 3 } as const

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    /** Legend marker: a dot (default), a row of n dots (zones: more dots, more intensity), a band (a range) or a line. */
    swatch?: "dot" | "band" | "line" | number
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

/** Props to spread on Bar, Area, Line, Pie, RadialBar: a quick spring-like ease out, off with reduced motion. */
function useChartAnimation() {
  const reduce = React.useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
  return React.useMemo(
    () => ({
      isAnimationActive: !reduce,
      animationBegin: 80,
      animationDuration: 900,
      // react-smooth accepts cubic-bezier(); this one decelerates hard like a spring settling
      animationEasing: "cubic-bezier(0.22, 1, 0.36, 1)" as unknown as "ease-out",
    }),
    [reduce]
  )
}

/** Show and hide series from the legend. `hidden` keys go to the series' `hide` prop. */
function useSeriesVisibility(initiallyHidden: string[] = []) {
  const [hiddenKeys, setHidden] = React.useState<string[]>(initiallyHidden)
  const toggle = React.useCallback((key: string) => setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key])), [])
  const isHidden = React.useCallback((key: string) => hiddenKeys.includes(key), [hiddenKeys])
  return { hiddenKeys, toggle, isHidden }
}

/** A dot for Line: filled with the series color, ringed in the chart surface. */
const chartDot = (key: string) => ({ r: 4, fill: `var(--color-${key})`, stroke: "var(--chart-surface)", strokeWidth: 2 })
/** The hovered dot: bigger, with a thick surface ring. */
const chartActiveDot = (key: string) => ({ r: 6, fill: `var(--color-${key})`, stroke: "var(--chart-surface)", strokeWidth: 3 })

/** A vertical area fill that fades out: `<defs><ChartGradient id="fillA" k="desktop" /></defs>` then fill="url(#fillA)". */
function ChartGradient({ id, k, from = 0.32, to = 0.02 }: { id: string; k: string; from?: number; to?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={`var(--color-${k})`} stopOpacity={from} />
      <stop offset="100%" stopColor={`var(--color-${k})`} stopOpacity={to} />
    </linearGradient>
  )
}

function ChartContainer({
  id,
  className,
  children,
  config,
  "aria-label": ariaLabel,
  initialDimension = { width: 480, height: 270 },
  focus,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  /** From useChartFocus: the chart becomes one keyboard stop (a slider over its points) and the plot is hidden from assistive tech. */
  focus?: ChartFocus
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  /** Size used for the server render and before the first measure. */
  initialDimension?: { width: number; height: number }
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  const ref = React.useRef<HTMLDivElement>(null)
  // Recharts measures text and the container, which differ between server and client: render the plot after hydration.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // name the plot for assistive tech (Recharts renders the svg itself)
  React.useEffect(() => {
    const el = ref.current
    if (!el || !ariaLabel) return
    const apply = () => {
      const svg = el.querySelector("svg.recharts-surface")
      if (!svg) return
      if (focus) {
        // the container is the slider and carries the name; the drawing is decoration
        if (svg.getAttribute("aria-hidden") !== "true") svg.setAttribute("aria-hidden", "true")
        svg.removeAttribute("role")
        return
      }
      if (svg.getAttribute("aria-label") !== ariaLabel) svg.setAttribute("aria-label", ariaLabel)
      if (!svg.hasAttribute("tabindex") && svg.getAttribute("role") !== "img") svg.setAttribute("role", "img")
      // the plot is one image: Recharts' own per-shape roles would need names of their own
      svg.querySelectorAll("[role=img]").forEach((n) => n !== svg && n.removeAttribute("role"))
    }
    apply()
    const mo = new MutationObserver(apply)
    mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["role"] })
    return () => mo.disconnect()
  }, [ariaLabel, !!focus])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-slot="chart"
        data-chart={chartId}
        {...(focus && {
          tabIndex: 0,
          role: "slider",
          "aria-label": ariaLabel,
          "aria-orientation": "horizontal" as const,
          "aria-valuemin": 0,
          "aria-valuemax": Math.max(0, focus.count - 1),
          "aria-valuenow": Math.max(0, focus.selected),
          "aria-valuetext": focus.describe?.(focus.selected),
          onKeyDown: focus.onKeyDown,
        })}
        className={cn(
          focus && "cursor-pointer rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
          "relative flex aspect-video w-full min-w-0 justify-center overflow-visible [--chart-surface:var(--card)] type-label-sm",
          "dark:[--chart-met:66%] dark:[--chart-unmet:100%]",
          // axes: muted label-sm, no strokes
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-[0.75rem] [&_.recharts-cartesian-axis-tick_text]:font-[520] [&_.recharts-cartesian-axis-tick_text]:tracking-[0.02em]",
          "[&_.recharts-polar-angle-axis-tick_text]:fill-muted-foreground [&_.recharts-polar-radius-axis-tick_text]:fill-muted-foreground",
          // grid: very faint hairlines
          "[&_.recharts-cartesian-grid_line]:stroke-outline-variant/70 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-outline-variant/70 [&_.recharts-cartesian-grid_line]:[stroke-dasharray:1_5] [&_.recharts-cartesian-grid_line]:[stroke-width:1.5] [&_.recharts-cartesian-grid_line]:[stroke-linecap:round]",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-outline-variant/60",
          // tooltip cursor: a soft band for bars, a hairline for lines
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-foreground/5",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-outline-variant [&_.recharts-curve.recharts-tooltip-cursor]:[stroke-width:2] [&_.recharts-curve.recharts-tooltip-cursor]:[stroke-linecap:round]",
          // the tooltip glides between points on a spring
          "[&_.recharts-tooltip-wrapper]:z-10 [&_.recharts-tooltip-wrapper]:transition-transform! [&_.recharts-tooltip-wrapper]:duration-300! [&_.recharts-tooltip-wrapper]:ease-(--ease-spring)! motion-reduce:[&_.recharts-tooltip-wrapper]:transition-none!",
          "[&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden [&_.recharts-layer]:outline-hidden [&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-outline-variant",
          "[&_.recharts-legend-wrapper]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {mounted && <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>{children}</RechartsPrimitive.ResponsiveContainer>}
      </div>
    </ChartContext.Provider>
  )
}

/** Writes `--color-<key>` for each config entry, per theme. Keys without a color take chartColors in order. */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const entries = Object.entries(config)
  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const lines = entries
        .map(([key, item], i) => {
          const color = item.theme?.[theme as keyof typeof item.theme] || item.color || chartColors[i % chartColors.length]
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
      return lines.length ? `${prefix} [data-chart=${id}] {\n${lines.join("\n")}\n}` : ""
    })
    .join("\n")
  if (!css) return null
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === "string" ? config[label as keyof typeof config]?.label || label : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn("type-label-md text-muted-foreground", labelClassName)}>{labelFormatter(value, payload)}</div>
    }
    if (!value) return null
    return <div className={cn("type-label-md text-muted-foreground", labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "grid min-w-36 max-w-64 items-start gap-2 rounded-2xl bg-inverse-surface px-3.5 py-3 text-inverse-foreground shadow-e2",
        // muted text on the inverse surface
        "[--muted-foreground:color-mix(in_oklab,var(--inverse-foreground)_72%,var(--inverse-surface))] [--foreground:var(--inverse-foreground)]",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-3.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          data-slot="chart-tooltip-indicator"
                          className={cn("shrink-0 rounded-full bg-(--color-bg) ring-2 ring-inverse-foreground/20", {
                            "size-2.5": indicator === "dot",
                            "w-1 rounded-full ring-0": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent border-(--color-bg) ring-0": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={{ "--color-bg": indicatorColor } as React.CSSProperties}
                        />
                      )
                    )}
                    <div className={cn("flex flex-1 justify-between gap-4 leading-none", nestLabel ? "items-end" : "items-center")}>
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="type-label-md text-muted-foreground">{itemConfig?.label || item.name}</span>
                      </div>
                      {item.value !== undefined && item.value !== null && (
                        <span className="type-label-md font-semibold text-foreground tabular-nums">
                          {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  hiddenKeys,
  onToggle,
  keys,
}: Omit<React.ComponentProps<"div">, "onToggle"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
    /** Series keys currently switched off (interactive legend). */
    hiddenKeys?: string[]
    /** Makes the chips toggle buttons. Called with the series key. */
    onToggle?: (key: string) => void
    /** List config keys instead of the chart's series, e.g. zones drawn as reference lines. */
    keys?: string[]
  }) {
  const { config } = useChart()
  if (keys) payload = keys.map((k) => ({ value: k, dataKey: k, color: `var(--color-${k})`, type: "circle" as const }))
  if (!payload?.length) return null
  const interactive = !!onToggle

  return (
    <div
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center justify-center gap-x-2 gap-y-1", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const off = hiddenKeys?.includes(key)
          const kind = itemConfig?.swatch ?? "dot"
          const swatch = !hideIcon && <LegendSwatch kind={kind} color={item.color} off={off} />
          const body = (
            <>
              {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : swatch}
              <span>{itemConfig?.label}</span>
            </>
          )
          const chip = "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 type-label-md [&_svg]:size-3"
          return interactive ? (
            <button
              key={String(item.value)}
              type="button"
              data-slot="chart-legend-item"
              aria-pressed={!off}
              onClick={() => onToggle(key)}
              className={cn(
                chip,
                "state-layer tactile cursor-pointer outline-none transition-[background-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                off ? "bg-transparent text-muted-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {body}
            </button>
          ) : (
            <div key={String(item.value)} data-slot="chart-legend-item" className={cn(chip, "text-muted-foreground")}>
              {body}
            </div>
          )
        })}
    </div>
  )
}

function LegendSwatch({ kind, color, off }: { kind: NonNullable<ChartConfig[string]["swatch"]>; color?: string; off?: boolean }) {
  if (typeof kind === "number") {
    const n = Math.max(1, Math.min(6, Math.round(kind)))
    return (
      <svg aria-hidden width={n * 6} height={10} className="shrink-0 overflow-visible" style={{ width: n * 6, height: 10, opacity: off ? 0.4 : 1 }}>
        {Array.from({ length: n }, (_, i) => (
          <circle key={i} cx={3 + i * 6} cy={5} r={1.75} fill={color} />
        ))}
      </svg>
    )
  }
  if (kind === "band")
    return (
      <span
        aria-hidden
        className="h-3 w-4 shrink-0 rounded-[4px] border-[1.5px] border-dotted"
        style={{ borderColor: color, background: off ? "transparent" : `color-mix(in oklab, ${color} 28%, transparent)` }}
      />
    )
  if (kind === "line")
    return <span aria-hidden className="h-[3px] w-4 shrink-0 rounded-full" style={{ background: color, opacity: off ? 0.4 : 1 }} />
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-full transition-[background-color,box-shadow] duration-200", off && "bg-transparent!")}
      style={{ backgroundColor: color, boxShadow: off ? `inset 0 0 0 1.5px ${color}` : undefined }}
    />
  )
}

// Pull the config entry for a tooltip/legend payload item.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined

  let configLabelKey: string = key
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }
  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

/* ------------------------------------------------------------------ */
/* Health-style charts, after Google's Material 3 Expressive health     */
/* app: a big readout, one point in focus marked by a line and a ring,  */
/* pill bars with a scalloped badge on goal days, dotted zone lines,    */
/* lanes for stages. Neutral by default, the series color carries data. */
/* ------------------------------------------------------------------ */

/** The tonal track behind a bar, lane or ring: the series color, mostly surface. */
const chartTrackColor = (color: string, amount = 14) => `color-mix(in oklab, ${color} ${amount}%, var(--chart-surface))`
/** A lighter tint of a series color: days short of the goal, badges. */
const chartTintColor = (color: string, amount = 52) => `color-mix(in oklab, ${color} ${amount}%, white)`
/** A series color pushed back, for points out of focus. */
const chartDimColor = (color: string) => `color-mix(in oklab, ${color} 42%, var(--chart-surface))`

type ChartMouseState = { activeTooltipIndex?: number; isTooltipActive?: boolean } | null | undefined

type ChartFocusOptions = {
  /** How many points the chart has. */
  count: number
  /** The point in focus when nothing is selected. Defaults to the last one (today); -1 starts with none (a summary). */
  defaultIndex?: number
  /** Controlled selection. */
  index?: number
  onIndexChange?: (index: number) => void
  /** What a screen reader hears for a point, e.g. "Thu, Nov 12: 8,412 steps". Called with -1 for the summary. */
  describe?: (index: number) => string
}

/**
 * One point in focus: hovering previews a point, a click or tap selects it,
 * arrow keys move the selection (Home, End, Page Up and Down too), and
 * leaving the chart falls back to the selection. `reset()` and `isDefault`
 * drive the readout's clear button.
 *
 *   const focus = useChartFocus({ count: data.length, describe })
 *   <ChartContainer focus={focus} ...>
 *     <BarChart data={data} {...focus.chartProps}>
 */
function useChartFocus({ count, defaultIndex, index: controlled, onIndexChange, describe }: ChartFocusOptions) {
  const last = Math.max(0, count - 1)
  const home = defaultIndex === -1 ? -1 : Math.min(defaultIndex ?? last, last)
  const [own, setOwn] = React.useState(home)
  const [hover, setHover] = React.useState<number | null>(null)
  const selected = Math.min(controlled ?? own, last)
  // index -1: nothing in focus, show the summary
  const index = hover ?? selected

  const select = React.useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(last, i))
      setOwn(next)
      onIndexChange?.(next)
    },
    [last, onIndexChange]
  )

  // the data changed length (week to month): start again from the default
  React.useEffect(() => {
    setOwn(home)
    setHover(null)
  }, [count, home])

  const chartProps = React.useMemo(
    () => ({
      onMouseMove: (s: ChartMouseState) => {
        const i = s?.activeTooltipIndex
        if (s?.isTooltipActive && typeof i === "number" && i >= 0) setHover(i)
      },
      onMouseLeave: () => setHover(null),
      onClick: (s: ChartMouseState) => {
        const i = s?.activeTooltipIndex
        if (typeof i === "number" && i >= 0) select(i)
      },
    }),
    [select]
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
      let next: number | undefined
      if (step) next = selected < 0 ? (step > 0 ? 0 : last) : selected + step
      else if (e.key === "Home") next = 0
      else if (e.key === "End") next = last
      else if (e.key === "PageUp") next = selected + 7
      else if (e.key === "PageDown") next = selected - 7
      else if (e.key === "Escape" && selected !== home) next = home
      if (next === undefined) return
      e.preventDefault()
      setHover(null)
      select(next)
    },
    [selected, last, home, select]
  )

  /** Full color for the point in focus, pushed back for the rest (opt in: the health look keeps all bars). */
  const fill = React.useCallback(
    (key: string, i: number) => (i === index ? `var(--color-${key})` : chartDimColor(`var(--color-${key})`)),
    [index]
  )

  return {
    index,
    selected,
    hovering: hover !== null,
    /** Nothing picked: the selection is where it started (hovering does not count). */
    isDefault: selected === home,
    reset: () => {
      setHover(null)
      select(home)
    },
    count,
    select,
    chartProps,
    onKeyDown,
    fill,
    describe,
  }
}

export type ChartFocus = ReturnType<typeof useChartFocus>

/** The focus marker's line: `<ReferenceLine x={data[focus.index].date} {...chartFocusLine} />`, after the series. */
const chartFocusLine = {
  stroke: "var(--foreground)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  ifOverflow: "visible" as const,
  className: "recharts-focus-line",
}
/** The focus marker's ring: `<ReferenceDot x=… y={value} {...chartFocusDot} />`. */
const chartFocusDot = {
  r: 7,
  fill: "var(--chart-surface)",
  stroke: "var(--foreground)",
  strokeWidth: 2.5,
  ifOverflow: "visible" as const,
}

/** A soft scalloped "cookie", the Material 3 Expressive burst. */
function cookiePath(cx: number, cy: number, r: number, lobes = 9, depth = 0.085) {
  const pts: string[] = []
  const n = lobes * 12
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const rr = r * (1 - depth + depth * Math.cos(lobes * a))
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join("L")}Z`
}

type BarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number | [number, number]
  index?: number
}

/**
 * A pill bar for health metrics. Days that reach `goal` take the full series
 * color and wear a scalloped check badge at the top; the rest are a lighter
 * tint. Without a goal every bar is full color.
 *
 *   <Bar dataKey="steps" shape={chartPillBar("steps", { goal: 10000 })} />
 */
function chartPillBar(key: string, { goal, badge = true }: { goal?: number; badge?: boolean } = {}) {
  const color = `var(--color-${key})`
  function PillBar(props: unknown) {
    const { x = 0, y = 0, width = 0, height = 0, value } = props as BarShapeProps
    if (width <= 0 || height <= 0) return <g />
    const v = Array.isArray(value) ? value[1] : (value ?? 0)
    const met = goal === undefined || v >= goal
    const r = Math.min(width, height) / 2
    const showBadge = badge && goal !== undefined && met && height >= width * 0.9
    const cx = x + width / 2
    const cy = y + width / 2
    const br = width * 0.44
    return (
      <g className="recharts-pill-bar">
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={r}
          // light: goal days full, the rest a pale tint; dark: goal days deepen, the rest stay bright
          fill={met ? `color-mix(in oklab, ${color} var(--chart-met, 100%), black)` : `color-mix(in oklab, ${color} var(--chart-unmet, 52%), white)`}
        />
        {showBadge && (
          <g aria-hidden>
            <path d={cookiePath(cx, cy, br)} fill={chartTintColor(color, 46)} />
            <path
              d={`M${cx - br * 0.36},${cy + br * 0.02} L${cx - br * 0.08},${cy + br * 0.3} L${cx + br * 0.4},${cy - br * 0.24}`}
              fill="none"
              stroke={`color-mix(in oklab, ${color} 55%, black)`}
              strokeWidth={Math.max(2, br * 0.16)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </g>
    )
  }
  return PillBar
}

/** The tonal pill track behind each bar, stronger behind the point in focus: `<Bar background={chartTrack("steps", focus)} />`. */
function chartTrack(key: string, focus?: { index: number }) {
  function Track(props: unknown) {
    const { x = 0, y = 0, width = 0, height = 0, index } = props as BarShapeProps
    if (width <= 0 || height <= 0) return <g />
    const on = focus && index === focus.index
    return <rect x={x} y={y} width={width} height={height} rx={Math.min(width, height) / 2} fill={chartTrackColor(`var(--color-${key})`, on ? 24 : 12)} />
  }
  return Track
}

/**
 * Value axis ticks that call out reference values: `<YAxis orientation="right"
 * ticks={[0, 4419, 10000, 13256]} tick={chartTicks({ highlight: { 10000: "var(--color-steps)" } })} />`.
 */
function chartTicks({ highlight = {}, format = (v: number) => v.toLocaleString() }: { highlight?: Record<number, string>; format?: (v: number) => string } = {}) {
  function Tick({ x = 0, y = 0, payload, textAnchor = "start" }: { x?: number; y?: number; payload?: { value: number }; textAnchor?: string }) {
    const v = payload?.value ?? 0
    const color = highlight[v]
    return (
      <text
        x={x}
        y={y}
        dy="0.35em"
        textAnchor={textAnchor as "start" | "end" | "middle"}
        className={cn("text-[0.75rem] tracking-[0.02em] tabular-nums", color ? "font-[650]" : "fill-muted-foreground font-[520]")}
        style={color ? { fill: color } : undefined}
      >
        {format(v)}
      </text>
    )
  }
  return Tick
}

/** Props for a health-style line: thick, round, smooth, no resting dots. Spread on Line. */
const chartLine = (key: string) => ({
  type: "monotone" as const,
  dataKey: key,
  stroke: `var(--color-${key})`,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  dot: false,
  activeDot: false as const,
})

/** A goal or threshold: a thin solid line in the series color, `<ReferenceLine y={10000} {...chartGoalLine("steps")} />`. */
const chartGoalLine = (key: string) => ({
  stroke: `var(--color-${key})`,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  ifOverflow: "extendDomain" as const,
})

/** A zone boundary: a dotted line of round dots in the zone's color, `<ReferenceLine y={113} {...chartZoneLine("moderate")} />`. */
const chartZoneLine = (key: string) => ({
  stroke: `var(--color-${key})`,
  strokeWidth: 3,
  strokeDasharray: "0 9",
  strokeLinecap: "round" as const,
  ifOverflow: "extendDomain" as const,
})

/**
 * A vertical gradient with hard stops at zone boundaries, so a line changes
 * color as it crosses them. `range` is the series' own [min, max] (the line's
 * bounding box); `zones` are the lower bounds, lowest first.
 *
 *   <defs><ChartZoneGradient id="hr" range={[47, 131]} zones={[{ key: "light", from: 0 }, { key: "moderate", from: 113 }]} /></defs>
 *   <Line stroke="url(#hr)" ... />
 */
function ChartZoneGradient({ id, range, zones }: { id: string; range: [number, number]; zones: { key: string; from: number }[] }) {
  const [min, max] = range
  const span = Math.max(1e-6, max - min)
  const at = (v: number) => Math.min(1, Math.max(0, (max - v) / span))
  const sorted = [...zones].sort((a, b) => b.from - a.from) // top of the box first
  const stops: React.ReactNode[] = []
  let offset = 0
  sorted.forEach((z, i) => {
    const color = `var(--color-${z.key})`
    const end = i === sorted.length - 1 ? 1 : at(z.from)
    if (end <= offset && i !== sorted.length - 1) return
    stops.push(<stop key={`${z.key}a`} offset={offset} stopColor={color} />, <stop key={`${z.key}b`} offset={Math.max(offset, end)} stopColor={color} />)
    offset = Math.max(offset, end)
  })
  return (
    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
      {stops}
    </linearGradient>
  )
}

/**
 * The headline of a health chart: a large value with its unit, and under it
 * what the value is (the day, a summary). `onClear` adds the round close
 * button that returns the selection to today.
 */
function ChartReadout({
  label,
  value,
  unit,
  detail,
  onClear,
  clearLabel = "Back to the latest",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** What the value is: "Today", "Thu, Nov 12". */
  label?: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
  /** A sentence under the label, or a badge. */
  detail?: React.ReactNode
  /** Shows a close button beside the value. Leave undefined to hide it. */
  onClear?: () => void
  clearLabel?: string
}) {
  const key = `${String(value)}|${String(label)}`
  return (
    <div data-slot="chart-readout" className={cn("grid gap-1", className)} {...props}>
      <style href="nelumbo-chart" precedence="default">
        {`@keyframes nelumbo-readout-in{0%{opacity:0;translate:0 8px}100%{opacity:1;translate:0 0}}`}
      </style>
      <div className="flex min-h-12 items-center gap-4">
        <div aria-live="polite" aria-atomic className="flex flex-wrap items-baseline gap-x-1.5">
          <span key={key} className="type-display-md font-[460] tracking-[-0.03em] text-foreground tabular-nums motion-safe:animate-[nelumbo-readout-in_360ms_var(--ease-spring)]">
            {value}
          </span>
          {unit != null && <span className="type-title-lg font-[620] text-foreground">{unit}</span>}
          {label != null && <span className="sr-only">, {label}</span>}
        </div>
        {onClear && (
          <IconButton
            variant="secondary"
            icon="close"
            label={clearLabel}
            onClick={onClear}
            className="motion-safe:animate-[nelumbo-readout-in_300ms_var(--ease-spring)]"
          />
        )}
      </div>
      {label != null && (
        <div aria-hidden className="type-body-lg text-muted-foreground">
          {label}
        </div>
      )}
      {detail != null && <div className="type-body-md text-muted-foreground">{detail}</div>}
    </div>
  )
}

/* Rings ------------------------------------------------------------ */

type ChartRing = {
  key: string
  label: string
  value: number
  max: number
  unit?: string
  /** Defaults to chartColors in order. */
  color?: string
}

/**
 * Concentric progress rings with round caps on tonal tracks. Past the goal a
 * ring keeps going: the second lap is drawn darker over the first.
 */
function ChartRings({
  rings,
  size = 200,
  thickness = 18,
  gap = 5,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  rings: ChartRing[]
  size?: number
  thickness?: number
  gap?: number
  /** Content for the middle (a total, an icon). */
  children?: React.ReactNode
}) {
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const c = size / 2
  const label = ariaLabel ?? rings.map((r) => `${r.label} ${r.value.toLocaleString()} of ${r.max.toLocaleString()}${r.unit ? ` ${r.unit}` : ""}`).join(", ")

  return (
    <div data-slot="chart-rings" className={cn("relative inline-grid shrink-0 place-items-center [--chart-surface:var(--card)]", className)} style={{ width: size, height: size }} {...props}>
      <svg role="img" aria-label={label} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((r, i) => {
          const color = r.color ?? chartColors[i % chartColors.length]
          const radius = c - thickness / 2 - i * (thickness + gap)
          if (radius <= thickness / 2) return null
          const len = 2 * Math.PI * radius
          const p = r.max > 0 ? r.value / r.max : 0
          const first = Math.min(p, 1)
          const lap = Math.min(Math.max(p - 1, 0), 1)
          const arc = (frac: number, delay: number, stroke: string) => (
            <circle
              cx={c}
              cy={c}
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${len} ${len}`}
              strokeDashoffset={shown ? len * (1 - frac) : len}
              // a zero-length arc with round caps still paints a dot
              opacity={frac > 0.001 ? 1 : 0}
              style={{ transition: `stroke-dashoffset 1100ms var(--ease-spring) ${delay}ms` }}
              className="motion-reduce:transition-none!"
            />
          )
          return (
            <g key={r.key}>
              <circle cx={c} cy={c} r={radius} fill="none" stroke={chartTrackColor(color, 18)} strokeWidth={thickness} />
              {arc(first, i * 90, color)}
              {lap > 0 && arc(lap, 700 + i * 90, `color-mix(in oklab, ${color} 70%, black)`)}
            </g>
          )
        })}
      </svg>
      {children != null && <div className="absolute inset-0 grid place-items-center text-center">{children}</div>}
    </div>
  )
}

/* Stages ----------------------------------------------------------- */

type ChartStage = {
  stage: string
  start: Date | number
  /** Leave out for an instant event (a restless moment): drawn as a tick. */
  end?: Date | number
}

const fmtDuration = (ms: number) => {
  const m = Math.round(ms / 60000)
  const h = Math.floor(m / 60)
  return h ? `${h}h ${m % 60}m` : `${m} min`
}

/**
 * A stage timeline, the sleep chart: one labelled lane per stage, each a
 * rounded track holding that stage's blocks, thin connectors where one stage
 * hands over to the next, and the start, middle and end times underneath.
 *
 * `levels` lists config keys top to bottom. Keys in `events` are lanes of
 * moments (restlessness): their items draw as ticks and break no chain.
 */
function ChartStages({
  config,
  data,
  levels,
  events = [],
  trackHeight = 26,
  startCaption,
  endCaption,
  locale,
  className,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig
  data: ChartStage[]
  levels: string[]
  events?: string[]
  trackHeight?: number
  /** Under the first time, e.g. "Went to bed". */
  startCaption?: React.ReactNode
  /** Under the last time, e.g. "Out of bed". */
  endCaption?: React.ReactNode
  locale?: string
}) {
  const uid = React.useId().replace(/:/g, "")
  const chartId = `chart-${uid}`
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const t = (d: Date | number | undefined) => (d === undefined ? undefined : typeof d === "number" ? d : d.getTime())
  const startOf = (d: ChartStage) => t(d.start)!
  const endOf = (d: ChartStage) => t(d.end) ?? startOf(d)
  const start = Math.min(...data.map(startOf))
  const end = Math.max(...data.map(endOf))
  const span = Math.max(1, end - start)
  const isEvent = (k: string) => events.includes(k)
  const totals = levels.map((k) =>
    data.filter((d) => d.stage === k).reduce((s, d) => s + (isEvent(k) && d.end === undefined ? 60000 : endOf(d) - startOf(d)), 0)
  )
  const fmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" })
  const time = (ms: number) => fmt.format(ms)
  const name = (k: string) => {
    const l = config[k]?.label
    return typeof l === "string" ? l : k
  }

  const label = ariaLabel ?? `${time(start)} to ${time(end)}. ` + levels.map((k, i) => `${name(k)} ${fmtDuration(totals[i])}`).join(", ")

  const labelH = 26
  const gapH = 10
  const laneH = labelH + trackHeight + gapH
  const h = levels.length * laneH - gapH
  const x = (ms: number) => ((ms - start) / span) * width
  const trackY = (k: string) => levels.indexOf(k) * laneH + labelH
  const chain = [...data].filter((d) => !isEvent(d.stage)).sort((a, b) => startOf(a) - startOf(b))
  const mid = start + span / 2

  return (
    <div data-slot="chart" data-chart={chartId} className={cn("grid gap-1 [--chart-surface:var(--card)]", className)} {...props}>
      <ChartStyle id={chartId} config={config} />
      <div ref={ref} className="min-w-0">
        <svg role="img" aria-label={label} width="100%" height={h} className="block overflow-visible">
          {width > 0 && (
            <>
              {levels.map((k, i) => (
                <g key={k}>
                  <text x={0} y={i * laneH + labelH / 2} dominantBaseline="central" className="fill-foreground text-[0.9375rem] font-[560] tracking-[-0.005em]">
                    {name(k)}
                    <tspan dx={10} className="fill-muted-foreground font-[480] tabular-nums">
                      {fmtDuration(totals[i])}
                    </tspan>
                  </text>
                  <rect x={0} y={trackY(k)} width={width} height={trackHeight} rx={trackHeight / 2} className="fill-surface-container-high" />
                </g>
              ))}
              {/* hand-over connectors, behind the blocks */}
              {chain.slice(1).map((d, i) => {
                const prev = chain[i]
                const a = trackY(prev.stage) + trackHeight / 2
                const b = trackY(d.stage) + trackHeight / 2
                if (a === b) return null
                const cx = x(startOf(d))
                return <line key={`c${i}`} x1={cx} x2={cx} y1={Math.min(a, b)} y2={Math.max(a, b)} strokeWidth={1.5} className="stroke-outline-variant" />
              })}
              {data.map((d, i) => {
                const y = trackY(d.stage)
                const color = `var(--color-${d.stage})`
                if (isEvent(d.stage)) {
                  const x1 = x(startOf(d))
                  const w = Math.max(2, x(endOf(d)) - x1)
                  return <rect key={i} x={x1 - w / 2} y={y + 4} width={w} height={trackHeight - 8} rx={1} fill={color} />
                }
                const x1 = x(startOf(d))
                const w = Math.max(3, x(endOf(d)) - x1)
                return <rect key={i} x={x1} y={y} width={w} height={trackHeight} rx={Math.min(trackHeight / 2, w / 2)} fill={color} />
              })}
            </>
          )}
        </svg>
      </div>
      <div aria-hidden className="grid grid-cols-3 pt-2 type-label-md text-muted-foreground">
        {[
          { at: start, cap: startCaption, align: "text-start" },
          { at: mid, cap: null, align: "text-center" },
          { at: end, cap: endCaption, align: "text-end" },
        ].map(({ at, cap, align }) => (
          <div key={at} className={cn("grid gap-0.5", align)}>
            <span className="tabular-nums">{time(at)}</span>
            {cap && <span className="type-body-md text-foreground">{cap}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
/* ================================================================== */
/* AREA HELPERS                                                  */
/* Owned by the area gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/**
 * Props for a Material area: a 3px round-capped line over a fill, no resting
 * dots. `fill` is usually a gradient (`url(#id)` from ChartGradient). Spread
 * on Area, then pass `type` ("monotone" default, "linear", "step") and motion.
 *
 *   <Area {...chartArea("desktop", "url(#fillDesktop)")} type="step" {...motion} />
 */
export const chartArea = (key: string, fill?: string) => ({
  type: "monotone" as const,
  dataKey: key,
  stroke: `var(--color-${key})`,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: fill ?? `var(--color-${key})`,
  fillOpacity: fill ? 1 : 0.2,
  dot: false as const,
  activeDot: false as const,
})

/* end area helpers */

/* ================================================================== */
/* BAR HELPERS                                                  */
/* Owned by the bar gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/**
 * Value labels for bars, as small pills or in-bar text. Pass to LabelList:
 *   <LabelList dataKey="v" content={chartBarLabel()} />                       // inverse pill above each column
 *   <LabelList dataKey="v" content={chartBarLabel({ horizontal: true })} />    // pill after each row
 *   <LabelList dataKey="v" content={chartBarLabel({ horizontal: true, position: "inside-start", onColor: "var(--blue-foreground)", text: (i) => names[i] })} />
 * Negative values put the pill on the far side of the zero line.
 * `tone` "tonal" tints the pill with `color`; `onColor` colors in-bar text.
 */
export function chartBarLabel({
  horizontal = false,
  position = "end",
  format = (v: number) => v.toLocaleString("en-US"),
  text,
  onColor = "var(--foreground)",
  tone = "inverse",
  color = "var(--foreground)",
}: {
  horizontal?: boolean
  position?: "end" | "inside-start"
  format?: (v: number) => string
  /** Replace the text (e.g. a category name) for the bar at `index`. */
  text?: (index: number, value: number) => string
  onColor?: string
  tone?: "inverse" | "tonal"
  color?: string
} = {}) {
  function BarLabel(props: unknown) {
    const { x = 0, y = 0, width = 0, height = 0, value, index = 0 } = props as BarShapeProps
    const v = Array.isArray(value) ? value[1] : Number(value ?? 0)
    if (!Number.isFinite(v)) return <g />
    const left = width < 0 ? x + width : x
    const top = height < 0 ? y + height : y
    const w = Math.abs(width)
    const h = Math.abs(height)
    const label = text ? text(index, v) : format(v)
    if (position === "inside-start") {
      if (w < 24) return <g />
      return (
        <text x={left + h / 2} y={top + h / 2} dominantBaseline="central" className="text-[0.8125rem] font-[620] tracking-[0.01em]" style={{ fill: onColor }}>
          {label}
        </text>
      )
    }
    const pw = label.length * 6.8 + 18
    const ph = 22
    const gap = 6
    const neg = v < 0
    const px = horizontal ? (neg ? left - gap - pw : left + w + gap) : left + w / 2 - pw / 2
    const py = horizontal ? top + h / 2 - ph / 2 : neg ? top + h + gap : top - gap - ph
    const tonal = tone === "tonal"
    return (
      <g aria-hidden className="pointer-events-none">
        <rect x={px} y={py} width={pw} height={ph} rx={ph / 2} className={tonal ? undefined : "fill-inverse-surface"} style={tonal ? { fill: chartTrackColor(color, 24) } : undefined} />
        <text
          x={px + pw / 2}
          y={py + ph / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("text-[0.75rem] font-[620] tabular-nums", tonal ? "fill-foreground" : "fill-inverse-foreground")}
        >
          {label}
        </text>
      </g>
    )
  }
  return BarLabel
}

/* end bar helpers */

/* ================================================================== */
/* LINE HELPERS                                                  */
/* Owned by the line gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/** A scalloped cookie outline as an SVG path (the Material 3 Expressive burst), centered on cx, cy. */
export function chartCookiePath(cx: number, cy: number, r: number, lobes = 9, depth = 0.085) {
  const pts: string[] = []
  const n = lobes * 12
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const rr = r * (1 - depth + depth * Math.cos(lobes * a))
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join("L")}Z`
}

type LineDotProps = { cx?: number; cy?: number; index?: number; value?: number | string; payload?: Record<string, unknown> }

/**
 * A Line `dot` renderer that colors each dot from the data: the series color is
 * the fallback. Dots are ringed in the chart surface like chartDot.
 *
 *   <Line dot={chartColorDot((d) => (d.in ? "var(--color-inRange)" : "var(--color-outRange)"))} />
 */
export function chartColorDot(colorOf: (payload: any, index: number) => string, { r = 5 }: { r?: number } = {}) {
  function ColorDot({ cx, cy, index = 0, payload }: LineDotProps) {
    if (cx === undefined || cy === undefined || !payload) return <g />
    return <circle cx={cx} cy={cy} r={r} fill={colorOf(payload, index)} stroke="var(--chart-surface)" strokeWidth={2} />
  }
  return ColorDot
}

/**
 * A Line `dot` renderer with a shape: points where `when` is true get a
 * scalloped cookie in the series color with a small `glyph` inside; the rest a
 * small ringed dot. `glyph` is an SVG path in a 24 by 24 box (a Material Symbols
 * outline works), drawn in the surface color.
 *
 *   <Line dot={chartCookieDot("desktop", { when: (d) => d.desktop >= 300, glyph: "M13 2 4 14h6l-1 8 9-12h-6z" })} />
 */
export function chartCookieDot(
  key: string,
  { when, glyph, r = 11 }: { when?: (payload: any, index: number) => boolean; glyph?: string; r?: number } = {}
) {
  const color = `var(--color-${key})`
  function CookieDot({ cx, cy, index = 0, payload }: LineDotProps) {
    if (cx === undefined || cy === undefined || !payload) return <g />
    if (when && !when(payload, index)) return <circle cx={cx} cy={cy} r={4} fill={color} stroke="var(--chart-surface)" strokeWidth={2} />
    const s = (r * 1.15) / 24
    return (
      <g aria-hidden>
        <path d={chartCookiePath(cx, cy, r)} fill={color} stroke="var(--chart-surface)" strokeWidth={2} />
        {glyph && <path d={glyph} transform={`translate(${cx - 12 * s} ${cy - 12 * s}) scale(${s})`} fill="var(--chart-surface)" />}
      </g>
    )
  }
  return CookieDot
}

/**
 * A value label as a small pill above its point, for `<LabelList content={...} />`
 * on a Line (or Bar). `tone` "inverse" is the dark chip, "tonal" a tint of the
 * series color. `text` maps the value and the point's index to the label.
 *
 *   <Line ...><LabelList content={chartPillLabel("desktop", { text: (v) => String(v) })} /></Line>
 */
export function chartPillLabel(
  key: string,
  { text = (v: number | string) => String(v), tone = "inverse", offset = 22 }: { text?: (value: any, index: number) => string; tone?: "inverse" | "tonal"; offset?: number } = {}
) {
  function PillLabel(props: { x?: number | string; y?: number | string; value?: number | string; index?: number; payload?: unknown }) {
    const x = Number(props.x)
    const y = Number(props.y)
    if (!Number.isFinite(x) || !Number.isFinite(y) || props.value === undefined) return <g />
    const label = text(props.value, props.index ?? 0)
    const w = Math.max(28, label.length * 6.6 + 16)
    const h = 22
    const color = `var(--color-${key})`
    return (
      <g aria-hidden>
        <rect
          x={x - w / 2}
          y={y - offset - h / 2}
          width={w}
          height={h}
          rx={h / 2}
          fill={tone === "inverse" ? "var(--inverse-surface)" : chartTrackColor(color, 22)}
        />
        <text
          x={x}
          y={y - offset}
          dy="0.35em"
          textAnchor="middle"
          className={cn("text-[0.75rem] font-[620] tabular-nums", tone === "inverse" ? "fill-inverse-foreground" : "fill-foreground")}
        >
          {label}
        </text>
      </g>
    )
  }
  return PillLabel
}

/* end line helpers */

/* ================================================================== */
/* PIE HELPERS                                                  */
/* Owned by the pie gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

const pieRad = Math.PI / 180

type PieLabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  value: number
  name?: string | number
  fill?: string
  payload?: { fill?: string }
}

/** Width of a chip's text at 12px (the chart font is proportional, this is a close estimate). */
const pieTextWidth = (s: string, size = 12) => Math.ceil(s.length * size * 0.56)

/**
 * A label as a small inverse pill, for Pie's `label` prop. `outside` draws a
 * round-capped leader line from the slice edge to the chip; `inside` centers
 * the chip in the slice. `text` builds the chip text from the value and the
 * config label; `dot` adds a swatch in the slice color.
 *
 *   <Pie label={piePillLabel({ config, text: (v, name) => `${name} ${v}`, dot: true })} labelLine={false} />
 */
export function piePillLabel({
  config,
  position = "outside",
  offset = 14,
  text = (value) => String(value),
  dot = false,
}: {
  config?: ChartConfig
  position?: "outside" | "inside"
  /** Distance from the slice edge to the chip, in px (outside). */
  offset?: number
  text?: (value: number, name: string) => string
  dot?: boolean
} = {}) {
  return function PiePillLabel(p: PieLabelProps) {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = p
    const key = String(p.name ?? "")
    const name = config?.[key]?.label ? String(config[key].label) : key
    const label = text(value, name)
    const size = 12
    const h = 22
    const w = pieTextWidth(label, size) + 16 + (dot ? 12 : 0)
    const cos = Math.cos(-midAngle * pieRad)
    const sin = Math.sin(-midAngle * pieRad)
    const color = p.payload?.fill ?? p.fill ?? "currentColor"

    let x: number
    let y: number
    let line: React.ReactNode = null
    if (position === "inside") {
      const r = (innerRadius + outerRadius) / 2
      x = cx + r * cos - w / 2
      y = cy + r * sin - h / 2
    } else {
      const sx = cx + (outerRadius + 3) * cos
      const sy = cy + (outerRadius + 3) * sin
      const ex = cx + (outerRadius + offset) * cos
      const ey = cy + (outerRadius + offset) * sin
      const right = cos >= 0
      // the chip sits on the leader's end, on the far side of the pie
      x = right ? ex : ex - w
      y = ey - h / 2
      line = <path d={`M${sx},${sy}L${ex},${ey}`} fill="none" stroke="var(--outline)" strokeWidth={1.5} strokeLinecap="round" />
    }
    return (
      <g pointerEvents="none">
        {line}
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="var(--inverse-surface)" />
        {dot && <circle cx={x + 11} cy={y + h / 2} r={4} fill={color} stroke="var(--inverse-foreground)" strokeOpacity={0.25} strokeWidth={1.5} />}
        <text
          x={x + (dot ? 20 : 8)}
          y={y + h / 2}
          dominantBaseline="central"
          fontSize={size}
          fontWeight={600}
          fill="var(--inverse-foreground)"
          className="tabular-nums"
        >
          {label}
        </text>
      </g>
    )
  }
}

/**
 * Active slice for Pie's `activeShape`: the same sector, grown outward by
 * `grow` px, settling on a spring (off with reduced motion). Pair with a
 * controlled `activeIndex`.
 *
 *   <Pie activeIndex={focus.index} activeShape={PieActiveSector} />
 */
export function PieActiveSector(props: React.ComponentProps<typeof RechartsPrimitive.Sector> & { grow?: number }) {
  const { grow = 12, cx = 0, cy = 0, outerRadius = 0, ...rest } = props
  const from = Number(outerRadius) / (Number(outerRadius) + grow)
  return (
    <g
      className="nelumbo-pie-grow"
      style={{ transformOrigin: `${cx}px ${cy}px`, ["--pie-from" as string]: from } as React.CSSProperties}
    >
      <style href="nelumbo-pie" precedence="default">
        {`@keyframes nelumbo-pie-grow{from{transform:scale(var(--pie-from))}to{transform:scale(1)}}@media (prefers-reduced-motion:no-preference){.nelumbo-pie-grow{animation:nelumbo-pie-grow 520ms var(--ease-spring)}}`}
      </style>
      <RechartsPrimitive.Sector {...rest} cx={cx} cy={cy} outerRadius={Number(outerRadius) + grow} />
    </g>
  )
}

/**
 * The center of a donut: a big value with a label under it, centered over
 * the chart. Place it inside a `relative` wrapper that also holds the
 * ChartContainer; it ignores the pointer and is hidden from assistive tech
 * (the chart's aria-label or slider text carries the same words).
 */
export function PieCenter({
  value,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { value: React.ReactNode; label?: React.ReactNode }) {
  const key = `${String(value)}|${String(label)}`
  return (
    <div aria-hidden data-slot="pie-center" className={cn("pointer-events-none absolute inset-0 grid place-content-center text-center", className)} {...props}>
      <style href="nelumbo-chart" precedence="default">
        {`@keyframes nelumbo-readout-in{0%{opacity:0;translate:0 8px}100%{opacity:1;translate:0 0}}`}
      </style>
      <div key={key} className="grid motion-safe:animate-[nelumbo-readout-in_360ms_var(--ease-spring)]">
        <span className="type-headline-lg font-[480] tracking-[-0.03em] text-foreground tabular-nums">{value}</span>
        {label != null && <span className="type-label-md text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}

/* end pie helpers */

/* ================================================================== */
/* RADAR HELPERS                                                  */
/* Owned by the radar gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/* end radar helpers */

/* ================================================================== */
/* RADIAL HELPERS                                                  */
/* Owned by the radial gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/**
 * Draws each radial bar as a tonal track plus a round-capped bar in one shape:
 * `<RadialBar shape={chartRadialShape({ startAngle: 90, endAngle: -270 })} />`.
 * Pass the chart's own start and end angle so the track spans the whole arc.
 * `track: "dots"` draws a dotted round-dot circle through the bar instead of a tonal track (the grid look); `track: false` skips the track (stacked series); `gap` adds the 3px surface
 * gap between stacked segments. The track takes the bar's own fill.
 */
export function chartRadialShape({
  startAngle = 90,
  endAngle = -270,
  track = true,
  trackAmount = 16,
  cornerRadius = 999,
  gap = false,
}: { startAngle?: number; endAngle?: number; track?: boolean | "dots"; trackAmount?: number; cornerRadius?: number; gap?: boolean } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function RadialShape(props: any) {
    const { cx, cy, innerRadius, outerRadius, fill } = props
    if (props.endAngle === props.startAngle) return <g />
    return (
      <g>
        {track === "dots" && <circle cx={cx} cy={cy} r={(innerRadius + outerRadius) / 2} fill="none" stroke="var(--outline-variant)" strokeWidth={3} strokeDasharray="0 9" strokeLinecap="round" />}
        {track === true && <RechartsPrimitive.Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} cornerRadius={cornerRadius} fill={chartTrackColor(fill, trackAmount)} stroke="none" />}
        <RechartsPrimitive.Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={props.startAngle}
          endAngle={props.endAngle}
          cornerRadius={cornerRadius}
          fill={fill}
          stroke={gap ? "var(--chart-surface)" : "none"}
          strokeWidth={gap ? 3 : 0}
        />
      </g>
    )
  }
}

/**
 * A pill chip at the start of each radial bar (bars that start at 12 o'clock):
 * `<LabelList dataKey="label" content={chartRadialLabel()} />`. Inverse
 * colors, so it reads on any bar. `format` turns the label value into text.
 */
export function chartRadialLabel({ format = (v: unknown) => String(v), height = 20 }: { format?: (v: unknown) => string; height?: number } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function RadialLabel(props: any) {
    const { viewBox, value } = props
    if (!viewBox || value == null) return null
    const { cx, cy, innerRadius, outerRadius } = viewBox
    const text = format(value)
    const w = text.length * 6.4 + 18
    const h = height
    const mid = (innerRadius + outerRadius) / 2
    return (
      <g aria-hidden>
        <rect x={cx + 5} y={cy - mid - h / 2} width={w} height={h} rx={h / 2} fill="var(--foreground)" />
        <text x={cx + 5 + w / 2} y={cy - mid} textAnchor="middle" dominantBaseline="central" fill="var(--background)" fontSize={height < 20 ? 11 : 12} fontWeight={560}>
          {text}
        </text>
      </g>
    )
  }
}

/**
 * The number in the middle of a radial chart, in display type like
 * ChartReadout. Put it beside the chart in a `relative` wrapper; `half`
 * sits it at the foot of a half ring.
 */
export function ChartRadialReadout({
  value,
  unit,
  label,
  half = false,
  size = "md",
  className,
}: {
  value: React.ReactNode
  unit?: React.ReactNode
  label?: React.ReactNode
  half?: boolean
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div
      data-slot="chart-radial-readout"
      className={cn("pointer-events-none absolute inset-x-0 grid justify-items-center text-center", half ? "bottom-[6%]" : "inset-y-0 content-center", className)}
    >
      <div className="flex items-baseline gap-1">
        <span className={cn("font-[460] tracking-[-0.03em] text-foreground tabular-nums", size === "sm" ? "type-display-sm" : "type-display-md")}>{value}</span>
        {unit != null && <span className="type-title-md font-[620] text-foreground">{unit}</span>}
      </div>
      {label != null && <div className="type-body-md text-muted-foreground">{label}</div>}
    </div>
  )
}
/* end radial helpers */

/* ================================================================== */
/* TOOLTIP HELPERS                                                  */
/* Owned by the tooltip gallery. Add helpers below with `export` inline.   */
/* ================================================================== */

/**
 * A tooltip row for `formatter`: marker (a dot, or an icon in a tonal chip), the series label and the value with
 * its unit in muted text. Use inside ChartTooltipContent's `formatter`, which replaces the whole row.
 */
export function ChartTooltipRow({
  color,
  icon,
  label,
  value,
  unit,
}: {
  color?: string
  /** A node (an `<Icon />`) shown in a small round chip tinted with `color`, instead of the dot. */
  icon?: React.ReactNode
  label: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
}) {
  return (
    <div data-slot="chart-tooltip-row" className="flex w-full items-center gap-2">
      {icon ? (
        <span
          aria-hidden
          className="grid size-6 shrink-0 place-items-center rounded-full [--icon-size:1rem]"
          style={{ background: `color-mix(in oklab, ${color} 28%, transparent)`, color: `color-mix(in oklab, ${color} 55%, var(--inverse-foreground))` }}
        >
          {icon}
        </span>
      ) : (
        <span aria-hidden className="size-2.5 shrink-0 rounded-full ring-2 ring-inverse-foreground/20" style={{ background: color }} />
      )}
      <span className="type-label-md text-muted-foreground">{label}</span>
      <span className="ml-auto flex items-baseline gap-1 pl-3 type-label-md font-semibold text-foreground tabular-nums">
        {value}
        {unit && <span className="text-[0.6875rem] font-medium text-muted-foreground">{unit}</span>}
      </span>
    </div>
  )
}

/** A total row under the series rows: a hairline divider, bold label and value. Render after the last series row. */
export function ChartTooltipTotal({ label = "Total", value, unit }: { label?: React.ReactNode; value: React.ReactNode; unit?: React.ReactNode }) {
  return (
    <div data-slot="chart-tooltip-total" className="mt-0.5 flex w-full basis-full items-baseline gap-2 border-t border-inverse-foreground/15 pt-2">
      <span className="type-label-md font-semibold text-foreground">{label}</span>
      <span className="ml-auto flex items-baseline gap-1 type-title-sm font-semibold text-foreground tabular-nums">
        {value}
        {unit && <span className="text-[0.6875rem] font-medium text-muted-foreground">{unit}</span>}
      </span>
    </div>
  )
}

/**
 * Builds a `formatter` for ChartTooltipContent that renders a ChartTooltipRow per series (label from the config,
 * color from the bar), `unit` after each value, `icons` (series key to node) in a chip, and optionally a total row
 * after the last series (the sum of the config keys that hold numbers in the data row).
 *
 *   <ChartTooltipContent formatter={chartTooltipFormatter(config, { unit: "min", total: true })} />
 */
export function chartTooltipFormatter(
  config: ChartConfig,
  { unit, icons, total, totalLabel = "Total" }: { unit?: string; icons?: Record<string, React.ReactNode>; total?: boolean; totalLabel?: React.ReactNode } = {}
) {
  return (value: unknown, name: unknown, item: { color?: string }, index: number, row: unknown) => {
    const key = String(name)
    const data = (row ?? {}) as Record<string, unknown>
    const keys = Object.keys(config).filter((k) => typeof data[k] === "number")
    const sum = keys.reduce((s, k) => s + (data[k] as number), 0)
    return (
      <>
        <ChartTooltipRow
          color={item.color}
          icon={icons?.[key]}
          label={config[key]?.label ?? key}
          value={typeof value === "number" ? value.toLocaleString() : String(value)}
          unit={unit}
        />
        {total && index === keys.length - 1 && <ChartTooltipTotal label={totalLabel} value={sum.toLocaleString()} unit={unit} />}
      </>
    )
  }
}

/* end tooltip helpers */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartGradient,
  useChart,
  useChartAnimation,
  useSeriesVisibility,
  chartDot,
  chartActiveDot,
  chartLine,
  chartGoalLine,
  chartZoneLine,
  chartFocusLine,
  chartFocusDot,
  chartPillBar,
  chartTicks,
  chartTrack,
  chartTrackColor,
  chartTintColor,
  chartDimColor,
  ChartZoneGradient,
  ChartReadout,
  ChartRings,
  ChartStages,
  useChartFocus,
  type ChartRing,
  type ChartStage,
}
