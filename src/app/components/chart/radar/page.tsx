"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import {
  RadarCustomLabel,
  RadarDefault,
  RadarDots,
  RadarGridDemo,
  RadarIcons,
  RadarLegend,
  RadarLinesOnly,
  RadarMultiple,
  RadarRadiusAxis,
} from "./demos"

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
        title="Default"
        description="The focused axis gets a spoke and a ring, and the readout above follows it. Hover an axis, click or tap to select, or tab to the chart and use the arrow keys (Escape goes back to the summary)."
      >
        <Preview className="block max-w-xl">
          <RadarDefault />
        </Preview>
      </Section>

      <Section title="Dots, Lines Only and Custom Label" description="Resting dots are ringed in the surface. Lines Only drops the fill for two outlines; Custom Label puts each value under its axis name.">
        <Preview className={grid}>
          <RadarDots />
          <RadarLinesOnly />
          <RadarCustomLabel />
        </Preview>
      </Section>

      <Section title="Grids" description="Dotted polygon rings are the default. Custom, None, Circle, Circle No Lines, Circle Filled and Filled change the shape and the tone behind the polygon.">
        <Preview className={grid}>
          <RadarGridDemo kind="custom" />
          <RadarGridDemo kind="none" />
          <RadarGridDemo kind="circle" />
          <RadarGridDemo kind="circle-no-lines" />
          <RadarGridDemo kind="circle-filled" />
          <RadarGridDemo kind="filled" />
        </Preview>
      </Section>

      <Section title="Multiple, Legend, Icons and Radius Axis" description="Two series overlap in translucent tones. The legend chips can toggle a series, carry Material Symbols, and the radius axis can be labelled along one spoke.">
        <Preview className={grid}>
          <RadarMultiple />
          <RadarLegend />
          <RadarIcons />
          <RadarRadiusAxis />
        </Preview>
      </Section>
    </>
  )
}
