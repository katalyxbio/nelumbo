"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/registry/velvet/ui/icon"
import { Button } from "@/registry/velvet/ui/button"
import { cn } from "@/lib/utils"
import { ACCENTS, ACCENT_NAMES } from "@/lib/velvet/scheme"
import { ICON_STYLES, NEUTRALS, useStudio } from "./studio"

type NavItem = { label: string; href?: string; soon?: boolean; isNew?: boolean }

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Foundations", items: [{ href: "/", label: "Color, depth & motion" }] },
  {
    group: "Buttons",
    items: [
      { href: "/components/button", label: "Button" },
      { href: "/components/icon-button", label: "Icon Button" },
      { href: "/components/segmented-button", label: "Segmented Button" },
      { href: "/components/button-group", label: "Button Group" },
      { href: "/components/split-button", label: "Split Button" },
      { href: "/components/fab", label: "FAB" },
    ],
  },
  {
    group: "Components",
    items: [
      { href: "/components/input", label: "Input" },
      { href: "/components/textarea", label: "Textarea" },
      { label: "Card", soon: true },
      { label: "Switch", soon: true },
      { label: "Chip", soon: true, isNew: true },
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
        <ThemePanel />
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
                      <span className="rounded-full bg-brand-container px-1.5 py-0.5 type-label-sm text-brand-container-foreground">new</span>
                    ) : (
                      <span className="type-label-sm text-muted-foreground">soon</span>
                    )}
                  </span>
                )
              )}
            </div>
          ))}
        </nav>
        <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 md:hidden">
          {NAV.flatMap((g) => g.items)
            .filter((item) => item.href)
            .map((item) => (
              <Button key={item.href} asChild size="sm" variant={pathname === item.href ? "secondary" : "ghost"}>
                <Link href={item.href!}>{item.label}</Link>
              </Button>
            ))}
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

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  const id = `choice-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="type-label-md text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-labelledby={id} className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-surface-container-high p-1 dark:bg-surface-container-highest">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className="state-layer tactile cursor-pointer rounded-full py-1.5 type-label-sm text-muted-foreground capitalize outline-none focus-visible:outline-2 focus-visible:outline-ring aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-e1"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function ThemePanel() {
  const { brand, setBrand, neutral, setNeutral, vibrance, setVibrance, iconStyle, setIconStyle } = useStudio()
  const custom = !(brand in ACCENTS)
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-3.5 dark:bg-surface-container">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="type-label-md text-muted-foreground">Brand accent</span>
          <span className="type-label-sm text-foreground capitalize">{custom ? brand.toUpperCase() : brand}</span>
        </div>
        <div className="grid grid-cols-9 gap-1.5">
          {ACCENT_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              title={n}
              aria-label={`Use ${n} as brand accent`}
              aria-pressed={brand === n}
              onClick={() => setBrand(n)}
              className="tactile aspect-square cursor-pointer rounded-full bg-(--sw) outline-none ring-offset-2 ring-offset-surface-container-low inset-shadow-highlight focus-visible:outline-2 focus-visible:outline-ring aria-pressed:ring-2 aria-pressed:ring-foreground dark:ring-offset-surface-container"
              style={{ ["--sw" as string]: `var(--${n})` }}
            />
          ))}
          <label
            title="Custom color"
            className="relative grid aspect-square cursor-pointer place-items-center rounded-full border border-dashed border-outline text-muted-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring"
            style={custom ? { background: brand, borderStyle: "solid" } : undefined}
          >
            {!custom && <Icon name="add" size={16} />}
            <input
              id="brand-custom"
              type="color"
              aria-label="Custom brand color"
              value={custom ? brand : "#2563eb"}
              onChange={(e) => setBrand(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>
      <Choice label="Neutrals" options={NEUTRALS} value={neutral} onChange={setNeutral} />
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between type-label-md text-muted-foreground">
          <label htmlFor="vibrance">Accent vibrance</label>
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
          className="w-full accent-(--foreground)"
        />
      </div>
      <Choice label="Icon style" options={ICON_STYLES} value={iconStyle} onChange={setIconStyle} />
    </div>
  )
}
