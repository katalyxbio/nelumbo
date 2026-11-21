"use client"

import * as React from "react"
import {
  Prose,
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyList,
  TypographyMuted,
  TypographyP,
  TypographySmall,
  TypographyTable,
} from "@/registry/nelumbo/ui/typography"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// full class names so Tailwind can see them
const SCALE: { role: string; cls: string; sample: string; use: string }[] = [
  { role: "display-lg", cls: "type-display-lg", sample: "Reading the genome", use: "Hero numbers, landing titles" },
  { role: "display-md", cls: "type-display-md", sample: "Single-cell atlas", use: "Big section openers" },
  { role: "display-sm", cls: "type-display-sm", sample: "Run 2025-11-19", use: "Page titles" },
  { role: "headline-lg", cls: "type-headline-lg", sample: "Differential expression", use: "Article titles" },
  { role: "headline-md", cls: "type-headline-md", sample: "Quality control", use: "Dialog and sheet titles" },
  { role: "headline-sm", cls: "type-headline-sm", sample: "Library preparation", use: "Section headings" },
  { role: "title-lg", cls: "type-title-lg", sample: "Plate QC-2025-114", use: "Card and panel titles" },
  { role: "title-md", cls: "type-title-md", sample: "BRCA1 c.68_69del", use: "List headers, sub-sections" },
  { role: "title-sm", cls: "type-title-sm", sample: "Sample S01, liver", use: "Item titles, table captions" },
  {
    role: "body-lg",
    cls: "type-body-lg",
    sample: "Reads were trimmed with a sliding window and aligned to GRCh38; 94.2% mapped uniquely.",
    use: "Lead paragraphs, reading",
  },
  {
    role: "body-md",
    cls: "type-body-md",
    sample: "Libraries with fewer than 10 million mapped reads were flagged and sequenced again on the next run.",
    use: "Default text",
  },
  {
    role: "body-sm",
    cls: "type-body-sm",
    sample: "Concentrations measured by Qubit dsDNA HS, in ng/µL, mean of two reads.",
    use: "Captions, dense tables",
  },
  { role: "label-lg", cls: "type-label-lg", sample: "Start run", use: "Buttons, tabs" },
  { role: "label-md", cls: "type-label-md", sample: "Last edited 2 min ago", use: "Chips, fields, meta" },
  { role: "label-sm", cls: "type-label-sm", sample: "96 wells", use: "Badges, axis labels" },
]

function ScaleRow({ s }: { s: (typeof SCALE)[number] }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [spec, setSpec] = React.useState("")
  React.useEffect(() => {
    if (!ref.current) return
    const cs = getComputedStyle(ref.current)
    const px = parseFloat(cs.fontSize)
    const lh = parseFloat(cs.lineHeight)
    const ls = parseFloat(cs.letterSpacing) || 0
    setSpec(`${px}px / ${Math.round(lh)}px, weight ${cs.fontWeight}, tracking ${(ls / px).toFixed(3)}em`)
  }, [])
  return (
    <div className="grid min-w-0 gap-x-6 gap-y-1 rounded-2xl px-4 py-4 transition-colors hover:bg-surface-container-low md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono type-label-md">{s.role}</span>
        <span className="type-body-sm text-muted-foreground">{s.use}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span ref={ref} className={`${s.cls} -my-[0.15em] block min-w-0 truncate py-[0.15em]`}>
          {s.sample}
        </span>
        <span className="type-body-sm text-muted-foreground tabular-nums">{spec || "\u00a0"}</span>
      </div>
    </div>
  )
}

const METHODS = (
  <>
    <h2>Library preparation</h2>
    <p>
      Total RNA (500 ng, RIN ≥ 8) was polyA-selected and fragmented for 8 min at 94 °C. First-strand synthesis used
      random hexamers in 1× buffer with 3 mM MgCl<sub>2</sub>, and libraries were indexed with 12 PCR cycles. We
      followed the <a href="#protocol">kit protocol</a> with one change: the bead cleanup ratio was raised to{" "}
      <strong>0.9×</strong> to keep fragments above 200 bp.<sup>1</sup>
    </p>
    <h3>Quality control</h3>
    <p>Each library passed three checks before pooling:</p>
    <ul>
      <li>Concentration above 2 ng/µL by Qubit</li>
      <li>
        A single peak between 300 and 500 bp on the Bioanalyzer
        <ul>
          <li>Adapter dimers below 3% of the trace</li>
        </ul>
      </li>
      <li>
        Fewer than 0.1% reads mapping to <em>E. coli</em> in a shallow test run
      </li>
    </ul>
    <blockquote>
      <p>Pool by molarity, not by volume. Two libraries with the same ng/µL can differ twofold in molecules.</p>
      <cite>Core facility handbook, section 4.2</cite>
    </blockquote>
    <h3>Sequencing</h3>
    <p>
      Pools were loaded at 650 pM and run 2 × 150 bp. Demultiplexing used <code>bcl-convert</code> with one mismatch
      allowed per index; press <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop a run in the console.
    </p>
    <table>
      <thead>
        <tr>
          <th>Sample</th>
          <th>Tissue</th>
          <th>Reads (M)</th>
          <th>Mapped</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>S01</td>
          <td>Liver</td>
          <td>42.8</td>
          <td>94.2%</td>
        </tr>
        <tr>
          <td>S02</td>
          <td>Liver</td>
          <td>38.1</td>
          <td>93.7%</td>
        </tr>
        <tr>
          <td>S03</td>
          <td>Kidney</td>
          <td>9.6</td>
          <td>
            <mark>88.0%</mark>
          </td>
        </tr>
      </tbody>
    </table>
    <ol>
      <li>Trim adapters and low-quality tails</li>
      <li>Align with STAR, two-pass mode</li>
      <li>Count with salmon against GENCODE v46</li>
    </ol>
    <hr />
    <p>
      <small>
        <sup>1</sup> Raising the ratio drops yield by about 15%, which is fine at 500 ng input.
      </small>
    </p>
  </>
)

export default function TypographyPage() {
  return (
    <>
      <PageHeader eyebrow="Component 84" title="Typography">
        Fifteen text styles in five roles: display, headline, title, body and label. Prose sets long text, such as
        rendered Markdown or a methods section, in those styles, and the shadcn typography pieces are here for
        building pages by hand.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/typography`}</Code>
      </Section>

      <Section
        title="Type scale"
        description={
          <>
            Each style is one utility class, such as <TypographyInlineCode>type-title-lg</TypographyInlineCode>, that sets
            size, line height, weight and tracking together. Larger styles are tighter and heavier, and smaller ones open up
            so they stay readable. The figures are read from the page.
          </>
        }
      >
        <div className="flex min-w-0 flex-col gap-1">
          {SCALE.map((s) => (
            <ScaleRow key={s.role} s={s} />
          ))}
        </div>
      </Section>

      <Section
        title="Typefaces"
        description={
          <>
            The docs use Geist and Geist Mono. Nelumbo leaves the font to your project: set{" "}
            <TypographyInlineCode>--font-sans</TypographyInlineCode> and <TypographyInlineCode>--font-mono</TypographyInlineCode>{" "}
            and the scale follows.
          </>
        }
      >
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest">
            <span className="type-label-md text-muted-foreground">Sans, for everything you read</span>
            <span className="type-display-md">Aa Gg 7</span>
            <span className="type-body-md break-words">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 µ ° ± × → ≥ Δ α β</span>
          </div>
          <div className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest">
            <span className="type-label-md text-muted-foreground">Mono, for code, sequences and IDs</span>
            <span className="font-mono type-display-md tracking-normal">ACGT 0O</span>
            <span className="font-mono type-body-md break-all">ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATG NM_007294.4 rs80357906</span>
          </div>
        </div>
      </Section>

      <Section
        title="Numbers"
        description={
          <>
            Use <TypographyInlineCode>tabular-nums</TypographyInlineCode> wherever numbers sit in columns or change in place,
            like tables, counters and timers, so the digits line up and don&apos;t jitter. Prose tables do this for you.
          </>
        }
      >
        <Preview className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="type-label-md text-muted-foreground">Proportional</span>
            {["11.11", "88.08", "41.17"].map((n) => (
              <span key={n} className="text-end type-title-lg">
                {n} ng/µL
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="type-label-md text-muted-foreground">Tabular</span>
            {["11.11", "88.08", "41.17"].map((n) => (
              <span key={n} className="text-end type-title-lg tabular-nums">
                {n} ng/µL
              </span>
            ))}
          </div>
        </Preview>
      </Section>

      <Section
        title="Prose"
        description="Wrap plain HTML in Prose and it takes the scale: headings, links, lists, a quote, inline code and keys, a table, sub- and superscripts and a short centered rule. Lines stay under about 68 characters for comfortable reading."
      >
        <Preview className="block">
          <Prose>{METHODS}</Prose>
        </Preview>
        <Code>{`<Prose>
  <h2>Library preparation</h2>
  <p>Total RNA (500 ng, RIN ≥ 8) was polyA-selected …</p>
  <ul>
    <li>Concentration above 2 ng/µL by Qubit</li>
  </ul>
</Prose>

// rendered Markdown
<Prose dangerouslySetInnerHTML={{ __html: html }} />`}</Code>
      </Section>

      <Section title="Prose sizes" description="size sm suits side panels and notes; lg suits a reading view. Headings and spacing scale with it.">
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <Preview label="sm" className="block">
            <Prose size="sm">
              <h3>Storage</h3>
              <p>
                Keep libraries at −20 °C for up to six months. Avoid more than three freeze–thaw cycles; aliquot
                pools before long-term storage.
              </p>
            </Prose>
          </Preview>
          <Preview label="lg" className="block">
            <Prose size="lg">
              <h3>Storage</h3>
              <p>
                Keep libraries at −20 °C for up to six months. Avoid more than three freeze–thaw cycles; aliquot
                pools before long-term storage.
              </p>
            </Prose>
          </Preview>
        </div>
      </Section>

      <Section
        title="Named pieces"
        description="The same names as shadcn's typography examples, so pages written for shadcn keep working. Each takes asChild to render a different element."
      >
        <Preview className="grid grid-cols-1 gap-8">
          <div className="flex flex-col gap-3">
            <TypographyH1>Taming the transcriptome</TypographyH1>
            <TypographyLead>
              A practical guide to bulk RNA-seq, from sample to differential expression, for labs running their first
              study.
            </TypographyLead>
          </div>
          <div>
            <TypographyH2>Before you sequence</TypographyH2>
            <TypographyP>
              Most failed experiments fail at the bench, not in the analysis. Plan replicates first: three per condition
              is the minimum, and <TypographyInlineCode>design = ~ batch + treatment</TypographyInlineCode> only helps if
              batches cross conditions.
            </TypographyP>
          </div>
          <div className="flex flex-col gap-2">
            <TypographyH3>Replicates beat depth</TypographyH3>
            <TypographyList>
              <li>Six samples at 20 M reads beat three at 40 M</li>
              <li>Randomize extraction order across conditions</li>
              <li>Record RIN, input and kit lot for every sample</li>
            </TypographyList>
          </div>
          <div className="flex flex-col gap-2">
            <TypographyH4>A note on pooling</TypographyH4>
            <TypographyBlockquote>
              Pool by molarity, not by volume.
              <cite>Core facility handbook</cite>
            </TypographyBlockquote>
          </div>
          <TypographyTable>
            <thead>
              <tr>
                <th>Condition</th>
                <th>Replicates</th>
                <th>Depth (M)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vehicle</td>
                <td>6</td>
                <td>20.0</td>
              </tr>
              <tr>
                <td>Drug, 1 µM</td>
                <td>6</td>
                <td>20.0</td>
              </tr>
            </tbody>
          </TypographyTable>
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <TypographyLarge>Are you sure?</TypographyLarge>
            <TypographySmall>Run ID</TypographySmall>
            <TypographyMuted>Updated 2 minutes ago</TypographyMuted>
          </div>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Prose size", '"sm" | "md" | "lg"', '"md"', "Body size and spacing; headings follow."],
            ["Prose asChild", "boolean", "false", "Style an article, section or Markdown root instead of a div."],
            ["Typography* asChild", "boolean", "false", "Render a piece as a different element, e.g. a TypographyH2 as an h1."],
            ["type-* classes", "utility", "—", "display, headline and title in lg, md, sm; body and label in lg, md, sm."],
          ]}
        />
      </Section>
    </>
  )
}
