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
node scripts/a11y.cjs                               # axe contrast scan of the running docs (needs :3000)
```

## Install into a project

Install the theme once, then components:

```bash
npx shadcn@latest add https://<your-registry>/r/theme.json
npx shadcn@latest add https://<your-registry>/r/button.json
```

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
- [ ] Icon Button (toggle, filled/tonal/outlined)
- [ ] Input / Textarea (filled + outlined, floating label)
- [ ] Card (filled, elevated, outlined, interactive)
- [ ] Switch, Checkbox, Radio
- [ ] Chip (new: assist, filter, input, suggestion)
- [ ] Segmented Control (new)
- [ ] Dialog, Sheet, Popover, Dropdown Menu, Tooltip
- [ ] Tabs, Navigation Rail (new), FAB (new), Snackbar (new)
