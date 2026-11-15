import type { ComboboxOption } from "@/registry/velvet/ui/combobox"

/** Three levels deep: continent › region › country. Shared by the nested Select and Combobox demos. */
export const LOCATIONS: ComboboxOption[] = [
  {
    value: "europe",
    label: "Europe",
    icon: "euro",
    children: [
      { value: "nordics", label: "Nordics", children: ["Denmark", "Finland", "Iceland", "Norway", "Sweden"] },
      { value: "western", label: "Western Europe", children: ["Belgium", "France", "Ireland", "Luxembourg", "Netherlands", "United Kingdom"] },
      { value: "southern", label: "Southern Europe", children: ["Greece", "Italy", "Portugal", "Spain"] },
      { value: "central", label: "Central Europe", children: ["Austria", "Czechia", "Germany", "Poland", "Switzerland"] },
    ],
  },
  {
    value: "americas",
    label: "Americas",
    icon: "south_america",
    children: [
      { value: "north", label: "North America", children: ["Canada", "Mexico", "United States"] },
      { value: "south", label: "South America", children: ["Argentina", "Brazil", "Chile", "Colombia", "Perú", "Uruguay"] },
    ],
  },
  {
    value: "apac",
    label: "Asia and Pacific",
    icon: "globe_asia",
    children: [
      { value: "east", label: "East Asia", children: ["Japan", "South Korea", "Taiwan"] },
      { value: "southeast", label: "Southeast Asia", children: ["Indonesia", "Singapore", "Thailand", "Vietnam"] },
      { value: "oceania", label: "Oceania", children: ["Australia", "New Zealand"] },
    ],
  },
  { value: "remote", label: "Anywhere (remote)", icon: "public" },
]

/** Path of labels to a value, e.g. ["Europe", "Nordics", "Sweden"]. */
export function pathTo(value: string | null, nodes: readonly (ComboboxOption | string)[] = LOCATIONS, trail: string[] = []): string[] | null {
  if (!value) return null
  for (const n of nodes) {
    const o = typeof n === "string" ? { value: n, label: n } : n
    if (o.value === value) return [...trail, o.label]
    if (o.children) {
      const found = pathTo(value, o.children, [...trail, o.label])
      if (found) return found
    }
  }
  return null
}
