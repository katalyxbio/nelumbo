"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Variant Badge
 *
 * A variant's clinical classification on the ACMG/AMP five-tier scale, as a
 * badge whose color carries the meaning: red toward pathogenic, green toward
 * benign, neutral for uncertain. Five pips show where on the scale it sits,
 * so the tier reads without color too.
 *
 *   <VariantBadge classification="pathogenic" />
 *   <VariantBadge classification="likely-benign" notation="short" />        // LB
 *   <VariantBadge classification="uncertain" review={1} />                  // with ClinVar review stars
 *   <VariantEvidence criteria={["PVS1", "PM2_Supporting", "PP3"]} />        // the criteria as chips
 *   classifyVariant(["PS3", "PM1", "PM2"])                                  // "likely-pathogenic"
 *
 * classifyVariant applies the 2015 ACMG/AMP combining rules (Richards et
 * al., table 5), with ClinGen's strength suffixes (PM2_Supporting, PVS1_Strong):
 * when pathogenic and benign rules are both met, the variant stays uncertain.
 */

export type VariantClassification = "pathogenic" | "likely-pathogenic" | "uncertain" | "likely-benign" | "benign" | "conflicting" | "not-provided"

export const VARIANT_CLASSES: Record<VariantClassification, { name: string; short: string; tier: number | null; about: string }> = {
  pathogenic: { name: "Pathogenic", short: "P", tier: 0, about: "Causes disease" },
  "likely-pathogenic": { name: "Likely pathogenic", short: "LP", tier: 1, about: "Over 90% certain to cause disease" },
  uncertain: { name: "Uncertain significance", short: "VUS", tier: 2, about: "Not enough evidence either way" },
  "likely-benign": { name: "Likely benign", short: "LB", tier: 3, about: "Over 90% certain not to cause disease" },
  benign: { name: "Benign", short: "B", tier: 4, about: "Does not cause disease" },
  conflicting: { name: "Conflicting", short: "Conflicting", tier: null, about: "Submitters disagree" },
  "not-provided": { name: "Not provided", short: "NP", tier: null, about: "No classification given" },
}

// tonal: the container, its ink, and the pip; strong tiers full, likely tiers lighter
const TONES: Record<VariantClassification, { tonal: string; outline: string; solid: string; pip: string }> = {
  pathogenic: {
    tonal: "bg-red-container text-red-container-foreground",
    outline: "border-red text-red-container-foreground dark:text-red",
    solid: "bg-red text-red-foreground",
    pip: "bg-red",
  },
  "likely-pathogenic": {
    tonal: "bg-red-container/55 text-red-container-foreground dark:bg-red-container/60",
    outline: "border-red/60 text-red-container-foreground dark:text-red",
    solid: "bg-red text-red-foreground",
    pip: "bg-red/70",
  },
  uncertain: {
    tonal: "bg-surface-container-highest text-foreground",
    outline: "border-outline text-foreground",
    solid: "bg-foreground text-background",
    pip: "bg-foreground/70",
  },
  "likely-benign": {
    tonal: "bg-green-container/55 text-green-container-foreground dark:bg-green-container/60",
    outline: "border-green/60 text-green-container-foreground dark:text-green",
    solid: "bg-green text-green-foreground",
    pip: "bg-green/70",
  },
  benign: {
    tonal: "bg-green-container text-green-container-foreground",
    outline: "border-green text-green-container-foreground dark:text-green",
    solid: "bg-green text-green-foreground",
    pip: "bg-green",
  },
  conflicting: {
    tonal: "bg-surface-container-highest text-foreground",
    outline: "border-outline text-foreground",
    solid: "bg-foreground text-background",
    pip: "bg-foreground/70",
  },
  "not-provided": {
    tonal: "bg-surface-container-high text-muted-foreground",
    outline: "border-outline-variant text-muted-foreground",
    solid: "bg-muted-foreground text-background",
    pip: "bg-muted-foreground",
  },
}

/** "Likely pathogenic", "LP", "VUS", "likely_benign", "Benign/Likely benign" (ClinVar) to a classification. */
export function toClassification(text: string): VariantClassification {
  const t = text.toLowerCase().replace(/[_\s-]+/g, " ").trim()
  if (/conflict/.test(t)) return "conflicting"
  if (/^(p|pathogenic)$/.test(t) || /^pathogenic\b/.test(t)) return "pathogenic"
  if (/^(lp|likely pathogenic)/.test(t)) return "likely-pathogenic"
  if (/^(vus|uncertain|us)\b/.test(t)) return "uncertain"
  if (/^(lb|likely benign)/.test(t)) return "likely-benign"
  if (/^(b|benign)\b/.test(t)) return "benign"
  return "not-provided"
}

// ---- ACMG/AMP criteria

export type AcmgStrength = "stand-alone" | "very-strong" | "strong" | "moderate" | "supporting"
export type AcmgCriterion = { code: string; base: string; direction: "pathogenic" | "benign"; strength: AcmgStrength }

const DEFAULT_STRENGTH: Record<string, AcmgStrength> = {
  PVS: "very-strong",
  PS: "strong",
  PM: "moderate",
  PP: "supporting",
  BA: "stand-alone",
  BS: "strong",
  BP: "supporting",
}

/** "PM2_Supporting" → { base: "PM2", direction: "pathogenic", strength: "supporting" }. */
export function parseCriterion(code: string): AcmgCriterion | null {
  const m = code.trim().match(/^(PVS|PS|PM|PP|BA|BS|BP)(\d+)(?:[_\s-]+(very[_\s-]?strong|strong|moderate|supporting|stand[_\s-]?alone))?$/i)
  if (!m) return null
  const kind = m[1].toUpperCase()
  const mod = m[3]?.toLowerCase().replace(/[_\s-]/g, "")
  const strength: AcmgStrength = mod
    ? mod === "verystrong"
      ? "very-strong"
      : mod === "standalone"
        ? "stand-alone"
        : (mod as AcmgStrength)
    : DEFAULT_STRENGTH[kind]
  return { code: code.trim(), base: `${kind}${m[2]}`, direction: kind.startsWith("P") ? "pathogenic" : "benign", strength }
}

/** A classification from ACMG/AMP criteria by the 2015 combining rules. */
export function classifyVariant(criteria: string[]): VariantClassification {
  const cs = criteria.map(parseCriterion).filter((c): c is AcmgCriterion => !!c)
  const count = (dir: AcmgCriterion["direction"], s: AcmgStrength) => cs.filter((c) => c.direction === dir && c.strength === s).length
  const pvs = count("pathogenic", "very-strong")
  const ps = count("pathogenic", "strong")
  const pm = count("pathogenic", "moderate")
  const pp = count("pathogenic", "supporting")
  const ba = count("benign", "stand-alone")
  const bs = count("benign", "strong") + count("benign", "very-strong")
  const bp = count("benign", "supporting") + count("benign", "moderate")

  const pathogenic =
    (pvs >= 1 && (ps >= 1 || pm >= 2 || (pm === 1 && pp === 1) || pp >= 2)) ||
    ps >= 2 ||
    (ps === 1 && (pm >= 3 || (pm === 2 && pp >= 2) || (pm === 1 && pp >= 4))) ||
    pvs >= 2
  const likelyPathogenic =
    (pvs >= 1 && pm === 1) ||
    (ps === 1 && (pm === 1 || pm === 2)) ||
    (ps === 1 && pp >= 2) ||
    pm >= 3 ||
    (pm === 2 && pp >= 2) ||
    (pm === 1 && pp >= 4)
  const benign = ba >= 1 || bs >= 2
  const likelyBenign = (bs === 1 && bp >= 1) || bp >= 2

  const towardP = pathogenic || likelyPathogenic
  const towardB = benign || likelyBenign
  if (towardP && towardB) return "uncertain"
  if (pathogenic) return "pathogenic"
  if (likelyPathogenic) return "likely-pathogenic"
  if (benign) return "benign"
  if (likelyBenign) return "likely-benign"
  return "uncertain"
}

// ---- badge

const SIZES = {
  sm: { root: "h-5 gap-1.5 pl-1.5 pr-2 text-[0.6875rem]", pip: "h-1.5 w-1", on: "h-2.5", star: "[--icon-size:12px]" },
  default: { root: "h-6 gap-2 pl-2 pr-2.5 type-label-md", pip: "h-2 w-1", on: "h-3", star: "[--icon-size:14px]" },
  lg: { root: "h-8 gap-2.5 pl-2.5 pr-3.5 type-label-lg", pip: "h-2.5 w-1.5", on: "h-4", star: "[--icon-size:16px]" },
}

const REVIEW = [
  "No assertion criteria",
  "Criteria provided, single submitter",
  "Criteria provided, multiple submitters, no conflicts",
  "Reviewed by expert panel",
  "Practice guideline",
]

type VariantBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** A classification, or text to read one from ("Likely pathogenic", "VUS"). */
  classification: VariantClassification | (string & {})
  /** "full" (default), or "short": P, LP, VUS, LB, B. */
  notation?: "full" | "short"
  variant?: "tonal" | "outline" | "solid"
  size?: keyof typeof SIZES
  /** Five pips for where it sits on the scale. Default true. */
  scale?: boolean
  /** ClinVar review status, 0 to 4 stars. */
  review?: 0 | 1 | 2 | 3 | 4
}

function VariantBadge({
  classification,
  notation = "full",
  variant = "tonal",
  size = "default",
  scale = true,
  review,
  className,
  title,
  ...props
}: VariantBadgeProps) {
  const c = (classification in VARIANT_CLASSES ? classification : toClassification(classification)) as VariantClassification
  const info = VARIANT_CLASSES[c]
  const tone = TONES[c]
  const S = SIZES[size]
  const spoken = `${info.name}${review != null ? `, ${review} of 4 stars, ${REVIEW[review].toLowerCase()}` : ""}`
  return (
    <span
      data-slot="variant-badge"
      data-classification={c}
      title={title ?? `${info.name}: ${info.about}${review != null ? `. ${REVIEW[review]}` : ""}`}
      className={cn(
        "inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-transparent font-medium leading-none",
        S.root,
        tone[variant],
        variant === "outline" && "bg-transparent",
        !scale && (size === "sm" ? "pl-2" : size === "lg" ? "pl-3.5" : "pl-2.5"),
        className
      )}
      {...props}
    >
      {scale && (
        <span aria-hidden className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-full transition-[height] duration-300 ease-spring",
                S.pip,
                t === info.tier ? cn(S.on, variant === "solid" ? "bg-current" : tone.pip) : variant === "solid" ? "bg-current opacity-35" : "bg-current opacity-25",
                info.tier == null && t === 2 && "opacity-60"
              )}
            />
          ))}
        </span>
      )}
      <span className="sr-only">{spoken}</span>
      <span aria-hidden>{notation === "short" ? info.short : info.name}</span>
      {review != null && (
        <span aria-hidden className={cn("-mr-0.5 flex items-center", S.star)}>
          {[1, 2, 3, 4].map((s) => (
            <Icon key={s} name="star" fill={s <= review} className={cn(s <= review ? "opacity-100" : "opacity-35")} />
          ))}
        </span>
      )}
    </span>
  )
}

// ---- evidence chips

const STRENGTH_NAME: Record<AcmgStrength, string> = {
  "stand-alone": "stand-alone",
  "very-strong": "very strong",
  strong: "strong",
  moderate: "moderate",
  supporting: "supporting",
}

const RANK: Record<AcmgStrength, number> = { "stand-alone": 4, "very-strong": 4, strong: 3, moderate: 2, supporting: 1 }

type VariantEvidenceProps = Omit<React.ComponentProps<"ul">, "children"> & {
  /** ACMG/AMP criteria met: "PVS1", "PM2_Supporting", "BS1". */
  criteria: string[]
  size?: "sm" | "default"
}

/**
 * The criteria met, as chips: red ones argue pathogenic, green benign, and
 * the bars beside each code show its strength (one for supporting, four for
 * very strong or stand-alone).
 */
function VariantEvidence({ criteria, size = "default", className, ...props }: VariantEvidenceProps) {
  const cs = criteria.map((c) => parseCriterion(c) ?? null)
  return (
    <ul data-slot="variant-evidence" className={cn("flex flex-wrap gap-1.5", className)} aria-label="ACMG criteria" {...props}>
      {cs.map((c, i) =>
        c ? (
          <li
            key={`${c.code}${i}`}
            title={`${c.base}: ${c.direction}, ${STRENGTH_NAME[c.strength]}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm font-mono font-semibold leading-none",
              size === "sm" ? "h-5 px-1.5 text-[0.6875rem]" : "h-6 px-2 text-[0.75rem]",
              c.direction === "pathogenic" ? "bg-red-container text-red-container-foreground" : "bg-green-container text-green-container-foreground"
            )}
          >
            {c.base}
            <span aria-hidden className="flex items-end gap-px">
              {[1, 2, 3, 4].map((k) => (
                <span key={k} className={cn("w-[3px] rounded-full bg-current", k <= RANK[c.strength] ? "opacity-90" : "opacity-20")} style={{ height: 3 + k * 2 }} />
              ))}
            </span>
            <span className="sr-only">
              , {c.direction}, {STRENGTH_NAME[c.strength]}
            </span>
          </li>
        ) : (
          <li key={`${criteria[i]}${i}`} className="inline-flex h-6 items-center rounded-md bg-surface-container-high px-2 font-mono text-[0.75rem] text-muted-foreground">
            {criteria[i]}
          </li>
        )
      )}
    </ul>
  )
}

export { VariantBadge, VariantEvidence, type VariantBadgeProps, type VariantEvidenceProps }
