"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

/**
 * Velvet Chart (built on Recharts 2.15)
 *
 * Drop-in for shadcn's Chart: ChartContainer, ChartTooltip,
 * ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle,
 * `useChart` and the `ChartConfig` type keep their names and props. Velvet
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
 *   color take the next entry of `chartColors`, Velvet's categorical accent
 *   roles in a fixed order (blue, orange, green, purple, pink, cyan, amber,
 *   red). They are contrast checked at 3:1 against the card in both themes.
 *   `aria-label` names the chart for screen readers (it becomes role="img"
 *   on the plot). Give every chart one that states what it shows.
 * - Interactive legend (a Velvet addition): pass `hiddenKeys` and
 *   `onToggle` (or use `useSeriesVisibility`) to ChartLegendContent and
 *   the chips turn series on and off. Set `hide` on the series.
 * - `useChartAnimation()` returns the animation props (duration, easing,
 *   and none for reduced motion) to spread on Bar, Area, Line, Pie and RadialBar.
 * - Helpers: `chartBarRadius`, `chartDot(key)`, `chartActiveDot(key)` (a dot
 *   with a surface ring) and `ChartGradient` (area fill).
 */

/** Velvet's categorical accent roles, in the order series should use them. */
export const chartColorNames = ["blue", "orange", "green", "purple", "pink", "cyan", "amber", "red"] as const
export const chartColors = chartColorNames.map((n) => `var(--${n})`)

/** Rounded top for vertical bars (square at the baseline). */
export const chartBarRadius: [number, number, number, number] = [6, 6, 0, 0]
/** Rounded end for horizontal bars. */
export const chartBarRadiusHorizontal: [number, number, number, number] = [0, 6, 6, 0]

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
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
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
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
      if (svg.getAttribute("aria-label") !== ariaLabel) svg.setAttribute("aria-label", ariaLabel)
      if (!svg.hasAttribute("tabindex") && svg.getAttribute("role") !== "img") svg.setAttribute("role", "img")
      // the plot is one image: Recharts' own per-shape roles would need names of their own
      svg.querySelectorAll("[role=img]").forEach((n) => n !== svg && n.removeAttribute("role"))
    }
    apply()
    const mo = new MutationObserver(apply)
    mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["role"] })
    return () => mo.disconnect()
  }, [ariaLabel])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "relative flex aspect-video w-full min-w-0 justify-center overflow-visible [--chart-surface:var(--card)] type-label-sm",
          // axes: muted label-sm, no strokes
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-[0.75rem] [&_.recharts-cartesian-axis-tick_text]:font-[520] [&_.recharts-cartesian-axis-tick_text]:tracking-[0.02em]",
          "[&_.recharts-polar-angle-axis-tick_text]:fill-muted-foreground [&_.recharts-polar-radius-axis-tick_text]:fill-muted-foreground",
          // grid: very faint hairlines
          "[&_.recharts-cartesian-grid_line]:stroke-outline-variant/60 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-outline-variant/60",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-outline-variant/60",
          // tooltip cursor: a soft band for bars, a hairline for lines
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-foreground/6",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-outline [&_.recharts-curve.recharts-tooltip-cursor]:[stroke-dasharray:2_4] [&_.recharts-curve.recharts-tooltip-cursor]:[stroke-linecap:round]",
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
        "grid min-w-36 max-w-64 items-start gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-foreground shadow-e2",
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
                          className={cn("shrink-0 rounded-[3px] bg-(--color-bg)", {
                            "size-2.5": indicator === "dot",
                            "w-1 rounded-full": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent border-(--color-bg)": indicator === "dashed",
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
}: Omit<React.ComponentProps<"div">, "onToggle"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
    /** Series keys currently switched off (interactive legend). */
    hiddenKeys?: string[]
    /** Makes the chips toggle buttons. Called with the series key. */
    onToggle?: (key: string) => void
  }) {
  const { config } = useChart()
  if (!payload?.length) return null
  const interactive = !!onToggle

  return (
    <div
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const off = hiddenKeys?.includes(key)
          const swatch = !hideIcon && (
            <span
              aria-hidden
              className={cn("size-2.5 shrink-0 rounded-[3px] transition-[background-color,box-shadow] duration-200", off && "bg-transparent!")}
              style={{ backgroundColor: item.color, boxShadow: off ? `inset 0 0 0 1.5px ${item.color}` : undefined }}
            />
          )
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
}
