import type { StructureElement } from "@/registry/nelumbo/ui/protein-domains"

// p53 (UniProt P04637), 393 residues.
export const P53_SEQUENCE =
  "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD"

// Secondary structure as UniProt annotates it, from experimental structures of p53's domains.
export const P53_STRUCTURE: StructureElement[] = [
  { start: 3, end: 6, type: "helix" },
  { start: 8, end: 10, type: "turn" },
  { start: 19, end: 29, type: "helix" },
  { start: 30, end: 32, type: "helix" },
  { start: 33, end: 35, type: "strand" },
  { start: 36, end: 38, type: "helix" },
  { start: 41, end: 44, type: "helix" },
  { start: 47, end: 55, type: "helix" },
  { start: 96, end: 99, type: "helix" },
  { start: 105, end: 108, type: "turn" },
  { start: 110, end: 112, type: "strand" },
  { start: 119, end: 121, type: "strand" },
  { start: 124, end: 127, type: "strand" },
  { start: 128, end: 131, type: "turn" },
  { start: 132, end: 135, type: "strand" },
  { start: 141, end: 146, type: "strand" },
  { start: 148, end: 150, type: "strand" },
  { start: 156, end: 165, type: "strand" },
  { start: 166, end: 168, type: "helix" },
  { start: 177, end: 180, type: "helix" },
  { start: 181, end: 183, type: "strand" },
  { start: 187, end: 189, type: "strand" },
  { start: 194, end: 199, type: "strand" },
  { start: 204, end: 207, type: "strand" },
  { start: 209, end: 211, type: "turn" },
  { start: 214, end: 219, type: "strand" },
  { start: 221, end: 224, type: "helix" },
  { start: 225, end: 227, type: "turn" },
  { start: 228, end: 236, type: "strand" },
  { start: 240, end: 242, type: "helix" },
  { start: 243, end: 248, type: "turn" },
  { start: 251, end: 258, type: "strand" },
  { start: 260, end: 262, type: "strand" },
  { start: 264, end: 274, type: "strand" },
  { start: 278, end: 287, type: "helix" },
  { start: 288, end: 290, type: "helix" },
  { start: 322, end: 324, type: "helix" },
  { start: 327, end: 334, type: "strand" },
  { start: 335, end: 349, type: "helix" },
  { start: 353, end: 355, type: "turn" },
  { start: 375, end: 380, type: "helix" },
  { start: 383, end: 386, type: "helix" },
]

// Simulated per-residue confidence shaped like AlphaFold's p53 model (AF-P04637-F1): its share of residues in each
// band (52.7% very high, 7.1% confident, 10.4% low, 29.8% very low) laid on p53's ordered DNA-binding and
// tetramerization domains and its disordered ends. Illustrative, not the model's own scores.
export const P53_PLDDT = [
  39.5, 44.2, 39.9, 44.3, 48.2, 43.8, 47.2, 47.8, 49.5, 39.7, 41.5, 49.5, 48.5, 41.8, 47.3, 39.3, 63.0, 63.0, 60.2, 58.4,
  61.0, 61.4, 57.3, 59.6, 61.8, 52.2, 53.5, 51.1, 56.1, 53.1, 27.4, 24.7, 31.4, 31.2, 27.5, 32.8, 25.8, 28.0, 36.8, 28.5,
  28.5, 28.3, 37.7, 40.9, 32.3, 39.0, 39.2, 39.4, 39.2, 42.0, 39.7, 49.5, 41.5, 46.0, 47.5, 47.6, 45.0, 45.2, 49.5, 39.3,
  38.8, 39.0, 43.5, 38.3, 36.6, 31.3, 30.7, 36.1, 29.6, 31.4, 27.5, 27.6, 25.3, 33.8, 29.8, 27.7, 24.4, 32.2, 29.0, 24,
  25.2, 35.8, 28.7, 30.8, 27.9, 39.0, 32.3, 37.6, 40.9, 39.8, 38.9, 38.6, 45.1, 82.7, 86.7, 89.5, 89.5, 88.2, 87.6, 83.3,
  89.3, 98.5, 96.2, 94.9, 96.4, 95.7, 97.0, 96.3, 94.6, 94.6, 94.0, 94.3, 93.9, 93.6, 91.5, 93.6, 90.5, 91.0, 92.0, 90.5,
  92.1, 91.0, 91.2, 90.5, 91.7, 92.7, 90.9, 94.3, 95.3, 93.8, 94.3, 95.8, 95.5, 96.0, 95.6, 96.1, 95.8, 95.0, 98.0, 97.7,
  95.2, 98.4, 98.5, 96.9, 98.5, 95.9, 97.4, 97.8, 95.9, 95.2, 94.2, 95.4, 94.1, 94.4, 94.5, 92.6, 92.9, 91.1, 93.3, 93.3,
  91.3, 90.8, 92.3, 91.5, 93.0, 92.7, 91.6, 91.7, 92.5, 92.8, 92.6, 93.2, 92.8, 94.5, 94.1, 93.1, 95.5, 94.6, 95.0, 96.4,
  97.8, 96.2, 96.5, 97.6, 98.5, 98.5, 98.5, 95.5, 97.3, 96.5, 96.3, 95.8, 96.7, 97.0, 96.3, 93.5, 94.7, 95.8, 93.6, 92.8,
  92.7, 93.4, 91.9, 91.1, 90.5, 90.5, 92.5, 90.5, 91.0, 90.8, 93.1, 93.3, 90.5, 91.0, 91.7, 91.6, 93.3, 95.5, 93.7, 95.3,
  95.0, 97.0, 95.3, 96.7, 94.8, 96.1, 95.0, 97.1, 97.7, 96.0, 97.2, 98.0, 96.5, 98.5, 95.1, 96.0, 98.2, 97.9, 95.6, 94.0,
  94.2, 94.1, 93.5, 93.4, 92.7, 94.5, 90.8, 93.7, 91.6, 93.9, 93.4, 93.4, 91.8, 93.2, 90.5, 91.3, 90.7, 90.6, 94.4, 92.5,
  92.3, 95.3, 95.4, 95.0, 94.1, 93.8, 94.2, 96.5, 98.0, 97.2, 95.9, 95.7, 98.5, 98.3, 97.3, 97.6, 95.4, 95.6, 98.5, 94.7,
  97.5, 94.7, 96.6, 93.9, 93.3, 95.1, 95.8, 93.7, 81.0, 78.0, 79.0, 75.5, 78.0, 75.6, 72.7, 72.5, 56.6, 50.5, 53.4, 50.5,
  57.7, 55.5, 58.8, 55.4, 56.8, 58.7, 37.0, 33.5, 32.5, 39.5, 35.6, 63.7, 61.0, 66.2, 66.0, 62.9, 69.3, 66.3, 69.5, 84.7,
  86.3, 85.0, 87.5, 83.5, 85.0, 95.8, 94.4, 97.1, 94.1, 96.0, 94.4, 93.4, 92.8, 92.0, 91.1, 91.6, 93.9, 90.6, 91.8, 91.6,
  91.0, 90.5, 92.8, 92.0, 92.6, 74.6, 79.6, 76.7, 79.1, 75.6, 78.3, 61.2, 65.1, 64.5, 65.9, 63.5, 66.9, 67.9, 48.1, 40.5,
  48.6, 49.5, 49.3, 47.7, 39.0, 42.8, 38.4, 45.9, 43.9, 46.8, 35.1, 39.4, 43.9, 41.2, 30.5, 32.8, 39.1, 29.7, 31.4, 25.1,
  34.3, 33.9, 27.1, 24, 26.0, 29.8, 33.5, 28.8, 28.1, 25.8, 29.0, 29.9, 37.4,
]
