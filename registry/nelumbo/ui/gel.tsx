"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Gel
 *
 * An agarose gel, simulated: each band where a model of how DNA runs puts it
 * for the gel's agarose, buffer, voltage and time, as wide as it spreads and
 * as bright as the DNA in it, drawn a pixel at a time as a stain shows it
 * (light falling off to the corners, dust, grain, lanes that smile). `mode`
 * draws the ideal bands over it, or alone.
 *
 *   const lanes = [
 *     { label: "Ladder", ladder: "neb-1kb" },
 *     { label: "HindIII", bands: digest(seq, { HindIII: "A^AGCTT" }, { circular: true }) },
 *   ]
 *   <Gel lanes={lanes} agarose={1} volts={100} minutes={40} />
 *
 * The model: a fragment's mobility falls with its length along a sigmoid in
 * log length, from that of the shortest (near free solution's) to a floor the
 * longest share (they reptate end first, so a gel stops telling them apart;
 * the floor rises with the field, which is why high voltages squeeze long
 * fragments together). The sigmoid is placed, for each agarose percentage, by
 * the sizes the loading dyes run with (bromophenol blue and xylene cyanol, in
 * TAE and TBE); the dyes' own mobility sets the scale. Bands spread from the
 * well's depth, by diffusion over the run, and more where they're squeezed
 * together; Joule heating at high fields broadens them a little more. Good to
 * roughly 5–10% of a real gel of the same make.
 *
 * - `digest` cuts a sequence with enzymes ("G^AATTC", the caret at the cut).
 *   Fragments of one digest are equimolar, so a band's mass follows its length.
 * - `autoGel` picks the agarose, voltage, time and ladder that best separate
 *   a set of sizes; `resolves` gives the range a gel tells apart well.
 * - Hover a band, or with `selectable` move through them with the arrow keys.
 */

// ---------------------------------------------------------------- the model

export type GelBuffer = "tae" | "tbe"

export type GelSettings = {
  /** Agarose, % w/v. */
  agarose: number
  buffer: GelBuffer
  /** Volts across the electrodes, and the distance between them (cm). */
  volts: number
  electrodes: number
  /** Minutes run. */
  minutes: number
  /** The gel's length from the wells to its end (cm). */
  length: number
}

export const DEFAULT_GEL: GelSettings = { agarose: 1, buffer: "tae", volts: 100, electrodes: 12, minutes: 40, length: 8 }

// the sizes (bp) bromophenol blue and xylene cyanol run with, by agarose % (Sambrook & Russell, TAE)
const DYES: [number, number, number][] = [
  [0.3, 2900, 24000],
  [0.5, 1650, 12000],
  [0.75, 1000, 8000],
  [1.0, 500, 4000],
  [1.25, 370, 3000],
  [1.5, 300, 2000],
  [1.75, 200, 1500],
  [2.0, 150, 1000],
  [2.5, 100, 700],
  [3.0, 70, 450],
  [4.0, 40, 250],
]
// bromophenol blue's mobility, cm²/V·s
const MU_DYE: Record<GelBuffer, number> = { tae: 3.2e-4, tbe: 2.6e-4 }
// xylene cyanol runs at this share of bromophenol blue's speed
const XC_SHARE = 0.48
// the shortest fragments' mobility, and the floor the longest share at 5 V/cm, of bromophenol blue's
const SHORT = 1.2
const FLOOR = 0.1

const interp = (c: number, k: 1 | 2) => {
  const t = DYES
  if (c <= t[0][0]) return t[0][k]
  for (let i = 1; i < t.length; i++)
    if (c <= t[i][0]) {
      const f = (c - t[i - 1][0]) / (t[i][0] - t[i - 1][0])
      return Math.exp(Math.log(t[i - 1][k]) * (1 - f) + Math.log(t[i][k]) * f)
    }
  return t[t.length - 1][k]
}

/** The field, V/cm. */
export const gelField = (g: GelSettings) => g.volts / g.electrodes

/** A fragment's mobility (cm²/V·s), by its length. */
export function mobility(bp: number, g: GelSettings) {
  const tbe = g.buffer === "tbe" ? 0.85 : 1
  const E = gelField(g)
  const hi = SHORT
  const lo = Math.min(0.4, FLOOR * Math.sqrt(Math.max(0.5, E) / 5))
  // the sigmoid's middle and steepness, from the two dyes' sizes: (hi − lo)/(μ/μ_dye − lo) − 1 = (L/Lc)^γ
  const l1 = interp(g.agarose, 1) * tbe
  const l2 = interp(g.agarose, 2) * tbe
  const f1 = (hi - lo) / (1 - lo) - 1
  const f2 = (hi - lo) / (XC_SHARE - lo) - 1
  const gamma = Math.log(f2 / f1) / Math.log(l2 / l1)
  const lc = l1 / Math.pow(f1, 1 / gamma)
  return MU_DYE[g.buffer] * (lo + (hi - lo) / (1 + Math.pow(bp / lc, gamma)))
}

/** How far a fragment runs, cm. */
export const gelDistance = (bp: number, g: GelSettings) => mobility(bp, g) * gelField(g) * g.minutes * 60

/** How far down the gel a fragment runs, 0 (the wells) to 1 (the end); over 1 once it has run off. */
export const migration = (bp: number, g: GelSettings = DEFAULT_GEL) => gelDistance(bp, g) / g.length

/** Where the loading dyes have run, cm. */
export const dyeFronts = (g: GelSettings) => {
  const d = MU_DYE[g.buffer] * gelField(g) * g.minutes * 60
  return { bromophenol: d, xylene: d * XC_SHARE }
}

/** A band's spread, cm (one standard deviation). */
export const spread = (bp: number, g: GelSettings) => spreadAt(bp, gelDistance(bp, g), gelDistance(bp * 1.05, g), g)

// from how far it runs (d) and one 5% longer runs (d5)
function spreadAt(bp: number, d: number, d5: number, g: GelSettings) {
  // how fast distance changes with log length here: where slow, near sizes overlap
  const dd = Math.abs(d5 - d) / Math.log(1.05)
  const diffusion = Math.sqrt(2 * 1.5e-7 * Math.pow(bp / 100, -0.6) * g.minutes * 60)
  const heat = Math.max(0, gelField(g) - 8) * 0.004
  return Math.hypot(0.05, diffusion, 0.012 * d, heat) + 0.02 * Math.max(0, 0.6 - dd)
}

/** The range of sizes a gel tells apart well: where a 10% difference runs at least a band's width apart. */
export function resolves(g: GelSettings): [number, number] {
  let lo: number | undefined
  let hi: number | undefined
  for (let bp = 20; bp <= 50_000; bp *= 1.05) {
    const apart = Math.abs(gelDistance(bp, g) - gelDistance(bp * 1.1, g))
    const ok = apart >= 1.5 * spread(bp, g) && gelDistance(bp, g) <= g.length
    if (ok && lo === undefined) lo = bp
    if (ok) hi = bp
  }
  return [Math.round(lo ?? 0), Math.round(hi ?? 0)]
}

/** Ladders as their makers list them: each band's size (bp) and mass (ng, of a usual 0.5–1 µg load). */
export const LADDERS = {
  "neb-1kb": { brand: "NEB", name: "NEB 1 kb", bands: [[10002, 42], [8001, 42], [6001, 50], [5001, 42], [4001, 33], [3001, 125], [2000, 48], [1500, 36], [1000, 42], [517, 42], [500, 42]] },
  "neb-1kb-plus": { brand: "NEB", name: "NEB 1 kb Plus", bands: [[10000, 40], [8000, 40], [6000, 48], [5000, 40], [4000, 32], [3000, 120], [2000, 40], [1500, 32], [1200, 28], [1000, 80], [900, 28], [800, 24], [700, 24], [600, 22], [500, 70], [400, 22], [300, 20], [200, 20], [100, 20]] },
  "neb-100": { brand: "NEB", name: "NEB 100 bp", bands: [[1517, 45], [1200, 35], [1000, 95], [900, 27], [800, 24], [700, 21], [600, 18], [517, 97], [500, 97], [400, 38], [300, 29], [200, 25], [100, 48]] },
  "neb-50": { brand: "NEB", name: "NEB 50 bp", bands: [[1350, 50], [916, 40], [766, 40], [700, 40], [650, 40], [600, 40], [550, 40], [500, 40], [450, 40], [400, 40], [350, 80], [300, 40], [250, 40], [200, 40], [150, 40], [100, 40], [50, 40]] },
  "generuler-1kb": { brand: "GeneRuler", name: "GeneRuler 1 kb", bands: [[10000, 30], [8000, 30], [6000, 70], [5000, 30], [4000, 30], [3500, 25], [3000, 70], [2500, 25], [2000, 20], [1500, 80], [1000, 60], [750, 25], [500, 25], [250, 25]] },
  "generuler-100-plus": { brand: "GeneRuler", name: "GeneRuler 100 bp Plus", bands: [[3000, 25], [2000, 25], [1500, 25], [1200, 25], [1000, 60], [900, 25], [800, 25], [700, 25], [600, 25], [500, 60], [400, 20], [300, 20], [200, 20], [100, 20]] },
  "generuler-50": { brand: "GeneRuler", name: "GeneRuler 50 bp", bands: [[1000, 25], [900, 25], [800, 25], [700, 25], [600, 25], [500, 60], [400, 25], [300, 25], [250, 60], [200, 25], [150, 25], [100, 25], [50, 25]] },
} satisfies Record<string, { brand: string; name: string; bands: [number, number][] }>

export type LadderId = keyof typeof LADDERS
const LADDER_IDS = Object.keys(LADDERS) as LadderId[]

// how far down a product may reach so it's well clear of the end; anything else run (primer-dimers), so it's still on; a ladder's bands
const END = 0.85
const EXTRA_END = 0.96
const LADDER_END = 0.93

/**
 * The gel and ladder that best run these sizes: of every agarose, voltage and
 * time that keeps each whole on the gel and clear of its end, the one that
 * best tells apart those in a lane (and less, those across lanes), takes the
 * longest a fair way down without crowding the shortest at the foot, and
 * keeps `extras` (primer-dimers) on the gel; with the ladder that has the most
 * bands either side of them, told apart. `brand` keeps to one maker's ladders.
 */
export function autoGel(
  sizes: number[],
  g: GelSettings = DEFAULT_GEL,
  { lanes = [sizes], extras = [], brand }: { lanes?: number[][]; extras?: number[]; brand?: string } = {}
): { gel: GelSettings; ladder: LadderId } {
  const pool = LADDER_IDS.filter((id) => !brand || LADDERS[id].brand === brand)
  const sorted = [...new Set(sizes.map(Math.round))].sort((a, b) => a - b)
  if (!sorted.length) return { gel: g, ladder: pool[0] ?? "neb-1kb" }
  const lo = sorted[0]
  const hi = sorted[sorted.length - 1]
  const index = new Map(sorted.map((bp, i) => [bp, i]))
  const laneIdx = lanes
    .map((l) => [...new Set(l.map(Math.round))].sort((a, b) => a - b))
    .filter((l) => l.length > 1)
    .map((l) => l.map((bp) => index.get(bp)).filter((i): i is number => i !== undefined))
  const all = sorted.map((_, i) => i)
  const shortest = extras.length ? Math.min(...extras) : undefined
  let best: { gel: GelSettings; score: number; ladder: LadderId } | undefined
  let fallback: { gel: GelSettings; worst: number } | undefined
  const d = new Float64Array(sorted.length)
  const sd = new Float64Array(sorted.length)
  // how far apart, in their widths, the nearest two of these run
  const apart = (list: number[]) => {
    let m = Infinity
    for (let i = 1; i < list.length; i++) m = Math.min(m, Math.abs(d[list[i - 1]] - d[list[i]]) / (sd[list[i - 1]] + sd[list[i]]))
    return m
  }
  for (let a = 0.5; a <= 4.0001; a += 0.1) {
    const agarose = Math.round(a * 10) / 10
    for (const volts of [30, 50, 70, 100, 130, 160, 200]) {
      // distance grows with the minutes run: a minute's, then scaled
      const at = { ...g, agarose, volts, minutes: 1 }
      const v = sorted.map((bp) => gelDistance(bp, at))
      const v5 = sorted.map((bp) => gelDistance(bp * 1.05, at))
      const vx = shortest === undefined ? 0 : gelDistance(shortest, at)
      const vl = pool.map((id) => LADDERS[id].bands.map((b) => gelDistance(b[0], at)))
      const vl5 = pool.map((id) => LADDERS[id].bands.map((b) => gelDistance(b[0] * 1.05, at)))
      for (let minutes = 5; minutes <= 180; minutes += 5) {
        const gel = { ...g, agarose, volts, minutes }
        let worst = 0
        for (let i = 0; i < sorted.length; i++) {
          d[i] = v[i] * minutes
          sd[i] = spreadAt(sorted[i], d[i], v5[i] * minutes, gel)
          worst = Math.max(worst, (d[i] + 2.5 * sd[i]) / g.length)
        }
        if (!fallback || worst < fallback.worst) fallback = { gel, worst }
        // longer runs only take bands further
        if (worst > END) break
        const within = Math.min(6, ...laneIdx.map(apart))
        const across = sorted.length > 1 ? Math.min(3, apart(all)) : 3
        const far = Math.min(0.35, d[d.length - 1] / g.length)
        const low = Math.max(0, d[0] / g.length - 0.7)
        let fine = Infinity
        for (let i = 0; i < sorted.length; i++) fine = Math.min(fine, (d[i] - v5[i] * minutes) / sd[i])
        const extraOff = shortest !== undefined && (vx * minutes) / g.length > EXTRA_END ? 1.5 : 0
        const score =
          within + 0.5 * across + far * 4 - low * 8 + Math.min(1.2, fine) * 1.5 - extraOff - Math.abs(Math.log(agarose)) * 0.3 - Math.abs(volts - 100) / 300 - Math.abs(minutes - 40) / 200
        // the ladder that suits this run: its bands on the gel, told apart, some either side of the products and among them
        let ladderScore = -Infinity
        let ladder = pool[0]
        pool.forEach((id, k) => {
          let off = 0
          let below = 0
          let above = 0
          let among = 0
          let last = -Infinity
          let lastSd = 0
          LADDERS[id].bands.forEach(([bp], m) => {
            const y = vl[k][m] * minutes
            if (y / g.length > LADDER_END) return void off++
            const s = spreadAt(bp, y, vl5[k][m] * minutes, gel)
            if (y - last < 0.75 * (s + lastSd)) return
            last = y
            lastSd = s
            if (bp < lo) below++
            else if (bp > hi) above++
            else among++
          })
          const fit = Math.min(below, 2) * 0.6 + Math.min(above, 2) * 0.6 + Math.min(among, 6) * 0.15 + Math.min(below + above + among, 8) * 0.1 - off * 1.2
          if (fit > ladderScore) {
            ladderScore = fit
            ladder = id
          }
        })
        if (!best || score + ladderScore > best.score) best = { gel, score: score + ladderScore, ladder }
      }
    }
  }
  if (best) return { gel: best.gel, ladder: best.ladder }
  const gel = fallback?.gel ?? g
  const off = (id: LadderId) => LADDERS[id].bands.filter(([bp]) => migration(bp, gel) > LADDER_END).length
  return { gel, ladder: pool.reduce((a, id) => (off(id) < off(a) ? id : a)) }
}

// ---------------------------------------------------------------- digests

/** Restriction enzymes, the caret at the top-strand cut. */
export const ENZYMES: Record<string, string> = {
  BamHI: "G^GATCC",
  BglII: "A^GATCT",
  DraI: "TTT^AAA",
  EcoRI: "G^AATTC",
  EcoRV: "GAT^ATC",
  HindIII: "A^AGCTT",
  KpnI: "GGTAC^C",
  MluI: "A^CGCGT",
  NcoI: "C^CATGG",
  NdeI: "CA^TATG",
  NheI: "G^CTAGC",
  NotI: "GC^GGCCGC",
  PstI: "CTGCA^G",
  SacI: "GAGCT^C",
  SalI: "G^TCGAC",
  ScaI: "AGT^ACT",
  SmaI: "CCC^GGG",
  SspI: "AAT^ATT",
  XbaI: "T^CTAGA",
  XhoI: "C^TCGAG",
}

export type GelBand = {
  /** Length in bp. */
  size: number
  /** DNA in the band: ng, or relative to the lane's others when the lane sets `ng`. Default: its size, as for equimolar fragments. */
  mass?: number
  label?: string
  /** Where it came from: "HindIII 53 to XbaI 1,742". */
  description?: string
  /** Where it runs, if not at its size: uncut plasmid runs as a fast supercoiled band and a slow nicked one. In bp of linear DNA. */
  apparent?: number
  /** Diffuse, as primer-dimers and degraded DNA run. */
  smear?: boolean
}

export type GelLane = {
  label: string
  bands?: GelBand[]
  /** A ladder, its bands and masses as its maker lists them. */
  ladder?: LadderId
  /** DNA loaded, ng: shared among the bands by their mass. Default 250, unless every band gives its mass in ng. */
  ng?: number
}

export type GelFocus = { lane: number; band: number; data: GelBand } | null

export type Fragment = GelBand & { start: number; end: number; left?: string; right?: string }

/**
 * The fragments a digest leaves: cuts on the top strand at the caret of each
 * site ("G^AATTC"; no caret cuts before the site). A circular sequence with
 * one cut gives one linear fragment of its full length; with none, it runs as
 * uncut plasmid does, a supercoiled band ahead of its size and a nicked one behind.
 */
export function digest(sequence: string, enzymes: Record<string, string>, { circular = false } = {}): Fragment[] {
  const s = sequence.toUpperCase().replace(/[^A-Z]/g, "")
  const L = s.length
  const cuts: { at: number; name: string }[] = []
  for (const [name, pattern] of Object.entries(enzymes)) {
    const caret = pattern.indexOf("^")
    const site = pattern.replace("^", "").toUpperCase()
    const off = caret < 0 ? 0 : caret
    const hay = circular ? s + s.slice(0, site.length - 1) : s
    for (let i = hay.indexOf(site); i >= 0 && i < L; i = hay.indexOf(site, i + 1)) cuts.push({ at: (i + off) % L, name })
  }
  cuts.sort((a, b) => a.at - b.at)
  const fmt = (n: number) => n.toLocaleString("en-US")
  if (!cuts.length)
    return circular
      ? [
          // mostly supercoiled, running ahead of its size; some nicked, behind
          { size: L, start: 1, end: L, apparent: Math.round(L * 0.62), mass: L, description: "Uncut, supercoiled" },
          { size: L, start: 1, end: L, apparent: Math.round(L * 1.7), mass: L * 0.3, description: "Uncut, nicked" },
        ]
      : [{ size: L, start: 1, end: L, description: "Uncut" }]
  const out: Fragment[] = []
  if (circular) {
    cuts.forEach((c, i) => {
      const next = cuts[(i + 1) % cuts.length]
      const size = cuts.length === 1 ? L : (next.at - c.at + L) % L || L
      out.push({ size, start: c.at + 1, end: ((next.at - 1 + L) % L) + 1, left: c.name, right: next.name, description: `${c.name} ${fmt(c.at + 1)} to ${next.name} ${fmt(next.at)}` })
    })
  } else {
    let prev = 0
    let prevName: string | undefined
    for (const c of cuts) {
      if (c.at > prev) out.push({ size: c.at - prev, start: prev + 1, end: c.at, left: prevName, right: c.name, description: `${prevName ? `${prevName} ${fmt(prev + 1)}` : "Start"} to ${c.name} ${fmt(c.at)}` })
      prev = c.at
      prevName = c.name
    }
    if (L > prev) out.push({ size: L - prev, start: prev + 1, end: L, left: prevName, description: `${prevName} ${fmt(prev + 1)} to the end` })
  }
  return out.sort((a, b) => b.size - a.size)
}

// ---------------------------------------------------------------- drawing

export type GelStain = "ethidium" | "sybr" | "print"

/** How a gel is drawn: as a stain shows it, with the ideal bands over it, or the ideal bands alone. */
export type GelMode = "real" | "overlay" | "ideal"

type Ramp = { ramp: [number, number, number][]; well: string; light: boolean }

/** How a gel is imaged: ethidium under UV, SYBR Safe under blue light, or printed dark on light, as a gel doc prints it. */
const STAINS: Record<GelStain, Ramp> = {
  print: { ramp: [[236, 236, 232], [198, 198, 196], [120, 120, 122], [48, 48, 52], [14, 14, 16]], well: "rgba(0,0,0,0.16)", light: false },
  // as a colour camera sees it: orange where there's DNA, white where it saturates, on the gel's violet
  ethidium: { ramp: [[20, 7, 28], [120, 30, 80], [236, 110, 80], [255, 190, 130], [255, 246, 228]], well: "rgba(0,0,0,0.55)", light: true },
  // through an amber filter: green-yellow on dark amber
  sybr: { ramp: [[30, 16, 5], [92, 70, 12], [170, 200, 40], [214, 250, 110], [246, 255, 214]], well: "rgba(0,0,0,0.5)", light: true },
}

const LUT = 1024
const SAT = 1 / (1 - Math.exp(-1.6))
const lutCache = new Map<string, Uint32Array>()
function colours(stain: keyof typeof STAINS) {
  let out = lutCache.get(stain)
  if (out) return out
  const ramp = STAINS[stain].ramp
  out = new Uint32Array(LUT)
  const bytes = new Uint8ClampedArray(out.buffer)
  for (let i = 0; i < LUT; i++) {
    const t = (i / (LUT - 1)) * (ramp.length - 1)
    const k = Math.min(ramp.length - 2, Math.floor(t))
    for (let c = 0; c < 3; c++) bytes[i * 4 + c] = ramp[k][c] + (ramp[k + 1][c] - ramp[k][c]) * (t - k)
    bytes[i * 4 + 3] = 255
  }
  lutCache.set(stain, out)
  return out
}

// a stable random number in [0, 1) for these keys, so a gel's quirks stay put as it's redrawn
const rand = (...keys: number[]) => {
  let h = 2166136261
  for (const k of keys) h = Math.imul(h ^ Math.round(k * 1000), 16777619)
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}
const mottle = (x: number, y: number) => Math.sin(x * 0.021 + Math.sin(y * 0.013) * 2) * 0.5 + Math.sin(y * 0.017 + x * 0.006 + 1.7) * 0.5
const grain = (x: number, y: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

// the light behind the gel: brightest in the middle, blotchy, with dust and the camera's grain. Kept by size and seed.
const backCache = new Map<string, Float32Array>()
function backdrop(W: number, H: number, dpr: number, seed: number) {
  const key = `${W}x${H}@${dpr}#${seed}`
  const kept = backCache.get(key)
  if (kept) return kept
  const back = new Float32Array(W * H)
  const shift = (seed % 9973) * 1.37
  for (let p = 0; p < W * H; p++) {
    const x = p % W
    const y = (p - x) / W
    const r = ((x / W - 0.5) ** 2 + (y / H - 0.45) ** 2) * 2
    back[p] = 0.05 * (1 - Math.min(1, r)) + 0.015 * mottle(x / dpr + shift, y / dpr + shift * 0.7) + (grain(x + shift, y) - 0.5) * 0.025
  }
  for (let k = 0; k < (W * H) / 20000; k++) {
    const cx = rand(k, 12, seed) * W
    const cy = rand(k, 11, seed) * H
    const r = (0.35 + 1.0 * rand(k, 14, seed) ** 3) * dpr
    const stretch = 1 + rand(k, 15, seed) * rand(k, 15, seed) * 1.8
    const angle = rand(k, 16, seed) * Math.PI
    const [ca, sa] = [Math.cos(angle), Math.sin(angle)]
    // the larger, the fainter: a big speck is out of focus
    const peak = (0.12 + rand(k, 13, seed) * 0.35) / Math.max(1, r / dpr)
    const reach = Math.ceil(r * stretch * 2.5)
    for (let py = Math.max(0, Math.floor(cy - reach)); py <= Math.min(H - 1, cy + reach); py++)
      for (let px = Math.max(0, Math.floor(cx - reach)); px <= Math.min(W - 1, cx + reach); px++) {
        const dx = px - cx
        const dy = py - cy
        const along = (dx * ca + dy * sa) / stretch
        const across = -dx * sa + dy * ca
        back[py * W + px] += peak * Math.exp(-(along * along + across * across) / (2 * r * r))
      }
  }
  if (backCache.size >= 8) backCache.delete(backCache.keys().next().value!)
  backCache.set(key, back)
  return back
}

type Run = { size: number; ng: number; smear?: boolean }
type Layout = { slabX: number; slabW: number; laneX: number[]; laneW: number; H: number; cm: number }

// wells sit this far into the slab, and are this deep
const WELL_TOP = 6
const WELL_H = 5
const RUN_TOP = WELL_TOP + WELL_H + 2

/** The slab drawn to a canvas: the stain's glow, a pixel at a time, then wells. */
function paintSlab(canvas: HTMLCanvasElement, runs: Run[][], g: GelSettings, stain: keyof typeof STAINS, lay: Layout, dpr: number, seed: number) {
  const W = Math.round(lay.slabW * dpr)
  const H = Math.round(lay.H * dpr)
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W
    canvas.height = H
  }
  const ctx = canvas.getContext("2d")
  if (!ctx || !W || !H) return
  const lit = new Float32Array(W * H)
  const top = RUN_TOP * dpr
  runs.forEach((bands, i) => {
    const lx = (lay.laneX[i] - lay.slabX + (rand(i, 1, seed) - 0.5) * 1.2) * dpr
    const lw = lay.laneW * dpr
    const speed = 1 + (rand(i, 2, seed) - 0.5) * 0.025
    const smile = 0.006 + rand(i, 3, seed) * 0.018
    const tilt = (rand(i, 4, seed) - 0.5) * 0.012
    // the well's residue
    if (bands.some((b) => !b.smear))
      for (let px = Math.max(0, Math.floor(lx)); px <= Math.min(W - 1, lx + lw); px++) {
        const k = 0.1 * (0.7 + 0.3 * rand(i, px))
        for (let py = 0; py < top + 3 * dpr && py < H; py++) lit[py * W + px] += k * Math.exp(-(((py - (WELL_TOP + WELL_H / 2) * dpr) / (2.2 * dpr)) ** 2))
      }
    bands.forEach((b, j) => {
      const d = gelDistance(b.size, g) * speed
      if (d > g.length) return
      const y = top + d * lay.cm * dpr
      const sigma = Math.max(0.8, spread(b.size, g) * lay.cm * dpr * (b.smear ? 2.6 : 1) * (0.9 + rand(i, j, 5, seed) * 0.25))
      // brighter for more DNA, saturating as a stain does; and loaded not quite as much as meant
      const amp = (1 - Math.exp(-b.ng / 35)) * (b.smear ? 0.3 : 1) * (0.82 + rand(i, j, 6, seed) * 0.3)
      const trail = b.smear ? 0 : 0.03 + rand(i, j, 7, seed) * 0.04
      const trailLen = Math.max(2 * sigma, (y - top) * 0.1)
      const y0 = Math.max(0, Math.floor(y - 4 * sigma - (b.smear ? 0 : trailLen)))
      const y1 = Math.min(H - 1, Math.ceil(y + 4 * sigma))
      for (let px = Math.floor(lx - 2 * dpr); px <= Math.ceil(lx + lw + 2 * dpr); px++) {
        if (px < 0 || px >= W) continue
        // soft sides, a little brighter (DNA crowds at a well's edges); smiled and a hair tilted; loaded unevenly across
        const u = (px - lx) / lw
        const edge = Math.min(1, Math.max(0, Math.min(u, 1 - u) * 9 + 0.5)) * (1 + 0.1 * (2 * u - 1) ** 4) * (0.93 + 0.07 * Math.sin(u * 7 + rand(i, j, 8, seed) * 6))
        const yx = top + (y - top) * (1 - smile * (2 * u - 1) ** 2 + tilt * (2 * u - 1))
        for (let py = y0; py <= y1; py++) {
          const dy = py - yx
          // its body, sharper at the leading edge; and above it, the smear it trails
          const s2 = dy > 0 ? sigma * 0.85 : sigma
          let v = Math.exp(-(dy * dy) / (2 * s2 * s2))
          if (dy < -sigma) v += trail * Math.exp((3 * (dy + sigma)) / trailLen) * Math.min(1, (dy + sigma + 4 * sigma + trailLen) / trailLen)
          lit[py * W + px] += amp * edge * v
        }
      }
    })
  })
  const back = backdrop(W, H, dpr, seed)
  const lut = colours(stain)
  const off = document.createElement("canvas")
  off.width = W
  off.height = H
  const octx = off.getContext("2d")!
  const img = octx.createImageData(W, H)
  const px32 = new Uint32Array(img.data.buffer)
  for (let p = 0; p < W * H; p++) {
    const lv = lit[p]
    const v = back[p] + (lv > 0 ? (1 - Math.exp(-1.6 * lv)) * SAT : 0)
    px32[p] = lut[Math.max(0, Math.min(LUT - 1, (v * (LUT - 1)) | 0))]
  }
  octx.putImageData(img, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, W, H)
  // a little blur, as a camera sees it; and the brightest bands bloom
  ctx.filter = `blur(${0.6 * dpr}px)`
  ctx.drawImage(off, 0, 0)
  ctx.globalCompositeOperation = STAINS[stain].light ? "screen" : "multiply"
  ctx.globalAlpha = 0.3
  ctx.filter = `blur(${4 * dpr}px)`
  ctx.drawImage(off, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
  ctx.filter = "none"
  // the wells
  ctx.fillStyle = STAINS[stain].well
  runs.forEach((_, i) => {
    ctx.beginPath()
    ctx.roundRect((lay.laneX[i] - lay.slabX) * dpr, WELL_TOP * dpr, lay.laneW * dpr, WELL_H * dpr, 1.5 * dpr)
    ctx.fill()
  })
}

const fmt = (n: number) => n.toLocaleString("en-US")
const fmtSize = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} kb` : `${n} bp`)

function useWidth() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

const RUN_MS = 1800
// a label character's width, px
const CHAR = 6.2

type GelProps = Omit<React.ComponentProps<"div">, "children"> &
  Partial<GelSettings> & {
    lanes: GelLane[]
    /** The slab's height in px; its `length` in cm is drawn to fit. Default 440. */
    height?: number
    /** How it's imaged: "ethidium" (default) under UV, "sybr" under blue light, or "print", dark on light. */
    stain?: GelStain
    /** "real" (default) as the stain shows it; "overlay", the ideal bands drawn over it; "ideal", the ideal bands alone. */
    mode?: GelMode
    /** The ladder's sizes along the left. Default true. */
    sizes?: boolean
    /** The loading dyes' fronts along the right. Default true. */
    dyes?: boolean
    /** Change it to run the gel again from the wells; set as it mounts, it runs as it appears. */
    run?: number
    /** The minutes as a run plays, each frame. */
    onRunProgress?: (minutes: number) => void
    selectable?: boolean
    onActiveChange?: (focus: GelFocus) => void
  }

function Gel({
  lanes,
  agarose = DEFAULT_GEL.agarose,
  buffer = DEFAULT_GEL.buffer,
  volts = DEFAULT_GEL.volts,
  electrodes = DEFAULT_GEL.electrodes,
  minutes = DEFAULT_GEL.minutes,
  length = DEFAULT_GEL.length,
  height = 440,
  stain = "ethidium",
  mode = "real",
  sizes = true,
  dyes = true,
  run,
  onRunProgress,
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: GelProps) {
  const [ref, width] = useWidth()
  const ink = stain
  const ideal = mode === "ideal"
  const [seed] = React.useState(() => (Math.random() * 1e6) | 0)

  // a run playing: the minutes climbing to those set, eased
  const [playing, setPlaying] = React.useState<number>()
  const progress = React.useRef(onRunProgress)
  progress.current = onRunProgress
  React.useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t0 = performance.now()
    let frame = 0
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / RUN_MS)
      const m = p < 1 ? minutes * (1 - (1 - p) ** 2) : undefined
      setPlaying(m)
      progress.current?.(m ?? minutes)
      if (p < 1) frame = requestAnimationFrame(step)
    }
    step()
    return () => cancelAnimationFrame(frame)
    // a run starts when asked for; what it runs to is read as it starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])
  const set = React.useMemo<GelSettings>(() => ({ agarose, buffer, volts, electrodes, minutes, length }), [agarose, buffer, volts, electrodes, minutes, length])
  const g = React.useMemo(() => (playing === undefined ? set : { ...set, minutes: playing }), [set, playing])

  const rows = React.useMemo(
    () =>
      lanes.map((l) => {
        if (l.ladder) {
          const L = LADDERS[l.ladder]
          return L.bands.map(([s, ng]): GelBand => ({ size: s, mass: ng, label: fmtSize(s), description: `${L.name}, ${ng} ng` }))
        }
        return [...(l.bands ?? [])].sort((a, b) => (b.apparent ?? b.size) - (a.apparent ?? a.size))
      }),
    [lanes]
  )
  // each band's ng: as given, or the lane's load shared by mass
  const runs = React.useMemo<Run[][]>(
    () =>
      rows.map((r, i) => {
        const l = lanes[i]
        const given = !!l.ladder || (l.ng === undefined && r.length > 0 && r.every((b) => b.mass !== undefined))
        const m = r.map((b) => b.mass ?? b.size)
        const sum = m.reduce((a, b) => a + b, 0) || 1
        return r.map((b, k) => ({ size: b.apparent ?? b.size, ng: given ? m[k] : ((l.ng ?? 250) * m[k]) / sum, smear: b.smear }))
      }),
    [rows, lanes]
  )

  const ladderLane = lanes.findIndex((l) => l.ladder)
  const showSizes = sizes && ladderLane >= 0
  const gutterL = showSizes ? 48 : 0
  const gutterR = dyes ? 36 : 0
  const top = 32
  const W = Math.max(width, 1)
  const n = Math.max(1, lanes.length)
  const avail = W - gutterL - gutterR
  // lanes as a real gel's: 34 px at most, 12 apart, so bands keep their proportions
  const pitch = Math.min(46, avail / n)
  const gap = Math.max(6, Math.min(12, pitch * 0.26))
  const laneW = Math.max(8, pitch - gap)
  const slabW = n * pitch + gap
  const slabX = gutterL + Math.max(0, (avail - slabW) / 2)
  const laneXs = lanes.map((_, i) => slabX + gap + i * pitch)
  const cx = (i: number) => laneXs[i] + laneW / 2
  // labels over their lanes, on up to two lines broken at " + "; where any won't fit, numbers, named in a key below
  const linesOf = (t: string) => {
    if (t.length * CHAR <= pitch) return [t]
    const at = t.lastIndexOf(" + ")
    return at < 0 ? [t] : [t.slice(0, at), t.slice(at + 1)]
  }
  const numbered = lanes.some((l) => linesOf(l.label).some((p) => p.length * CHAR > pitch + 4))
  const cm = (height - RUN_TOP - 4) / length
  const yOf = (bp: number) => top + RUN_TOP + gelDistance(bp, g) * cm
  const yb = (b: GelBand) => yOf(b.apparent ?? b.size)
  const on = (bp: number) => gelDistance(bp, g) <= g.length
  const H = top + height + 6

  const canvas = React.useRef<HTMLCanvasElement>(null)
  React.useLayoutEffect(() => {
    const c = canvas.current
    if (!c || !width || ideal) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    paintSlab(c, runs, g, ink, { slabX, slabW, laneX: laneXs, laneW, H: height, cm }, dpr, seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, g, ink, width, height, seed, ideal])

  // ---- focus
  const flat = React.useMemo(() => rows.flatMap((r, lane) => r.map((_, band) => ({ lane, band }))), [rows])
  const [hover, setHover] = React.useState<{ lane: number; band: number } | null>(null)
  const [cursor, setCursor] = React.useState(0)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? (flat[cursor] ?? null) : null)
  const activeBand = active ? rows[active.lane]?.[active.band] : null
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  const k = active ? `${active.lane}-${active.band}` : ""
  React.useEffect(() => cb.current?.(active && activeBand ? { ...active, data: activeBand } : null), [k]) // eslint-disable-line react-hooks/exhaustive-deps

  const describe = (a: { lane: number; band: number } | null) => {
    if (!a) return ""
    const b = rows[a.lane][a.band]
    const where = on(b.apparent ?? b.size) ? "" : ", run off the gel"
    return `${lanes[a.lane].label}, ${b.apparent ? `uncut ${fmtSize(b.size)}` : fmtSize(b.size)}${b.description && !lanes[a.lane].ladder ? `, ${b.description}` : ""}${where}`
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = flat[cursor]
    if (!cur) return
    let next = cursor
    if (e.key === "ArrowDown") next = Math.min(flat.length - 1, cursor + 1)
    else if (e.key === "ArrowUp") next = Math.max(0, cursor - 1)
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const d = e.key === "ArrowRight" ? 1 : -1
      let lane = cur.lane + d
      while (lane >= 0 && lane < lanes.length && !rows[lane].length) lane += d
      if (lane < 0 || lane >= lanes.length) return e.preventDefault()
      // the band nearest in height on the next lane
      const yy = yb(rows[cur.lane][cur.band])
      const best = rows[lane].reduce((a, b, i) => (Math.abs(yb(b) - yy) < Math.abs(yb(rows[lane][a]) - yy) ? i : a), 0)
      next = flat.findIndex((f) => f.lane === lane && f.band === best)
    } else if (e.key === "Home") next = 0
    else if (e.key === "End") next = flat.length - 1
    else return
    e.preventDefault()
    setCursor(next)
  }

  const label =
    ariaLabel ??
    `Agarose gel, ${agarose}% ${buffer.toUpperCase()}, ${volts} V for ${minutes} min: ${lanes
      .map((l, i) => `${l.label}: ${l.ladder ? LADDERS[l.ladder].name : rows[i].map((b) => fmtSize(b.size)).join(", ") || "no bands"}`)
      .join("; ")}`

  // ladder sizes, left out where they'd overlap
  const ladderTicks: { size: number; y: number }[] = []
  if (showSizes) {
    let last = -Infinity
    for (const b of rows[ladderLane]) {
      if (!on(b.size)) continue
      const y = yOf(b.size)
      if (y - last < 11) continue
      last = y
      ladderTicks.push({ size: b.size, y })
    }
  }
  const fronts = dyeFronts(g)
  const light = !ideal && STAINS[ink].light

  return (
    <div data-slot="gel" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div
        ref={ref}
        className={cn("relative w-full select-none outline-none", selectable && "rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring")}
        style={{ height: H }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          const px = e.clientX - r.left
          const py = e.clientY - r.top
          const lane = Math.floor((px - slabX - gap / 2) / pitch)
          if (lane < 0 || lane >= lanes.length) return setHover(null)
          let best: number | null = null
          let d = Infinity
          rows[lane].forEach((b, i) => {
            const bp = b.apparent ?? b.size
            if (!on(bp)) return
            const dd = Math.abs(yb(b) - py)
            if (dd < Math.max(6, spread(bp, g) * cm * 2) && dd < d) {
              d = dd
              best = i
            }
          })
          setHover(best == null ? null : { lane, band: best })
        }}
        onPointerLeave={() => setHover(null)}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": 1,
              "aria-valuemax": flat.length,
              "aria-valuenow": cursor + 1,
              "aria-valuetext": describe(flat[cursor] ?? null),
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <>
            {!ideal && <canvas ref={canvas} aria-hidden className="absolute rounded-lg" style={{ left: slabX, top, width: slabW, height }} />}
            <svg width={W} height={H} aria-hidden className="absolute inset-0 block overflow-visible">
              {/* the ideal run: a plain slab, each band a line where its size runs */}
              {ideal && (
                <>
                  <rect x={slabX} y={top} width={slabW} height={height} rx={8} className="fill-surface-container-high" />
                  {lanes.map((_, i) => (
                    <rect key={i} x={laneXs[i]} y={top + WELL_TOP} width={laneW} height={WELL_H} rx={1.5} className="fill-foreground/15" />
                  ))}
                </>
              )}
              {mode !== "real" &&
                runs.map((r, i) =>
                  r.map((b, j) => {
                    if (!on(b.size)) return null
                    const y = yOf(b.size)
                    const ladder = !!lanes[i].ladder
                    const color = ideal ? "fill-foreground" : light ? "fill-[#4fe3ff]" : "fill-[#d61f1f]"
                    if (b.smear) {
                      const sm = Math.max(2, spread(b.size, g) * cm * 2.6)
                      return <rect key={`${i}-${j}`} x={laneXs[i]} y={y - sm} width={laneW} height={2 * sm} rx={sm} className={color} opacity={0.3} />
                    }
                    const t = ladder ? 1.2 : ideal ? 2.2 : 1.8
                    return (
                      <rect
                        key={`${i}-${j}`}
                        x={laneXs[i] - (ideal ? 0 : 3)}
                        y={y - t / 2}
                        width={laneW + (ideal ? 0 : 6)}
                        height={t}
                        rx={t / 2}
                        className={color}
                        opacity={ladder ? (ideal ? 0.55 : 0.8) : 1}
                      />
                    )
                  })
                )}
              {/* lane labels: the lane in focus lights its label as a pill */}
              {lanes.map((l, i) => {
                const parts = numbered ? [String(i + 1)] : linesOf(l.label)
                const lit = active?.lane === i
                const w = Math.min(pitch, Math.max(...parts.map((p) => p.length)) * CHAR + 14, numbered ? 22 : Infinity)
                const h = parts.length > 1 ? 28 : 18
                return (
                  <g key={i}>
                    <rect
                      x={cx(i) - w / 2}
                      y={13 - h / 2 + (parts.length > 1 ? 1 : 0)}
                      width={w}
                      height={h}
                      rx={h > 20 ? 10 : h / 2}
                      className={cn("fill-foreground transition-opacity duration-200", lit ? "opacity-100" : "opacity-0")}
                    />
                    <text x={cx(i)} y={parts.length > 1 ? 10 : 17} textAnchor="middle" className={cn("text-[0.6875rem] tabular-nums transition-colors duration-200", lit ? "fill-background font-semibold" : "fill-muted-foreground")}>
                      {parts.map((p, k) => (
                        <tspan key={k} x={cx(i)} dy={k ? 12 : 0}>
                          {p}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )
              })}
              {/* ladder sizes */}
              {ladderTicks.map((t) => (
                <g key={t.size}>
                  <text x={slabX - 10} y={t.y + 3.5} textAnchor="end" className="fill-muted-foreground text-[0.625rem] tabular-nums">
                    {fmtSize(t.size)}
                  </text>
                  <rect x={slabX - 6} y={t.y - 0.75} width={4} height={1.5} rx={0.75} className="fill-muted-foreground/60" />
                </g>
              ))}
              {/* the loading dyes' fronts, in their own colours */}
              {dyes &&
                (
                  [
                    ["BPB", fronts.bromophenol, "fill-[oklch(0.58_0.2_275)]", "Bromophenol blue"],
                    ["XC", fronts.xylene, "fill-[oklch(0.7_0.12_200)]", "Xylene cyanol"],
                  ] as const
                ).map(([name, d, color, full]) =>
                  d > g.length ? null : (
                    <g key={name}>
                      <title>{`${full} front`}</title>
                      <rect x={slabX + slabW + 4} y={top + RUN_TOP + d * cm - 2} width={8} height={4} rx={2} className={color} />
                      <text x={slabX + slabW + 15} y={top + RUN_TOP + d * cm + 3.5} className="fill-muted-foreground text-[0.625rem]">
                        {name}
                      </text>
                    </g>
                  )
                )}
              {/* a lane whose bands have all run off says so */}
              {rows.map((r, i) =>
                r.length && r.every((b) => !b.smear && !on(b.apparent ?? b.size)) && laneW >= 22 ? (
                  <text key={i} x={cx(i)} y={top + height - 10} textAnchor="middle" className={cn("text-[0.5625rem]", ideal ? "fill-muted-foreground" : light ? "fill-white/70" : "fill-black/60")}>
                    Ran off
                  </text>
                ) : null
              )}
              {/* the band in focus */}
              {active &&
                activeBand &&
                on(activeBand.apparent ?? activeBand.size) &&
                (() => {
                  const s = Math.max(3, spread(activeBand.apparent ?? activeBand.size, g) * cm * 1.6)
                  return (
                    <rect
                      x={laneXs[active.lane] - 4}
                      y={yb(activeBand) - s - 3}
                      width={laneW + 8}
                      height={2 * s + 6}
                      rx={s + 3}
                      fill="none"
                      className={light ? "stroke-white" : "stroke-ring"}
                      strokeWidth={1.5}
                    />
                  )
                })()}
            </svg>
          </>
        )}

        {active && activeBand && hover && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid max-w-56 -translate-y-1/2 gap-0.5 rounded-xl bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{
              left: cx(active.lane) + pitch / 2 + 8 + 200 > W ? undefined : cx(active.lane) + pitch / 2 + 8,
              right: cx(active.lane) + pitch / 2 + 8 + 200 > W ? W - cx(active.lane) + pitch / 2 + 8 : undefined,
              top: yb(activeBand),
            }}
          >
            <span className="type-label-lg font-semibold tabular-nums">{`${fmt(activeBand.size)} bp`}</span>
            <span className="type-label-sm opacity-80">{lanes[active.lane].label}</span>
            {activeBand.description && <span className="type-label-sm tabular-nums opacity-80">{activeBand.description}</span>}
          </div>
        )}
      </div>
      {numbered && (
        <ol aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 type-body-sm text-muted-foreground" style={{ paddingLeft: slabX }}>
          {lanes.map((l, i) => (
            <li key={i} className={cn("transition-colors", active?.lane === i && "text-foreground")}>
              <span className="font-semibold text-foreground tabular-nums">{i + 1}</span> {l.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export { Gel, type GelProps }
