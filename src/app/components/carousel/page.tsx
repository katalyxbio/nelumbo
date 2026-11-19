"use client"

import * as React from "react"
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/registry/nelumbo/ui/carousel"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Avatar } from "@/registry/nelumbo/ui/avatar"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { PEOPLE } from "@/components/docs/people"

// Placeholder "photos": tonal gradients from the palette, no external images.
const SCENES: { title: string; place: string; icon: IconName; hue: string; hue2: string }[] = [
  { title: "Glacier lake", place: "Iceland", icon: "landscape", hue: "blue", hue2: "cyan" },
  { title: "Old town at dusk", place: "Lisbon", icon: "location_city", hue: "orange", hue2: "pink" },
  { title: "Tea terraces", place: "Fujian", icon: "forest", hue: "green", hue2: "amber" },
  { title: "Night market", place: "Taipei", icon: "storefront", hue: "purple", hue2: "pink" },
  { title: "Salt flats", place: "Bolivia", icon: "wb_sunny", hue: "amber", hue2: "orange" },
  { title: "Harbour fog", place: "Maine", icon: "sailing", hue: "cyan", hue2: "blue" },
  { title: "Desert road", place: "Namibia", icon: "directions_car", hue: "red", hue2: "amber" },
  { title: "Bamboo grove", place: "Kyoto", icon: "park", hue: "green", hue2: "cyan" },
]

function art(s: (typeof SCENES)[number]): React.CSSProperties {
  return {
    backgroundImage: `radial-gradient(120% 90% at 20% 10%, var(--${s.hue2}-container) 0%, transparent 60%), linear-gradient(160deg, var(--${s.hue}-container), var(--${s.hue2}-container))`,
    color: `var(--${s.hue}-container-foreground)`,
  }
}

/** A photo that fills its carousel card. The label fades in as the card grows. */
function Photo({ scene, caption = true }: { scene: (typeof SCENES)[number]; caption?: boolean }) {
  return (
    <div className="relative size-full min-w-0" style={art(scene)}>
      <Icon name={scene.icon} fill size={64} className="absolute top-[calc(50%-32px)] left-[calc(50%-32px)] opacity-30" />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 truncate p-5" style={{ opacity: "calc((var(--carousel-p, 1) - 0.6) * 2.5)" }}>
          <p className="type-title-md">{scene.title}</p>
          <p className="type-body-sm opacity-80">{scene.place}</p>
        </div>
      )}
    </div>
  )
}


export default function CarouselPage() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(1)
  const count = api?.scrollSnapList().length ?? 0
  React.useEffect(() => {
    if (!api) return
    const on = () => setCurrent(api.selectedScrollSnap() + 1)
    on()
    api.on("select", on)
    api.on("reInit", on)
    return () => {
      api.off("select", on)
      api.off("reInit", on)
    }
  }, [api])

  return (
    <>
      <PageHeader eyebrow="Component 52" title="Carousel">
        A row of things to browse by swiping, dragging or pressing the arrows: photos, cards, featured content.
        Multi-browse and hero layouts, from Material 3, show one large item and let the rest shrink to a peek, so
        you can see there is more and still read what is in front of you.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/carousel`}</Code>
      </Section>

      <Section
        title="Multi-browse"
        description='layout="multi-browse": one large item, a medium one and small ones at the edge. The large item shrinks as it scrolls off while the next one grows, following your finger. Drag, swipe, press the arrows or use the dots.'
      >
        <Preview className="block">
          <Carousel layout="multi-browse" setApi={setApi} aria-label="Photos" className="w-full">
            <CarouselContent className="h-72 sm:h-80">
              {SCENES.map((s) => (
                <CarouselItem key={s.title}>
                  <Photo scene={s} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <CarouselDots className="mt-3" />
          </Carousel>
          <p className="mt-2 text-center type-label-md text-muted-foreground" aria-live="polite">
            {count ? `Position ${current} of ${count}` : " "}
          </p>
        </Preview>
      </Section>

      <Section title="Hero" description='layout="hero": one large item and a small peek of the next.'>
        <Preview className="block">
          <Carousel layout="hero" aria-label="Featured trips" className="w-full">
            <CarouselContent className="h-64 sm:h-72">
              {SCENES.slice(0, 5).map((s) => (
                <CarouselItem key={s.title}>
                  <Photo scene={s} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <CarouselDots className="mt-3" />
          </Carousel>
        </Preview>
      </Section>

      <Section
        title="Uncontained"
        description='layout="uncontained": equal items that run off the edge. Item width comes from a basis class on CarouselItem (basis-[40%] by default).'
      >
        <Preview className="block">
          <Carousel layout="uncontained" opts={{ align: "start" }} aria-label="People" className="w-full">
            <CarouselContent>
              {PEOPLE.map((p) => (
                <CarouselItem key={p.name} className="basis-[62%] sm:basis-[34%] lg:basis-[26%]">
                  <div className="flex h-full flex-col items-center gap-3 bg-surface-container-high p-6 text-center">
                    <Avatar src={p.src} name={p.name} color="auto" size="xl" />
                    <div>
                      <p className="type-title-sm">{p.name}</p>
                      <p className="type-body-sm text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Preview>
      </Section>

      <Section
        title="Full and vertical"
        description='The default layout is "full": one item at a time, like shadcn. Vertical carousels need a height on CarouselContent. Arrow keys follow the axis.'
      >
        <Preview className="items-start justify-center gap-10">
          <Carousel className="w-full max-w-xs" aria-label="Full">
            <CarouselContent>
              {SCENES.slice(0, 4).map((s) => (
                <CarouselItem key={s.title}>
                  <div className="h-56 overflow-hidden rounded-[28px]">
                    <Photo scene={s} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <CarouselDots className="mt-3" />
          </Carousel>

          <Carousel orientation="vertical" opts={{ align: "start" }} className="w-full max-w-xs" aria-label="Vertical">
            <CarouselContent className="h-56">
              {SCENES.slice(4, 8).map((s) => (
                <CarouselItem key={s.title}>
                  <div className="h-56 overflow-hidden rounded-[28px] pt-0">
                    <Photo scene={s} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Preview>
      </Section>

      <Section
        title="Vertical multi-browse"
        description="Multi-browse and hero work on the vertical axis too."
      >
        <Preview className="justify-center">
          <Carousel layout="multi-browse" orientation="vertical" aria-label="Places" className="w-full max-w-xs">
            <CarouselContent className="h-80">
              {SCENES.map((s) => (
                <CarouselItem key={s.title}>
                  <Photo scene={s} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from "@/components/ui/carousel"

// shadcn's API
<Carousel className="w-full max-w-xs">
  <CarouselContent>
    <CarouselItem>…</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>

// Nelumbo: Material 3 layouts and a dot indicator
<Carousel layout="multi-browse" aria-label="Photos">
  <CarouselContent className="h-72">
    <CarouselItem>
      <Photo className="h-full w-full" />
    </CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots className="mt-3" />
</Carousel>

// Fade a label in as the card grows
<p className="truncate" style={{ opacity: "calc((var(--carousel-p) - 0.6) * 2.5)" }}>Glacier lake</p>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Embla's own props (opts, plugins, setApi, orientation) work as in shadcn"
          rows={[
            ["Carousel layout", '"full" | "uncontained" | "multi-browse" | "hero"', '"full"', "How items are sized. Full is shadcn's behaviour"],
            ["Carousel orientation", '"horizontal" | "vertical"', '"horizontal"', "Vertical needs a height on CarouselContent"],
            ["Carousel opts / plugins / setApi", "Embla options / plugins / callback", "", "Passed through; setApi hands you the Embla API"],
            ["CarouselContent className", "string", "", "Multi-browse and hero use h-64 unless you set a height"],
            ["CarouselItem className", "string", "", "Uncontained: set the width with basis-*"],
            ["CarouselPrevious / Next", "IconButton props", "", "Tonal icon buttons over the edges; hidden at the ends. label overrides the accessible name"],
            ["CarouselDots", "div props", "", "One dot per scroll position; the active dot stretches into a pill"],
            ["--carousel-p", "CSS variable", "", "Set on each multi-browse and hero card: 0 small to 1 large"],
          ]}
        />
      </Section>
    </>
  )
}
