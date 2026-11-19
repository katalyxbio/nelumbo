"use client"

import * as React from "react"
import katex, { type KatexOptions } from "katex"
import "katex/contrib/mhchem"
import "katex/dist/katex.min.css"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Math
 *
 * TeX math typeset with KaTeX: `Formula` sits inside a sentence, `Equation`
 * stands on its own line, centered, optionally numbered and captioned.
 *
 *   The rate is <Formula>{String.raw`v = \frac{V_{max}[S]}{K_m + [S]}`}</Formula>.
 *
 *   <Equation number={1} caption="Michaelis–Menten">
 *     {String.raw`v = \frac{V_{\max}[S]}{K_m + [S]}`}
 *   </Equation>
 *
 *   <Equation>{String.raw`\ce{ATP + H2O -> ADP + P_i}`}</Equation>   // chemistry, via mhchem
 *
 * - Write TeX as a string; `String.raw` saves doubling every backslash.
 * - Output is HTML for sighted readers plus hidden MathML, so screen readers
 *   read the math itself rather than a picture of it.
 * - It typesets on the server too: no layout shift, no flash.
 * - Colors follow the text, so it works in dark mode and inside colored containers.
 * - `\ce{}` and `\pu{}` from mhchem write reactions and units.
 * - `macros` defines shortcuts, e.g. { "\\R": "\\mathbb{R}" }.
 * - Long equations scroll sideways; the scroller can take focus.
 * - Invalid TeX shows the source with the error, instead of breaking the page.
 * - `Equation` has a copy button for the TeX source (`copyable`, default true).
 */

type Macros = Record<string, string>

function render(tex: string, displayMode: boolean, macros?: Macros): { html: string } | { error: string } {
  const opts: KatexOptions = {
    displayMode,
    throwOnError: true,
    output: "htmlAndMathml",
    strict: "ignore",
    trust: false,
    macros: macros ? { ...macros } : undefined,
  }
  try {
    return { html: katex.renderToString(tex, opts) }
  } catch (e) {
    return { error: e instanceof Error ? e.message.replace(/^KaTeX parse error: /, "") : "Couldn't typeset this." }
  }
}

const texOf = (children: React.ReactNode, tex?: string) => tex ?? (typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "")

function TexError({ source, message, block }: { source: string; message: string; block?: boolean }) {
  return (
    <span
      data-slot="math-error"
      role="note"
      title={message}
      className={cn(
        "rounded-[0.3em] bg-destructive-container/60 px-[0.3em] font-mono text-[0.875em] text-destructive-container-foreground",
        block && "flex flex-col gap-1 rounded-xl px-4 py-3"
      )}
    >
      <span className="whitespace-pre-wrap break-all">{source}</span>
      {block && <span className="font-sans type-body-sm opacity-80">{message}</span>}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Formula: inline                                                     */
/* ------------------------------------------------------------------ */

type FormulaProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** TeX source; or pass it as the child string. */
  tex?: string
  children?: string | string[]
  macros?: Macros
}

function Formula({ tex, children, macros, className, ...props }: FormulaProps) {
  const source = texOf(children, tex)
  const macroKey = macros ? JSON.stringify(macros) : ""
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const out = React.useMemo(() => render(source, false, macros), [source, macroKey])
  if ("error" in out) return <TexError source={source} message={out.error} />
  return (
    <span
      data-slot="formula"
      className={cn("[&_.katex]:text-[1.08em] [&_.katex]:leading-none", className)}
      dangerouslySetInnerHTML={{ __html: out.html }}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Equation: display                                                   */
/* ------------------------------------------------------------------ */

type EquationProps = Omit<React.ComponentProps<"figure">, "children"> & {
  tex?: string
  children?: string | string[]
  macros?: Macros
  /** Shown at the right, in parentheses: (1), (2a). */
  number?: React.ReactNode
  /** A short caption under the equation. */
  caption?: React.ReactNode
  /** "center" (default) or "start". */
  align?: "center" | "start"
  /** Shows a button that copies the TeX source. */
  copyable?: boolean
}

function Equation({ tex, children, macros, number, caption, align = "center", copyable = true, className, ...props }: EquationProps) {
  const source = texOf(children, tex)
  const macroKey = macros ? JSON.stringify(macros) : ""
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const out = React.useMemo(() => render(source, true, macros), [source, macroKey])
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <figure data-slot="equation" className={cn("group/eq relative flex min-w-0 flex-col gap-2", className)} {...props}>
      <div className={cn("grid min-w-0 items-center gap-3", number != null ? "grid-cols-[minmax(0,1fr)_auto_auto]" : "grid-cols-[minmax(0,1fr)_auto]")}>
        {"error" in out ? (
          <TexError source={source} message={out.error} block />
        ) : (
          <div
            data-slot="equation-body"
            tabIndex={0}
            className={cn(
              "min-w-0 overflow-x-auto overflow-y-hidden rounded-xl py-1 outline-none focus-visible:outline-2 focus-visible:outline-ring",
              "[&_.katex-display]:my-0 [&_.katex]:text-[1.15em]",
              align === "start" && "[&_.katex-display]:text-start [&_.katex-display>.katex]:text-start"
            )}
            dangerouslySetInnerHTML={{ __html: out.html }}
          />
        )}
        {number != null && <span className="type-body-md text-muted-foreground tabular-nums">({number})</span>}
        {copyable && !("error" in out) && (
          <div className="opacity-0 transition-opacity group-focus-within/eq:opacity-100 group-hover/eq:opacity-100 [@media(hover:none)]:opacity-100">
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={copied ? "Copied" : "Copy TeX"}
              onClick={() =>
                navigator.clipboard?.writeText(source).then(
                  () => {
                    setCopied(true)
                    clearTimeout(timer.current)
                    timer.current = setTimeout(() => setCopied(false), 1400)
                  },
                  () => {}
                )
              }
            >
              <Icon name={copied ? "check" : "content_copy"} />
            </Button>
            <span role="status" className="sr-only">
              {copied ? "Copied" : ""}
            </span>
          </div>
        )}
      </div>
      {caption && <figcaption className={cn("type-body-sm text-muted-foreground", align === "center" ? "text-center" : "text-start")}>{caption}</figcaption>}
    </figure>
  )
}

export { Formula, Equation, type FormulaProps, type EquationProps }
