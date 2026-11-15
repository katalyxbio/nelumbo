"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import { RadialGaugeDemo, RadialGridDemo, RadialLabelDemo, RadialShapeDemo, RadialSimpleDemo, RadialStackedDemo, RadialTextDemo } from "./demos"

export default function RadialChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Radial charts">
        Radial bars on tonal tracks with round caps. Each bar and its track are drawn by one shape (chartRadialShape), the
        number in the middle uses the same display type as the readout, and labels are pill chips.
      </PageHeader>
      <ChartNav />

      <Section title="Simple and Label" description="Bars start at 12 o'clock on a track in the same hue. The label variant puts the name in an inverse chip at the start of each bar.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialSimpleDemo />
          <RadialLabelDemo />
        </Preview>
      </Section>

      <Section title="Grid and Text" description="A dotted circular grid replaces the tracks. With one bar, the middle carries the number.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialGridDemo />
          <RadialTextDemo />
        </Preview>
      </Section>

      <Section title="Shape and Stacked" description="A single progress ring with a thick tonal track, and two series stacked in a half ring with the total in the middle.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialShapeDemo />
          <RadialStackedDemo />
        </Preview>
      </Section>

      <Section title="Gauge" description="A half ring cut into heart rate zones. The reading fills its zones in full color; the rest of each zone stays tonal. The legend counts dots for intensity.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialGaugeDemo />
        </Preview>
      </Section>
    </>
  )
}
