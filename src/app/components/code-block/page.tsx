"use client"

import * as React from "react"
import { CodeBlock, CodeBlockTabs } from "@/registry/nelumbo/ui/code-block"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TRIM = `from Bio import SeqIO

# Keep reads whose mean Phred quality clears the cutoff
MIN_Q = 28

def passes(record, min_q=MIN_Q):
    quals = record.letter_annotations["phred_quality"]
    return sum(quals) / len(quals) >= min_q

reads = SeqIO.parse("sample_R1.fastq", "fastq")
kept = (r for r in reads if passes(r))
n = SeqIO.write(kept, "sample_R1.trimmed.fastq", "fastq")
print(f"kept {n} reads")`

const ALIGN = `# Align paired reads to GRCh38, then sort and index
bwa mem -t 8 -R "@RG\\tID:S01\\tSM:S01" ref/GRCh38.fa \\
  reads/S01_R1.fastq.gz reads/S01_R2.fastq.gz \\
  | samtools sort -@ 4 -o aln/S01.bam -
samtools index aln/S01.bam
echo "done: $SAMPLE"`

const PROCESS = `process QUANT {
    tag "$sample"
    cpus 8
    memory '16 GB'

    input:
    tuple val(sample), path(reads)
    path index

    output:
    path "\${sample}/quant.sf", emit: quant

    script:
    """
    salmon quant -i $index -l A -1 \${reads[0]} -2 \${reads[1]} -p $task.cpus -o $sample
    """
}`

const PATCH = ` params:
   genome: GRCh38
-  aligner: star
+  aligner: star_salmon
-  min_mapped_reads: 5
+  min_mapped_reads: 10
   skip_qc: false
+  save_trimmed: true`

const DESEQ = `library(DESeq2)
library(tidyverse)

counts <- read.csv("counts/gene_counts.csv", row.names = 1)
samples <- read.csv("metadata/samples.csv", row.names = 1)

# Treatment against vehicle, controlling for batch
dds <- DESeqDataSetFromMatrix(
  countData = round(counts),
  colData = samples,
  design = ~ batch + treatment
)
dds <- dds[rowSums(counts(dds) >= 10) >= 3, ]
dds <- DESeq(dds)

res <- results(dds, contrast = c("treatment", "drug", "vehicle"), alpha = 0.05)
res <- lfcShrink(dds, coef = "treatment_drug_vs_vehicle", type = "apeglm")

hits <- as.data.frame(res) %>%
  rownames_to_column("gene") %>%
  filter(padj < 0.05, abs(log2FoldChange) > 1) %>%
  arrange(padj)

write.csv(hits, "results/de_genes.csv", row.names = FALSE)
message(nrow(hits), " genes pass FDR 5% and |log2FC| > 1")`

const FASTA = `>NM_007294.4 Homo sapiens BRCA1 DNA repair associated, transcript variant 1, mRNA (partial)
ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGA`

const PLATE = `{
  "plate": "QC-2025-114",
  "assay": "Qubit dsDNA HS",
  "units": "ng/uL",
  "wells": [
    { "well": "A1", "sample": "S01", "conc": 42.8, "pass": true },
    { "well": "A2", "sample": "S02", "conc": 3.1, "pass": false },
    { "well": "A3", "sample": null, "conc": 0, "pass": false }
  ]
}`

const QUERY = `SELECT s.sample_id, s.tissue, COUNT(v.id) AS variants
FROM samples s
LEFT JOIN variants v ON v.sample_id = s.sample_id AND v.qual >= 30
WHERE s.cohort = 'BRCA-2025'
GROUP BY s.sample_id, s.tissue
ORDER BY variants DESC
LIMIT 20;`

const COMPONENT = `import { CodeBlock } from "@/components/ui/code-block"

export function Protocol({ script }: { script: string }) {
  return <CodeBlock code={script} language="python" title="trim_reads.py" lineNumbers />
}`

export default function CodeBlockPage() {
  return (
    <>
      <PageHeader eyebrow="Component 83" title="Code Block">
        A block of code with a copy button, light syntax highlighting and an optional header. The highlighting is
        built in, so there&apos;s nothing extra to install. Its palette stays almost black and white: keywords are
        heavier, strings and numbers take the one accent color, and comments step back.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/code-block`}</Code>
      </Section>

      <Section title="Usage">
        <Code>{COMPONENT}</Code>
      </Section>

      <Section title="Basic" description="Pass the code as a string and name its language. The copy button sits in the corner.">
        <Preview className="block">
          <CodeBlock code={TRIM} language="python" />
        </Preview>
      </Section>

      <Section
        title="Header"
        description="A title adds a header row with a file icon. showLanguage names the language on the right, next to the copy button."
      >
        <Preview className="grid grid-cols-1 gap-4">
          <CodeBlock code={TRIM} language="python" title="trim_reads.py" showLanguage />
          <CodeBlock code={PLATE} language="json" title="plates/QC-2025-114.json" />
        </Preview>
      </Section>

      <Section
        title="Inverse"
        description="variant inverse is dark in light mode, for commands and snippets that should stand apart from the page. In dark mode it is a raised surface. The docs' own snippets use it."
      >
        <Preview className="grid grid-cols-1 gap-4">
          <CodeBlock code={ALIGN} language="bash" variant="inverse" />
          <CodeBlock code={ALIGN} language="bash" variant="inverse" title="align.sh" />
        </Preview>
      </Section>

      <Section
        title="Line numbers and highlighted lines"
        description='lineNumbers adds a gutter. highlight tints lines, as an array or a string like "8-9,12".'
      >
        <Preview className="block">
          <CodeBlock code={PROCESS} language="nextflow" title="modules/quant.nf" lineNumbers highlight="7-8,12" />
        </Preview>
      </Section>

      <Section
        title="Diff"
        description="With diff, lines starting with + or - are marked added or removed. Color is used here because it carries meaning, and screen readers hear “Added” or “Removed” too. The rest of each line keeps its highlighting."
      >
        <Preview className="block">
          <CodeBlock code={PATCH} language="yaml" diff title="params.yml" lineNumbers />
        </Preview>
      </Section>

      <Section
        title="Tabs"
        description="CodeBlockTabs holds several versions of the same thing: package managers, languages or files. The copy button copies the open tab."
      >
        <Preview className="grid grid-cols-1 gap-4">
          <CodeBlockTabs
            label="Package manager"
            items={[
              { value: "npm", label: "npm", language: "bash", code: "npx shadcn@latest add @nelumbo/code-block" },
              { value: "pnpm", label: "pnpm", language: "bash", code: "pnpm dlx shadcn@latest add @nelumbo/code-block" },
              { value: "bun", label: "bun", language: "bash", code: "bunx --bun shadcn@latest add @nelumbo/code-block" },
            ]}
          />
          <CodeBlockTabs
            label="Language"
            variant="inverse"
            items={[
              { value: "sql", label: "variants.sql", language: "sql", code: QUERY },
              { value: "py", label: "trim_reads.py", language: "python", code: TRIM },
              { value: "json", label: "plate.json", language: "json", code: PLATE },
            ]}
          />
        </Preview>
      </Section>

      <Section
        title="Long code"
        description="maxLines cuts long code off with a soft fade and a button that shows all of it. Opening and closing animate the height."
      >
        <Preview className="block">
          <CodeBlock code={DESEQ} language="r" title="de_analysis.R" lineNumbers maxLines={9} />
        </Preview>
      </Section>

      <Section
        title="Wrapping"
        description="Long lines scroll sideways by default, and the code area takes keyboard focus so it can be scrolled with the arrow keys. wrap breaks them onto new lines instead, which suits sequences."
      >
        <Preview className="grid grid-cols-1 gap-4">
          <CodeBlock code={FASTA} language="fasta" title="BRCA1.fa" />
          <CodeBlock code={FASTA} language="fasta" title="BRCA1.fa" wrap />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["code", "string", "—", "The code to show and copy."],
            ["language", "string", '"text"', "ts, tsx, js, jsx, json, python, r, bash, sql, yaml, css, html, nextflow, fasta, diff or text."],
            ["title", "ReactNode", "—", "Adds a header row, usually a file name."],
            ["icon", "IconName", "by language", "Icon before the title."],
            ["showLanguage", "boolean", "false", "Names the language in the header."],
            ["variant", '"tonal" | "inverse"', '"tonal"', "A soft grey surface, or dark in light mode."],
            ["lineNumbers", "boolean", "false", "Adds a line-number gutter."],
            ["highlight", 'number[] | string', "—", 'Lines to tint, e.g. [3, 4] or "3-4,8".'],
            ["diff", "boolean", "false", "Marks lines starting with + or - as added or removed."],
            ["maxLines", "number", "—", "Cuts longer code off behind a Show all button."],
            ["wrap", "boolean", "false", "Wraps long lines instead of scrolling."],
            ["copy", "boolean", "true", "Shows the copy button."],
            ["CodeBlockTabs items", "{ value, label, code, language, … }[]", "—", "One tab per item; each takes the same options as CodeBlock."],
          ]}
        />
      </Section>
    </>
  )
}
