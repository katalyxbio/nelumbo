import type { AlignedSequence } from "@/registry/nelumbo/ui/sequence-alignment"

// p53 from six species (UniProt), aligned with FAMSA. Windows are cut by human
// residue numbers; each row's start is the position of its first residue there.

// Human 225 to 290: loops L2 and L3 of the DNA-binding domain, with hotspots G245, R248, R273 and R282: columns 234 to 299 of 415
export const P53_L3_COLUMN = 234
export const P53_L3: AlignedSequence[] = [
  { id: "P53_HUMAN", name: "Human", description: "Homo sapiens, UniProt P04637", start: 225, sequence: "VGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLR" },
  { id: "P53_MOUSE", name: "Mouse", description: "Mus musculus, UniProt P02340", start: 222, sequence: "AGSEYTTIHYKYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRDSFEVRVCACPGRDRRTEEENFR" },
  { id: "P53_RAT", name: "Rat", description: "Rattus norvegicus, UniProt P10361", start: 223, sequence: "VGSDYTTIHYKYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRDSFEVRVCACPGRDRRTEEENFR" },
  { id: "P53_CHICK", name: "Chicken", description: "Gallus gallus, UniProt P10360", start: 211, sequence: "VGSDCTTVLYNFMCNSSCMGGMNRRPILTILTLEGPGGQLLGRRCFEVRVCACPGRDRKIEEENFR" },
  { id: "P53_XENLA", name: "Frog", description: "Xenopus laevis, UniProt P07193", start: 200, sequence: "VGTECTTVLYNYMCNSSCMGGMNRRPILTIITLETPQGLLLGRRCFEVRVCACPGRDRRTEEDNYT" },
  { id: "P53_DANRE", name: "Zebrafish", description: "Danio rerio, UniProt P79734", start: 193, sequence: "LGAEWTTVLLNYMCNSSCMGGMNRRPILTIITLETQEGQLLGRRSFEVRVCACPGRDRKTEESNFK" },
]

// Human 1 to 60: the transactivation domain, gapped: columns 4 to 67 of 415
export const P53_N_COLUMN = 4
export const P53_N: AlignedSequence[] = [
  { id: "P53_HUMAN", name: "Human", description: "Homo sapiens, UniProt P04637", start: 1, sequence: "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPL---PSQAMDDLMLSPDDIEQWFT-EDPGP" },
  { id: "P53_MOUSE", name: "Mouse", description: "Mus musculus, UniProt P02340", start: 4, sequence: "MEESQSDISLELPLSQETFSGLWKLLPPEDILP-----SPHCMDDLLL-PQDVEEFFE----GP" },
  { id: "P53_RAT", name: "Rat", description: "Rattus norvegicus, UniProt P10361", start: 1, sequence: "MEDSQSDMSIELPLSQETFSCLWKLLPPDDILPTTATGSPNSMEDLFL-PQDVAELLE----GP" },
  { id: "P53_CHICK", name: "Chicken", description: "Gallus gallus, UniProt P10360", start: 1, sequence: "-MAEEMEPLLEP---TEVFMDLWSMLP-------------YSMQQLPL-PEDHSNWQELSPLEP" },
  { id: "P53_XENLA", name: "Frog", description: "Xenopus laevis, UniProt P07193", start: 1, sequence: "-MEPSSETGMDPPLSQETFEDLWSLLP-------------DPLQTVTCRLDNLSEFPD------" },
  { id: "P53_DANRE", name: "Zebrafish", description: "Danio rerio, UniProt P79734", start: 1, sequence: "----------MAQNDSQEFAELWE-------------------KNLIIQPPGGGSCWD--IIND" },
]

// Human 94 to 292: the DNA-binding domain: columns 101 to 301 of 415
export const P53_DBD_COLUMN = 101
export const P53_DBD: AlignedSequence[] = [
  { id: "P53_HUMAN", name: "Human", description: "Homo sapiens, UniProt P04637", start: 94, sequence: "SSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSD-S-DGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKK" },
  { id: "P53_MOUSE", name: "Mouse", description: "Mus musculus, UniProt P02340", start: 91, sequence: "SSFVPSQKTYQGNYGFHLGFLQSGTAKSVMCTYSPPLNKLFCQLAKTCPVQLWVSATPPAGSRVRAMAIYKKSQHMTEVVRRCPHHERCSD-G-DGLAPPQHLIRVEGNLYPEYLEDRQTFRHSVVVPYEPPEAGSEYTTIHYKYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRDSFEVRVCACPGRDRRTEEENFRKK" },
  { id: "P53_RAT", name: "Rat", description: "Rattus norvegicus, UniProt P10361", start: 92, sequence: "SSSVPSQKTYQGNYGFHLGFLQSGTAKSVMCTYSISLNKLFCQLAKTCPVQLWVTSTPPPGTRVRAMAIYKKSQHMTEVVRRCPHHERCSD-G-DGLAPPQHLIRVEGNPYAEYLDDRQTFRHSVVVPYEPPEVGSDYTTIHYKYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRDSFEVRVCACPGRDRRTEEENFRKK" },
  { id: "P53_CHICK", name: "Chicken", description: "Gallus gallus, UniProt P10360", start: 79, sequence: "SPVVPSTEDYGGDFDFRVGFVEAGTAKSVTCTYSPVLNKVYCRLAKPCPVQVRVGVAPPPGSSLRAVAVYKKSEHVAEVVRRCPHHERCGG-GTDGLAPAQHLIRVEGNPQARYHDDETTKRHSVVVPYEPPEVGSDCTTVLYNFMCNSSCMGGMNRRPILTILTLEGPGGQLLGRRCFEVRVCACPGRDRKIEEENFRKR" },
  { id: "P53_XENLA", name: "Frog", description: "Xenopus laevis, UniProt P07193", start: 68, sequence: "SCAVPSTDDYAGKYGLQLDFQQNGTAKSVTCTYSPELNKLFCQLAKTCPLLVRVESPPPRGSILRATAVYKKSEHVAEVVKRCPHHERSVEPG-EDAAPPSHLMRVEGNLQAYYMEDVNSGRHSVCVPYEGPQVGTECTTVLYNYMCNSSCMGGMNRRPILTIITLETPQGLLLGRRCFEVRVCACPGRDRRTEEDNYTKK" },
  { id: "P53_DANRE", name: "Zebrafish", description: "Danio rerio, UniProt P79734", start: 62, sequence: "TSTVPETSDYPGDHGFRLRFPQSGTAKSVTCTYSPDLNKLFCQLAKTCPVQMVVDVAPPQGSVVRATAIYKKSEHVAEVVRRCPHHERTPD-G-DNLAPAGHLIRVEGNQRANYREDNITLRHSVFVPYEAPQLGAEWTTVLLNYMCNSSCMGGMNRRPILTIITLETQEGQLLGRRSFEVRVCACPGRDRKTEESNFKKD" },
]

// TP53 coding sequence around codons 242 to 252 (CMGGMNRRPIL), Ensembl orthologues aligned with FAMSA.
export const TP53_CDS_COLUMN = 724
export const TP53_CDS: AlignedSequence[] = [
  { name: "Human", start: 724, sequence: "TGCATGGGCGGCATGAACCGGAGGCCCATCCTC", description: "Homo sapiens, ENST00000269305" },
  { name: "Mouse", start: 715, sequence: "TGCATGGGGGGCATGAACCGCCGACCTATCCTT", description: "Mus musculus" },
  { name: "Frog", start: 649, sequence: "TGTATGGGTGGGATGAACCGCCGGCCCATTCTC", description: "Xenopus tropicalis" },
  { name: "Zebrafish", start: 628, sequence: "TGCATGGGGGGGATGAACCGCAGGCCCATCCTC", description: "Danio rerio" },
]
