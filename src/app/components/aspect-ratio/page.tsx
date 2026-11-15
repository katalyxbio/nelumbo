"use client"

import * as React from "react"
import { AspectRatio } from "@/registry/velvet/ui/aspect-ratio"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function Media({ ratio, label, radius }: { ratio: number; label: string; radius: string }) {
  return (
    <div className="flex w-full max-w-64 flex-col gap-2">
      <AspectRatio ratio={ratio} className={`grid place-items-center bg-linear-to-br from-brand-container to-surface-container-highest ${radius}`}>
        <Icon name="landscape" size={32} className="text-brand-container-foreground" />
      </AspectRatio>
      <span className="type-label-md text-muted-foreground">{label}</span>
    </div>
  )
}

export default function AspectRatioPage() {
  return (
    <>
      <PageHeader eyebrow="Component 59" title="Aspect Ratio">
        A box that keeps its width-to-height ratio at any width. It is shadcn&apos;s AspectRatio, unchanged, and
        draws nothing itself: round the media with Velvet&apos;s radius.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/aspect-ratio`}</Code>
      </Section>

      <Section title="Ratios" description="Pass ratio as width over height. Photos and video use 16 / 9, square thumbnails 1, portraits 3 / 4.">
        <Preview className="items-start gap-6">
          <Media ratio={16 / 9} label="16 / 9" radius="rounded-xl" />
          <Media ratio={1} label="1 / 1" radius="rounded-xl" />
          <Media ratio={3 / 4} label="3 / 4" radius="rounded-xl" />
        </Preview>
      </Section>

      <Section title="Velvet radius" description="rounded-xl suits photos and cards, rounded-2xl large hero images, rounded-full an avatar-like crop. Add overflow-hidden when the box holds an image.">
        <Preview className="items-start gap-6">
          <Media ratio={4 / 3} label="rounded-lg" radius="rounded-lg" />
          <Media ratio={4 / 3} label="rounded-2xl" radius="rounded-2xl" />
          <Media ratio={1} label="rounded-full" radius="rounded-full" />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`<AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-surface-container-high">
  <img src="/cover.jpg" alt="" className="size-full object-cover" />
</AspectRatio>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable rows={[["ratio", "number", "1", "Width divided by height."], ["asChild", "boolean", "false", "Render the child element as the box."]]} />
      </Section>
    </>
  )
}
