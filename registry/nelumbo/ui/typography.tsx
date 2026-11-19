import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Typography
 *
 * Two ways to set text with the Nelumbo type scale:
 *
 * 1. `Prose` styles the plain HTML inside it: headings, paragraphs, links,
 *    lists, quotes, inline code, tables, figures, sub- and superscripts. Use
 *    it for long-form text you don't control element by element, such as
 *    rendered Markdown, a protocol, a methods section or release notes.
 *
 *      <Prose>
 *        <h2>Library preparation</h2>
 *        <p>Total RNA (500 ng, RIN ≥ 8) was …</p>
 *      </Prose>
 *
 * 2. Named pieces with shadcn's typography names, for building a page by hand:
 *    TypographyH1 to H4, P, Lead, Large, Small, Muted, Blockquote, List,
 *    InlineCode and Table. Each takes `asChild` to change the element.
 *
 * Looks: no rules under headings or beside quotes. A quote is a soft tonal
 * block, links are underlined in the text color rather than painted blue,
 * and numbers in tables are tabular so columns of data line up.
 * `Prose size`: sm, md (default) or lg; it changes the body size and
 * spacing, and headings follow.
 */

const prose = cn(
  "max-w-[68ch] text-foreground [--prose-gap:1em]",
  // rhythm: every block gets the same gap; headings get more room above than below
  "[&>*+*]:mt-(--prose-gap)",
  "[&_:where(h1,h2,h3,h4)]:text-balance [&_:where(h1,h2,h3,h4)]:scroll-mt-20",
  "[&_h1]:type-headline-lg [&_h1+*]:mt-[0.75em]",
  "[&_h2]:type-headline-sm [&>*+h2]:mt-[2em] [&_h2+*]:mt-[0.6em]",
  "[&_h3]:type-title-lg [&>*+h3]:mt-[1.6em] [&_h3+*]:mt-[0.5em]",
  "[&_h4]:type-title-md [&>*+h4]:mt-[1.4em] [&_h4+*]:mt-[0.4em]",
  "[&_p]:text-pretty",
  // links: text-colored, underlined, the underline darkens on hover
  "[&_a]:font-medium [&_a]:underline [&_a]:decoration-[color-mix(in_oklch,currentColor_35%,transparent)] [&_a]:decoration-1 [&_a]:underline-offset-[0.2em]",
  "[&_a]:transition-[text-decoration-color] [&_a:hover]:decoration-current",
  "[&_a]:rounded-[0.2em] [&_a]:outline-none [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-ring",
  "[&_strong]:font-semibold [&_mark]:rounded-[0.2em] [&_mark]:bg-warning-container [&_mark]:px-[0.15em] [&_mark]:text-warning-container-foreground",
  "[&_small]:text-[0.875em] [&_small]:text-muted-foreground",
  "[&_:where(sub,sup)]:text-[0.75em] [&_:where(sub,sup)]:leading-none",
  // lists: muted markers, a little air between items
  "[&_:where(ul,ol)]:ps-[1.4em] [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ps-[0.25em] [&_li+li]:mt-[0.35em]",
  "[&_li::marker]:text-muted-foreground [&_ol>li::marker]:tabular-nums [&_:where(li>ul,li>ol)]:mt-[0.35em]",
  // quote: a soft block, no rule
  "[&_blockquote]:rounded-xl [&_blockquote]:bg-surface-container [&_blockquote]:px-[1.1em] [&_blockquote]:py-[0.85em]",
  "[&_blockquote_p+p]:mt-[0.6em] [&_blockquote_cite]:mt-[0.5em] [&_blockquote_cite]:block [&_blockquote_cite]:text-[0.875em] [&_blockquote_cite]:not-italic [&_blockquote_cite]:text-muted-foreground",
  // code
  "[&_:not(pre)>code]:rounded-[0.3em] [&_:not(pre)>code]:bg-surface-container [&_:not(pre)>code]:px-[0.3em] [&_:not(pre)>code]:py-[0.1em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-surface-container [&_pre]:p-[1em] [&_pre]:font-mono [&_pre]:text-[0.8125rem] [&_pre]:leading-[1.6]",
  "[&_kbd]:rounded-[0.3em] [&_kbd]:bg-surface-container-highest [&_kbd]:px-[0.35em] [&_kbd]:py-[0.05em] [&_kbd]:font-sans [&_kbd]:text-[0.8125em] [&_kbd]:font-medium",
  // a short centered rule, not a full-width line
  "[&_hr]:mx-auto [&_hr]:my-[2em] [&_hr]:h-1 [&_hr]:w-10 [&_hr]:rounded-full [&_hr]:border-0 [&_hr]:bg-surface-container-highest",
  // figures
  "[&_figure>*+figcaption]:mt-[0.6em] [&_figcaption]:text-[0.875em] [&_figcaption]:text-muted-foreground",
  "[&_img]:rounded-2xl",
  // tables: tonal header, quiet rows, tabular numbers
  "[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[0.9em] [&_table]:tabular-nums",
  "[&_th]:bg-surface-container [&_th]:px-[0.9em] [&_th]:py-[0.55em] [&_th]:text-start [&_th]:font-medium [&_th]:text-muted-foreground",
  "[&_th:first-child]:rounded-s-lg [&_th:last-child]:rounded-e-lg",
  "[&_td]:px-[0.9em] [&_td]:py-[0.55em] [&_td]:align-top [&_tr+tr>td]:border-t [&_tr+tr>td]:border-border/60"
)

const proseSize = {
  sm: "type-body-sm [--prose-gap:0.9em]",
  md: "type-body-md",
  lg: "type-body-lg [--prose-gap:1.1em]",
}

type ProseProps = React.ComponentProps<"div"> & {
  size?: keyof typeof proseSize
  asChild?: boolean
}

function Prose({ className, size = "md", asChild, ...props }: ProseProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="prose" data-size={size} className={cn(prose, proseSize[size], className)} {...props} />
}

/* ------------------------------------------------------------------ */
/* Named pieces (shadcn typography names)                              */
/* ------------------------------------------------------------------ */

type PieceProps<T extends keyof React.JSX.IntrinsicElements> = React.ComponentProps<T> & { asChild?: boolean }

function piece<T extends keyof React.JSX.IntrinsicElements>(tag: T, slot: string, base: string) {
  function Piece({ className, asChild, ...props }: PieceProps<T>) {
    const Comp = (asChild ? Slot.Root : tag) as React.ElementType
    return <Comp data-slot={slot} className={cn(base, className)} {...props} />
  }
  Piece.displayName = slot
  return Piece
}

const TypographyH1 = piece("h1", "typography-h1", "scroll-mt-20 type-display-sm text-balance")
const TypographyH2 = piece("h2", "typography-h2", "scroll-mt-20 type-headline-sm text-balance")
const TypographyH3 = piece("h3", "typography-h3", "scroll-mt-20 type-title-lg text-balance")
const TypographyH4 = piece("h4", "typography-h4", "scroll-mt-20 type-title-md text-balance")
const TypographyP = piece("p", "typography-p", "type-body-md text-pretty [&:not(:first-child)]:mt-4")
const TypographyLead = piece("p", "typography-lead", "type-body-lg text-pretty text-muted-foreground")
const TypographyLarge = piece("div", "typography-large", "type-title-md")
const TypographySmall = piece("small", "typography-small", "type-label-md")
const TypographyMuted = piece("p", "typography-muted", "type-body-sm text-muted-foreground")
const TypographyBlockquote = piece(
  "blockquote",
  "typography-blockquote",
  "rounded-xl bg-surface-container px-5 py-3.5 type-body-lg text-pretty [&_cite]:mt-1.5 [&_cite]:block [&_cite]:type-body-sm [&_cite]:not-italic [&_cite]:text-muted-foreground"
)
const TypographyList = piece(
  "ul",
  "typography-list",
  "list-disc ps-6 type-body-md [&>li]:ps-1 [&>li+li]:mt-1.5 [&>li::marker]:text-muted-foreground"
)
const TypographyInlineCode = piece(
  "code",
  "typography-inline-code",
  "rounded-[0.3em] bg-surface-container px-[0.3em] py-[0.1em] font-mono text-[0.875em]"
)

function TypographyTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="typography-table" className="min-w-0 overflow-x-auto">
      <Prose className="max-w-none">
        <table className={className} {...props} />
      </Prose>
    </div>
  )
}

export {
  Prose,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyTable,
  type ProseProps,
}
