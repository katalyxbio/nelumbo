<p align="center"><img src="docs/banner.webp" alt="Nelumbo, set over an illustration of lotus leaves and pink lotus flowers" width="100%"></p>

# Nelumbo

A soft, tactile design system for shadcn/ui (Tailwind v4). Neutral first: the
interface is black, white and true grays, with depth from a surface ladder,
two-layer shadows and spring motion. Color comes from an accent
palette (blue, cyan, green, amber, orange, red, pink, purple) used where it
means something: status, categories, charts and focus. One accent is the brand.

## Components

### Charts

Every chart from shadcn's gallery has a Material counterpart (area, bar, line, pie, radar, radial, scatter and tooltips), and the demos use lab data. One point is always in focus: a big readout follows it, a line and a ring mark it, and the arrow keys move it.

<table>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-dark.webp"><img src="docs/components/charts-light.webp" alt="Readout charts: samples against a plate a day, a qPCR control against its range" width="100%"></picture><br><sub>Readout charts: samples against a plate a day, a qPCR control against its range</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-scatter-dark.webp"><img src="docs/components/charts-scatter-light.webp" alt="Scatter: volcano plot and enrichment bubbles" width="100%"></picture><br><sub>Scatter: volcano plot and enrichment bubbles</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-line-dark.webp"><img src="docs/components/charts-line-light.webp" alt="Line: growth curves with custom and colored dots" width="100%"></picture><br><sub>Line: growth curves with custom and colored dots</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-bar-dark.webp"><img src="docs/components/charts-bar-light.webp" alt="Bar: stacked libraries, fold changes up and down" width="100%"></picture><br><sub>Bar: stacked libraries, fold changes up and down</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-pie-dark.webp"><img src="docs/components/charts-pie-light.webp" alt="Pie and radial: donut with text, stacked half ring" width="100%"></picture><br><sub>Pie and radial: donut with text, stacked half ring</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/charts-radar-dark.webp"><img src="docs/components/charts-radar-light.webp" alt="Radar grids and a CO2 gauge" width="100%"></picture><br><sub>Radar grids and a CO2 gauge</sub></td>
</tr>
</table>

### Biology

Components for sequences, maps and trees, built from the same tonal tiles, connected shapes and keyboard focus as the rest.

<table>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/nucleotide-dark.webp"><img src="docs/components/nucleotide-light.webp" alt="Nucleotides: double strand" width="100%"></picture><br><sub>Nucleotides: double strand</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/amino-acid-dark.webp"><img src="docs/components/amino-acid-light.webp" alt="Amino acids: protein sequence with selection" width="100%"></picture><br><sub>Amino acids: protein sequence with selection</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/phylo-tree-dark.webp"><img src="docs/components/phylo-tree-light.webp" alt="Phylo Tree: a dated tree with clades" width="100%"></picture><br><sub>Phylo Tree: a dated tree with clades</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/plasmid-map-dark.webp"><img src="docs/components/plasmid-map-light.webp" alt="Plasmid Map" width="100%"></picture><br><sub>Plasmid Map</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/gene-model-dark.webp"><img src="docs/components/gene-model-light.webp" alt="Gene Model: variants, domains and isoforms" width="100%"></picture><br><sub>Gene Model: variants, domains and isoforms</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/sequence-alignment-dark.webp"><img src="docs/components/sequence-alignment-light.webp" alt="Sequence Alignment: overview, features and identity" width="100%"></picture><br><sub>Sequence Alignment: overview, features and identity</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/plate-map-dark.webp"><img src="docs/components/plate-map-light.webp" alt="Plate Map: a 96-well layout with its barcode" width="100%"></picture><br><sub>Plate Map: a 96-well layout with its barcode</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/gel-dark.webp"><img src="docs/components/gel-light.webp" alt="Gel: a restriction digest" width="100%"></picture><br><sub>Gel: a restriction digest</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/sanger-trace-dark.webp"><img src="docs/components/sanger-trace-light.webp" alt="Sanger Trace against a reference" width="100%"></picture><br><sub>Sanger Trace against a reference</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/sequence-logo-dark.webp"><img src="docs/components/sequence-logo-light.webp" alt="Sequence Logo" width="100%"></picture><br><sub>Sequence Logo</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/chromosome-ideogram-dark.webp"><img src="docs/components/chromosome-ideogram-light.webp" alt="Chromosome Ideogram and karyotype" width="100%"></picture><br><sub>Chromosome Ideogram and karyotype</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/construct-map-dark.webp"><img src="docs/components/construct-map-light.webp" alt="Construct Map" width="100%"></picture><br><sub>Construct Map</sub></td>
</tr>
</table>

### Interface

<table>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/buttons-dark.webp"><img src="docs/components/buttons-light.webp" alt="Buttons, split buttons, segmented buttons, FABs" width="100%"></picture><br><sub>Buttons, split buttons, segmented buttons, FABs</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/alerts-dark.webp"><img src="docs/components/alerts-light.webp" alt="Alerts" width="100%"></picture><br><sub>Alerts</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/command-dark.webp"><img src="docs/components/command-light.webp" alt="Command palette" width="100%"></picture><br><sub>Command palette</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/date-picker-dark.webp"><img src="docs/components/date-picker-light.webp" alt="Date picker" width="100%"></picture><br><sub>Date picker</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/data-table-dark.webp"><img src="docs/components/data-table-light.webp" alt="Data table" width="100%"></picture><br><sub>Data table</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/fields-dark.webp"><img src="docs/components/fields-light.webp" alt="Inputs, selects, time fields" width="100%"></picture><br><sub>Inputs, selects, time fields</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/list-dark.webp"><img src="docs/components/list-light.webp" alt="List" width="100%"></picture><br><sub>List</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/phones-dark.webp"><img src="docs/components/phones-light.webp" alt="Navigation bar, FAB menu" width="100%"></picture><br><sub>Navigation bar, FAB menu</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/navigation-rail-dark.webp"><img src="docs/components/navigation-rail-light.webp" alt="Navigation rail" width="100%"></picture><br><sub>Navigation rail</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/selection-dark.webp"><img src="docs/components/selection-light.webp" alt="Switches, checkboxes, chips, sliders" width="100%"></picture><br><sub>Switches, checkboxes, chips, sliders</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/progress-dark.webp"><img src="docs/components/progress-light.webp" alt="Progress, loading indicators, spinners" width="100%"></picture><br><sub>Progress, loading indicators, spinners</sub></td>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/cards-dark.webp"><img src="docs/components/cards-light.webp" alt="Cards, avatars, badges" width="100%"></picture><br><sub>Cards, avatars, badges</sub></td>
</tr>
<tr>
<td width="50%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/components/carousel-dark.webp"><img src="docs/components/carousel-light.webp" alt="Carousel" width="100%"></picture><br><sub>Carousel</sub></td>
</tr>
</table>

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
"registries": { "@nelumbo": "https://<your-registry>/r/{name}.json" }
```

Then install the theme, then components (dependencies such as `@nelumbo/icon` come along):

```bash
npx shadcn@latest add @nelumbo/theme
npx shadcn@latest add @nelumbo/button @nelumbo/icon-button
```

## Icons

Nelumbo uses **Material Symbols Rounded** (variable font) instead of lucide.
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
name used in `src/` and `registry/` into `src/lib/nelumbo/icons.generated.ts`,
and `scripts/a11y.cjs` fails if a rendered icon is missing from the subset.

## Layout

| Path | What |
| --- | --- |
| `src/lib/nelumbo/scheme.ts` | Neutral + accent palettes (HCT) → color roles (light/dark) |
| `src/lib/nelumbo/tokens.ts` | Radius, elevation, springs, type roles, `state-layer` / `tactile` utilities |
| `scripts/build-theme.ts` | Writes `src/styles/nelumbo.css` and the `theme` item in `registry.json` |
| `registry/nelumbo/ui/` | Components shipped through the registry |
| `src/app/` | Docs site |

## Conventions

- Type roles are `type-*` utilities (`type-body-md`), not `text-*`, so stock
  `tailwind-merge` never drops a text color next to them.
- Interactive components use `state-layer` (hover/focus/press overlay) and
  `tactile` (press compression with spring release).
- Components keep shadcn's prop names and variants; Nelumbo only adds to them.
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

## What's included

- Foundations
- Button
- Icon Button (toggle, filled/secondary/outlined) + Icon (Material Symbols)
- Segmented Button (single / multiple select)
- Button Group (standard, connected)
- Split Button
- FAB (five colors, three sizes, extended)
- Input (filled + outlined, floating label)
- Textarea
- Select (field trigger), Combobox (new: type to filter, chips for multiple, nested options that cascade or drill), NestedSelect
- Card (filled, elevated, outlined, interactive)
- Switch
- Checkbox, Radio Group
- Slider
- Chip (new: assist, filter, input, suggestion)
- Dialog, Sheet (drag-to-dismiss bottom sheet)
- Popover, Dropdown Menu, Tooltip
- Tabs, Navigation Rail (new)
- Snackbar (new, with a sonner-compatible `toast` API), Navigation Bar
- Progress (new: linear and circular, flat or wavy), Loading Indicator (morphing shapes), Skeleton
- Avatar (new: auto tints, status, groups), Badge (labels and notification badges), List (plain and segmented)
- Calendar, Date Picker (new: typed dates, year grid, ranges with presets)
- Time Picker (new: typed times in the locale's format, M3 clock dial with 24-hour rings, list mode)
- Accordion (plain and segmented, Radix), Alert (tonal variants, actions, dismiss, banner)
- Table, Data Table (new: TanStack; sorting, selection, search, column menu, pagination, loading and empty states)
- Input OTP (separate or connected slots), Toggle, Toggle Group (connected, morphing selection)
- Breadcrumb, Pagination (with a range helper)
- Scroll Area (auto-hiding thumb, edge fades), Separator (faint, inset or space only)
- Command (cmdk palette with a ⌘K dialog)
- Alert Dialog (icon tile, destructive), Collapsible (spring chevron), Hover Card
- Form (react-hook-form; one label per control, spring errors, shake on failed submit), Label
- Chart (new: Recharts, API-compatible with shadcn's Chart; a readout that follows the point in focus, keyboard focus over the points, pill bars with goal badges, zone and goal lines, stage lanes and progress rings)
  - Area, bar, line, pie, radar, radial and tooltip pages with every shadcn variant in Material form: even pie gaps around a small hole, tonal stacks, dotted radar grids, radial bars on tonal tracks with real gaps between stacked segments, pill value labels
  - Scatter (new): log axes, groups with toggleable legend chips, a least-squares fit with its 95% band (`chartLinearFit`), volcano plots with labels that avoid each other (`ChartPointLabels`), bubble dot plots
- Carousel (multi-browse, hero, uncontained; spring dots), Resizable (gap instead of a line, growing grip)
- Navigation Menu (springing pill, morphing viewport, rich links)
- Sidebar (springing active pill, spring collapse to icons, no lines)
- Search (Material 3 search bar and view; also the Command palette field)
- Context Menu, Menubar (springing segment; sliding row highlight shared with Dropdown Menu)
- Top App Bar (four sizes; elevate, collapse, hide on scroll), Bottom App Bar (FAB slot, floating)
- Field (shadcn layout set; choice cards), Item (segmented tiles)
- Input Group (one field with addons; chat composer), Native Select
- FAB Menu (staggered spring actions, morphing trigger)
- Toolbar (docked and floating, vertical, vibrant; paired FAB, collapse, overflow)
- Kbd, Spinner (ring or shapes), Empty (layered icon tile), Aspect Ratio
- Nucleotide and Amino Acid (new, biology: tonal residue tiles in one tone system; Nelumbo, base-pair, charge and classic schemes such as IGV, Clustal X and Taylor; sequences with ruler, complement strand, codon footers, highlight and keyboard selection; mutations: DNA changes with the changed bases as a capsule and indels aligned, protein changes as one connected R | 175 | H shape)
- Gene Model (new, biology: exons and introns with connected UTR and coding parts, dotted introns with strand chevrons, compressed introns, isoform stacks, variant lollipops, protein domains mapped onto the exons that encode them, keyboard focus on exons)
- Protein Domains (new, biology: a protein backbone with domain blocks, a residue ruler, a legend and variant lollipops, plus secondary structure and AlphaFold confidence tracks on the same scale)
- Plasmid Map (new, biology: circular map with directional feature arcs, names along arcs or outside with non-crossing leaders, unique restriction sites, a center readout and keyboard focus)
- Sequence Alignment (new, biology: aligned DNA or protein as connected residue rows with gap lines, wrapping blocks or a scrolling row with an overview, feature and marker tracks, identity bars, a consensus row, color by residue, conservation or difference, and block selection that copies as FASTA)
- Plate Map (new, biology: 6 to 1536-well plates, bare or drawn to scale with a chosen notch corner and a scannable barcode on its front wall, wells by group or value, excluded wells, hover cards, and selection traced as one filleted outline with full keyboard navigation)
- Sequence Logo (new, biology: motifs as stacks of letters sized by information or probability, from aligned sequences or a position matrix, with small-sample correction, a background, reverse complement, an IUPAC consensus row and range selection)
- Construct Map (new, biology: the plasmid map unrolled into a line for inserts, guides and PCR products, with strands above and below the backbone, zoom down to both strands and the amino acids of each codon, range selection, and a GenBank parser shared with Plasmid Map)
- Translation (new, biology: DNA with each amino acid under its codon, in one, three or six reading frames, with open reading frames lit and base selection)
- Sanger Trace (new, biology: a chromatogram read straight from .ab1 files, with base calls, quality bars, trimmed ends shaded, differences from a reference and mixed bases marked)
- Variant Badge (new, biology: ACMG/AMP classifications from pathogenic to benign with a five-pip scale, ClinVar review stars, evidence chips, and a classifier that applies the 2015 combining rules)
- Gel (new, biology: an agarose gel simulated from a restriction digest of a sequence, with ladders, the agarose percentage, and uncut plasmid forms)
- Chromosome Ideogram (new, biology: banded chromosomes from UCSC cytobands with markers and a zoom region over a gene model, and a whole-genome karyotype to pick from)
- Phylo Tree (new, biology: trees from Newick, rectangular or circular, phylogram or cladogram, with rounded elbows, shaded clades that fold, support values or dots, a scale bar or a time axis, keyboard focus through the nodes, and helpers to parse and write Newick, reroot on an outgroup and build a tree by neighbor joining)

## License

Nelumbo is released under the [Apache License 2.0](LICENSE).
