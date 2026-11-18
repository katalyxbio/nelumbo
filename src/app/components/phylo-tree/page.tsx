"use client"

import * as React from "react"
import { PhyloTree, neighborJoining, reroot, toNewick, type PhyloClade, type PhyloFocus } from "@/registry/nelumbo/ui/phylo-tree"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Switch } from "@/registry/nelumbo/ui/switch"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// Thirteen vertebrates, dated with TimeTree's median divergence times (million years ago).
const VERTEBRATES =
  "((((((((((Human:6.4,Chimpanzee:6.4):2.2,Gorilla:8.6):6.6,Orangutan:15.2):13.6,Macaque:28.8):14.4,Marmoset:43.2):46.8,(Mouse:13.1,Rat:13.1):76.9):6,(Dog:76,Cow:76):20):64,Opossum:160):152,Chicken:312):123,Zebrafish:435);"
const ROOT_AGE = 435

const CLADES: PhyloClade[] = [
  { taxa: ["Human", "Marmoset"], label: "Primates", color: "blue" },
  { taxa: ["Mouse", "Rat"], label: "Rodents", color: "amber" },
  { taxa: ["Dog", "Cow"], label: "Laurasiatheria", color: "green" },
]

// The human globin family. Topology follows the accepted gene tree; lengths and support are illustrative.
const GLOBINS =
  "(NGB:0.9,(CYGB:0.7,(MB:0.6,(((HBA1:0.01,HBA2:0.01)100:0.12,HBZ:0.2)98:0.25,((HBB:0.03,HBD:0.05)100:0.1,((HBG1:0.01,HBG2:0.01)100:0.06,HBE1:0.09)84:0.04)100:0.22)95:0.15)62:0.12)91:0.2);"

// The textbook neighbor-joining example.
const NAMES = ["a", "b", "c", "d", "e"]
const MATRIX = [
  [0, 5, 9, 9, 8],
  [5, 0, 10, 10, 9],
  [9, 10, 0, 8, 7],
  [9, 10, 8, 0, 3],
  [8, 9, 7, 3, 0],
]

export default function PhyloTreePage() {
  return (
    <>
      <PageHeader eyebrow="Component 82" title="Phylo Tree">
        A phylogenetic tree from Newick, rectangular or circular, with branch lengths or without. Branches meet in rounded
        elbows, and pointing at a node lights the path to every leaf below it. Color is kept for the clades you name.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/phylo-tree`}</Code>
      </Section>

      <Section
        title="A dated tree"
        description='Thirteen vertebrates at their divergence times, with scale="time" counting back from today. Point at a node, or tab in and use the arrows; click a clade or press Enter to fold it.'
      >
        <Preview className="block">
          <DatedDemo />
        </Preview>
      </Section>

      <Section
        title="Support"
        description='Bootstrap support printed at the nodes, hidden under supportThreshold (70 here). support="dots" trades the numbers for marks. The human globins; the support values are illustrative.'
      >
        <Preview className="grid gap-8 md:grid-cols-2">
          <PhyloTree tree={GLOBINS} support="values" scale="bar" unit="substitutions/site" ladderize aria-label="Human globin gene tree with support values" />
          <PhyloTree tree={GLOBINS} support="dots" alignLabels scale={false} aria-label="Human globin gene tree with support as dots and aligned labels" />
        </Preview>
      </Section>

      <Section
        title="From distances"
        description="neighborJoining builds a tree from a distance matrix (distances computes one from aligned sequences), and reroot hangs it from an outgroup. This is the textbook example."
      >
        <Preview className="block">
          <NJDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["tree", "string | PhyloNode", "", "Newick, or a parsed tree."],
            ["layout", '"rectangular" | "circular"', '"rectangular"', "Circular puts the root at the center."],
            ["branchLengths", "boolean", "true", "A phylogram; false lines the leaves up as a cladogram."],
            ["alignLabels", "boolean", "false", "Leaves in one column, with dotted leaders."],
            ["ladderize", "boolean", "true", "Children ordered by size."],
            ["support", '"values" | "dots" | false', '"values"', "Support at internal nodes. Circular uses dots."],
            ["supportThreshold", "number", "70", "Hide support below this."],
            ["scale", '"bar" | "time" | false', '"bar"', "A scale bar, or an axis counting back from the tips."],
            ["unit", "string", "", "For the scale: Mya, substitutions/site."],
            ["clades", "{ taxa, label, color?, collapsed? }[]", "", "Shaded clades, found as the common ancestor of taxa."],
            ["highlight", "string[]", "", "Leaves set in bold."],
            ["italic", "boolean", "false", "Species names in italics."],
            ["collapsible", "boolean", "false", "Fold and unfold clades by click or Enter."],
            ["rowHeight / size", "number", "24 / 560", "Row height; the circular diameter cap."],
            ["selectable", "boolean", "false", "Keyboard focus: up and down through nodes, left to the parent, right to a child."],
            ["onActiveChange", "(focus: { node, taxa, depth, clade } | null) => void", "", "The node pointed at or focused."],
            ["Helpers", "parseNewick, toNewick, ladderize, leafNames, reroot, distances, neighborJoining", "", "Parse and write Newick; order, root and build trees."],
          ]}
        />
      </Section>
    </>
  )
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="type-label-lg">{label}</span>
      {children}
    </div>
  )
}

function DatedDemo() {
  const [layout, setLayout] = React.useState<"rectangular" | "circular">("rectangular")
  const [lengths, setLengths] = React.useState(true)
  const [aligned, setAligned] = React.useState(false)
  const [focus, setFocus] = React.useState<PhyloFocus>(null)
  const leaf = focus && !focus.node.children?.length
  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div className="grid gap-5 rounded-2xl bg-surface-container p-5">
        <Setting label="Layout">
          <SegmentedButton type="single" size="sm" value={layout} onValueChange={(v) => v && setLayout(v as typeof layout)} aria-label="Layout">
            <SegmentedButtonItem value="rectangular">Rectangular</SegmentedButtonItem>
            <SegmentedButtonItem value="circular">Circular</SegmentedButtonItem>
          </SegmentedButton>
        </Setting>
        <Setting label="Branches">
          <SegmentedButton type="single" size="sm" value={lengths ? "on" : "off"} onValueChange={(v) => v && setLengths(v === "on")} aria-label="Branches">
            <SegmentedButtonItem value="on">Phylogram</SegmentedButtonItem>
            <SegmentedButtonItem value="off">Cladogram</SegmentedButtonItem>
          </SegmentedButton>
        </Setting>
        <label className="flex items-center justify-between gap-3 type-label-lg">
          Aligned labels
          <Switch checked={aligned} onCheckedChange={setAligned} />
        </label>
      </div>
      <div className="grid min-w-0 gap-4">
        <div className="min-h-[4.5rem]">
          {focus ? (
            <ChartReadout
              value={leaf ? (focus.node.length ?? 0) : focus.age}
              unit={leaf ? "Myr on its own" : "Mya"}
              label={leaf ? focus.node.name : `${focus.clade ?? "Common ancestor"}`}
              detail={!leaf && <span className="type-body-sm text-muted-foreground">{focus.taxa.join(", ")}</span>}
            />
          ) : (
            <ChartReadout value={ROOT_AGE} unit="Mya" label="Vertebrates" detail={<span className="type-body-sm text-muted-foreground">13 species, TimeTree median dates</span>} />
          )}
        </div>
        <PhyloTree
          tree={VERTEBRATES}
          layout={layout}
          branchLengths={lengths}
          alignLabels={aligned}
          scale="time"
          unit="Mya"
          clades={CLADES}
          highlight={["Human"]}
          collapsible
          selectable
          onActiveChange={setFocus}
          aria-label="Thirteen vertebrates dated by divergence time"
        />
      </div>
    </div>
  )
}

function NJDemo() {
  const [outgroup, setOutgroup] = React.useState("none")
  const tree = React.useMemo(() => {
    const t = neighborJoining(NAMES, MATRIX)
    return outgroup === "none" ? t : reroot(t, outgroup)
  }, [outgroup])
  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <div className="grid gap-4">
        <table className="w-fit type-body-sm tabular-nums">
          <caption className="sr-only">Distances</caption>
          <thead>
            <tr>
              <td />
              {NAMES.map((n) => (
                <th key={n} scope="col" className="w-9 pb-1 text-center type-label-md text-muted-foreground">
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row, i) => (
              <tr key={i}>
                <th scope="row" className="pr-2 text-left type-label-md text-muted-foreground">
                  {NAMES[i]}
                </th>
                {row.map((v, j) => (
                  <td key={j} className={j === i ? "text-center text-muted-foreground" : "text-center"}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Setting label="Outgroup">
          <SegmentedButton type="single" size="sm" value={outgroup} onValueChange={(v) => v && setOutgroup(v)} aria-label="Outgroup">
            <SegmentedButtonItem value="none">None</SegmentedButtonItem>
            {NAMES.map((n) => (
              <SegmentedButtonItem key={n} value={n}>
                {n}
              </SegmentedButtonItem>
            ))}
          </SegmentedButton>
        </Setting>
      </div>
      <div className="grid min-w-0 gap-3">
        <PhyloTree tree={tree} ladderize={false} scale="bar" rowHeight={28} aria-label="Neighbor-joining tree of a to e" />
        <code className="break-all font-mono type-label-md text-muted-foreground">{toNewick(tree)}</code>
      </div>
    </div>
  )
}
