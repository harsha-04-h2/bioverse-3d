import type { FigureDef } from "@/lib/data";

/**
 * Gap-closure figures: inventory items not covered by earlier batches.
 * - Fig 1.6 (pollen products) and Fig 5.2 (polynucleotide chain): skipped by
 *   dedup because 3D models were registered under their numbers; fixed to
 *   Fig 1.1 / Fig 5.3 in data.ts, real figures built here.
 * - Fig 6.11, 7.7, 7.9, 12.1: tagged 3d/molecular in inventory but never
 *   built; rendered here as faithful 2D schematics (the textbook itself
 *   shows the chemical structures as 2D skeletal formulae).
 */
export const figures: FigureDef[] = [
  {
    id: "dgm-12-1-1d6",
    title: "Pollen Products — Commercial Applications",
    figureNo: "Fig 1.6",
    classLevel: 12,
    chapterNo: 1,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 470,
        shapes: [
          { kind: "circle", cx: 400, cy: 150, r: 62, fill: "#14324f", stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "circle", cx: 382, cy: 138, r: 10, fill: "#fbbf24", opacity: 0.75 },
          { kind: "circle", cx: 414, cy: 142, r: 7, fill: "#fbbf24", opacity: 0.55 },
          { kind: "circle", cx: 398, cy: 164, r: 8, fill: "#fbbf24", opacity: 0.65 },
          { kind: "text", x: 400, y: 248, text: "Pollen grain", size: 15, weight: 700, anchor: "middle" },
          { kind: "text", x: 400, y: 268, text: "protein-rich microspore", size: 11.5, color: "#94a3b8", anchor: "middle" },
          // product cards
          { kind: "rect", x: 60, y: 320, w: 150, h: 96, rx: 12, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "rect", x: 245, y: 320, w: 150, h: 96, rx: 12, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "rect", x: 430, y: 320, w: 150, h: 96, rx: 12, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "rect", x: 615, y: 320, w: 150, h: 96, rx: 12, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "text", x: 135, y: 352, text: "Tablets &", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 135, y: 370, text: "capsules", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 320, y: 352, text: "Health-food", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 320, y: 370, text: "powder", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 505, y: 352, text: "Cosmetic", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 505, y: 370, text: "creams", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 690, y: 352, text: "Honey & hive", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 690, y: 370, text: "products", size: 12.5, weight: 700, anchor: "middle" },
          { kind: "text", x: 135, y: 394, text: "dietary supplement", size: 10.5, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 320, y: 394, text: "protein supplement", size: 10.5, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 505, y: 394, text: "skin preparations", size: 10.5, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 690, y: 394, text: "bee-collected", size: 10.5, color: "#94a3b8", anchor: "middle" },
          // arrows from pollen to products
          { kind: "arrow", x1: 340, y1: 200, x2: 150, y2: 310, stroke: "#fbbf24", strokeWidth: 1.8 },
          { kind: "arrow", x1: 375, y1: 208, x2: 300, y2: 310, stroke: "#fbbf24", strokeWidth: 1.8 },
          { kind: "arrow", x1: 425, y1: 208, x2: 500, y2: 310, stroke: "#fbbf24", strokeWidth: 1.8 },
          { kind: "arrow", x1: 460, y1: 200, x2: 650, y2: 310, stroke: "#fbbf24", strokeWidth: 1.8 },
        ],
        labels: [],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Pollen grains are collected commercially and sold as health products. Because pollen is rich in proteins, vitamins and minerals, it is processed into tablets, food powders and cosmetic creams — an original schematic treatment of the textbook's product montage.",
    labels: [
      { id: "dgm-12-1-1d6-pollen", name: "Pollen grain", description: "The male microspore of flowering plants. Its tough outer wall lets harvested pollen survive processing into commercial products." },
      { id: "dgm-12-1-1d6-tablets", name: "Tablets and capsules", description: "Dried pollen compressed into pills and sold as a dietary supplement for its protein and micronutrient content." },
      { id: "dgm-12-1-1d6-cosmetic", name: "Cosmetic creams", description: "Pollen extracts are used in skin preparations, marketed for their vitamin and amino-acid content." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-5-5d2",
    title: "Polynucleotide Chain — Double-Stranded Segment",
    figureNo: "Fig 5.2",
    classLevel: 12,
    chapterNo: 5,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 460,
        shapes: [
          // strand 1 backbone (left, 5' top -> 3' bottom)
          { kind: "text", x: 250, y: 40, text: "5′", size: 15, weight: 700, color: "#22d3ee", anchor: "middle" },
          { kind: "text", x: 250, y: 445, text: "3′", size: 15, weight: 700, color: "#22d3ee", anchor: "middle" },
          // strand 2 backbone (right, 3' top -> 5' bottom): antiparallel
          { kind: "text", x: 550, y: 40, text: "3′", size: 15, weight: 700, color: "#a78bfa", anchor: "middle" },
          { kind: "text", x: 550, y: 445, text: "5′", size: 15, weight: 700, color: "#a78bfa", anchor: "middle" },
          // sugars (pentagons) strand 1
          { kind: "path", d: "M250,70 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#14324f", stroke: "#22d3ee", strokeWidth: 1.8 },
          { kind: "path", d: "M250,170 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#14324f", stroke: "#22d3ee", strokeWidth: 1.8 },
          { kind: "path", d: "M250,270 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#14324f", stroke: "#22d3ee", strokeWidth: 1.8 },
          { kind: "path", d: "M250,370 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#14324f", stroke: "#22d3ee", strokeWidth: 1.8 },
          // phosphates strand 1
          { kind: "circle", cx: 250, cy: 140, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "circle", cx: 250, cy: 240, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "circle", cx: 250, cy: 340, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "text", x: 250, y: 145, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 250, y: 245, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 250, y: 345, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          // sugars strand 2
          { kind: "path", d: "M550,70 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#1d1440", stroke: "#a78bfa", strokeWidth: 1.8 },
          { kind: "path", d: "M550,170 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#1d1440", stroke: "#a78bfa", strokeWidth: 1.8 },
          { kind: "path", d: "M550,270 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#1d1440", stroke: "#a78bfa", strokeWidth: 1.8 },
          { kind: "path", d: "M550,370 l34,12 l-8,34 l-52,0 l-8,-34 Z", fill: "#1d1440", stroke: "#a78bfa", strokeWidth: 1.8 },
          // phosphates strand 2
          { kind: "circle", cx: 550, cy: 140, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "circle", cx: 550, cy: 240, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "circle", cx: 550, cy: 340, r: 13, fill: "#0f2c22", stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "text", x: 550, y: 145, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 550, y: 245, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 550, y: 345, text: "P", size: 11, weight: 700, color: "#34d399", anchor: "middle" },
          // bases strand 1: A T G C
          { kind: "rect", x: 292, y: 76, w: 60, h: 30, rx: 6, fill: "#12303f", stroke: "#38bdf8", strokeWidth: 1.6 },
          { kind: "rect", x: 292, y: 176, w: 60, h: 30, rx: 6, fill: "#3a1d2e", stroke: "#fb7185", strokeWidth: 1.6 },
          { kind: "rect", x: 292, y: 276, w: 60, h: 30, rx: 6, fill: "#2e2a12", stroke: "#fbbf24", strokeWidth: 1.6 },
          { kind: "rect", x: 292, y: 376, w: 60, h: 30, rx: 6, fill: "#12331f", stroke: "#34d399", strokeWidth: 1.6 },
          { kind: "text", x: 322, y: 97, text: "A", size: 14, weight: 700, color: "#38bdf8", anchor: "middle" },
          { kind: "text", x: 322, y: 197, text: "T", size: 14, weight: 700, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 322, y: 297, text: "G", size: 14, weight: 700, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 322, y: 397, text: "C", size: 14, weight: 700, color: "#34d399", anchor: "middle" },
          // bases strand 2: T A C G (complementary)
          { kind: "rect", x: 448, y: 76, w: 60, h: 30, rx: 6, fill: "#3a1d2e", stroke: "#fb7185", strokeWidth: 1.6 },
          { kind: "rect", x: 448, y: 176, w: 60, h: 30, rx: 6, fill: "#12303f", stroke: "#38bdf8", strokeWidth: 1.6 },
          { kind: "rect", x: 448, y: 276, w: 60, h: 30, rx: 6, fill: "#12331f", stroke: "#34d399", strokeWidth: 1.6 },
          { kind: "rect", x: 448, y: 376, w: 60, h: 30, rx: 6, fill: "#2e2a12", stroke: "#fbbf24", strokeWidth: 1.6 },
          { kind: "text", x: 478, y: 97, text: "T", size: 14, weight: 700, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 478, y: 197, text: "A", size: 14, weight: 700, color: "#38bdf8", anchor: "middle" },
          { kind: "text", x: 478, y: 297, text: "C", size: 14, weight: 700, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 478, y: 397, text: "G", size: 14, weight: 700, color: "#fbbf24", anchor: "middle" },
          // hydrogen bonds: 2 for A=T, 3 for G≡C
          { kind: "line", x1: 356, y1: 86, x2: 444, y2: 86, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 98, x2: 444, y2: 98, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 186, x2: 444, y2: 186, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 198, x2: 444, y2: 198, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 284, x2: 444, y2: 284, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 293, x2: 444, y2: 293, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 302, x2: 444, y2: 302, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 384, x2: 444, y2: 384, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 393, x2: 444, y2: 393, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
          { kind: "line", x1: 356, y1: 402, x2: 444, y2: 402, stroke: "#e2e8f0", strokeWidth: 1.4, dashed: true },
        ],
        labels: [
          { text: "Deoxyribose sugar", x: 250, y: 200, lx: 120, ly: 130, anchor: "middle", accent: "cyan", info: "The five-carbon sugar in DNA. Sugars link through phosphates to form each strand's backbone." },
          { text: "Phosphate (P)", x: 250, y: 240, lx: 120, ly: 300, anchor: "middle", accent: "emerald", info: "Phosphate groups join sugars with phosphodiester bonds, giving the backbone its negative charge and 5′→3′ direction." },
          { text: "A = T (2 H-bonds)", x: 400, y: 92, lx: 400, ly: 20, anchor: "middle", accent: "sky", info: "Adenine always pairs with thymine, held by two hydrogen bonds." },
          { text: "G ≡ C (3 H-bonds)", x: 400, y: 293, lx: 660, ly: 240, anchor: "middle", accent: "amber", info: "Guanine always pairs with cytosine, held by three hydrogen bonds — a stronger pairing than A–T." },
          { text: "Antiparallel strands", x: 550, y: 200, lx: 680, ly: 130, anchor: "middle", accent: "violet", info: "The two strands run in opposite directions: one 5′→3′ downward, the other 3′→5′. This antiparallel layout is essential for replication." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "A segment of double-stranded DNA drawn as a polynucleotide chain: two sugar–phosphate backbones running antiparallel, with complementary bases (A–T, G–C) joined by hydrogen bonds. This is the flat schematic view of the molecule shown in 3D as the double helix.",
    labels: [
      { id: "dgm-12-5-5d2-backbone", name: "Sugar–phosphate backbone", description: "Alternating deoxyribose sugars and phosphates linked by phosphodiester bonds form each strand's structural backbone." },
      { id: "dgm-12-5-5d2-bases", name: "Nitrogenous bases", description: "Adenine, thymine, guanine and cytosine project inward from the sugars and pair across the strands by hydrogen bonding." },
      { id: "dgm-12-5-5d2-anti", name: "Antiparallel orientation", description: "One strand runs 5′→3′ while its partner runs 3′→5′, a requirement for DNA replication and transcription." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-6-6d11",
    title: "Skull Comparison — Ape-like Ancestor vs Modern Human",
    figureNo: "Fig 6.11",
    classLevel: 12,
    chapterNo: 6,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 430,
        shapes: [
          // ancestor skull profile (stylized lateral view)
          { kind: "path", d: "M120,120 C110,180 118,250 150,300 C170,330 200,345 235,350 L260,350 C250,320 245,290 250,260 C252,240 250,220 244,205 C230,175 200,160 175,158 C150,156 130,140 120,120 Z", fill: "#1a2340", stroke: "#a78bfa", strokeWidth: 2 },
          { kind: "path", d: "M150,300 C170,330 200,345 235,350 L260,350 C250,320 245,290 250,260", fill: "none", stroke: "#a78bfa", strokeWidth: 1.4, dashed: true },
          { kind: "ellipse", cx: 205, cy: 225, rx: 16, ry: 20, fill: "none", stroke: "#a78bfa", strokeWidth: 1.4 },
          { kind: "text", x: 190, y: 400, text: "Ape-like ancestor", size: 14, weight: 700, anchor: "middle", color: "#a78bfa" },
          { kind: "text", x: 190, y: 420, text: "≈ 400 cm³ cranial capacity", size: 11.5, color: "#94a3b8", anchor: "middle" },
          // human skull profile
          { kind: "path", d: "M470,80 C455,150 460,230 495,290 C515,325 545,342 580,348 L610,348 C600,315 596,285 602,255 C606,232 604,212 596,196 C580,165 548,150 520,150 C495,150 478,120 470,80 Z", fill: "#0f2c33", stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "ellipse", cx: 552, cy: 218, rx: 15, ry: 19, fill: "none", stroke: "#22d3ee", strokeWidth: 1.4 },
          { kind: "text", x: 540, y: 400, text: "Modern human", size: 14, weight: 700, anchor: "middle", color: "#22d3ee" },
          { kind: "text", x: 540, y: 420, text: "≈ 1400 cm³ cranial capacity", size: 11.5, color: "#94a3b8", anchor: "middle" },
          // comparison arrows
          { kind: "arrow", x1: 300, y1: 170, x2: 440, y2: 150, stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "text", x: 370, y: 140, text: "domed forehead,", size: 11, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 370, y: 156, text: "smaller brow ridge", size: 11, color: "#34d399", anchor: "middle" },
          { kind: "arrow", x1: 300, y1: 320, x2: 445, y2: 315, stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "text", x: 372, y: 348, text: "reduced jaw,", size: 11, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 372, y: 364, text: "larger braincase", size: 11, color: "#34d399", anchor: "middle" },
        ],
        labels: [
          { text: "Sloping forehead + heavy brow", x: 175, y: 175, lx: 60, ly: 60, anchor: "middle", accent: "violet", info: "Early hominin skulls had a low, sloping forehead with a prominent brow ridge above the eyes." },
          { text: "Prognathic (projecting) jaw", x: 235, y: 330, lx: 90, ly: 250, anchor: "middle", accent: "violet", info: "A forward-projecting jaw with large teeth, suited to a coarse diet." },
          { text: "High domed forehead", x: 520, y: 165, lx: 660, ly: 60, anchor: "middle", accent: "cyan", info: "Modern humans have a vertical forehead reflecting a greatly expanded frontal brain region." },
          { text: "Small jaw, chin present", x: 580, y: 330, lx: 700, ly: 250, anchor: "middle", accent: "cyan", info: "Reduced jaw and teeth with a distinct chin — a uniquely human trait." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "A stylized side-by-side comparison of an ape-like ancestor's skull with a modern human skull. Human evolution expanded the braincase from roughly 400 cm³ to about 1400 cm³, flattened the face, and reduced the jaw — the anatomical signature of increasing brain size.",
    labels: [
      { id: "dgm-12-6-6d11-capacity", name: "Cranial capacity", description: "Brain-case volume grew from ~400 cm³ in early hominins to ~1400 cm³ in modern humans, tracking the evolution of larger brains." },
      { id: "dgm-12-6-6d11-face", name: "Facial reduction", description: "The projecting ape-like jaw shrank as diet and tool use changed, giving humans a flatter face and a chin." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-7-7d7",
    title: "Morphine — Skeletal Structure",
    figureNo: "Fig 7.7",
    classLevel: 12,
    chapterNo: 7,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 440,
        shapes: [
          // A-ring (benzene), flat-top hexagon center (170,200) r=52
          { kind: "path", d: "M222,200 L196,245 L144,245 L118,200 L144,155 L196,155 Z", fill: "#1a2340", stroke: "#e2e8f0", strokeWidth: 2 },
          { kind: "circle", cx: 170, cy: 200, r: 28, fill: "none", stroke: "#94a3b8", strokeWidth: 1.4 },
          // C-ring fused along edge (222,200)-(196,245): vertices (196,245),(222,200),(274,200),(300,245),(274,290),(222,290)
          { kind: "path", d: "M196,245 L222,200 L274,200 L300,245 L274,290 L222,290 Z", fill: "#1a2340", stroke: "#e2e8f0", strokeWidth: 2 },
          // C7=C8 double bond: inner line parallel to edge (274,200)-(300,245)
          { kind: "line", x1: 268, y1: 212, x2: 288, y2: 242, stroke: "#e2e8f0", strokeWidth: 1.6 },
          // D-ring (piperidine) fused along bottom edge (274,290)-(222,290): center (248,335)
          { kind: "path", d: "M274,290 L222,290 L196,335 L222,380 L274,380 L300,335 Z", fill: "#14261f", stroke: "#34d399", strokeWidth: 2 },
          { kind: "text", x: 300, y: 341, text: "N", size: 16, weight: 700, color: "#34d399", anchor: "middle" },
          // N-methyl
          { kind: "line", x1: 312, y1: 335, x2: 344, y2: 335, stroke: "#34d399", strokeWidth: 1.8 },
          { kind: "text", x: 372, y: 340, text: "CH₃", size: 13, weight: 600, color: "#34d399", anchor: "middle" },
          // phenolic OH at C3 (vertex 118,200)
          { kind: "line", x1: 118, y1: 200, x2: 84, y2: 200, stroke: "#fb7185", strokeWidth: 1.8 },
          { kind: "text", x: 66, y: 205, text: "OH", size: 13, weight: 700, color: "#fb7185", anchor: "middle" },
          // alcoholic OH at C6 (vertex 300,245)
          { kind: "line", x1: 300, y1: 245, x2: 334, y2: 245, stroke: "#fb7185", strokeWidth: 1.8 },
          { kind: "text", x: 356, y: 250, text: "OH", size: 13, weight: 700, color: "#fb7185", anchor: "middle" },
          // ether bridge (E-ring): dashed from A-ring top (196,155) to C-ring top (274,200), O at midpoint
          { kind: "line", x1: 196, y1: 155, x2: 274, y2: 200, stroke: "#fbbf24", strokeWidth: 1.8, dashed: true },
          { kind: "text", x: 235, y: 172, text: "O", size: 14, weight: 700, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 170, y: 120, text: "A", size: 12, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 120, text: "Stylized skeletal formula — ring connectivity shown", size: 11.5, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Phenolic –OH (C3)", x: 84, y: 200, lx: 60, ly: 90, anchor: "middle", accent: "rose", info: "The hydroxyl on the benzene ring makes this end of the molecule phenolic — key to morphine's chemistry." },
          { text: "Alcoholic –OH (C6)", x: 334, y: 245, lx: 470, ly: 120, anchor: "middle", accent: "rose", info: "The second hydroxyl sits on the cyclohexene ring; modifying it changes the drug's potency." },
          { text: "Ether bridge (O)", x: 235, y: 177, lx: 420, ly: 200, anchor: "middle", accent: "amber", info: "An oxygen bridge locks the rings into morphine's rigid T-shape, which fits opioid receptors precisely." },
          { text: "Tertiary amine (N–CH₃)", x: 310, y: 335, lx: 480, ly: 380, anchor: "middle", accent: "emerald", info: "The nitrogen with its methyl group is essential for binding to opioid receptors in the brain." },
          { text: "Benzene (A-ring)", x: 170, y: 200, lx: 170, ly: 300, anchor: "middle", accent: "sky", info: "The aromatic ring anchors the rigid pentacyclic morphinan skeleton shared by morphine, codeine and heroin." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Morphine's skeletal formula: a rigid pentacyclic structure with a benzene ring, two hydroxyl groups, an ether bridge and a nitrogen carrying a methyl group. This precise 3D shape lets morphine fit the brain's opioid receptors — which is why it kills pain so effectively and why it is so addictive.",
    labels: [
      { id: "dgm-12-7-7d7-opioid", name: "Opioid receptor fit", description: "Morphine's rigid shape mimics the body's natural endorphins, binding the same receptors — producing pain relief, drowsiness and euphoria." },
      { id: "dgm-12-7-7d7-source", name: "From poppy latex", description: "Morphine is extracted from the dried latex (smack) of the opium poppy's unripe capsules." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-7-7d9",
    title: "Cannabinoid (THC) — Skeletal Structure",
    figureNo: "Fig 7.9",
    classLevel: 12,
    chapterNo: 7,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 460,
        shapes: [
          // A-ring benzene, flat-top center (170,210) r=54
          { kind: "path", d: "M224,210 L197,257 L143,257 L116,210 L143,163 L197,163 Z", fill: "#1a2340", stroke: "#e2e8f0", strokeWidth: 2 },
          { kind: "circle", cx: 170, cy: 210, r: 29, fill: "none", stroke: "#94a3b8", strokeWidth: 1.4 },
          // phenolic OH at C1 (vertex 116,210)
          { kind: "line", x1: 116, y1: 210, x2: 82, y2: 210, stroke: "#fb7185", strokeWidth: 1.8 },
          { kind: "text", x: 64, y: 215, text: "OH", size: 13, weight: 700, color: "#fb7185", anchor: "middle" },
          // pentyl chain at C3 (vertex 143,257): zigzag down
          { kind: "path", d: "M143,257 L118,292 L148,322 L124,356 L154,386", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.8 },
          { kind: "text", x: 170, y: 408, text: "C₅H₁₁ (pentyl chain)", size: 12, color: "#94a3b8", anchor: "middle" },
          // C-ring pyran fused along edge (224,210)-(197,257): center (251,257) r=54
          // vertices: 180:(197,257) 240:(224,210) 300:(278,210) 0:(305,257)->O 60:(278,304) 120:(224,304)
          { kind: "path", d: "M197,257 L224,210 L278,210 L305,257 L278,304 L224,304 Z", fill: "#1c1a38", stroke: "#e2e8f0", strokeWidth: 2 },
          { kind: "text", x: 305, y: 263, text: "O", size: 15, weight: 700, color: "#fbbf24", anchor: "middle" },
          // gem-dimethyl at (278,304)
          { kind: "line", x1: 278, y1: 304, x2: 262, y2: 332, stroke: "#e2e8f0", strokeWidth: 1.6 },
          { kind: "line", x1: 278, y1: 304, x2: 296, y2: 330, stroke: "#e2e8f0", strokeWidth: 1.6 },
          { kind: "text", x: 250, y: 350, text: "CH₃", size: 11, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 306, y: 348, text: "CH₃", size: 11, color: "#94a3b8", anchor: "middle" },
          // B-ring cyclohexene fused along edge (224,304)-(278,304): center (251,351) r=54
          // vertices: 240:(224,304) 300:(278,304) 0:(305,351) 60:(278,398) 120:(224,398) 180:(197,351)
          { kind: "path", d: "M224,304 L278,304 L305,351 L278,398 L224,398 L197,351 Z", fill: "#1a2340", stroke: "#e2e8f0", strokeWidth: 2 },
          // Δ9 double bond: inner line parallel to edge (305,351)-(278,398)
          { kind: "line", x1: 295, y1: 355, x2: 274, y2: 388, stroke: "#e2e8f0", strokeWidth: 1.6 },
          // methyl at C9 (vertex 305,351)
          { kind: "line", x1: 305, y1: 351, x2: 337, y2: 351, stroke: "#e2e8f0", strokeWidth: 1.6 },
          { kind: "text", x: 359, y: 356, text: "CH₃", size: 12, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 100, text: "Stylized skeletal formula — Δ⁹-tetrahydrocannabinol", size: 11.5, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Phenolic –OH", x: 82, y: 210, lx: 60, ly: 100, anchor: "middle", accent: "rose", info: "The hydroxyl group on the benzene ring, shared with many plant phenols." },
          { text: "Pentyl side chain", x: 140, y: 330, lx: 60, ly: 440, anchor: "middle", accent: "sky", info: "A five-carbon chain that makes THC fat-soluble, letting it cross into the brain quickly." },
          { text: "Pyran oxygen", x: 305, y: 257, lx: 470, ly: 180, anchor: "middle", accent: "amber", info: "The oxygen in the six-membered pyran ring gives the dibenzopyran core its name." },
          { text: "Δ⁹ double bond", x: 285, y: 372, lx: 470, ly: 420, anchor: "middle", accent: "emerald", info: "The double bond at position 9 defines Δ⁹-THC — the main psychoactive cannabinoid of cannabis." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The skeletal formula of Δ⁹-tetrahydrocannabinol (THC), the main psychoactive chemical in cannabis: a three-ring dibenzopyran core with a phenolic hydroxyl, a pentyl side chain and the characteristic Δ⁹ double bond. Its fat-soluble shape lets it reach cannabinoid receptors in the brain.",
    labels: [
      { id: "dgm-12-7-7d9-thc", name: "Δ⁹-THC", description: "The principal psychoactive cannabinoid in Cannabis sativa, responsible for its effects on mood, perception and coordination." },
      { id: "dgm-12-7-7d9-receptor", name: "Cannabinoid receptors", description: "THC binds CB1 receptors concentrated in the brain, which is why cannabis affects thinking, memory and movement." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-12-12d1",
    title: "Decomposition Cycle — Terrestrial Ecosystem",
    figureNo: "Fig 12.1",
    classLevel: 12,
    chapterNo: 12,
    modelKey: null,
    diagram: {
      template: "cycle",
      spec: {
        centerLabel: "Decomposition",
        centerSub: "breakdown of dead organic matter",
        nodes: [
          { label: "Detritus", sub: "dead leaves, bark, faeces", accent: "amber", info: "Dead plant and animal remains plus faecal matter — the raw material of decomposition, lying on or in the soil." },
          { label: "Fragmentation", sub: "by detritivores", accent: "orange", info: "Detritivores such as earthworms and termites chew detritus into smaller particles, hugely increasing the surface area for microbes." },
          { label: "Leaching", sub: "water-soluble nutrients", accent: "sky", info: "Rainwater percolating through the fragments dissolves soluble sugars and inorganic nutrients, carrying them into deeper soil layers." },
          { label: "Catabolism", sub: "bacterial & fungal enzymes", accent: "emerald", info: "Bacteria and fungi secrete enzymes that digest the remaining complex molecules into simple soluble compounds." },
          { label: "Humification", sub: "humus formation", accent: "violet", info: "Partially decomposed matter condenses into humus — a dark, amorphous, nutrient-rich colloid that improves soil structure and fertility." },
          { label: "Mineralisation", sub: "release of minerals", accent: "cyan", info: "Microbes finally release inorganic nutrients (CO₂, NH₄⁺, PO₄³⁻) into the soil, where plant roots absorb them — closing the cycle." },
        ],
        arrows: [
          { from: 0, to: 1, label: "detritivores" },
          { from: 1, to: 2, label: "rainwater" },
          { from: 2, to: 3, label: "enzymes" },
          { from: 3, to: 4 },
          { from: 4, to: 5, label: "microbes" },
          { from: 5, to: 0, label: "to producers" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The decomposition cycle in a terrestrial ecosystem: detritus is fragmented by detritivores, leached by water, and digested by microbial enzymes; the residue becomes humus, and finally mineralisation releases inorganic nutrients back to the soil for plants to reuse.",
    labels: [
      { id: "dgm-12-12-12d1-detritus", name: "Detritus", description: "Dead organic matter — fallen leaves, dead roots, bark and animal remains — that feeds the decomposer food chain." },
      { id: "dgm-12-12-12d1-humus", name: "Humus", description: "Dark, colloidal, nutrient-rich residue of decomposition that gives fertile soil its structure and water-holding capacity." },
      { id: "dgm-12-12-12d1-min", name: "Mineralisation", description: "The final step releasing CO₂, ammonium and phosphate into soil — the nutrients plants absorb to grow again." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
];
