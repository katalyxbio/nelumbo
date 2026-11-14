"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/registry/velvet/ui/icon"
import { Button } from "@/registry/velvet/ui/button"
import { cn } from "@/lib/utils"
import { SEED_PRESETS, useStudio } from "./studio"

const NAV = [
  { group: "Foundations", items: [{ href: "/", label: "Color, depth & motion" }] },
  {
    group: "Components",
    items: [
      { href: "/components/button", label: "Button" },
      { href: "/components/icon-button", label: "Icon Button" },
      { label: "Input", soon: true },
      { label: "Card", soon: true },
      { label: "Switch", soon: true },
      { label: "Chip", soon: true, isNew: true },
      { label: "Segmented Control", soon: true, isNew: true },
    ],
  },
]

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-border px-5 py-5 md:sticky md:top-0 md:h-dvh md:w-64 md:border-r md:border-b-0 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring">
            <span className="size-6 rounded-[0.55rem] bg-primary bg-linear-to-br from-white/25 to-transparent shadow-e1 inset-shadow-highlight" />
            <span className="type-title-md">Velvet</span>
          </Link>
          <ThemeToggle />
        </div>
        <SeedPicker />
        <nav className="flex flex-col gap-5 max-md:hidden">
          {NAV.map((g) => (
            <div key={g.group} className="flex flex-col gap-1">
              <p className="px-3 pb-1 type-label-sm text-muted-foreground uppercase">{g.group}</p>
              {g.items.map((item) =>
                "href" in item && item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "state-layer rounded-full px-3 py-2 type-label-lg outline-none focus-visible:outline-2 focus-visible:outline-ring",
                      pathname === item.href ? "bg-secondary text-secondary-foreground" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span key={item.label} className="flex items-center justify-between px-3 py-2 type-label-lg text-muted-foreground">
                    {item.label}
                    {"isNew" in item && item.isNew ? (
                      <span className="rounded-full bg-tertiary-container px-1.5 py-0.5 type-label-sm text-tertiary-container-foreground">new</span>
                    ) : (
                      <span className="type-label-sm text-muted-foreground">soon</span>
                    )}
                  </span>
                )
              )}
            </div>
          ))}
        </nav>
        <nav className="flex gap-2 md:hidden">
          <Button asChild size="sm" variant={pathname === "/" ? "secondary" : "ghost"}>
            <Link href="/">Foundations</Link>
          </Button>
          <Button asChild size="sm" variant={pathname === "/components/button" ? "secondary" : "ghost"}>
            <Link href="/components/button">Button</Link>
          </Button>
          <Button asChild size="sm" variant={pathname === "/components/icon-button" ? "secondary" : "ghost"}>
            <Link href="/components/icon-button">Icon Button</Link>
          </Button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-12 md:py-12">{children}</main>
    </div>
  )
}

function ThemeToggle() {
  const { dark, setDark } = useStudio()
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Icon name="light_mode" /> : <Icon name="dark_mode" />}
    </Button>
  )
}

function SeedPicker() {
  const { seed, setSeed, vibrance, setVibrance } = useStudio()
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-3.5 dark:bg-surface-container">
      <div className="flex items-center justify-between">
        <label htmlFor="seed" className="type-label-md text-muted-foreground">Seed color</label>
        <div className="flex items-center gap-2">
          <code className="font-mono type-label-sm text-muted-foreground uppercase">{seed}</code>
          <input
            id="seed"
            type="color"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="size-6 cursor-pointer appearance-none overflow-hidden rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          />
        </div>
      </div>
      <div className="flex justify-between">
        {SEED_PRESETS.map((p) => (
          <button
            key={p.hex}
            type="button"
            title={p.name}
            aria-label={`Use ${p.name} seed`}
            aria-pressed={seed === p.hex}
            onClick={() => setSeed(p.hex)}
            className="tactile size-7 cursor-pointer rounded-full shadow-e1 outline-none ring-offset-2 ring-offset-surface-container-low inset-shadow-highlight focus-visible:outline-2 focus-visible:outline-ring aria-pressed:ring-2 aria-pressed:ring-foreground/70"
            style={{ backgroundColor: p.hex }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between type-label-md text-muted-foreground">
          <label htmlFor="vibrance">Vibrance</label>
          <span className="tabular-nums">{vibrance.toFixed(2)}</span>
        </div>
        <input
          id="vibrance"
          type="range"
          min={0.5}
          max={1.4}
          step={0.05}
          value={vibrance}
          onChange={(e) => setVibrance(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </div>
  )
}
