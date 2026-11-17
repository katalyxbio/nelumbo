import type { GeneModelTranscript } from "@/registry/nelumbo/ui/gene-model"

// From Ensembl (GRCh38), release current at the time of writing: exons and coding
// stretches of human TP53 (chr17, minus strand) and HBB (chr11, minus strand).

export const TP53_201: GeneModelTranscript = {
  id: "ENST00000269305",
  name: "TP53-201",
  description: "p53α, canonical",
  strand: "-",
  canonical: true,
  cds: { start: 7669609, end: 7676594 },
  exons: [
    { start: 7668421, end: 7669690 },
    { start: 7670609, end: 7670715 },
    { start: 7673535, end: 7673608 },
    { start: 7673701, end: 7673837 },
    { start: 7674181, end: 7674290 },
    { start: 7674859, end: 7674971 },
    { start: 7675053, end: 7675236 },
    { start: 7675994, end: 7676272 },
    { start: 7676382, end: 7676403 },
    { start: 7676521, end: 7676622 },
    { start: 7687377, end: 7687490 },
  ],
}

export const TP53_204: GeneModelTranscript = {
  id: "ENST00000420246",
  name: "TP53-204",
  description: "p53β, with exon 9β",
  strand: "-",
  canonical: false,
  cds: { start: 7673307, end: 7676594 },
  exons: [
    { start: 7668404, end: 7669690 },
    { start: 7670609, end: 7670715 },
    { start: 7673207, end: 7673339 },
    { start: 7673535, end: 7673608 },
    { start: 7673701, end: 7673837 },
    { start: 7674181, end: 7674290 },
    { start: 7674859, end: 7674971 },
    { start: 7675053, end: 7675236 },
    { start: 7675994, end: 7676272 },
    { start: 7676382, end: 7676403 },
    { start: 7676521, end: 7676622 },
    { start: 7687377, end: 7687538 },
  ],
}

export const TP53_209: GeneModelTranscript = {
  id: "ENST00000504937",
  name: "TP53-209",
  description: "Δ133p53α, starts in intron 4",
  strand: "-",
  canonical: false,
  cds: { start: 7669609, end: 7675215 },
  exons: [
    { start: 7668402, end: 7669690 },
    { start: 7670609, end: 7670715 },
    { start: 7673535, end: 7673608 },
    { start: 7673701, end: 7673837 },
    { start: 7674181, end: 7674290 },
    { start: 7674859, end: 7674971 },
    { start: 7675053, end: 7675493 },
  ],
}

export const TP53_202: GeneModelTranscript = {
  id: "ENST00000359597",
  name: "TP53-202",
  description: "ends in an alternative last exon",
  strand: "-",
  canonical: false,
  cds: { start: 7666206, end: 7676594 },
  exons: [
    { start: 7666086, end: 7666244 },
    { start: 7673535, end: 7673608 },
    { start: 7673701, end: 7673837 },
    { start: 7674181, end: 7674290 },
    { start: 7674859, end: 7674971 },
    { start: 7675053, end: 7675236 },
    { start: 7675994, end: 7676272 },
    { start: 7676382, end: 7676403 },
    { start: 7676521, end: 7676594 },
  ],
}

export const HBB_201: GeneModelTranscript = {
  id: "ENST00000335295",
  name: "HBB-201",
  description: "β-globin, canonical",
  strand: "-",
  canonical: true,
  cds: { start: 5225598, end: 5227021 },
  exons: [
    { start: 5225464, end: 5225726 },
    { start: 5226577, end: 5226799 },
    { start: 5226930, end: 5227071 },
  ],
}
