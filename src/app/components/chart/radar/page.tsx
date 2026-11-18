"use client"

import * as React from "react"
import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChipGroup, FilterChip } from "@/registry/nelumbo/ui/chip"
import { ChartNav } from "../chart-nav"
import { RadarCustomLabel, RadarDefault, RadarGridDemo, RadarLegend, RadarLinesOnly, RadarRadiusAxis, gridMeta, type GridKind } from "./demos"

const grid = "grid items-start gap-4 lg:grid-cols-2"

export default function RadarChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Radar charts">
        Polygons with a tonal fill, a 3px round stroke and dots ringed in the card. The grid is dotted round hairlines, or tonal rings
        where the variant is filled. Every shadcn variant, drawn in Material 3 Expressive.
      </PageHeader>
      <ChartNav />

      <Section
        title="Default and grids"
        description="The focused axis gets a spoke and a ring, and the readout above follows it: hover an axis, click or tap to select, or tab to the chart and use the arrow keys (Escape goes back to the summary). Dotted polygon rings are the default grid; the others change the rings' shape, drop the spokes, or put a tone behind the polygon."
      >
        <Preview className={grid}>
          <RadarDefault />
          <GridPicker />
        </Preview>
      </Section>

      <Section title="Lines Only and Custom Label" description="Lines Only drops the fill for two outlines; Custom Label puts each value under its axis name.">
        <Preview className={grid}>
          <RadarLinesOnly />
          <RadarCustomLabel />
        </Preview>
      </Section>

      <Section title="Legend and Radius Axis" description="Two series overlap in translucent tones. The legend chips toggle a series and can carry Material Symbols; the radius axis can be labelled along one spoke.">
        <Preview className={grid}>
          <RadarLegend />
          <RadarRadiusAxis />
        </Preview>
      </Section>
    </>
  )
}

function GridPicker() {
  const [kind, setKind] = React.useState<GridKind>("polygon")
  return (
    <RadarGridDemo
      kind={kind}
      control={
        <ChipGroup aria-label="Grid">
          {(Object.keys(gridMeta) as GridKind[]).map((k) => (
            <FilterChip key={k} selected={kind === k} onSelectedChange={() => setKind(k)}>
              {gridMeta[k].short}
            </FilterChip>
          ))}
        </ChipGroup>
      }
    />
  )
}
