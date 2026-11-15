"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import { GradientAreaDemo, InteractiveAreaDemo, SingleAreaDemo, StackedAreaDemo, stackedConfigs } from "./demos"

export default function AreaChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Area charts">
        Every shadcn area chart in the Material style: a 3px round line over a soft gradient, a quiet value axis on the
        right, and one point in focus marked by a line and a ring. Single series charts read out the focused value above
        the plot; stacked charts keep the inverse tooltip and replace the cursor band with the focus line.
      </PageHeader>
      <ChartNav />

      <Section
        title="Default, Linear and Step"
        description="One series, three curves: monotone (Default), linear and step. Hover to preview a month, click or use the arrow keys to select one. The dotted line on Default is the average, called out on the axis."
      >
        <Preview className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <SingleAreaDemo id="default" title="Area Chart" description="Showing total visitors for the last 6 months" average />
          <SingleAreaDemo id="linear" title="Area Chart - Linear" description="Straight segments between months" curve="linear" />
          <SingleAreaDemo id="step" title="Area Chart - Step" description="The value holds until the next month" curve="step" />
        </Preview>
      </Section>

      <Section title="Gradient" description="Two overlapping series with a fade from the line to the baseline. The readout follows desktop and names mobile underneath.">
        <Preview className="block max-w-xl">
          <GradientAreaDemo />
        </Preview>
      </Section>

      <Section
        title="Stacked and Legend"
        description="Stacked series use the inverse tooltip with the focus line in place of a cursor band. Legend adds the chips under the plot."
      >
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <StackedAreaDemo id="stacked" title="Area Chart - Stacked" description="Desktop and mobile visitors, stacked" />
          <StackedAreaDemo id="legend" title="Area Chart - Legend" description="The same series with a legend" legend />
        </Preview>
      </Section>

      <Section
        title="Stacked Expanded and Icons"
        description="Expanded normalizes every month to 100% so the axis reads as share; the tooltip still reports the real counts. Icons put a Material Symbol in the legend and tooltip for each series."
      >
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <StackedAreaDemo id="expanded" title="Area Chart - Stacked Expanded" description="Share of visitors by device, desktop, mobile and other" config={stackedConfigs.TRIO} expand legend />
          <StackedAreaDemo id="icons" title="Area Chart - Icons" description="Device icons from the chart config" config={stackedConfigs.ICONS} legend />
        </Preview>
      </Section>

      <Section title="Axes" description="Both axes shown: month labels with short round ticks along the bottom, the value axis on the right, and a grid in both directions.">
        <Preview className="block max-w-xl">
          <StackedAreaDemo id="axes" title="Area Chart - Axes" description="Desktop and mobile visitors with both axes" axes />
        </Preview>
      </Section>

      <Section
        title="Interactive"
        description="The connected period switcher changes the range, the readout totals the visible series for the range or for the focused day, and the legend chips switch series on and off."
      >
        <Preview className="block max-w-3xl">
          <InteractiveAreaDemo />
        </Preview>
      </Section>
    </>
  )
}
