"use client"

import * as React from "react"
import { buildScheme, schemeToCss, type Neutral } from "@/lib/nelumbo/scheme"
import { materialSymbolsUrl } from "@/registry/nelumbo/ui/icon"
import { USED_ICONS } from "@/lib/nelumbo/icons.generated"

export type IconStyle = "Rounded" | "Outlined" | "Sharp"
export const ICON_STYLES: IconStyle[] = ["Rounded", "Outlined", "Sharp"]

export const DEFAULT_BRAND = "blue"
export const NEUTRALS: Neutral[] = ["pure", "warm", "cool"]

type Studio = {
  brand: string
  neutral: Neutral
  vibrance: number
  dark: boolean
  setBrand: (s: string) => void
  setNeutral: (n: Neutral) => void
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
  const [brand, setBrand] = React.useState(DEFAULT_BRAND)
  const [neutral, setNeutral] = React.useState<Neutral>("pure")
  const [vibrance, setVibrance] = React.useState(1)
  const [dark, setDark] = React.useState(false)
  const [iconStyle, setIconStyle] = React.useState<IconStyle>("Rounded")

  // Docs-only preview of the other Material Symbols families. Rounded stays
  // Nelumbo's default; this swaps --icon-font and loads the matching subset.
  React.useEffect(() => {
    const root = document.documentElement
    if (iconStyle === "Rounded") root.style.removeProperty("--icon-font")
    else root.style.setProperty("--icon-font", `'Material Symbols ${iconStyle}'`)
  }, [iconStyle])

  // Saved choice wins; otherwise follow the system until the user picks.
  React.useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem("nelumbo-theme") } catch {}
    if (saved === "dark" || saved === "light") {
      setDark(saved === "dark")
      return
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setDark(mq.matches)
    const on = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const setDarkChosen = React.useCallback((v: boolean) => {
    setDark(v)
    try { localStorage.setItem("nelumbo-theme", v ? "dark" : "light") } catch {}
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  }, [dark])

  const css = React.useMemo(() => {
    if (brand === DEFAULT_BRAND && neutral === "pure" && vibrance === 1) return ""
    try {
      return schemeToCss(buildScheme({ brand, neutral, vibrance }))
    } catch {
      return ""
    }
  }, [brand, neutral, vibrance])

  return (
    <Ctx.Provider value={{ brand, neutral, vibrance, dark, setBrand, setNeutral, setVibrance, setDark: setDarkChosen, iconStyle, setIconStyle }}>
      {iconStyle !== "Rounded" && <link rel="stylesheet" href={materialSymbolsUrl(USED_ICONS, iconStyle)} />}
      {css && <style id="nelumbo-live">{css}</style>}
      {children}
    </Ctx.Provider>
  )
}
