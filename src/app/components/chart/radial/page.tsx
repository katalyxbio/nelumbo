"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import { RadialGaugeDemo, RadialGridDemo, RadialLabelDemo, RadialShapeDemo, RadialSimpleDemo, RadialStackedDemo, RadialTextDemo } from "./demos"

export default function RadialChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Radial charts">
        Radial bars on tonal tracks with round caps. Each bar and its track are drawn by one shape (chartRadialShape), the
        number in the middle uses the same display type as the readout, and labels are pill chips. The demos show sequencing
        run QC, a plate being imaged and an incubator&apos;s CO2, with illustrative numbers.
      </PageHeader>
      <ChartNav />

      <Section title="Simple and Label" description="Bars start at 12 o'clock on a track in the same hue. The label variant puts the name in an inverse chip at the start of each bar. Here, one exome library's QC: bases at Q30 or better, reads aligned, reads on target, target covered 20x or deeper, and clusters passing filter (PF).">
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

      <Section title="Shape and Stacked" description="A single progress ring with a thick tonal track, and two parts of one quantity stacked in a half ring, in two tones of one color, with the total in the middle.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialShapeDemo />
          <RadialStackedDemo />
        </Preview>
      </Section>

      <Section title="Gauge" description="A half ring cut into bands around a setpoint. The reading fills the bands up to it in full color; the rest of each band stays tonal, and the readout names the band, so it reads without color.">
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <RadialGaugeDemo />
        </Preview>
      </Section>
    </>
  )
}
