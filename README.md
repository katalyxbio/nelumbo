# Velvet

A soft, tactile design system for shadcn/ui (Tailwind v4). Neutral first: the
interface is black, white and true grays, with depth from a surface ladder,
two-layer shadows and spring motion. Color comes from an accent
palette (blue, cyan, green, amber, orange, red, pink, purple) used where it
means something: status, categories, charts and focus. One accent is the brand.

## Commands

```bash
npm run dev                                         # docs site with live brand, neutral and icon controls
npm run theme -- --brand green --neutral warm       # brand accent (palette name or hex), gray temperature
npm run registry:build                              # theme + public/r/*.json
npm run contrast                                    # WCAG AA audit: 130 pairs x 153 brand/neutral/vibrance combos x 2 themes
node scripts/a11y.cjs                               # axe contrast + missing-icon scan of the running docs (needs :3000)
```

## Install into a project

Add the registry to the project's `components.json` once:

```json
"registries": { "@velvet": "https://<your-registry>/r/{name}.json" }
```

Then install the theme, then components (dependencies such as `@velvet/icon` come along):

```bash
npx shadcn@latest add @velvet/theme
npx shadcn@latest add @velvet/button @velvet/icon-button
```

## Icons

Velvet uses **Material Symbols Rounded** (variable font) instead of lucide.
`<Icon name="favorite" />` has typed names; `fill`, `weight`, `grade` and `size`
map to the font axes through CSS variables (`--icon-fill`, `--icon-wght`,
`--icon-grad`, `--icon-opsz`, `--icon-size`), so components animate icons
without extra props.

The full font is ~4.6 MB. Load a subset instead:

```tsx
import { materialSymbolsUrl } from "@/components/ui/icon"
<link rel="stylesheet" href={materialSymbolsUrl(["favorite", "settings"])} />
```

In this repo, `npm run icons` (runs before dev and build) collects every symbol
name used in `src/` and `registry/` into `src/lib/velvet/icons.generated.ts`,
and `scripts/a11y.cjs` fails if a rendered icon is missing from the subset.

## Layout

| Path | What |
| --- | --- |
| `src/lib/velvet/scheme.ts` | Neutral + accent palettes (HCT) → color roles (light/dark) |
| `src/lib/velvet/tokens.ts` | Radius, elevation, springs, type roles, `state-layer` / `tactile` utilities |
| `scripts/build-theme.ts` | Writes `src/styles/velvet.css` and the `theme` item in `registry.json` |
| `registry/velvet/ui/` | Components shipped through the registry |
| `src/app/` | Docs site |

## Conventions

- Type roles are `type-*` utilities (`type-body-md`), not `text-*`, so stock
  `tailwind-merge` never drops a text color next to them.
- Interactive components use `state-layer` (hover/focus/press overlay) and
  `tactile` (press compression with spring release).
- Components keep shadcn's prop names and variants; Velvet only adds to them.
- Buttons expose their geometry as CSS variables so wrappers can shape them
  without extra props: `--btn-h`, `--btn-px` / `--btn-px-delta` (padding),
  `--btn-radius`, `--btn-radius-start` / `--btn-radius-end` (per-side corners)
  and `--press-scale` (set to 1 to turn off the press squeeze).

## Contrast rules

- Text pairs need 4.5:1, control boundaries, focus ring and chart marks 3:1 (WCAG 2.1 AA).
- Roles are picked by HCT tone, so contrast holds for any brand accent; `npm run contrast` proves it.
- Each accent has four roles: `blue`, `blue-foreground`, `blue-container`,
  `blue-container-foreground` (same for every hue, plus `brand`, `success`,
  `warning`, `destructive`). Solids work as text on the page (4.5:1).
- Amber and orange solids are deep so they work as text; use their
  `-container` roles for the bright look.
- `border` and `outline-variant` are decorative dividers (exempt). Anything that
  identifies a control uses `input` or `outline`.
- Disabled controls fade to 40% (exempt). Loading is a busy state, not disabled: full strength.

## Roadmap

- [x] Foundations
- [x] Button
- [x] Icon Button (toggle, filled/secondary/outlined) + Icon (Material Symbols)
- [x] Segmented Button (single / multiple select)
- [x] Button Group (standard, connected)
- [x] Split Button
- [x] FAB (five colors, three sizes, extended)
- [x] Input (filled + outlined, floating label)
- [x] Textarea
- [x] Select (field trigger), Combobox (new: type to filter, chips for multiple, nested options that cascade or drill), NestedSelect
- [x] Card (filled, elevated, outlined, interactive)
- [x] Switch
- [x] Checkbox, Radio Group
- [x] Slider
- [x] Chip (new: assist, filter, input, suggestion)
- [x] Dialog, Sheet (drag-to-dismiss bottom sheet)
- [x] Popover, Dropdown Menu, Tooltip
- [x] Tabs, Navigation Rail (new)
- [x] Snackbar (new, with a sonner-compatible `toast` API), Navigation Bar
- [x] Progress (new: linear and circular, flat or wavy), Loading Indicator (morphing shapes), Skeleton
- [x] Avatar (new: auto tints, status, groups), Badge (labels and notification badges), List (plain and segmented)
- [x] Calendar, Date Picker (new: typed dates, year grid, ranges with presets)
- [x] Time Picker (new: typed times in the locale's format, M3 clock dial with 24-hour rings, list mode)
- [x] Accordion (plain and segmented, Radix), Alert (tonal variants, actions, dismiss, banner)
- [x] Table, Data Table (new: TanStack; sorting, selection, search, column menu, pagination, loading and empty states)
- [x] Input OTP (separate or connected slots), Toggle, Toggle Group (connected, morphing selection)
- [x] Breadcrumb, Pagination (with a range helper)
- [x] Scroll Area (auto-hiding thumb, edge fades), Separator (faint, inset or space only)
- [x] Command (cmdk palette with a ⌘K dialog)
- [x] Alert Dialog (icon tile, destructive), Collapsible (spring chevron), Hover Card
- [x] Form (react-hook-form; one label per control, spring errors, shake on failed submit), Label
- [x] Chart (recharts; accent series, spring tooltip, toggleable legend chips)
- [x] Carousel (multi-browse, hero, uncontained; spring dots), Resizable (gap instead of a line, growing grip)
- [x] Navigation Menu (springing pill, morphing viewport, rich links)
- [x] Sidebar (springing active pill, spring collapse to icons, no lines)
- [x] Search (Material 3 search bar and view; also the Command palette field)
- [x] Context Menu, Menubar (springing segment; sliding row highlight shared with Dropdown Menu)
- [x] Top App Bar (four sizes; elevate, collapse, hide on scroll), Bottom App Bar (FAB slot, floating)
- [x] Field (shadcn layout set; choice cards), Item (segmented tiles)
- [x] Input Group (one field with addons; chat composer), Native Select
