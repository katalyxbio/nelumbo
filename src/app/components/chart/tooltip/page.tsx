"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import {
  AdvancedDemo,
  CustomLabelDemo,
  DefaultTooltipDemo,
  FormatterDemo,
  IconsDemo,
  LabelFormatterDemo,
  LineIndicatorDemo,
  NoIndicatorDemo,
  NoLabelDemo,
} from "./demos"

const grid = "grid items-start gap-4 md:grid-cols-2"

export default function TooltipChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Tooltip charts">
        ChartTooltipContent on the inverse surface, over a week of DNA and RNA extractions (illustrative), shown open on the focused day so each variant reads without hovering. Hover or tap
        a day, or tab to a chart and use the arrow keys: the tooltip glides to it and a focus line replaces the gray cursor band.
      </PageHeader>
      <ChartNav />

      <Section title="Indicators" description="The marker beside each value: a dot (default), a line, or none. hideLabel drops the heading.">
        <Preview className={grid}>
          <DefaultTooltipDemo />
          <LineIndicatorDemo />
          <NoIndicatorDemo />
          <NoLabelDemo />
        </Preview>
      </Section>

      <Section title="Labels" description="The heading is the day by default. Take it from a config entry, or format it.">
        <Preview className={grid}>
          <CustomLabelDemo />
          <LabelFormatterDemo />
        </Preview>
      </Section>

      <Section
        title="Formatters"
        description="formatter replaces each row. chartTooltipFormatter(config, { unit, icons, total }) builds Material rows with units, icon chips and a total."
      >
        <Preview className={grid}>
          <FormatterDemo />
          <IconsDemo />
          <div className="md:col-span-2">
            <AdvancedDemo />
          </div>
        </Preview>
      </Section>
    </>
  )
}
