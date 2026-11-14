# Velvet

A soft, tactile design system for shadcn/ui (Tailwind v4). Material You's tonal
color model, rebuilt quieter: one seed color generates every shadcn variable plus
containers, a surface ladder, tinted elevation, spring motion and type roles.

## Commands

```bash
npm run dev                                         # docs site with live seed picker
npm run theme -- --seed "#0f766e" --vibrance 0.9    # regenerate theme from a seed
npm run registry:build                              # theme + public/r/*.json
npm run contrast                                    # WCAG AA audit of every role pair, 22 seeds x 3 vibrances x 2 themes
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
| `src/lib/velvet/scheme.ts` | Seed → HCT tonal palettes → color roles (light/dark) |
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
- Roles are picked by HCT tone, so contrast holds for any seed; `npm run contrast` proves it.
- `warning` is a dark amber that works as text and takes a white label. Use
  `warning-container` when you want the bright amber look.
- `border` and `outline-variant` are decorative dividers (exempt). Anything that
  identifies a control uses `input` or `outline`.
- Disabled controls fade to 40% (exempt). Loading is a busy state, not disabled: full strength.

## Roadmap

- [x] Foundations
- [x] Button
- [x] Icon Button (toggle, filled/tonal/outlined) + Icon (Material Symbols)
- [x] Segmented Button (single / multiple select)
- [x] Button Group (standard, connected)
- [x] Split Button
- [x] FAB (five colors, three sizes, extended)
- [ ] Input / Textarea (filled + outlined, floating label)
- [ ] Card (filled, elevated, outlined, interactive)
- [ ] Switch, Checkbox, Radio
- [ ] Chip (new: assist, filter, input, suggestion)
- [ ] Dialog, Sheet, Popover, Dropdown Menu, Tooltip
- [ ] Tabs, Navigation Rail (new), FAB (new), Snackbar (new)
