"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Button } from "@/registry/nelumbo/ui/button"
import { cn } from "@/lib/utils"
import { ACCENTS, ACCENT_NAMES } from "@/lib/nelumbo/scheme"
import { ICON_STYLES, NEUTRALS, useStudio } from "./studio"

type NavItem = { label: string; href?: string; soon?: boolean; isNew?: boolean }

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Foundations",
    items: [
      { href: "/", label: "Color, depth & motion" },
      { href: "/components/typography", label: "Typography", isNew: true },
      { href: "/components/shape", label: "Shape", isNew: true },
    ],
  },
  {
    group: "Buttons",
    items: [
      { href: "/components/button", label: "Button" },
      { href: "/components/icon-button", label: "Icon Button" },
      { href: "/components/segmented-button", label: "Segmented Button" },
      { href: "/components/button-group", label: "Button Group" },
      { href: "/components/split-button", label: "Split Button" },
      { href: "/components/fab", label: "FAB" },
      { href: "/components/fab-menu", label: "FAB Menu", isNew: true },
    ],
  },
  {
    group: "Components",
    items: [
      { href: "/components/input", label: "Input" },
      { href: "/components/input-group", label: "Input Group", isNew: true },
      { href: "/components/textarea", label: "Textarea" },
      { href: "/components/form", label: "Form", isNew: true },
      { href: "/components/field", label: "Field", isNew: true },
      { href: "/components/select", label: "Select", isNew: true },
      { href: "/components/native-select", label: "Native Select", isNew: true },
      { href: "/components/combobox", label: "Combobox", isNew: true },
      { href: "/components/search", label: "Search", isNew: true },
      { href: "/components/date-picker", label: "Date Picker", isNew: true },
      { href: "/components/time-picker", label: "Time Picker", isNew: true },
      { href: "/components/input-otp", label: "Input OTP", isNew: true },
      { href: "/components/card", label: "Card" },
      { href: "/components/carousel", label: "Carousel", isNew: true },
      { href: "/components/aspect-ratio", label: "Aspect Ratio", isNew: true },
      { href: "/components/switch", label: "Switch" },
      { href: "/components/checkbox", label: "Checkbox" },
      { href: "/components/radio-group", label: "Radio Group" },
      { href: "/components/toggle", label: "Toggle", isNew: true },
      { href: "/components/slider", label: "Slider" },
      { href: "/components/chip", label: "Chip", isNew: true },
      { href: "/components/avatar", label: "Avatar", isNew: true },
      { href: "/components/badge", label: "Badge", isNew: true },
      { href: "/components/list", label: "List", isNew: true },
      { href: "/components/item", label: "Item", isNew: true },
      { href: "/components/accordion", label: "Accordion", isNew: true },
      { href: "/components/collapsible", label: "Collapsible", isNew: true },
      { href: "/components/alert", label: "Alert", isNew: true },
      { href: "/components/empty", label: "Empty", isNew: true },
      { href: "/components/table", label: "Table", isNew: true },
      { href: "/components/data-table", label: "Data Table", isNew: true },
      { href: "/components/code-block", label: "Code Block", isNew: true },
      { href: "/components/chart", label: "Chart", isNew: true },
      { href: "/components/scroll-area", label: "Scroll Area", isNew: true },
      { href: "/components/separator", label: "Separator", isNew: true },
      { href: "/components/resizable", label: "Resizable", isNew: true },
    ],
  },
  {
    group: "Navigation",
    items: [
      { href: "/components/tabs", label: "Tabs" },
      { href: "/components/navigation-rail", label: "Navigation Rail", isNew: true },
      { href: "/components/sidebar", label: "Sidebar", isNew: true },
      { href: "/components/navigation-bar", label: "Navigation Bar", isNew: true },
      { href: "/components/navigation-menu", label: "Navigation Menu", isNew: true },
      { href: "/components/top-app-bar", label: "Top App Bar", isNew: true },
      { href: "/components/bottom-app-bar", label: "Bottom App Bar", isNew: true },
      { href: "/components/toolbar", label: "Toolbar", isNew: true },
      { href: "/components/breadcrumb", label: "Breadcrumb", isNew: true },
      { href: "/components/pagination", label: "Pagination", isNew: true },
    ],
  },
  {
    group: "Overlays",
    items: [
      { href: "/components/dialog", label: "Dialog" },
      { href: "/components/alert-dialog", label: "Alert Dialog", isNew: true },
      { href: "/components/sheet", label: "Sheet" },
      { href: "/components/popover", label: "Popover" },
      { href: "/components/hover-card", label: "Hover Card", isNew: true },
      { href: "/components/dropdown-menu", label: "Dropdown Menu" },
      { href: "/components/context-menu", label: "Context Menu", isNew: true },
      { href: "/components/menubar", label: "Menubar", isNew: true },
      { href: "/components/command", label: "Command", isNew: true },
      { href: "/components/tooltip", label: "Tooltip" },
      { href: "/components/kbd", label: "Kbd", isNew: true },
      { href: "/components/snackbar", label: "Snackbar", isNew: true },
    ],
  },
  {
    group: "Biology",
    items: [
      { href: "/components/nucleotide", label: "Nucleotide", isNew: true },
      { href: "/components/amino-acid", label: "Amino Acid", isNew: true },
      { href: "/components/gene-model", label: "Gene Model", isNew: true },
      { href: "/components/protein-domains", label: "Protein Domains", isNew: true },
      { href: "/components/plasmid-map", label: "Plasmid Map", isNew: true },
      { href: "/components/sequence-alignment", label: "Sequence Alignment", isNew: true },
      { href: "/components/plate-map", label: "Plate Map", isNew: true },
      { href: "/components/sequence-logo", label: "Sequence Logo", isNew: true },
      { href: "/components/construct-map", label: "Construct Map", isNew: true },
      { href: "/components/translation", label: "Translation", isNew: true },
      { href: "/components/sanger-trace", label: "Sanger Trace", isNew: true },
      { href: "/components/variant-badge", label: "Variant Badge", isNew: true },
      { href: "/components/gel", label: "Gel", isNew: true },
      { href: "/components/chromosome-ideogram", label: "Chromosome Ideogram", isNew: true },
      { href: "/components/phylo-tree", label: "Phylo Tree", isNew: true },
      { href: "/components/protein-structure", label: "Protein Structure", isNew: true },
    ],
  },
  {
    group: "Feedback",
    items: [
      { href: "/components/progress", label: "Progress", isNew: true },
      { href: "/components/loading-indicator", label: "Loading Indicator", isNew: true },
      { href: "/components/spinner", label: "Spinner", isNew: true },
    ],
  },
]

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-border px-5 py-5 md:sticky md:top-0 md:h-dvh md:w-64 md:overflow-y-auto md:overscroll-contain md:border-r md:border-b-0 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring">
            <span className="size-6 rounded-[0.55rem] bg-primary shadow-e1" />
            <span className="type-title-md">Nelumbo</span>
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
              className="tactile aspect-square cursor-pointer rounded-full bg-(--sw) outline-none ring-offset-2 ring-offset-surface-container-low focus-visible:outline-2 focus-visible:outline-ring aria-pressed:ring-2 aria-pressed:ring-foreground dark:ring-offset-surface-container"
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
