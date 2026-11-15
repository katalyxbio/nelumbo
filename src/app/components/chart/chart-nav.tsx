"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export const chartPages = [
  { href: "/components/chart", label: "Overview" },
  { href: "/components/chart/area", label: "Area" },
  { href: "/components/chart/bar", label: "Bar" },
  { href: "/components/chart/line", label: "Line" },
  { href: "/components/chart/pie", label: "Pie" },
  { href: "/components/chart/radar", label: "Radar" },
  { href: "/components/chart/radial", label: "Radial" },
  { href: "/components/chart/tooltip", label: "Tooltip" },
]

/** The chart gallery's page switcher: a row of chips, the current page inverse. */
export function ChartNav() {
  const path = usePathname()
  return (
    <nav aria-label="Chart types" className="-mx-1 mb-10 flex flex-wrap gap-1.5 px-1">
      {chartPages.map((p) => {
        const on = path === p.href
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "state-layer tactile inline-flex h-9 items-center rounded-full px-4 type-label-lg outline-none transition-[background-color,color,border-radius] duration-300 ease-(--ease-spring) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              on ? "bg-inverse-surface text-inverse-foreground" : "rounded-[0.75rem] bg-surface-container-high text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </Link>
        )
      })}
    </nav>
  )
}
