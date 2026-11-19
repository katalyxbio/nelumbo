"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo CodeBlock
 *
 * A block of code with light, built-in highlighting (no extra dependencies),
 * a copy button and an optional header. The palette stays nearly
 * monochrome: keywords are set heavier, strings and numbers take the one
 * accent color, comments step back. Color is kept for things that mean
 * something, like added and removed lines in a diff.
 *
 *   <CodeBlock code={src} language="python" title="trim_reads.py" />
 *   <CodeBlock code={src} language="bash" variant="inverse" />
 *   <CodeBlock code={src} language="tsx" lineNumbers highlight="3-5" />
 *   <CodeBlock code={patch} language="yaml" diff />
 *   <CodeBlock code={long} language="r" maxLines={8} />
 *
 *   <CodeBlockTabs items={[{ value: "npm", label: "npm", code: "npm i x", language: "bash" }, …]} />
 *
 * - `language`: ts, tsx, js, jsx, json, python, r, bash (sh, shell), sql,
 *   yaml, css, html, nextflow, fasta, diff, or text. Unknown names show as text.
 * - `variant`: `tonal` (default, a soft grey surface) or `inverse` (dark in
 *   light mode, like the docs' install snippets).
 * - `highlight`: line numbers to tint, as an array or a string like "2,4-6".
 * - `diff`: lines starting with + or - are marked added or removed. The sign
 *   moves into the gutter and the rest of the line is still highlighted.
 * - `maxLines`: longer code is cut off with a "Show all N lines" button.
 * - `wrap`: wrap long lines instead of scrolling sideways.
 * - The code area is focusable, so keyboard users can scroll long lines, and
 *   the copy button announces "Copied" to screen readers.
 */

/* ------------------------------------------------------------------ */
/* Tokenizer                                                           */
/* ------------------------------------------------------------------ */

type TokenType =
  | "comment"
  | "string"
  | "number"
  | "constant"
  | "keyword"
  | "function"
  | "type"
  | "tag"
  | "attr"
  | "property"
  | "variable"
  | "punctuation"
  | "heading"

type Token = { type: TokenType | null; value: string }
type Rule = [TokenType, RegExp]

const words = (list: string, flags = "") => new RegExp(`\\b(?:${list.trim().split(/\s+/).join("|")})\\b`, `y${flags}`)

const NUMBER: Rule = ["number", /(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y]
const PUNCT: Rule = ["punctuation", /[{}()[\];,.:]|[=+\-*/<>!&|?%^~@]+/y]
const DQ: Rule = ["string", /"(?:\\.|[^"\\\n])*"/y]
const SQ: Rule = ["string", /'(?:\\.|[^'\\\n])*'/y]
const SLASH_COMMENTS: Rule[] = [
  ["comment", /\/\/[^\n]*/y],
  ["comment", /\/\*[\s\S]*?(?:\*\/|$)/y],
]
const HASH_COMMENT: Rule = ["comment", /#[^\n]*/y]
const CALL: Rule = ["function", /[A-Za-z_$][\w$]*(?=\s*\()/y]
const TYPE: Rule = ["type", /[A-Z][\w$]*\b/y]

const JS_KEYWORDS =
  "const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof in of as interface type enum implements public private protected readonly static yield void delete this super satisfies keyof declare"
const JS_CONSTANTS = "true false null undefined NaN Infinity"

const js: Rule[] = [
  ...SLASH_COMMENTS,
  ["string", /`(?:\\[\s\S]|[^`\\])*`/y],
  DQ,
  SQ,
  ["keyword", words(JS_KEYWORDS)],
  ["constant", words(JS_CONSTANTS)],
  NUMBER,
  CALL,
  TYPE,
  PUNCT,
]

const jsx: Rule[] = [
  ...SLASH_COMMENTS,
  ["string", /`(?:\\[\s\S]|[^`\\])*`/y],
  DQ,
  SQ,
  ["tag", /(?<=<\/?)[A-Za-z][\w.]*/y],
  ["attr", /[A-Za-z_][\w-]*(?==[{"'])/y],
  ["keyword", words(JS_KEYWORDS)],
  ["constant", words(JS_CONSTANTS)],
  NUMBER,
  CALL,
  TYPE,
  PUNCT,
]

const json: Rule[] = [
  ["property", /"(?:\\.|[^"\\\n])*"(?=\s*:)/y],
  DQ,
  ["constant", words("true false null")],
  ["number", /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
  PUNCT,
]

const python: Rule[] = [
  HASH_COMMENT,
  ["string", /[rRfFbBuU]{0,2}("""|''')[\s\S]*?(?:\1|$)/y],
  ["string", /[rRfFbBuU]{0,2}"(?:\\.|[^"\\\n])*"/y],
  ["string", /[rRfFbBuU]{0,2}'(?:\\.|[^'\\\n])*'/y],
  ["variable", /@[\w.]+/y],
  [
    "keyword",
    words(
      "def class return if elif else for while in not and or is import from as with try except finally raise lambda yield pass break continue global nonlocal async await assert del match case"
    ),
  ],
  ["constant", words("True False None self")],
  NUMBER,
  CALL,
  TYPE,
  PUNCT,
]

const r: Rule[] = [
  HASH_COMMENT,
  DQ,
  SQ,
  ["keyword", words("function if else for while repeat in next break return library require")],
  ["constant", words("TRUE FALSE NULL NA NA_integer_ NA_character_ Inf NaN T F")],
  ["punctuation", /<-|->|\|>|%>%|%in%/y],
  NUMBER,
  ["function", /[A-Za-z_.][\w.]*(?=\s*\()/y],
  PUNCT,
]

const bash: Rule[] = [
  ["comment", /(?<=^|\s)#[^\n]*/y],
  DQ,
  SQ,
  ["variable", /\$\{[^}\n]*\}|\$\(|\$[\w@#?*!-]+/y],
  ["keyword", words("if then else elif fi for in do done while until case esac function return local export set unset source")],
  ["function", /(?<=(?:^|[\n|;&(]|\$\()[ \t]*(?:sudo[ \t]+)?)[A-Za-z_./][\w./+-]*/y],
  ["attr", /(?<=\s)--?[A-Za-z][\w-]*/y],
  NUMBER,
  ["punctuation", /[|&;<>()\\]+|=/y],
]

const sql: Rule[] = [
  ["comment", /--[^\n]*/y],
  ["comment", /\/\*[\s\S]*?(?:\*\/|$)/y],
  SQ,
  ["property", /"(?:[^"\n])*"/y],
  [
    "keyword",
    words(
      "select from where join left right inner outer full cross on group by order having limit offset as and or not in is null insert into values update set delete create table view index primary key foreign references distinct with case when then else end asc desc union all exists between like ilike returning",
      "i"
    ),
  ],
  ["constant", words("true false", "i")],
  NUMBER,
  CALL,
  PUNCT,
]

const yaml: Rule[] = [
  ["comment", /(?<=^|\s)#[^\n]*/y],
  ["property", /(?<=(?:^|\n)[ \t]*(?:-[ \t]+)?)[\w.$/-]+(?=[ \t]*:(?:\s|$))/y],
  DQ,
  SQ,
  ["constant", words("true false null yes no on off")],
  ["variable", /[&*][\w-]+/y],
  NUMBER,
  ["punctuation", /[-:[\]{},|>]/y],
]

const css: Rule[] = [
  ["comment", /\/\*[\s\S]*?(?:\*\/|$)/y],
  DQ,
  SQ,
  ["keyword", /@[\w-]+/y],
  ["property", /--?[A-Za-z][\w-]*(?=\s*:)/y],
  ["number", /#[\da-fA-F]{3,8}\b/y],
  ["number", /-?\d*\.?\d+(?:px|rem|em|%|ms|s|deg|fr|vh|vw|ch|lh)?\b/y],
  CALL,
  ["punctuation", /[{}():;,>+~]/y],
]

const html: Rule[] = [
  ["comment", /<!--[\s\S]*?(?:-->|$)/y],
  ["tag", /(?<=<\/?)[A-Za-z][\w-]*/y],
  ["attr", /[A-Za-z_:][\w:.-]*(?==)/y],
  DQ,
  SQ,
  ["punctuation", /<\/?|\/?>|=/y],
]

const nextflow: Rule[] = [
  ...SLASH_COMMENTS,
  ["string", /("""|''')[\s\S]*?(?:\1|$)/y],
  DQ,
  SQ,
  ["variable", /\$\{[^}\n]*\}|\$[A-Za-z_]\w*/y],
  [
    "keyword",
    words(
      "process workflow input output script shell exec when take main emit publish path val tuple file env stdin stdout include from def return if else params channel Channel container cpus memory time publishDir tag label"
    ),
  ],
  ["constant", words("true false null")],
  NUMBER,
  CALL,
  PUNCT,
]

const fasta: Rule[] = [
  ["heading", /(?<=^|\n)>[^\n]*/y],
  ["comment", /(?<=^|\n);[^\n]*/y],
]

const LANGUAGES: Record<string, Rule[]> = {
  js,
  javascript: js,
  ts: js,
  typescript: js,
  jsx,
  tsx: jsx,
  json,
  python,
  py: python,
  r,
  bash,
  sh: bash,
  shell: bash,
  zsh: bash,
  sql,
  yaml,
  yml: yaml,
  css,
  html,
  xml: html,
  nextflow,
  nf: nextflow,
  groovy: nextflow,
  fasta,
  fa: fasta,
}

const WORD = /[A-Za-z_$][\w$]*|\s+|[\s\S]/y

function tokenize(code: string, language: string): Token[] {
  const rules = LANGUAGES[language.toLowerCase()]
  if (!rules) return [{ type: null, value: code }]
  const out: Token[] = []
  let plain = ""
  let i = 0
  while (i < code.length) {
    let hit: Token | null = null
    for (const [type, re] of rules) {
      re.lastIndex = i
      const m = re.exec(code)
      if (m && m[0]) {
        hit = { type, value: m[0] }
        break
      }
    }
    if (hit) {
      if (plain) out.push({ type: null, value: plain }), (plain = "")
      out.push(hit)
      i += hit.value.length
    } else {
      // Take a whole word (or one other character) so a keyword can never match inside a longer name.
      WORD.lastIndex = i
      const w = WORD.exec(code)![0]
      plain += w
      i += w.length
    }
  }
  if (plain) out.push({ type: null, value: plain })
  return out
}

/** Splits tokens into lines; a token that spans lines (a block comment) is cut at each newline. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]]
  for (const t of tokens) {
    const parts = t.value.split("\n")
    parts.forEach((p, k) => {
      if (k > 0) lines.push([])
      if (p) lines[lines.length - 1].push({ type: t.type, value: p })
    })
  }
  return lines
}

function parseRanges(h: number[] | string | undefined): Set<number> {
  if (!h) return new Set()
  if (Array.isArray(h)) return new Set(h)
  const s = new Set<number>()
  for (const part of h.split(",")) {
    const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10))
    if (Number.isNaN(a)) continue
    for (let n = a; n <= (Number.isNaN(b) || b === undefined ? a : b); n++) s.add(n)
  }
  return s
}

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-(--code-muted) italic",
  string: "text-(--code-accent)",
  number: "text-(--code-accent)",
  constant: "text-(--code-accent)",
  keyword: "font-semibold",
  function: "font-medium",
  type: "font-medium",
  tag: "font-semibold",
  attr: "text-(--code-soft)",
  property: "text-(--code-soft)",
  variable: "text-(--code-accent)",
  punctuation: "text-(--code-soft)",
  heading: "font-semibold",
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

type CodeBlockVariant = "tonal" | "inverse"

const surface = {
  tonal: cn(
    "bg-surface-container text-foreground",
    "[--code-accent:var(--brand)] [--code-muted:var(--muted-foreground)]",
    "[--code-soft:color-mix(in_oklch,var(--foreground)_72%,transparent)]",
    "[--code-add:var(--success)] [--code-del:var(--destructive)]",
    "[--code-chip:var(--surface-container-highest)]"
  ),
  inverse: cn(
    "bg-inverse-surface text-inverse-foreground dark:bg-surface-container-high dark:text-foreground",
    "[--code-accent:var(--inverse-primary)] dark:[--code-accent:var(--brand)]",
    "[--code-muted:color-mix(in_oklch,var(--inverse-foreground)_64%,transparent)] dark:[--code-muted:var(--muted-foreground)]",
    "[--code-soft:color-mix(in_oklch,var(--inverse-foreground)_76%,transparent)] dark:[--code-soft:color-mix(in_oklch,var(--foreground)_72%,transparent)]",
    "[--code-add:color-mix(in_oklch,var(--success)_45%,white)] dark:[--code-add:var(--success)]",
    "[--code-del:color-mix(in_oklch,var(--destructive)_45%,white)] dark:[--code-del:var(--destructive)]",
    "[--code-chip:color-mix(in_oklch,var(--inverse-foreground)_14%,transparent)] dark:[--code-chip:var(--surface-container-highest)]"
  ),
} satisfies Record<CodeBlockVariant, string>

const LANGUAGE_ICON: Record<string, IconName> = {
  bash: "terminal",
  sh: "terminal",
  shell: "terminal",
  zsh: "terminal",
  json: "data_object",
  fasta: "genetics",
  fa: "genetics",
}

function CopyButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label={copied ? "Copied" : "Copy code"}
        data-slot="code-block-copy"
        className={cn("text-inherit", className)}
        onClick={() => {
          navigator.clipboard?.writeText(code).then(
            () => {
              setCopied(true)
              clearTimeout(timer.current)
              timer.current = setTimeout(() => setCopied(false), 1400)
            },
            () => {}
          )
        }}
      >
        <Icon name={copied ? "check" : "content_copy"} />
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  )
}

type CodeBodyProps = {
  code: string
  language?: string
  lineNumbers?: boolean
  highlight?: number[] | string
  diff?: boolean
  wrap?: boolean
  maxLines?: number
  /** Leaves room for a floating copy button when there is no header. */
  floatingCopy?: boolean
  /** A header row sits above, so the code starts closer to the top. */
  underHeader?: boolean
  label?: string
}

function CodeBody({ code, language = "text", lineNumbers, highlight, diff, wrap, maxLines, floatingCopy, underHeader, label }: CodeBodyProps) {
  const source = code.replace(/\n$/, "")
  const isDiff = diff || language === "diff"

  const lines = React.useMemo(() => {
    const raw = source.split("\n")
    const marks = raw.map((l) => (isDiff ? (l.startsWith("+") ? "add" : l.startsWith("-") ? "del" : null) : null))
    const body = isDiff ? raw.map((l, k) => (marks[k] || l.startsWith(" ") ? l.slice(1) : l)).join("\n") : source
    const tokenLines = toLines(tokenize(body, language === "diff" ? "text" : language))
    return tokenLines.map((tokens, k) => ({ tokens, mark: marks[k] }))
  }, [source, language, isDiff])

  const lit = React.useMemo(() => parseRanges(highlight), [highlight])
  const digits = String(lines.length).length

  const collapsible = maxLines !== undefined && lines.length > maxLines
  const [open, setOpen] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)
  const [full, setFull] = React.useState<number>()
  const id = React.useId()

  React.useLayoutEffect(() => {
    if (collapsible) setFull(preRef.current?.scrollHeight)
  }, [collapsible, lines, wrap])

  const collapsed = collapsible && !open
  const maxHeight = !collapsible ? undefined : collapsed ? `calc(${maxLines}lh + ${underHeader ? 0.25 : 1}rem)` : full ? `${full}px` : undefined

  return (
    <div className="relative min-w-0 rounded-b-[inherit]">
      <pre
        ref={preRef}
        id={id}
        tabIndex={0}
        aria-label={label}
        data-slot="code-block-pre"
        style={{ maxHeight }}
        className={cn(
          "overflow-x-auto pb-4 font-mono text-[0.8125rem] leading-[1.6] outline-none",
          underHeader ? "pt-1" : "pt-4",
          "rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          collapsible && "overflow-y-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
        )}
      >
        <code className={cn("grid min-w-full", wrap ? "w-full grid-cols-[minmax(0,1fr)]" : "w-max")}>
          {lines.map(({ tokens, mark }, k) => {
            const n = k + 1
            return (
              <span
                key={k}
                data-line={n}
                data-highlighted={lit.has(n) || undefined}
                data-diff={mark ?? undefined}
                className={cn(
                  "flex px-4",
                  floatingCopy && k === 0 && "pr-14",
                  lit.has(n) && "bg-[color-mix(in_oklch,currentColor_8%,transparent)]",
                  mark === "add" && "bg-[color-mix(in_oklch,var(--code-add)_10%,transparent)]",
                  mark === "del" && "bg-[color-mix(in_oklch,var(--code-del)_10%,transparent)]"
                )}
              >
                {lineNumbers && (
                  <span aria-hidden className="mr-4 shrink-0 text-right text-(--code-muted) select-none" style={{ width: `${digits}ch` }}>
                    {n}
                  </span>
                )}
                {isDiff && (
                  <span
                    aria-hidden
                    className={cn(
                      "mr-3 w-[1ch] shrink-0 select-none",
                      mark === "add" && "text-(--code-add)",
                      mark === "del" && "text-(--code-del)"
                    )}
                  >
                    {mark === "add" ? "+" : mark === "del" ? "−" : ""}
                  </span>
                )}
                {mark && <span className="sr-only">{mark === "add" ? "Added: " : "Removed: "}</span>}
                <span className={cn("min-w-0 flex-1", wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre")}>
                  {tokens.length === 0
                    ? "​"
                    : tokens.map((t, j) =>
                        t.type ? (
                          <span key={j} className={TOKEN_CLASS[t.type]}>
                            {t.value}
                          </span>
                        ) : (
                          t.value
                        )
                      )}
                </span>
              </span>
            )
          })}
        </code>
      </pre>
      {collapsible && (
        <div
          className={cn(
            "flex justify-center rounded-b-[inherit] px-4 pb-3",
            collapsed && "relative -mt-10 bg-linear-to-b from-transparent via-[color-mix(in_oklch,var(--code-bg)_88%,transparent)] to-(--code-bg) pt-8"
          )}
        >
          <Button
            size="xs"
            variant="ghost"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
            className="bg-(--code-chip) text-inherit"
          >
            <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
            {open ? "Show less" : `Show all ${lines.length} lines`}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CodeBlock                                                           */
/* ------------------------------------------------------------------ */

type CodeBlockProps = Omit<React.ComponentProps<"div">, "children" | "title"> &
  Omit<CodeBodyProps, "floatingCopy" | "label"> & {
    /** A file name or caption shown in a header row. */
    title?: React.ReactNode
    /** Icon before the title; defaults to one that fits the language. */
    icon?: IconName
    /** Shows the language name in the header. */
    showLanguage?: boolean
    variant?: CodeBlockVariant
    /** Set false to hide the copy button. */
    copy?: boolean
  }

const BG = {
  tonal: "[--code-bg:var(--surface-container)]",
  inverse: "[--code-bg:var(--inverse-surface)] dark:[--code-bg:var(--surface-container-high)]",
}

function CodeBlock({
  code,
  language = "text",
  title,
  icon,
  showLanguage,
  variant = "tonal",
  copy = true,
  lineNumbers,
  highlight,
  diff,
  wrap,
  maxLines,
  className,
  ...props
}: CodeBlockProps) {
  const header = title !== undefined || showLanguage
  const glyph = icon ?? LANGUAGE_ICON[language] ?? "description"
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      data-language={language}
      className={cn("relative min-w-0 rounded-2xl", surface[variant], BG[variant], className)}
      {...props}
    >
      {header && (
        <div data-slot="code-block-header" className="flex h-11 items-center gap-2 pr-2 pl-4">
          {title !== undefined && (
            <>
              <Icon name={glyph} size={18} className="text-(--code-muted)" />
              <span className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] font-medium">{title}</span>
            </>
          )}
          {showLanguage && (
            <span className={cn("type-label-sm text-(--code-muted)", title === undefined && "flex-1")}>{language}</span>
          )}
          {copy && <CopyButton code={code} />}
        </div>
      )}
      <CodeBody
        code={code}
        language={language}
        lineNumbers={lineNumbers}
        highlight={highlight}
        diff={diff}
        wrap={wrap}
        maxLines={maxLines}
        floatingCopy={!header && copy}
        underHeader={header}
        label={typeof title === "string" ? title : `${language} code`}
      />
      {!header && copy && (
        <div className="absolute top-2.5 right-2.5">
          <CopyButton code={code} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CodeBlockTabs                                                       */
/* ------------------------------------------------------------------ */

type CodeBlockTab = Omit<CodeBodyProps, "floatingCopy" | "label"> & {
  value: string
  label: React.ReactNode
}

type CodeBlockTabsProps = Omit<React.ComponentProps<typeof TabsPrimitive.Root>, "children" | "dir" | "orientation"> & {
  items: CodeBlockTab[]
  variant?: CodeBlockVariant
  copy?: boolean
  /** Accessible name for the tab list. */
  label?: string
}

/** One block, several versions of the code: package managers, languages, or files. */
function CodeBlockTabs({ items, variant = "tonal", copy = true, label = "Code", className, value, defaultValue, onValueChange, ...props }: CodeBlockTabsProps) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value)
  const current = value ?? inner
  const active = items.find((i) => i.value === current) ?? items[0]
  return (
    <TabsPrimitive.Root
      data-slot="code-block"
      data-variant={variant}
      value={current}
      onValueChange={(v) => {
        setInner(v)
        onValueChange?.(v)
      }}
      className={cn("relative min-w-0 rounded-2xl", surface[variant], BG[variant], className)}
      {...props}
    >
      <div data-slot="code-block-header" className="flex h-11 items-center gap-2 pr-2 pl-2">
        <TabsPrimitive.List aria-label={label} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {items.map((i) => (
            <TabsPrimitive.Trigger
              key={i.value}
              value={i.value}
              className={cn(
                "relative h-7 shrink-0 rounded-full px-3 font-mono text-[0.8125rem] text-(--code-muted) outline-none",
                "transition-[background-color,color] duration-150 hover:text-inherit",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                "data-[state=active]:bg-(--code-chip) data-[state=active]:font-medium data-[state=active]:text-inherit"
              )}
            >
              {i.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {copy && active && <CopyButton code={active.code} />}
      </div>
      {items.map((i) => (
        <TabsPrimitive.Content key={i.value} value={i.value} className="outline-none">
          <CodeBody {...i} underHeader label={typeof i.label === "string" ? i.label : undefined} />
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}

export { CodeBlock, CodeBlockTabs, tokenize, type CodeBlockProps, type CodeBlockTabsProps, type CodeBlockTab, type CodeBlockVariant }
