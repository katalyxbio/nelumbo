"use client"

import * as React from "react"
import { buildScheme, schemeToCss } from "@/lib/velvet/scheme"
import { materialSymbolsUrl } from "@/registry/velvet/ui/icon"
import { USED_ICONS } from "@/lib/velvet/icons.generated"

export type IconStyle = "Rounded" | "Outlined" | "Sharp"
export const ICON_STYLES: IconStyle[] = ["Rounded", "Outlined", "Sharp"]

export const DEFAULT_SEED = "#5b5bd6"

export const SEED_PRESETS = [
  { name: "Iris", hex: "#5b5bd6" },
  { name: "Lagoon", hex: "#0f7c86" },
  { name: "Moss", hex: "#4f7a3a" },
  { name: "Amber", hex: "#b86e00" },
  { name: "Rosewood", hex: "#a4384f" },
  { name: "Graphite", hex: "#5f6670" },
]

type Studio = {
  seed: string
  vibrance: number
  dark: boolean
  setSeed: (s: string) => void
  setVibrance: (v: number) => void
  setDark: (d: boolean) => void
  iconStyle: IconStyle
  setIconStyle: (s: IconStyle) => void
}

const Ctx = React.createContext<Studio | null>(null)

export function useStudio() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider")
  return ctx
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [seed, setSeed] = React.useState(DEFAULT_SEED)
  const [vibrance, setVibrance] = React.useState(1)
  const [dark, setDark] = React.useState(false)
  const [iconStyle, setIconStyle] = React.useState<IconStyle>("Rounded")

  // Docs-only preview of the other Material Symbols families. Rounded stays
  // Velvet's default; this swaps --icon-font and loads the matching subset.
  React.useEffect(() => {
    const root = document.documentElement
    if (iconStyle === "Rounded") root.style.removeProperty("--icon-font")
    else root.style.setProperty("--icon-font", `'Material Symbols ${iconStyle}'`)
  }, [iconStyle])

  React.useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) setDark(true)
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  }, [dark])

  const css = React.useMemo(() => {
    if (seed === DEFAULT_SEED && vibrance === 1) return ""
    try {
      return schemeToCss(buildScheme({ seed, vibrance }))
    } catch {
      return ""
    }
  }, [seed, vibrance])

  return (
    <Ctx.Provider value={{ seed, vibrance, dark, setSeed, setVibrance, setDark, iconStyle, setIconStyle }}>
      {iconStyle !== "Rounded" && <link rel="stylesheet" href={materialSymbolsUrl(USED_ICONS, iconStyle)} />}
      {css && <style id="velvet-live">{css}</style>}
      {children}
    </Ctx.Provider>
  )
}
