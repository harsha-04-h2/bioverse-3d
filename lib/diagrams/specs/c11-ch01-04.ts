import type { FigureDef } from "@/lib/data";

export const figures: FigureDef[] = [
  /* ================= Ch 1 · The Living World ================= */
  {
    id: "dgm-11-1-1d1",
    title: "The Taxonomic Ladder",
    figureNo: "Fig 1.1",
    classLevel: 11,
    chapterNo: 1,
    modelKey: null,
    diagram: {
      template: "flow",
      spec: {
        direction: "vertical",
        steps: [
          { title: "Kingdom", detail: "broadest grouping, e.g. Animalia, Plantae", accent: "violet" },
          { title: "Phylum (Division in plants)", detail: "shared fundamental body plan", accent: "sky" },
          { title: "Class", detail: "major shared traits within a phylum", accent: "cyan" },
          { title: "Order", detail: "families sharing common features", accent: "emerald" },
          { title: "Family", detail: "cluster of closely related genera", accent: "lime" },
          { title: "Genus", detail: "group of closely related species", accent: "amber" },
          { title: "Species", detail: "individuals that can interbreed, e.g. Mangifera indica", accent: "rose" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Every organism sits inside seven nested taxonomic ranks, from the all-inclusive kingdom down to the single species. Each step down the ladder is a tighter set of shared characters, so fewer and fewer organisms qualify. The mango climbs this ladder from Species indica through Genus Mangifera all the way up to Kingdom Plantae.",
    labels: [
      {
        id: "dgm-11-1-1d1-species",
        name: "Species",
        description:
          "The lowest and most exclusive rank: a group of actually or potentially interbreeding natural populations. It is the basic unit of classification.",
      },
      {
        id: "dgm-11-1-1d1-genus",
        name: "Genus",
        description:
          "A group of closely related species that share more characters with each other than with species of other genera.",
      },
      {
        id: "dgm-11-1-1d1-binomial",
        name: "Binomial nomenclature",
        description:
          "Linnaeus's two-word naming system: genus name (capitalised) followed by species epithet, e.g. Homo sapiens. Names are Latinised and printed in italics.",
      },
      {
        id: "dgm-11-1-1d1-taxon",
        name: "Taxon",
        description:
          "Any real group of organisms placed at a rank - a species, a genus, or a kingdom is each a taxon. Ranks are the ladder; taxa are the rungs occupied.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },

  /* ================= Ch 2 · Biological Classification ================= */
  {
    id: "dgm-11-2-2d1",
    title: "Four Bacterial Body Plans",
    figureNo: "Fig 2.1",
    classLevel: 11,
    chapterNo: 2,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Bacterial shapes - a stable identification character", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "circle", cx: 100, cy: 180, r: 20, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.18 },
          { kind: "circle", cx: 142, cy: 180, r: 20, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.18 },
          { kind: "circle", cx: 184, cy: 180, r: 20, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.18 },
          { kind: "text", x: 142, y: 250, text: "Coccus", size: 18, color: "#22d3ee", weight: 600, anchor: "middle" },
          { kind: "text", x: 142, y: 276, text: "spherical", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "rect", x: 300, y: 160, w: 130, h: 40, rx: 20, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.18 },
          { kind: "text", x: 365, y: 250, text: "Bacillus", size: 18, color: "#34d399", weight: 600, anchor: "middle" },
          { kind: "text", x: 365, y: 276, text: "rod-shaped", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "path", d: "M 505 195 q 28 -45 56 0 q 28 45 56 0 q 28 -45 56 0", fill: "none", stroke: "#fb923c", strokeWidth: 7, opacity: 0.85 },
          { kind: "text", x: 589, y: 250, text: "Spirillum", size: 18, color: "#fb923c", weight: 600, anchor: "middle" },
          { kind: "text", x: 589, y: 276, text: "spiral", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "path", d: "M 680 155 q 50 5 45 60", fill: "none", stroke: "#fb7185", strokeWidth: 9, opacity: 0.85 },
          { kind: "path", d: "M 690 150 q 30 -25 55 -22", fill: "none", stroke: "#fb7185", strokeWidth: 2, dashed: true },
          { kind: "text", x: 700, y: 250, text: "Vibrio", size: 18, color: "#fb7185", weight: 600, anchor: "middle" },
          { kind: "text", x: 700, y: 276, text: "comma-shaped", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 400, text: "Most bacteria are 0.5 - 5 µm long: roughly 200x smaller than a printed dot.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 428, text: "Shape stays constant for a species even as size varies with nutrition.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Streptococcus - chains of cocci", x: 184, y: 180, lx: 142, ly: 330, anchor: "middle", accent: "cyan", info: "Cocci may stay attached after division, forming chains (strepto-), clusters (staphylo-) or pairs (diplo-)." },
          { text: "Rod with rounded ends", x: 365, y: 180, lx: 365, ly: 330, anchor: "middle", accent: "emerald", info: "Bacilli such as E. coli and Lactobacillus are the most common bacterial shape." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Bacteria come in a handful of dependable shapes: spheres (cocci), rods (bacilli), spirals (spirilla) and commas (vibrios). Shape is genetically fixed and therefore a reliable identification character, while size shifts with nutrition. This panel shows the four classic forms side by side at the same imagined scale.",
    labels: [
      {
        id: "dgm-11-2-2d1-coccus",
        name: "Coccus",
        description:
          "Spherical bacterium. After division cocci may separate, or stay attached as chains (Streptococcus), clusters (Staphylococcus) or pairs (Diplococcus).",
      },
      {
        id: "dgm-11-2-2d1-bacillus",
        name: "Bacillus",
        description:
          "Rod-shaped bacterium, the commonest form - E. coli and Lactobacillus are classic examples. Some form resistant endospores to survive harsh conditions.",
      },
      {
        id: "dgm-11-2-2d1-spirillum",
        name: "Spirillum",
        description:
          "Rigid spiral or corkscrew-shaped bacterium. The helical body suits swimming through viscous fluids, often driven by polar flagella.",
      },
      {
        id: "dgm-11-2-2d1-vibrio",
        name: "Vibrio",
        description:
          "Comma- or curved-rod-shaped bacterium, typically with a single polar flagellum. Vibrio cholerae, the cholera pathogen, is the famous example.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-2-2d2",
    title: "Nostoc: A Nitrogen-Fixing Filament",
    figureNo: "Fig 2.2",
    classLevel: 11,
    chapterNo: 2,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Nostoc - a filamentous cyanobacterium", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "rect", x: 90, y: 165, w: 620, h: 170, rx: 85, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, dashed: true, opacity: 0.08 },
          { kind: "ellipse", cx: 160, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 225, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 290, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 362, cy: 250, rx: 26, ry: 36, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2.5, opacity: 0.25 },
          { kind: "text", x: 362, y: 256, text: "H", size: 16, color: "#fbbf24", weight: 700, anchor: "middle" },
          { kind: "ellipse", cx: 434, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 499, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 564, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 629, cy: 250, rx: 20, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "text", x: 400, y: 415, text: "Unbranched, bead-like trichome - no true branching", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 442, text: "Found in moist soil, paddy fields and temporary ponds", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Heterocyst - fixes N2", x: 362, y: 214, lx: 362, ly: 110, anchor: "middle", accent: "amber", info: "A thick-walled, non-photosynthetic cell that fixes atmospheric nitrogen using the oxygen-sensitive enzyme nitrogenase." },
          { text: "Vegetative cells - photosynthesis", x: 225, y: 250, lx: 150, ly: 415, anchor: "middle", accent: "emerald", info: "Ordinary cells carry chlorophyll a and phycobilins; they photosynthesise and pass carbon to the heterocyst." },
          { text: "Mucilaginous sheath", x: 700, y: 250, lx: 660, ly: 415, anchor: "middle", accent: "sky", info: "A jelly-like covering that holds the filament together and resists drying when ponds shrink." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Nostoc is a cyanobacterium that grows as an unbranched, bead-like filament wrapped in a mucilaginous sheath. Most cells are ordinary photosynthetic cells, but scattered among them are larger heterocysts - specialised cells that fix atmospheric nitrogen. This division of labour lets one filament both make its own food and fertilise paddy fields.",
    labels: [
      {
        id: "dgm-11-2-2d2-heterocyst",
        name: "Heterocyst",
        description:
          "A thick-walled, enlarged cell in the filament that fixes atmospheric nitrogen into ammonia. It lacks photosystem II so no oxygen poisons nitrogenase.",
      },
      {
        id: "dgm-11-2-2d2-sheath",
        name: "Mucilage sheath",
        description:
          "A gelatinous covering around the trichome that protects against desiccation and glues filaments into visible colonies in ponds and wet soil.",
      },
      {
        id: "dgm-11-2-2d2-nfix",
        name: "Nitrogen fixation",
        description:
          "Converting inert atmospheric N2 into usable ammonia. Nostoc and Anabaena in rice paddies are natural biofertilisers because of it.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-2-2d3",
    title: "Binary Fission, Step by Step",
    figureNo: "Fig 2.3",
    classLevel: 11,
    chapterNo: 2,
    modelKey: null,
    diagram: {
      template: "flow",
      spec: {
        direction: "horizontal",
        arrowLabels: ["DNA copies", "wall grows in", "splits apart"],
        steps: [
          { title: "Elongation and DNA replication", detail: "circular chromosome duplicates; cell grows longer", accent: "cyan" },
          { title: "Septum formation", detail: "plasma membrane and wall invaginate at mid-cell", accent: "sky" },
          { title: "Cytoplasmic constriction", detail: "the furrow deepens, partitioning the cytoplasm", accent: "emerald" },
          { title: "Two daughter cells", detail: "genetically identical; ~20 min per cycle in E. coli", accent: "lime" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Binary fission is the simplest form of reproduction: one bacterial cell copies its chromosome, grows a dividing wall across its middle, and pinches into two. Because it is asexual and mitosis-like, both daughters are genetic clones of the parent. In rich medium E. coli can complete the whole cycle in about twenty minutes.",
    labels: [
      {
        id: "dgm-11-2-2d3-septum",
        name: "Septum",
        description:
          "The inward-growing wall of membrane and peptidoglycan that partitions the dividing cell. Its position decides whether division is equal or unequal.",
      },
      {
        id: "dgm-11-2-2d3-clone",
        name: "Clone",
        description:
          "A population of genetically identical cells. Binary fission produces clones, so new traits arise only through rare mutations or gene transfer.",
      },
      {
        id: "dgm-11-2-2d3-asexual",
        name: "Asexual reproduction",
        description:
          "Reproduction from a single parent without gametes or fertilisation. It is fast and efficient but generates no genetic variation on its own.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-2-2d4",
    title: "Two Protist Body Plans",
    figureNo: "Fig 2.4",
    classLevel: 11,
    chapterNo: 2,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 200, y: 52, text: "Euglena - the mixotroph", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 590, y: 52, text: "Paramecium - the ciliate", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 105 235 Q 195 190 295 235 Q 195 280 105 235 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.16 },
          { kind: "path", d: "M 292 235 q 35 -35 70 -20 q 25 10 45 -5", fill: "none", stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "circle", cx: 245, cy: 228, r: 7, fill: "#fb7185", stroke: "#fb7185", opacity: 0.9 },
          { kind: "ellipse", cx: 175, cy: 235, rx: 26, ry: 14, fill: "#34d399", stroke: "#34d399", opacity: 0.35 },
          { kind: "ellipse", cx: 215, cy: 245, rx: 22, ry: 12, fill: "#34d399", stroke: "#34d399", opacity: 0.35 },
          { kind: "text", x: 200, y: 330, text: "pellicle - flexible, no rigid wall", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "ellipse", cx: 590, cy: 235, rx: 115, ry: 68, fill: "none", stroke: "#a3e635", strokeWidth: 2, dashed: true, opacity: 0.55 },
          { kind: "ellipse", cx: 590, cy: 235, rx: 100, ry: 55, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.14 },
          { kind: "path", d: "M 520 250 q 35 28 80 18", fill: "none", stroke: "#38bdf8", strokeWidth: 2.5, dashed: true },
          { kind: "ellipse", cx: 630, cy: 225, rx: 30, ry: 14, fill: "#a78bfa", stroke: "#a78bfa", opacity: 0.5 },
          { kind: "circle", cx: 535, cy: 200, r: 9, fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.6 },
          { kind: "circle", cx: 645, cy: 270, r: 9, fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.6 },
          { kind: "text", x: 590, y: 330, text: "slipper-shaped, covered in cilia", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 440, text: "Both are unicellular eukaryotes - one cell doing everything an animal does.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Flagellum - pulls cell forward", x: 330, y: 215, lx: 250, ly: 110, anchor: "middle", accent: "emerald", info: "Euglena swims with one or two emergent flagella arising from an anterior reservoir." },
          { text: "Eyespot (stigma) - senses light", x: 245, y: 228, lx: 130, ly: 400, anchor: "middle", accent: "rose", info: "A red pigment spot shading the photoreceptor, letting Euglena swim toward light for photosynthesis." },
          { text: "Cilia - locomotion and feeding", x: 590, y: 168, lx: 590, ly: 110, anchor: "middle", accent: "lime", info: "Thousands of short cilia beat in coordinated waves to swim and sweep food into the oral groove." },
          { text: "Oral groove - food channel", x: 555, y: 272, lx: 470, ly: 400, anchor: "middle", accent: "sky", info: "A funnel-like depression leading to the cytostome, where food vacuoles form." },
          { text: "Contractile vacuole - pumps out water", x: 535, y: 200, lx: 700, ly: 400, anchor: "middle", accent: "sky", info: "Star-shaped vacuoles collect and expel excess water - osmoregulation in fresh water." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Euglena and Paramecium show how much a single eukaryotic cell can do. Euglena is a mixotroph: it photosynthesises like a plant in sunlight yet can also absorb nutrients, steered by its eyespot and flagellum. Paramecium is a heterotrophic ciliate, rowing through pond water with thousands of cilia and pumping out excess water with contractile vacuoles.",
    labels: [
      {
        id: "dgm-11-2-2d4-mixotroph",
        name: "Mixotroph",
        description:
          "An organism that mixes nutrition modes. Euglena photosynthesises when light is available and switches to absorbing dissolved food in the dark.",
      },
      {
        id: "dgm-11-2-2d4-pellicle",
        name: "Pellicle",
        description:
          "Euglena's flexible protein skin beneath the plasma membrane. It holds the cell's shape yet allows the squirming movement called metaboly.",
      },
      {
        id: "dgm-11-2-2d4-cilia",
        name: "Cilia",
        description:
          "Short hair-like extensions of the cell surface. In Paramecium they beat in metachronal waves for swimming and for sweeping food particles in.",
      },
      {
        id: "dgm-11-2-2d4-contractile",
        name: "Contractile vacuole",
        description:
          "A pulsating vacuole that collects excess water entering by osmosis and expels it. Freshwater protists cannot survive without this pump.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-2-2d5",
    title: "Three Fungal Lifestyles",
    figureNo: "Fig 2.5",
    classLevel: 11,
    chapterNo: 2,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 140, y: 52, text: "Mucor - bread mould", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Aspergillus", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 640, y: 52, text: "Agaricus - mushroom", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "line", x1: 60, y1: 320, x2: 220, y2: 320, stroke: "#a78bfa", strokeWidth: 3 },
          { kind: "line", x1: 140, y1: 320, x2: 140, y2: 190, stroke: "#a78bfa", strokeWidth: 3 },
          { kind: "circle", cx: 140, cy: 160, r: 30, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.22 },
          { kind: "circle", cx: 140, cy: 160, r: 10, fill: "#a78bfa", opacity: 0.5 },
          { kind: "path", d: "M 140 320 l -25 30 M 140 320 l 25 30 M 140 320 l 0 32", stroke: "#a78bfa", strokeWidth: 2 },
          { kind: "text", x: 140, y: 400, text: "sporangiophore + sporangium", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "line", x1: 400, y1: 340, x2: 400, y2: 200, stroke: "#22d3ee", strokeWidth: 3 },
          { kind: "circle", cx: 400, cy: 182, r: 16, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.3 },
          { kind: "line", x1: 388, y1: 172, x2: 368, y2: 140, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 400, y1: 168, x2: 400, y2: 132, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 412, y1: 172, x2: 432, y2: 140, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "circle", cx: 364, cy: 132, r: 8, fill: "#22d3ee", opacity: 0.45 },
          { kind: "circle", cx: 358, cy: 118, r: 7, fill: "#22d3ee", opacity: 0.35 },
          { kind: "circle", cx: 400, cy: 122, r: 8, fill: "#22d3ee", opacity: 0.45 },
          { kind: "circle", cx: 400, cy: 108, r: 7, fill: "#22d3ee", opacity: 0.35 },
          { kind: "circle", cx: 436, cy: 132, r: 8, fill: "#22d3ee", opacity: 0.45 },
          { kind: "circle", cx: 442, cy: 118, r: 7, fill: "#22d3ee", opacity: 0.35 },
          { kind: "text", x: 400, y: 400, text: "conidiophore with conidia chains", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "line", x1: 540, y1: 380, x2: 740, y2: 380, stroke: "#64748b", strokeWidth: 2, dashed: true },
          { kind: "rect", x: 618, y: 260, w: 44, h: 120, rx: 12, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 575 262 Q 640 185 705 262 Z", fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.25 },
          { kind: "line", x1: 605, y1: 262, x2: 605, y2: 282, stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "line", x1: 625, y1: 262, x2: 625, y2: 284, stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "line", x1: 645, y1: 262, x2: 645, y2: 284, stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "line", x1: 665, y1: 262, x2: 665, y2: 282, stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "path", d: "M 640 380 q -30 25 -70 30 M 640 380 q 25 30 60 28 M 640 380 q -10 32 -45 40", fill: "none", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.6 },
          { kind: "text", x: 640, y: 445, text: "fruiting body over hidden mycelium", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          { text: "Sporangium - asexual spores", x: 140, y: 160, lx: 140, ly: 105, anchor: "middle", accent: "violet", info: "A sac in which non-motile sporangiospores form by mitosis - Mucor's asexual stage." },
          { text: "Conidia in chains", x: 400, y: 122, lx: 400, ly: 105, anchor: "middle", accent: "cyan", info: "Exogenous asexual spores budded in chains from a swollen vesicle - the Aspergillus signature." },
          { text: "Pileus (cap) with gills", x: 640, y: 220, lx: 700, ly: 120, anchor: "middle", accent: "amber", info: "The mushroom's cap; gills underneath bear millions of basidiospores - the sexual stage of Agaricus." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Fungi solve reproduction three different ways. Mucor packs asexual spores into a round sporangium atop an upright stalk. Aspergillus buds its spores in chains from a swollen vesicle, giving the classic brush-head look. Agaricus builds a full mushroom - a fruiting body whose gills release sexual basidiospores while the real fungus, the mycelium, stays hidden underground.",
    labels: [
      {
        id: "dgm-11-2-2d5-sporangium",
        name: "Sporangium",
        description:
          "A sac-like structure producing endogenous asexual spores. In Mucor it sits on a sporangiophore and bursts to scatter sporangiospores.",
      },
      {
        id: "dgm-11-2-2d5-conidia",
        name: "Conidia",
        description:
          "Exogenous, non-motile asexual spores pinched off in chains from a conidiophore. Aspergillus and Penicillium reproduce chiefly this way.",
      },
      {
        id: "dgm-11-2-2d5-mycelium",
        name: "Mycelium",
        description:
          "The network of branching hyphae that is the true body of a fungus, absorbing nutrients. The mushroom is only its temporary reproductive structure.",
      },
      {
        id: "dgm-11-2-2d5-saprophyte",
        name: "Saprophyte",
        description:
          "An organism feeding on dead organic matter. Mucor and Agaricus are saprophytic decomposers, recycling nutrients back into the ecosystem.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },

  /* ================= Ch 3 · Plant Kingdom ================= */
  {
    id: "dgm-11-3-3d1",
    title: "Three Pigments, Three Algae",
    figureNo: "Fig 3.1",
    classLevel: 11,
    chapterNo: 3,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 150, y: 52, text: "Green alga - Chlamydomonas", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Brown alga - Laminaria", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Red alga - Porphyra", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Chlamydomonas
          { kind: "ellipse", cx: 150, cy: 230, rx: 38, ry: 52, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.18 },
          { kind: "path", d: "M 122 250 Q 150 290 178 250", fill: "none", stroke: "#34d399", strokeWidth: 3, opacity: 0.7 },
          { kind: "path", d: "M 140 180 q -15 -35 -30 -50", fill: "none", stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "path", d: "M 160 180 q 15 -35 30 -50", fill: "none", stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "circle", cx: 150, cy: 262, r: 7, fill: "#34d399", opacity: 0.6 },
          { kind: "text", x: 150, y: 350, text: "chlorophyll a + b", size: 14, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 150, y: 372, text: "starch stored in pyrenoids", size: 13, color: "#94a3b8", anchor: "middle" },
          // Laminaria
          { kind: "path", d: "M 400 360 q -20 25 -45 22 q 15 12 40 8 M 400 360 q 20 25 45 22 q -15 12 -40 8", fill: "none", stroke: "#fb923c", strokeWidth: 3 },
          { kind: "line", x1: 400, y1: 360, x2: 400, y2: 230, stroke: "#fb923c", strokeWidth: 6 },
          { kind: "ellipse", cx: 400, cy: 165, rx: 30, ry: 68, fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.18 },
          { kind: "line", x1: 400, y1: 110, x2: 400, y2: 220, stroke: "#fb923c", strokeWidth: 2, opacity: 0.6 },
          { kind: "text", x: 400, y: 415, text: "fucoxanthin masks green", size: 14, color: "#fb923c", anchor: "middle" },
          { kind: "text", x: 400, y: 437, text: "holdfast - stipe - frond", size: 13, color: "#94a3b8", anchor: "middle" },
          // Porphyra
          { kind: "path", d: "M 590 150 q 20 -18 40 0 t 40 0 t 40 0 t 40 0 L 750 300 q -20 18 -40 0 t -40 0 t -40 0 t -40 0 Z", fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.2 },
          { kind: "text", x: 670, y: 350, text: "phycoerythrin - red", size: 14, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 670, y: 372, text: "floridean starch reserve", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          { text: "Biflagellate - two equal flagella", x: 125, y: 150, lx: 150, ly: 110, anchor: "middle", accent: "emerald", info: "Motile green algae swim with two identical anterior flagella - the ancestral swimming cell." },
          { text: "Blade (lamina) - the frond", x: 400, y: 165, lx: 540, ly: 110, anchor: "middle", accent: "orange", info: "The leaf-like photosynthetic blade of a kelp, borne on a stipe anchored by a holdfast." },
          { text: "Membranous thallus", x: 670, y: 225, lx: 670, ly: 420, anchor: "middle", accent: "rose", info: "Red algae have simple, often sheet-like bodies; many reach great depths where red pigment harvests blue light." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Algae are classified by their dominant pigment, and each class looks and lives differently. Green algae like Chlamydomonas carry chlorophyll a and b and store starch - plant-like in every biochemical way. Brown algae like the kelp Laminaria use fucoxanthin to build giant differentiated fronds. Red algae like Porphyra rely on phycoerythrin, which lets them photosynthesise in deep water.",
    labels: [
      {
        id: "dgm-11-3-3d1-chlorophyceae",
        name: "Chlorophyceae",
        description:
          "Green algae: chlorophyll a and b in defined chloroplasts, starch stored in pyrenoids. Mostly freshwater; the group closest to land plants.",
      },
      {
        id: "dgm-11-3-3d1-phaeophyceae",
        name: "Phaeophyceae",
        description:
          "Brown algae: chlorophyll a and c plus fucoxanthin. Almost all marine, with differentiated holdfast, stipe and frond - kelps are the giants.",
      },
      {
        id: "dgm-11-3-3d1-rhodophyceae",
        name: "Rhodophyceae",
        description:
          "Red algae: chlorophyll a and d plus phycoerythrin. Store floridean starch; many live at depth. Porphyra and Gracilaria are edible and commercial.",
      },
      {
        id: "dgm-11-3-3d1-thallus",
        name: "Thallus",
        description:
          "A plant body not differentiated into root, stem and leaves. Algae, fungi and bryophytes all have thalloid organisation at some stage.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-3-3d2",
    title: "Marchantia and Funaria",
    figureNo: "Fig 3.2",
    classLevel: 11,
    chapterNo: 3,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 220, y: 52, text: "Marchantia - a liverwort", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 580, y: 52, text: "Funaria - a moss", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Marchantia thallus - dichotomous lobes
          { kind: "ellipse", cx: 220, cy: 300, rx: 95, ry: 30, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 140, cy: 262, rx: 55, ry: 22, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 300, cy: 262, rx: 55, ry: 22, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 220, cy: 330, rx: 45, ry: 18, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.12 },
          { kind: "line", x1: 220, y1: 300, x2: 220, y2: 300, stroke: "#34d399", strokeWidth: 2 },
          { kind: "circle", cx: 190, cy: 285, r: 10, fill: "none", stroke: "#a3e635", strokeWidth: 2 },
          { kind: "circle", cx: 252, cy: 288, r: 10, fill: "none", stroke: "#a3e635", strokeWidth: 2 },
          { kind: "path", d: "M 130 340 l -12 25 M 170 345 l -8 25 M 270 345 l 8 25 M 310 340 l 12 25", stroke: "#34d399", strokeWidth: 1.5, opacity: 0.7 },
          { kind: "text", x: 220, y: 420, text: "dorsiventral thallus, gemma cups on top", size: 14, color: "#94a3b8", anchor: "middle" },
          // Funaria
          { kind: "line", x1: 580, y1: 380, x2: 580, y2: 200, stroke: "#a3e635", strokeWidth: 4 },
          { kind: "ellipse", cx: 556, cy: 340, rx: 22, ry: 9, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 604, cy: 340, rx: 22, ry: 9, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 556, cy: 305, rx: 20, ry: 8, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 604, cy: 305, rx: 20, ry: 8, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 556, cy: 272, rx: 17, ry: 7, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 604, cy: 272, rx: 17, ry: 7, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 556, cy: 240, rx: 15, ry: 6, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "ellipse", cx: 604, cy: 240, rx: 15, ry: 6, fill: "#a3e635", stroke: "#a3e635", opacity: 0.35 },
          { kind: "line", x1: 580, y1: 200, x2: 580, y2: 120, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "ellipse", cx: 580, cy: 102, rx: 15, ry: 22, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 565 84 Q 580 70 595 84", fill: "none", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "text", x: 580, y: 420, text: "leafy gametophyte + sporophyte (seta + capsule)", size: 14, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          { text: "Gemma cup - asexual buds", x: 190, y: 285, lx: 110, ly: 130, anchor: "middle", accent: "lime", info: "Cup-shaped receptacles holding gemmae - multicellular buds that splash out and grow into new thalli." },
          { text: "Dichotomous thallus", x: 300, y: 262, lx: 330, ly: 130, anchor: "middle", accent: "emerald", info: "The flat, ribbon-like body forks repeatedly (dichotomous branching) and lies dorsiventrally on moist soil." },
          { text: "Phyllids - leaf-like", x: 556, y: 305, lx: 470, ly: 130, anchor: "middle", accent: "lime", info: "Small spirally arranged leaves of the moss gametophyte; the stem-like axis bears them on multicellular rhizoids." },
          { text: "Capsule - the sporophyte", x: 580, y: 102, lx: 690, ly: 130, anchor: "middle", accent: "amber", info: "The dependent diploid sporophyte: foot, long seta and spore-bearing capsule, nourished by the gametophyte." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Liverworts and mosses are the amphibians of the plant kingdom - land plants that still need water for fertilisation. Marchantia is a flat, forked thallus that creeps on damp soil and multiplies through gemma cups. Funaria is a tiny upright leafy plant whose delicate sporophyte - a seta tipped with a spore capsule - stays permanently attached to and fed by the gametophyte.",
    labels: [
      {
        id: "dgm-11-3-3d2-gametophyte",
        name: "Gametophyte",
        description:
          "The haploid, gamete-producing phase. In bryophytes it is the dominant, free-living green plant; the sporophyte depends on it.",
      },
      {
        id: "dgm-11-3-3d2-gemma",
        name: "Gemma",
        description:
          "A multicellular asexual bud produced in cup-shaped gemma cups on the Marchantia thallus. Raindrops splash gemmae out to form new plants.",
      },
      {
        id: "dgm-11-3-3d2-sporophyte",
        name: "Sporophyte",
        description:
          "The diploid, spore-producing phase arising from the zygote. In mosses it is a small stalked capsule that never becomes independent.",
      },
      {
        id: "dgm-11-3-3d2-rhizoid",
        name: "Rhizoid",
        description:
          "A root-like anchoring filament. Bryophyte rhizoids are unicellular or multicellular threads, not true roots - they absorb little.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-3-3d3",
    title: "Ferns and Horsetails",
    figureNo: "Fig 3.3",
    classLevel: 11,
    chapterNo: 3,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 220, y: 52, text: "Dryopteris - a true fern", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 580, y: 52, text: "Equisetum - the horsetail", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Dryopteris frond
          { kind: "line", x1: 220, y1: 420, x2: 220, y2: 140, stroke: "#34d399", strokeWidth: 4 },
          { kind: "ellipse", cx: 178, cy: 360, rx: 42, ry: 13, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 262, cy: 360, rx: 42, ry: 13, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 182, cy: 320, rx: 36, ry: 11, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 258, cy: 320, rx: 36, ry: 11, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 186, cy: 282, rx: 30, ry: 10, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 254, cy: 282, rx: 30, ry: 10, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 191, cy: 246, rx: 24, ry: 9, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 249, cy: 246, rx: 24, ry: 9, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 196, cy: 212, rx: 18, ry: 8, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 244, cy: 212, rx: 18, ry: 8, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "ellipse", cx: 220, cy: 168, rx: 12, ry: 22, fill: "#34d399", stroke: "#34d399", opacity: 0.35 },
          { kind: "text", x: 220, y: 458, text: "pinnate frond with sori beneath", size: 14, color: "#94a3b8", anchor: "middle" },
          // Equisetum
          { kind: "line", x1: 580, y1: 420, x2: 580, y2: 160, stroke: "#a3e635", strokeWidth: 7 },
          { kind: "line", x1: 566, y1: 370, x2: 594, y2: 370, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "line", x1: 566, y1: 320, x2: 594, y2: 320, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "line", x1: 566, y1: 270, x2: 594, y2: 270, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "line", x1: 566, y1: 220, x2: 594, y2: 220, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "path", d: "M 580 370 l -45 -30 M 580 370 l 45 -30 M 580 320 l -45 -30 M 580 320 l 45 -30 M 580 270 l -45 -30 M 580 270 l 45 -30 M 580 220 l -40 -28 M 580 220 l 40 -28", stroke: "#a3e635", strokeWidth: 2.5 },
          { kind: "ellipse", cx: 580, cy: 138, rx: 18, ry: 26, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.3 },
          { kind: "text", x: 580, y: 458, text: "jointed stem, whorled branches, strobilus", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 100, text: "Sporophyte dominant - the leafy plant you see is diploid", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Pinnae - leaflets of the frond", x: 178, y: 360, lx: 90, ly: 130, anchor: "middle", accent: "emerald", info: "The fern leaf (frond) is divided into pinnae bearing pinnules; young fronds uncoil in circinate vernation." },
          { text: "Sori - spore clusters", x: 262, y: 360, lx: 350, ly: 130, anchor: "middle", accent: "amber", info: "Clusters of sporangia on the frond's underside, often covered by a flap called the indusium." },
          { text: "Strobilus - spore cone", x: 580, y: 138, lx: 700, ly: 130, anchor: "middle", accent: "amber", info: "The compact cone of sporangiophores at the stem tip, bearing homosporous spores." },
          { text: "Nodes with whorled branches", x: 580, y: 270, lx: 700, ly: 320, anchor: "middle", accent: "lime", info: "Silica-roughened, jointed stems with branches in rings at each node - the horsetail signature." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Pteridophytes were the first plants with true roots, stems and leaves - and the sporophyte finally becomes the plant you see. Dryopteris shows the classic fern: a large pinnate frond unfurling from a rhizome, with spore clusters (sori) on its underside. Equisetum, the living horsetail, is stranger: jointed, silica-hardened stems with whorls of branches and a spore cone at the tip.",
    labels: [
      {
        id: "dgm-11-3-3d3-sorus",
        name: "Sorus",
        description:
          "A cluster of sporangia on a fern frond's lower surface. Each sporangium catapults haploid spores that grow into tiny heart-shaped prothalli.",
      },
      {
        id: "dgm-11-3-3d3-prothallus",
        name: "Prothallus",
        description:
          "The small, free-living, heart-shaped gametophyte of ferns. It bears both antheridia and archegonia and needs water for the sperms to swim.",
      },
      {
        id: "dgm-11-3-3d3-strobilus",
        name: "Strobilus",
        description:
          "A compact cone of spore-bearing structures. Equisetum bears one at each fertile stem tip; in Selaginella such cones carry two spore types.",
      },
      {
        id: "dgm-11-3-3d3-heterospory",
        name: "Heterospory",
        description:
          "Producing two kinds of spores: small microspores (male) and large megaspores (female). Selaginella shows it - the evolutionary seed habit precursor.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-3-3d4",
    title: "Living Gymnosperms",
    figureNo: "Fig 3.4",
    classLevel: 11,
    chapterNo: 3,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 170, y: 52, text: "Cycas - a cycad", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 430, y: 52, text: "Pinus - male and female cones", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 660, y: 52, text: "Ginkgo leaf", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Cycas trunk
          { kind: "path", d: "M 140 400 L 152 220 L 188 220 L 200 400 Z", fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.18 },
          { kind: "path", d: "M 170 220 q -70 -60 -110 -55 M 170 220 q -60 -75 -95 -80 M 170 220 q 70 -60 110 -55 M 170 220 q 60 -75 95 -80 M 170 220 q 0 -80 0 -90 M 170 220 q -35 -70 -55 -72 M 170 220 q 35 -70 55 -72", fill: "none", stroke: "#34d399", strokeWidth: 3 },
          { kind: "path", d: "M 130 400 q -25 18 -50 15 M 210 400 q 25 18 50 15", fill: "none", stroke: "#34d399", strokeWidth: 2.5, opacity: 0.7 },
          { kind: "text", x: 170, y: 448, text: "palm-like, coralloid roots below", size: 13, color: "#94a3b8", anchor: "middle" },
          // Pinus cones
          { kind: "ellipse", cx: 380, cy: 250, rx: 16, ry: 30, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.28 },
          { kind: "line", x1: 380, y1: 226, x2: 380, y2: 274, stroke: "#fbbf24", strokeWidth: 2, opacity: 0.6 },
          { kind: "text", x: 380, y: 310, text: "male", size: 13, color: "#fbbf24", anchor: "middle" },
          { kind: "path", d: "M 470 220 Q 500 260 470 330 Q 440 260 470 220 Z", fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 450 250 l 40 12 M 447 275 l 46 10 M 450 300 l 40 8", stroke: "#fb923c", strokeWidth: 2, opacity: 0.7 },
          { kind: "text", x: 470, y: 360, text: "female", size: 13, color: "#fb923c", anchor: "middle" },
          { kind: "text", x: 430, y: 420, text: "compact cones, wind-pollinated", size: 13, color: "#94a3b8", anchor: "middle" },
          // Ginkgo leaf
          { kind: "path", d: "M 660 330 L 610 235 A 62 62 0 0 1 710 235 Z", fill: "#a3e635", stroke: "#a3e635", strokeWidth: 2, opacity: 0.22 },
          { kind: "path", d: "M 660 330 L 640 240 M 660 330 L 660 235 M 660 330 L 680 240", stroke: "#a3e635", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "line", x1: 660, y1: 330, x2: 660, y2: 370, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "text", x: 660, y: 420, text: "fan leaf, living fossil", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          { text: "Pinnate fronds in a crown", x: 100, y: 155, lx: 170, ly: 105, anchor: "middle", accent: "emerald", info: "Cycas bears a crown of large pinnate leaves; young leaves show circinate vernation like ferns." },
          { text: "Naked ovules on cone scales", x: 470, y: 275, lx: 560, ly: 120, anchor: "middle", accent: "orange", info: "Gymnosperm means 'naked seed' - ovules sit exposed on cone scales, never enclosed in an ovary." },
          { text: "Coralloid roots - house cyanobacteria", x: 130, y: 415, lx: 300, ly: 450, anchor: "middle", accent: "sky", info: "Special swollen roots of Cycas harbour nitrogen-fixing cyanobacteria in a symbiotic zone." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Gymnosperms are seed plants without flowers or fruits - their ovules sit naked on cone scales. Cycas looks like a palm but is a cycad with coralloid roots that host nitrogen-fixing cyanobacteria. Pinus carries separate small male and large woody female cones, pollinated by wind. Ginkgo, with its unmistakable fan leaves, is a living fossil unchanged for 200 million years.",
    labels: [
      {
        id: "dgm-11-3-3d4-nakedseed",
        name: "Naked seed",
        description:
          "A seed not enclosed in a fruit because the ovule was never inside an ovary. The defining gymnosperm trait - contrast with angiosperm seeds inside fruits.",
      },
      {
        id: "dgm-11-3-3d4-coralloid",
        name: "Coralloid root",
        description:
          "A specialised, coral-like swollen root of Cycas containing nitrogen-fixing cyanobacteria (Anabaena/Nostoc) in its cortex.",
      },
      {
        id: "dgm-11-3-3d4-livingfossil",
        name: "Living fossil",
        description:
          "A surviving species nearly identical to ancient fossils. Ginkgo biloba is the classic example - one species representing an entire division.",
      },
      {
        id: "dgm-11-3-3d4-windpollination",
        name: "Wind pollination",
        description:
          "Pollen carried by air currents. Gymnosperms produce enormous quantities of light pollen; a pine male cone can release millions of grains.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },

  /* ================= Ch 4 · Animal Kingdom ================= */
  {
    id: "dgm-11-4-4d1",
    title: "Two Ways to Be Symmetrical",
    figureNo: "Fig 4.1",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 220, y: 52, text: "Radial symmetry", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 580, y: 52, text: "Bilateral symmetry", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // radial disc
          { kind: "circle", cx: 220, cy: 240, r: 85, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.14 },
          { kind: "line", x1: 220, y1: 240, x2: 220, y2: 155, stroke: "#22d3ee", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 220, y1: 240, x2: 301, y2: 214, stroke: "#22d3ee", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 220, y1: 240, x2: 270, y2: 309, stroke: "#22d3ee", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 220, y1: 240, x2: 170, y2: 309, stroke: "#22d3ee", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 220, y1: 240, x2: 139, y2: 214, stroke: "#22d3ee", strokeWidth: 1.5, dashed: true },
          { kind: "circle", cx: 220, cy: 240, r: 8, fill: "#22d3ee", opacity: 0.7 },
          { kind: "text", x: 220, y: 370, text: "many planes through the centre", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 220, y: 394, text: "e.g. Hydra, sea anemone", size: 13, color: "#64748b", anchor: "middle" },
          // bilateral
          { kind: "ellipse", cx: 580, cy: 240, rx: 105, ry: 70, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.14 },
          { kind: "line", x1: 580, y1: 150, x2: 580, y2: 330, stroke: "#a78bfa", strokeWidth: 1.5, dashed: true },
          { kind: "circle", cx: 620, cy: 215, r: 6, fill: "#a78bfa", opacity: 0.7 },
          { kind: "circle", cx: 540, cy: 215, r: 6, fill: "#a78bfa", opacity: 0.7 },
          { kind: "text", x: 580, y: 370, text: "one plane - mirror-image halves", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 580, y: 394, text: "e.g. earthworm, frog, human", size: 13, color: "#64748b", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Sponges are asymmetrical - no plane of symmetry at all.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Any diameter is a plane of symmetry", x: 301, y: 214, lx: 220, ly: 110, anchor: "middle", accent: "cyan", info: "In radial animals body parts repeat around a central oral-aboral axis - suited to a sessile or drifting life." },
          { text: "Single sagittal plane", x: 580, y: 240, lx: 580, ly: 110, anchor: "middle", accent: "violet", info: "One plane divides the animal into left and right mirror halves - the hallmark of actively moving animals with a head end." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Symmetry is the first great divide in animal body plans. Radially symmetrical animals like Hydra can be cut through the centre in any plane to get mirror halves - ideal for a sessile life where danger and food come from all sides. Bilaterally symmetrical animals have exactly one such plane, and with it comes a distinct head end, a front-back axis, and directional movement.",
    labels: [
      {
        id: "dgm-11-4-4d1-radial",
        name: "Radial symmetry",
        description:
          "Body parts arranged around a central axis so any plane through the centre gives mirror halves. Seen in cnidarians and adult echinoderms.",
      },
      {
        id: "dgm-11-4-4d1-bilateral",
        name: "Bilateral symmetry",
        description:
          "One sagittal plane divides the body into left and right mirror images. It concentrates sense organs at the head - cephalisation.",
      },
      {
        id: "dgm-11-4-4d1-asymmetry",
        name: "Asymmetry",
        description:
          "No plane of symmetry at all. Sponges are the classic example - their irregular bodies fit wherever they grow.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d2",
    title: "Two or Three Germ Layers",
    figureNo: "Fig 4.2",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 220, y: 52, text: "Diploblastic - two layers", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 580, y: 52, text: "Triploblastic - three layers", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // diploblastic rings
          { kind: "circle", cx: 220, cy: 240, r: 88, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.16 },
          { kind: "circle", cx: 220, cy: 240, r: 66, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 3, opacity: 1 },
          { kind: "circle", cx: 220, cy: 240, r: 52, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.16 },
          { kind: "text", x: 220, y: 244, text: "gut", size: 14, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 220, y: 380, text: "ectoderm + endoderm, mesoglea between", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 220, y: 404, text: "e.g. Hydra, jellyfish", size: 13, color: "#64748b", anchor: "middle" },
          // triploblastic rings
          { kind: "circle", cx: 580, cy: 240, r: 88, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.16 },
          { kind: "circle", cx: 580, cy: 240, r: 70, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "circle", cx: 580, cy: 240, r: 50, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.16 },
          { kind: "text", x: 580, y: 244, text: "gut", size: 14, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 580, y: 380, text: "ectoderm + mesoderm + endoderm", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 580, y: 404, text: "e.g. flatworms to mammals", size: 13, color: "#64748b", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Germ layers are the embryonic sheets every organ is built from.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Ectoderm - outer covering", x: 220, y: 155, lx: 130, ly: 110, anchor: "middle", accent: "cyan", info: "Forms skin and nervous system. Present in every animal above the sponges." },
          { text: "Mesoglea - jelly, not cells", x: 220, y: 300, lx: 330, ly: 130, anchor: "middle", accent: "amber", info: "An acellular jelly layer in diploblasts. It is not a germ layer - no organs arise from it." },
          { text: "Mesoderm - muscles, blood, bone", x: 580, y: 168, lx: 580, ly: 110, anchor: "middle", accent: "emerald", info: "The third layer, sandwiched between ectoderm and endoderm; it builds muscles, circulatory and skeletal systems." },
          { text: "Endoderm - gut lining", x: 580, y: 290, lx: 690, ly: 130, anchor: "middle", accent: "rose", info: "Lines the gut and forms liver, pancreas and lungs in vertebrates." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Animals are built from embryonic germ layers, and the count matters. Diploblastic animals like Hydra develop only an outer ectoderm and inner endoderm, separated by non-cellular jelly. Triploblastic animals add a middle mesoderm between them - the layer that will become muscle, blood and bone, enabling the complex bodies of everything from flatworms to humans.",
    labels: [
      {
        id: "dgm-11-4-4d2-diploblastic",
        name: "Diploblastic",
        description:
          "Having two germ layers: ectoderm and endoderm. Cnidarians and ctenophores are diploblastic, with mesoglea jelly in between.",
      },
      {
        id: "dgm-11-4-4d2-triploblastic",
        name: "Triploblastic",
        description:
          "Having three germ layers: ectoderm, mesoderm and endoderm. All bilaterally symmetrical animals from flatworms upward are triploblastic.",
      },
      {
        id: "dgm-11-4-4d2-mesoglea",
        name: "Mesoglea",
        description:
          "The jelly-like, non-cellular layer between ectoderm and endoderm in cnidarians. It gives the jellyfish its bell but forms no organs.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d3",
    title: "Body Cavities Compared",
    figureNo: "Fig 4.3",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 150, y: 52, text: "Acoelomate", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Pseudocoelomate", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Coelomate", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // acoelomate - solid
          { kind: "circle", cx: 150, cy: 230, r: 80, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 3, opacity: 0.25 },
          { kind: "circle", cx: 150, cy: 230, r: 22, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.5 },
          { kind: "text", x: 150, y: 234, text: "gut", size: 12, color: "#fff", anchor: "middle" },
          { kind: "text", x: 150, y: 348, text: "no cavity", size: 14, color: "#a78bfa", anchor: "middle" },
          { kind: "text", x: 150, y: 372, text: "solid parenchyma", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 150, y: 394, text: "e.g. flatworms", size: 13, color: "#64748b", anchor: "middle" },
          // pseudocoelomate - cavity not lined
          { kind: "circle", cx: 400, cy: 230, r: 80, fill: "none", stroke: "#a78bfa", strokeWidth: 3 },
          { kind: "circle", cx: 400, cy: 230, r: 58, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 1.5, dashed: true, opacity: 0.25 },
          { kind: "circle", cx: 400, cy: 230, r: 40, fill: "#0f172a", stroke: "#38bdf8", strokeWidth: 1.5, dashed: true, opacity: 1 },
          { kind: "circle", cx: 400, cy: 230, r: 22, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.5 },
          { kind: "text", x: 400, y: 234, text: "gut", size: 12, color: "#fff", anchor: "middle" },
          { kind: "text", x: 400, y: 348, text: "cavity present, unlined", size: 14, color: "#38bdf8", anchor: "middle" },
          { kind: "text", x: 400, y: 372, text: "not enclosed by mesoderm", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 394, text: "e.g. roundworms", size: 13, color: "#64748b", anchor: "middle" },
          // coelomate - lined cavity
          { kind: "circle", cx: 650, cy: 230, r: 80, fill: "none", stroke: "#a78bfa", strokeWidth: 3 },
          { kind: "circle", cx: 650, cy: 230, r: 58, fill: "#34d399", stroke: "#34d399", strokeWidth: 2.5, opacity: 0.18 },
          { kind: "circle", cx: 650, cy: 230, r: 40, fill: "#0f172a", stroke: "#34d399", strokeWidth: 2.5, opacity: 1 },
          { kind: "circle", cx: 650, cy: 230, r: 22, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.5 },
          { kind: "text", x: 650, y: 234, text: "gut", size: 12, color: "#fff", anchor: "middle" },
          { kind: "text", x: 650, y: 348, text: "true coelom", size: 14, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 650, y: 372, text: "lined on both sides by mesoderm", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 650, y: 394, text: "e.g. earthworm to human", size: 13, color: "#64748b", anchor: "middle" },
          { kind: "text", x: 400, y: 448, text: "A fluid-filled coelom cushions organs and works as a hydrostatic skeleton.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Parenchyma fills everything", x: 150, y: 290, lx: 150, ly: 110, anchor: "middle", accent: "violet", info: "In acoelomates mesoderm forms a solid packing tissue; organs are embedded with no room to move." },
          { text: "Pseudo = false coelom", x: 400, y: 172, lx: 400, ly: 110, anchor: "middle", accent: "sky", info: "The cavity is bounded by mesoderm on one side only - it is a persistent blastocoel, not a true coelom." },
          { text: "Mesoderm lines both walls", x: 650, y: 172, lx: 650, ly: 110, anchor: "middle", accent: "emerald", info: "A true coelom is fully enclosed in mesoderm, letting the gut move independently of the body wall." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The coelom - the body cavity between gut and body wall - is the third great classification character. Acoelomates like flatworms have none: solid tissue packs the space. Pseudocoelomates like roundworms have a fluid cavity that is not fully lined by mesoderm. Coelomates, from earthworms to humans, have a true cavity lined on all sides by mesoderm, giving organs room to grow and move.",
    labels: [
      {
        id: "dgm-11-4-4d3-coelom",
        name: "Coelom",
        description:
          "The fluid-filled body cavity between the gut and body wall, lined by mesoderm. It cushions organs and acts as a hydrostatic skeleton.",
      },
      {
        id: "dgm-11-4-4d3-pseudocoel",
        name: "Pseudocoelom",
        description:
          "A 'false' body cavity not fully lined by mesoderm, derived from the embryonic blastocoel. Characteristic of roundworms (Aschelminthes).",
      },
      {
        id: "dgm-11-4-4d3-acoelomate",
        name: "Acoelomate",
        description:
          "Lacking any body cavity. Flatworms pack the space between gut and wall with solid mesodermal parenchyma instead.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d4",
    title: "The Animal Kingdom at a Glance",
    figureNo: "Fig 4.4",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "rect", x: 300, y: 28, w: 200, h: 40, rx: 8, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.2 },
          { kind: "text", x: 400, y: 54, text: "Kingdom Animalia", size: 18, color: "#a78bfa", weight: 700, anchor: "middle" },
          { kind: "line", x1: 400, y1: 68, x2: 400, y2: 92, stroke: "#64748b", strokeWidth: 2 },
          { kind: "line", x1: 195, y1: 92, x2: 605, y2: 92, stroke: "#64748b", strokeWidth: 2 },
          { kind: "line", x1: 195, y1: 92, x2: 195, y2: 116, stroke: "#64748b", strokeWidth: 2 },
          { kind: "line", x1: 605, y1: 92, x2: 605, y2: 116, stroke: "#64748b", strokeWidth: 2 },
          { kind: "rect", x: 115, y: 116, w: 160, h: 36, rx: 8, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.2 },
          { kind: "text", x: 195, y: 139, text: "Non-chordata", size: 16, color: "#22d3ee", weight: 700, anchor: "middle" },
          { kind: "rect", x: 525, y: 116, w: 160, h: 36, rx: 8, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "text", x: 605, y: 139, text: "Chordata", size: 16, color: "#34d399", weight: 700, anchor: "middle" },
          { kind: "rect", x: 55, y: 168, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 120, y: 190, text: "Porifera", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 205, y: 168, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 270, y: 190, text: "Cnidaria", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 55, y: 212, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 120, y: 234, text: "Ctenophora", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 205, y: 212, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 270, y: 234, text: "Platyhelminthes", size: 13, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 55, y: 256, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 120, y: 278, text: "Aschelminthes", size: 13, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 205, y: 256, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 270, y: 278, text: "Annelida", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 55, y: 300, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 120, y: 322, text: "Arthropoda", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 205, y: 300, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 270, y: 322, text: "Mollusca", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 55, y: 344, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 120, y: 366, text: "Echinodermata", size: 13, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 205, y: 344, w: 130, h: 34, rx: 6, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.1 },
          { kind: "text", x: 270, y: 366, text: "Hemichordata", size: 13, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 505, y: 168, w: 200, h: 38, rx: 6, fill: "#34d399", stroke: "#34d399", opacity: 0.1 },
          { kind: "text", x: 605, y: 192, text: "Urochordata", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 505, y: 216, w: 200, h: 38, rx: 6, fill: "#34d399", stroke: "#34d399", opacity: 0.1 },
          { kind: "text", x: 605, y: 240, text: "Cephalochordata", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "rect", x: 505, y: 264, w: 200, h: 38, rx: 6, fill: "#34d399", stroke: "#34d399", opacity: 0.1 },
          { kind: "text", x: 605, y: 288, text: "Vertebrata", size: 14, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 400, y: 430, text: "10 non-chordate phyla + 3 chordate subphyla = the whole animal kingdom", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 456, text: "Ordered by increasing complexity of body plan", size: 14, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "no notochord at any stage", x: 195, y: 116, lx: 195, ly: 105, anchor: "middle", accent: "cyan", info: "Non-chordates never develop a notochord; they range from sponges to acorn worms." },
          { text: "notochord present at some stage", x: 605, y: 116, lx: 605, ly: 105, anchor: "middle", accent: "emerald", info: "Chordates possess a notochord, dorsal nerve cord, gill slits and post-anal tail during development." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The entire animal kingdom fits into eleven phyla, split by one question: does the animal ever develop a notochord? Ten phyla - from sponges through arthropods to hemichordates - never do. The eleventh, Chordata, does, and subdivides into the tunicates, lancelets and vertebrates. Reading the chart top to bottom is a walk through increasing body-plan complexity.",
    labels: [
      {
        id: "dgm-11-4-4d4-nonchordata",
        name: "Non-chordata",
        description:
          "Animals that never develop a notochord. Ten phyla from Porifera to Hemichordata, covering every invertebrate body plan.",
      },
      {
        id: "dgm-11-4-4d4-chordata",
        name: "Chordata",
        description:
          "Animals with a notochord, dorsal hollow nerve cord, pharyngeal slits and post-anal tail at some life stage. Includes all vertebrates.",
      },
      {
        id: "dgm-11-4-4d4-phylum",
        name: "Phylum",
        description:
          "The primary division of the animal kingdom, based on fundamental body plan - symmetry, germ layers, coelom and segmentation.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d5",
    title: "Sponge Body Plans",
    figureNo: "Fig 4.5",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 160, y: 52, text: "Sycon", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Spongilla - freshwater", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 640, y: 52, text: "Euspongia - bath sponge", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Sycon vase
          { kind: "path", d: "M 125 170 L 195 170 L 182 350 L 138 350 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 160, cy: 170, rx: 35, ry: 10, fill: "#0f172a", stroke: "#38bdf8", strokeWidth: 2 },
          { kind: "circle", cx: 145, cy: 230, r: 3, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 168, cy: 260, r: 3, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 152, cy: 300, r: 3, fill: "#38bdf8", opacity: 0.7 },
          { kind: "arrow", x1: 160, y1: 130, x2: 160, y2: 100, stroke: "#38bdf8", strokeWidth: 2.5 },
          { kind: "text", x: 160, y: 400, text: "vase with single osculum", size: 13, color: "#94a3b8", anchor: "middle" },
          // Spongilla encrusting
          { kind: "path", d: "M 310 330 Q 330 260 380 275 Q 430 250 460 300 Q 480 340 420 350 Q 350 360 310 330 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 365, cy: 295, rx: 12, ry: 7, fill: "#0f172a", stroke: "#34d399", strokeWidth: 2 },
          { kind: "ellipse", cx: 420, cy: 315, rx: 9, ry: 6, fill: "#0f172a", stroke: "#34d399", strokeWidth: 2 },
          { kind: "text", x: 400, y: 400, text: "encrusting, on submerged twigs", size: 13, color: "#94a3b8", anchor: "middle" },
          // Euspongia
          { kind: "path", d: "M 590 200 Q 640 200 690 200 L 675 350 Q 640 365 605 350 Z", fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.16 },
          { kind: "ellipse", cx: 615, cy: 200, rx: 18, ry: 7, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "ellipse", cx: 660, cy: 200, rx: 18, ry: 7, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "text", x: 640, y: 400, text: "fibrous skeleton, no spicules", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Water enters through ostia, exits through the osculum - the canal system.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Osculum - water exits", x: 160, y: 170, lx: 160, ly: 105, anchor: "middle", accent: "sky", info: "The large opening through which filtered water leaves the sponge body." },
          { text: "Ostia - tiny intake pores", x: 145, y: 230, lx: 300, ly: 130, anchor: "middle", accent: "sky", info: "Minute pores in the body wall through which water, food and oxygen enter." },
          { text: "Choanocytes line the canals", x: 420, y: 315, lx: 560, ly: 130, anchor: "middle", accent: "emerald", info: "Collar cells with beating flagella create the current and trap food particles." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Sponges are the simplest animals: asymmetrical, sessile filter-feeders with no true tissues. Sycon is the textbook vase sponge with a single large osculum. Spongilla is the freshwater exception, encrusting submerged twigs. Euspongia, the bath sponge, has a soft fibrous skeleton of spongin with no glassy spicules - which is why it was harvested for bathing.",
    labels: [
      {
        id: "dgm-11-4-4d5-osculum",
        name: "Osculum",
        description:
          "The large excurrent opening of a sponge. Filtered water, wastes and gametes all leave the body through it.",
      },
      {
        id: "dgm-11-4-4d5-canal",
        name: "Canal system",
        description:
          "The network of pores and chambers through which water flows. Choanocyte flagella drive the current that feeds, breathes and cleans the sponge.",
      },
      {
        id: "dgm-11-4-4d5-spongin",
        name: "Spongin",
        description:
          "A flexible protein fibre forming the skeleton of bath sponges. Other sponges are stiffened by siliceous or calcareous spicules instead.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d6",
    title: "Polyp and Medusa: One Animal, Two Forms",
    figureNo: "Fig 4.6",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 250, y: 52, text: "Polyp - e.g. Hydra", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 560, y: 52, text: "Medusa - e.g. Aurelia", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // polyp
          { kind: "path", d: "M 228 200 L 272 200 L 266 350 L 234 350 Z", fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.16 },
          { kind: "path", d: "M 250 200 q -30 -40 -55 -45 M 250 200 q -15 -45 -35 -60 M 250 200 q 0 -50 0 -65 M 250 200 q 15 -45 35 -60 M 250 200 q 30 -40 55 -45", fill: "none", stroke: "#22d3ee", strokeWidth: 2.5 },
          { kind: "circle", cx: 250, cy: 196, r: 6, fill: "#22d3ee", opacity: 0.8 },
          { kind: "ellipse", cx: 250, cy: 356, rx: 32, ry: 9, fill: "#22d3ee", stroke: "#22d3ee", opacity: 0.3 },
          { kind: "text", x: 250, y: 400, text: "sessile, mouth faces up", size: 14, color: "#94a3b8", anchor: "middle" },
          // medusa
          { kind: "path", d: "M 490 260 Q 560 165 630 260 Z", fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.18 },
          { kind: "path", d: "M 500 260 q -8 40 -20 55 M 525 260 q -4 42 -12 58 M 550 260 q 0 42 0 60 M 575 260 q 4 42 12 58 M 600 260 q 8 40 20 55", fill: "none", stroke: "#a78bfa", strokeWidth: 2 },
          { kind: "rect", x: 552, y: 260, w: 16, h: 45, rx: 6, fill: "#a78bfa", stroke: "#a78bfa", opacity: 0.35 },
          { kind: "text", x: 560, y: 400, text: "free-swimming, mouth faces down", size: 14, color: "#94a3b8", anchor: "middle" },
          // reversible arrow
          { kind: "arrow", x1: 350, y1: 250, x2: 450, y2: 250, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "arrow", x1: 450, y1: 272, x2: 350, y2: 272, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 240, text: "alternation", size: 13, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Cnidarians switch between a fixed polyp and a drifting medusa - metagenesis.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Tentacles ring the mouth", x: 195, y: 155, lx: 120, ly: 110, anchor: "middle", accent: "cyan", info: "The polyp's tentacles bear cnidoblasts to sting prey and push it into the mouth." },
          { text: "Bell pulses to swim", x: 560, y: 200, lx: 620, ly: 110, anchor: "middle", accent: "violet", info: "The medusa contracts its bell to jet through water - the jellyfish swimming stroke." },
          { text: "Basal disc anchors the polyp", x: 250, y: 356, lx: 250, ly: 445, anchor: "middle", accent: "cyan", info: "Polyps attach to rocks or plants by a sticky basal disc and can slowly glide or somersault." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Cnidarians come in two body forms that are really one life cycle. The polyp is a sessile tube with tentacles around an upward-facing mouth - think Hydra stuck to a pond weed. The medusa is the familiar free-swimming jellyfish, bell pulsing, mouth hanging underneath. Many cnidarians alternate between the two forms, a phenomenon called metagenesis.",
    labels: [
      {
        id: "dgm-11-4-4d6-polyp",
        name: "Polyp",
        description:
          "The sessile, tubular cnidarian form with mouth and tentacles facing upward. Hydra exists only as a polyp; corals are polyp colonies.",
      },
      {
        id: "dgm-11-4-4d6-medusa",
        name: "Medusa",
        description:
          "The free-swimming, umbrella-shaped cnidarian form with mouth facing downward. Jellyfish like Aurelia are dominant medusae.",
      },
      {
        id: "dgm-11-4-4d6-metagenesis",
        name: "Metagenesis",
        description:
          "Alternation between polyp and medusa generations in a life cycle. Obelia shows it clearly: polyp colonies bud off medusae.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d7",
    title: "The Cnidoblast Stinging Cell",
    figureNo: "Fig 4.7",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 240, y: 52, text: "Undischarged", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 560, y: 52, text: "Discharged", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // undischarged cell
          { kind: "ellipse", cx: 240, cy: 260, rx: 55, ry: 85, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.14 },
          { kind: "ellipse", cx: 240, cy: 265, rx: 26, ry: 42, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.3 },
          { kind: "path", d: "M 240 265 q 12 -18 0 -30 q -12 12 0 30 q 12 -6 0 -20", fill: "none", stroke: "#fb7185", strokeWidth: 2 },
          { kind: "circle", cx: 240, cy: 320, r: 8, fill: "#fb7185", opacity: 0.6 },
          { kind: "line", x1: 240, y1: 175, x2: 240, y2: 150, stroke: "#fbbf24", strokeWidth: 3 },
          { kind: "text", x: 240, y: 400, text: "thread coiled inside capsule", size: 14, color: "#94a3b8", anchor: "middle" },
          // discharged cell
          { kind: "ellipse", cx: 560, cy: 300, rx: 55, ry: 70, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.14 },
          { kind: "ellipse", cx: 560, cy: 285, rx: 24, ry: 34, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.3 },
          { kind: "line", x1: 560, y1: 250, x2: 560, y2: 110, stroke: "#fb7185", strokeWidth: 3.5 },
          { kind: "path", d: "M 560 220 l -12 -10 M 560 200 l 12 -10 M 560 180 l -12 -10 M 560 160 l 12 -10", stroke: "#fb7185", strokeWidth: 2 },
          { kind: "circle", cx: 560, cy: 345, r: 8, fill: "#fb7185", opacity: 0.6 },
          { kind: "text", x: 560, y: 400, text: "thread everts - fires in ~3 ms", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "arrow", x1: 330, y1: 260, x2: 460, y2: 260, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "text", x: 395, y: 240, text: "trigger", size: 13, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Cnidoblasts give Cnidaria its name - no other animal has them.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Nematocyst - the capsule", x: 240, y: 265, lx: 130, ly: 130, anchor: "middle", accent: "rose", info: "A fluid-filled capsule containing a coiled, often barbed thread. Osmotic pressure builds until release." },
          { text: "Cnidocil - the trigger hair", x: 240, y: 160, lx: 330, ly: 105, anchor: "middle", accent: "amber", info: "A modified cilium that fires the nematocyst when touched - one of the fastest cellular events known." },
          { text: "Barbed thread injects toxin", x: 560, y: 180, lx: 680, ly: 130, anchor: "middle", accent: "rose", info: "The thread everts inside-out, harpooning prey and pumping in paralysing toxins." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The cnidoblast is the defining cell of the cnidarians - a microscopic harpoon gun. At rest it holds a coiled, barbed thread inside a pressurised capsule called the nematocyst. Brush the trigger hair (cnidocil) and the thread everts explosively in about three milliseconds, among the fastest events in biology, injecting toxin into prey or predator.",
    labels: [
      {
        id: "dgm-11-4-4d7-cnidoblast",
        name: "Cnidoblast",
        description:
          "The stinging cell of cnidarians, concentrated on tentacles. Each contains one nematocyst and fires only once.",
      },
      {
        id: "dgm-11-4-4d7-nematocyst",
        name: "Nematocyst",
        description:
          "The capsule inside a cnidoblast holding the coiled thread. Discharge is driven by sudden osmotic pressure - no muscles involved.",
      },
      {
        id: "dgm-11-4-4d7-cnidocil",
        name: "Cnidocil",
        description:
          "The stiff trigger hair on a cnidoblast. Mechanical or chemical contact with it fires the nematocyst within milliseconds.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d8",
    title: "Pleurobrachia: The Comb Jelly",
    figureNo: "Fig 4.8",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Pleurobrachia - a ctenophore", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "ellipse", cx: 400, cy: 250, rx: 95, ry: 125, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.14 },
          { kind: "path", d: "M 345 140 Q 335 250 345 360", fill: "none", stroke: "#38bdf8", strokeWidth: 3, dashed: true, opacity: 0.8 },
          { kind: "path", d: "M 375 132 Q 368 250 375 368", fill: "none", stroke: "#38bdf8", strokeWidth: 3, dashed: true, opacity: 0.8 },
          { kind: "path", d: "M 425 132 Q 432 250 425 368", fill: "none", stroke: "#38bdf8", strokeWidth: 3, dashed: true, opacity: 0.8 },
          { kind: "path", d: "M 455 140 Q 465 250 455 360", fill: "none", stroke: "#38bdf8", strokeWidth: 3, dashed: true, opacity: 0.8 },
          { kind: "circle", cx: 400, cy: 130, r: 9, fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.8 },
          { kind: "path", d: "M 305 250 q -60 20 -80 90 q -10 40 15 55", fill: "none", stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "path", d: "M 495 250 q 60 20 80 90 q 10 40 -15 55", fill: "none", stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "path", d: "M 250 330 l -18 8 M 252 355 l -18 8", stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.7 },
          { kind: "path", d: "M 550 330 l 18 8 M 548 355 l 18 8", stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.7 },
          { kind: "circle", cx: 400, cy: 372, r: 7, fill: "#38bdf8", opacity: 0.7 },
          { kind: "text", x: 400, y: 445, text: "Transparent marine plankton - often called sea gooseberries", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "8 comb rows - fused cilia plates", x: 345, y: 250, lx: 160, ly: 130, anchor: "middle", accent: "sky", info: "Rows of ctenes (fused cilia) beat in waves to swim and scatter light into rainbow flashes." },
          { text: "Tentacles with colloblasts", x: 250, y: 340, lx: 160, ly: 400, anchor: "middle", accent: "violet", info: "Long sticky tentacles snare prey with colloblast glue cells - ctenophores have no stinging cells." },
          { text: "Apical sense organ", x: 400, y: 130, lx: 560, ly: 110, anchor: "middle", accent: "amber", info: "A gravity-sensing statocyst at the aboral pole coordinates the comb rows." },
          { text: "Biradial symmetry", x: 400, y: 372, lx: 600, ly: 400, anchor: "middle", accent: "sky", info: "Part radial, part bilateral - ctenophores sit symmetrically between the two plans." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Comb jellies look like jellyfish but belong to their own phylum, Ctenophora. Instead of stinging cells they swim with eight rows of fused cilia - comb plates - that beat in metachronal waves and diffract light into moving rainbows. Long tentacles armed with sticky colloblasts snare plankton, and the whole animal is transparent, biradially symmetrical marine plankton.",
    labels: [
      {
        id: "dgm-11-4-4d8-ctene",
        name: "Ctene (comb plate)",
        description:
          "A paddle of thousands of fused cilia. Eight rows of ctenes are the ctenophore's oars - and the source of their rainbow shimmer.",
      },
      {
        id: "dgm-11-4-4d8-colloblast",
        name: "Colloblast",
        description:
          "A sticky glue cell on ctenophore tentacles that captures prey on contact. Ctenophores use glue, not venom - they lack cnidoblasts.",
      },
      {
        id: "dgm-11-4-4d8-biradial",
        name: "Biradial symmetry",
        description:
          "Symmetry combining radial and bilateral elements: two planes of symmetry instead of many or one. Unique to ctenophores.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d9",
    title: "Tapeworm and Liver Fluke",
    figureNo: "Fig 4.9",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 250, y: 52, text: "Taenia - the tapeworm", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 570, y: 52, text: "Fasciola - the liver fluke", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // tapeworm
          { kind: "circle", cx: 250, cy: 115, r: 20, fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 238 105 l -8 -12 M 250 102 l 0 -14 M 262 105 l 8 -12", stroke: "#fb7185", strokeWidth: 2 },
          { kind: "circle", cx: 240, cy: 118, r: 5, fill: "#fb7185", opacity: 0.7 },
          { kind: "circle", cx: 260, cy: 118, r: 5, fill: "#fb7185", opacity: 0.7 },
          { kind: "rect", x: 240, y: 135, w: 20, h: 18, fill: "#fb7185", opacity: 0.25 },
          { kind: "rect", x: 232, y: 153, w: 36, h: 22, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 226, y: 175, w: 48, h: 24, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 220, y: 199, w: 60, h: 26, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 214, y: 225, w: 72, h: 28, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 208, y: 253, w: 84, h: 30, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 202, y: 283, w: 96, h: 32, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "rect", x: 196, y: 315, w: 108, h: 34, rx: 4, fill: "#fb7185", stroke: "#fb7185", opacity: 0.16 },
          { kind: "text", x: 250, y: 395, text: "strobila - chain of proglottids", size: 14, color: "#94a3b8", anchor: "middle" },
          // liver fluke
          { kind: "path", d: "M 570 150 Q 630 230 570 350 Q 510 230 570 150 Z", fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.18 },
          { kind: "circle", cx: 570, cy: 175, r: 10, fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.5 },
          { kind: "circle", cx: 570, cy: 215, r: 12, fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.4 },
          { kind: "path", d: "M 570 185 L 570 340", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.5 },
          { kind: "text", x: 570, y: 395, text: "leaf-like, lives in sheep liver", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Flatworms are acoelomate, triploblastic and mostly parasitic.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Scolex - hooks and suckers", x: 250, y: 115, lx: 250, ly: 105, anchor: "middle", accent: "rose", info: "The head anchors to the intestinal wall; it has no mouth - food is absorbed through the skin." },
          { text: "Proglottids - egg factories", x: 250, y: 315, lx: 420, ly: 160, anchor: "middle", accent: "rose", info: "Each segment is hermaphrodite and fills with eggs; ripe ones break off and pass out with faeces." },
          { text: "Oral and ventral suckers", x: 570, y: 195, lx: 700, ly: 130, anchor: "middle", accent: "amber", info: "Two suckers grip the bile ducts; Fasciola migrates through the liver of sheep and occasionally humans." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Platyhelminthes - the flatworms - are the simplest triploblastic animals, and many are parasites. The tapeworm Taenia lives in the human intestine: a hooked scolex grips the gut wall while a ribbon of proglottids, each a self-contained egg factory, grows behind it. The liver fluke Fasciola is leaf-shaped, clings to bile ducts with suckers, and cycles between sheep and snails.",
    labels: [
      {
        id: "dgm-11-4-4d9-scolex",
        name: "Scolex",
        description:
          "The tapeworm's attachment head, armed with hooks and suckers. Behind it a growth zone buds off new proglottids for life.",
      },
      {
        id: "dgm-11-4-4d9-proglottid",
        name: "Proglottid",
        description:
          "One segment of a tapeworm's strobila. Each contains a complete hermaphrodite reproductive system and ends as a sac of eggs.",
      },
      {
        id: "dgm-11-4-4d9-hermaphrodite",
        name: "Hermaphrodite",
        description:
          "Bearing both male and female reproductive organs in one individual. Most parasitic flatworms are hermaphrodite - one worm is enough.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d10",
    title: "Ascaris: The Roundworm",
    figureNo: "Fig 4.10",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 260, y: 52, text: "Female - straight, larger", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 560, y: 52, text: "Male - curved posterior", size: 20, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 260 110 L 260 390", stroke: "#fb923c", strokeWidth: 20, opacity: 0.55 },
          { kind: "circle", cx: 260, cy: 250, r: 6, fill: "#fb923c", opacity: 0.9 },
          { kind: "text", x: 260, y: 430, text: "up to 35 cm long", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "path", d: "M 560 110 L 560 330 q 0 45 -38 58", stroke: "#fbbf24", strokeWidth: 14, fill: "none", opacity: 0.55 },
          { kind: "text", x: 560, y: 430, text: "smaller, with copulatory spicules", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 100, text: "Pseudocoelomate - fluid cavity between gut and wall", size: 15, color: "#64748b", anchor: "middle" },
          { kind: "text", x: 400, y: 475, text: "Ascaris lumbricoides parasitises the human small intestine.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Tough cuticle - resists digestion", x: 260, y: 180, lx: 130, ly: 180, anchor: "middle", accent: "orange", info: "A collagenous cuticle, shed four times as the worm grows, protects against host enzymes." },
          { text: "Complete gut - mouth to anus", x: 260, y: 320, lx: 130, ly: 320, anchor: "middle", accent: "orange", info: "Unlike flatworms, roundworms have a through-gut: food enters the mouth and waste leaves the anus." },
          { text: "Curved tail of the male", x: 532, y: 380, lx: 680, ly: 300, anchor: "middle", accent: "amber", info: "The male's posterior curls ventrally and carries copulatory spicules for mating." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Ascaris is the giant intestinal roundworm - females reach 35 cm - and the textbook pseudocoelomate. Its cylindrical body is a tube within a tube: an outer body wall, a fluid-filled pseudocoelom, and a complete gut running mouth to anus inside. The sexes look different: females are straight and large, males smaller with a characteristically curved tail.",
    labels: [
      {
        id: "dgm-11-4-4d10-pseudocoelom",
        name: "Pseudocoelom",
        description:
          "The fluid-filled cavity of roundworms, not lined by mesoderm. It bathes the organs and acts as a hydrostatic skeleton for movement.",
      },
      {
        id: "dgm-11-4-4d10-cuticle",
        name: "Cuticle",
        description:
          "A tough, non-cellular outer covering secreted by the epidermis. In parasites it resists the host's digestive enzymes.",
      },
      {
        id: "dgm-11-4-4d10-dimorphism",
        name: "Sexual dimorphism",
        description:
          "Visible differences between sexes of one species. In Ascaris the female is larger and straight; the male is smaller with a curved tail.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d11",
    title: "Segmented Worms",
    figureNo: "Fig 4.11",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 140, y: 52, text: "Nereis - the sandworm", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Pheretima - earthworm", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Hirudinaria - leech", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Nereis
          { kind: "rect", x: 55, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "rect", x: 83, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "rect", x: 111, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "rect", x: 139, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "rect", x: 167, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "rect", x: 195, y: 235, w: 26, h: 34, rx: 5, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "path", d: "M 83 252 l -18 -14 M 111 252 l -18 -14 M 139 252 l -18 -14 M 167 252 l -18 -14 M 83 252 l -18 14 M 111 252 l -18 14 M 139 252 l -18 14 M 167 252 l -18 14", stroke: "#34d399", strokeWidth: 2 },
          { kind: "circle", cx: 40, cy: 252, r: 12, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "text", x: 140, y: 320, text: "parapodia - paddle feet", size: 13, color: "#94a3b8", anchor: "middle" },
          // Earthworm
          { kind: "rect", x: 300, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 322, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 344, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 366, y: 232, w: 44, h: 42, rx: 8, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.3 },
          { kind: "rect", x: 410, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 432, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 454, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "rect", x: 476, y: 238, w: 22, h: 30, rx: 4, fill: "#fb923c", stroke: "#fb923c", opacity: 0.2 },
          { kind: "text", x: 400, y: 320, text: "clitellum - glandular band", size: 13, color: "#94a3b8", anchor: "middle" },
          // Leech
          { kind: "path", d: "M 580 252 Q 650 235 720 252 Q 650 270 580 252 Z", fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.2 },
          { kind: "circle", cx: 578, cy: 252, r: 12, fill: "#fb7185", stroke: "#fb7185", opacity: 0.4 },
          { kind: "circle", cx: 722, cy: 252, r: 16, fill: "#fb7185", stroke: "#fb7185", opacity: 0.4 },
          { kind: "path", d: "M 610 244 l 0 16 M 640 244 l 0 16 M 670 244 l 0 16 M 700 244 l 0 16", stroke: "#fb7185", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "text", x: 650, y: 320, text: "suckers at both ends", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 400, text: "Annelida: metamerically segmented, true coelom, closed circulation.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Segmentation lets each metamere repeat organs - damage to one is survivable.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Parapodia - lateral paddles", x: 93, y: 238, lx: 140, ly: 130, anchor: "middle", accent: "emerald", info: "Fleshy lateral flaps with bristles (setae); Nereis rows with them and breathes through them." },
          { text: "Clitellum secretes the cocoon", x: 388, y: 253, lx: 400, ly: 130, anchor: "middle", accent: "amber", info: "A glandular band that secretes the cocoon into which eggs and sperm are deposited." },
          { text: "No parapodia, no setae", x: 650, y: 252, lx: 650, ly: 130, anchor: "middle", accent: "rose", info: "Leeches lost their bristles; suckers at both ends anchor the body while it feeds on blood." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Annelids are the segmented worms: the body is divided into repeating units called metameres, each with its own muscles, nerves and excretory organs. Nereis the marine sandworm rows with fleshy parapodia. The earthworm burrows with bristles and a glandular clitellum that makes the egg cocoon. The leech has traded bristles for suckers and a blood-sucking lifestyle.",
    labels: [
      {
        id: "dgm-11-4-4d11-metamerism",
        name: "Metamerism",
        description:
          "True segmentation: the body divided into serially repeated units. Each metamere of an earthworm has its own nephridia and nerve ganglion.",
      },
      {
        id: "dgm-11-4-4d11-clitellum",
        name: "Clitellum",
        description:
          "A thick glandular band on the earthworm's body that secretes mucus for mating and the cocoon that receives the eggs.",
      },
      {
        id: "dgm-11-4-4d11-parapodium",
        name: "Parapodium",
        description:
          "A fleshy lateral projection of a polychaete segment, bearing setae. Used for crawling, swimming and gas exchange.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d12",
    title: "Jointed-Legged Animals",
    figureNo: "Fig 4.12",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 140, y: 52, text: "Apis - honeybee", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Palaemon - prawn", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Spider - arachnid", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // bee
          { kind: "circle", cx: 85, cy: 235, r: 20, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.3 },
          { kind: "ellipse", cx: 135, cy: 240, rx: 30, ry: 26, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.22 },
          { kind: "ellipse", cx: 200, cy: 245, rx: 45, ry: 30, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.22 },
          { kind: "ellipse", cx: 140, cy: 195, rx: 40, ry: 14, fill: "#e2e8f0", stroke: "#e2e8f0", opacity: 0.25 },
          { kind: "ellipse", cx: 165, cy: 205, rx: 32, ry: 11, fill: "#e2e8f0", stroke: "#e2e8f0", opacity: 0.2 },
          { kind: "path", d: "M 120 262 l -10 35 M 140 264 l -4 36 M 160 264 l 4 36 M 180 262 l 10 35", stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "path", d: "M 75 220 l -18 -14 M 95 220 l -12 -18", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "text", x: 140, y: 340, text: "head - thorax - abdomen", size: 13, color: "#94a3b8", anchor: "middle" },
          // prawn
          { kind: "ellipse", cx: 380, cy: 240, rx: 48, ry: 30, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.22 },
          { kind: "path", d: "M 428 240 L 462 228 L 428 252 Z", fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.4 },
          { kind: "rect", x: 300, y: 228, w: 24, h: 26, rx: 5, fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.22 },
          { kind: "rect", x: 276, y: 228, w: 24, h: 26, rx: 5, fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.22 },
          { kind: "rect", x: 252, y: 228, w: 24, h: 26, rx: 5, fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.22 },
          { kind: "path", d: "M 252 240 L 225 225 L 225 255 Z", fill: "#38bdf8", stroke: "#38bdf8", opacity: 0.4 },
          { kind: "path", d: "M 428 235 q 30 -25 55 -20 M 428 245 q 30 -15 52 -8", fill: "none", stroke: "#38bdf8", strokeWidth: 2 },
          { kind: "text", x: 400, y: 340, text: "cephalothorax + abdomen", size: 13, color: "#94a3b8", anchor: "middle" },
          // spider
          { kind: "circle", cx: 640, cy: 215, r: 26, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.25 },
          { kind: "circle", cx: 640, cy: 285, r: 36, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 622 205 l -40 -35 l -25 -10 M 628 200 l -30 -45 l -15 -20 M 652 200 l 30 -45 l 15 -20 M 658 205 l 40 -35 l 25 -10 M 618 225 l -45 -5 l -25 8 M 662 225 l 45 -5 l 25 8 M 618 235 l -42 18 l -20 18 M 662 235 l 42 18 l 20 18", stroke: "#a78bfa", strokeWidth: 2.5, fill: "none" },
          { kind: "text", x: 650, y: 340, text: "8 legs, no antennae", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 410, text: "Arthropoda: jointed appendages, chitinous exoskeleton, the largest phylum.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Over 80% of all known animal species are arthropods.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Tagmata - fused body regions", x: 135, y: 240, lx: 140, ly: 130, anchor: "middle", accent: "amber", info: "Segments fuse into functional regions: insects have head, thorax and abdomen." },
          { text: "Jointed appendages", x: 250, y: 300, lx: 280, ly: 400, anchor: "middle", accent: "amber", info: "Legs, antennae and mouthparts are all jointed limbs - the phylum's namesake trait." },
          { text: "Chitinous exoskeleton", x: 640, y: 285, lx: 640, ly: 400, anchor: "middle", accent: "violet", info: "A hard cuticle of chitin that must be moulted (ecdysis) for growth." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Arthropods - jointed-legged animals - are the most successful animals on Earth, with over eighty percent of all known species. The honeybee shows insect tagmatisation: head, thorax and abdomen with six legs and wings. The prawn fuses head and thorax into a cephalothorax. The spider, an arachnid, walks on eight legs and has no antennae at all.",
    labels: [
      {
        id: "dgm-11-4-4d12-tagmosis",
        name: "Tagmosis",
        description:
          "Fusion of segments into functional body regions (tagmata). Insects have three tagmata; spiders and crustaceans have two.",
      },
      {
        id: "dgm-11-4-4d12-exoskeleton",
        name: "Exoskeleton",
        description:
          "A hard external skeleton of chitin and protein. It gives superb leverage for muscles but must be shed to grow - ecdysis.",
      },
      {
        id: "dgm-11-4-4d12-open-circulation",
        name: "Open circulation",
        description:
          "Blood (haemolymph) pumped into body spaces rather than closed vessels. Typical of arthropods and most molluscs.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d13",
    title: "Soft Bodies, Hard Shells",
    figureNo: "Fig 4.13",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 150, y: 52, text: "Pila - apple snail", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Sepia - cuttlefish", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Octopus", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // Pila
          { kind: "path", d: "M 150 200 m -38 0 a 38 38 0 1 0 76 0 a 30 30 0 1 1 -60 0 a 22 22 0 1 0 44 0", fill: "none", stroke: "#34d399", strokeWidth: 5, opacity: 0.7 },
          { kind: "ellipse", cx: 120, cy: 280, rx: 22, ry: 16, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "rect", x: 90, y: 296, w: 90, h: 26, rx: 13, fill: "#34d399", stroke: "#34d399", opacity: 0.22 },
          { kind: "text", x: 150, y: 360, text: "coiled shell + muscular foot", size: 13, color: "#94a3b8", anchor: "middle" },
          // Sepia
          { kind: "ellipse", cx: 400, cy: 220, rx: 42, ry: 72, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.18 },
          { kind: "path", d: "M 358 170 Q 335 220 358 270 M 442 170 Q 465 220 442 270", fill: "none", stroke: "#22d3ee", strokeWidth: 3, opacity: 0.6 },
          { kind: "path", d: "M 385 290 q -8 30 -20 40 M 400 292 q 0 32 -6 44 M 415 290 q 8 30 20 40", stroke: "#22d3ee", strokeWidth: 2.5, fill: "none" },
          { kind: "text", x: 400, y: 360, text: "internal shell - the cuttlebone", size: 13, color: "#94a3b8", anchor: "middle" },
          // Octopus
          { kind: "circle", cx: 650, cy: 195, r: 32, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 625 215 q -25 50 -15 95 M 640 222 q -12 55 0 100 M 660 222 q 12 55 0 100 M 675 215 q 25 50 15 95", fill: "none", stroke: "#a78bfa", strokeWidth: 5, opacity: 0.55 },
          { kind: "circle", cx: 640, cy: 190, r: 4, fill: "#0f172a" },
          { kind: "circle", cx: 660, cy: 190, r: 4, fill: "#0f172a" },
          { kind: "text", x: 650, y: 360, text: "8 arms, no shell at all", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 420, text: "Mollusca: soft unsegmented body - mantle, foot and visceral mass.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Second-largest phylum; from snails to the giant squid.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Mantle secretes the shell", x: 150, y: 185, lx: 150, ly: 115, anchor: "middle", accent: "emerald", info: "The dorsal body wall (mantle) deposits calcium carbonate to build and repair the shell." },
          { text: "Foot modified into arms", x: 650, y: 280, lx: 650, ly: 410, anchor: "middle", accent: "violet", info: "In cephalopods the ancestral crawling foot became grasping arms and a jet-propulsion funnel." },
          { text: "Radula - the rasping tongue", x: 400, y: 250, lx: 520, ly: 130, anchor: "middle", accent: "cyan", info: "A ribbon of tiny teeth that rasps food - present in most molluscs except bivalves." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Molluscs are soft, unsegmented animals built from three parts: a mantle that secretes the shell, a muscular foot, and a visceral mass of organs. The apple snail Pila carries a classic coiled shell and crawls on its foot. The cuttlefish keeps its shell inside as the cuttlebone. The octopus has abandoned the shell entirely, trading armour for intelligence and eight versatile arms.",
    labels: [
      {
        id: "dgm-11-4-4d13-mantle",
        name: "Mantle",
        description:
          "The dorsal body wall of a mollusc that secretes the shell. The space beneath it houses the gills (ctenidia).",
      },
      {
        id: "dgm-11-4-4d13-radula",
        name: "Radula",
        description:
          "A chitinous ribbon of teeth used to rasp food. A molluscan hallmark - snails scrape algae, octopuses drill shells with it.",
      },
      {
        id: "dgm-11-4-4d13-cephalopod",
        name: "Cephalopod",
        description:
          "'Head-footed' molluscs: squid, cuttlefish, octopus and nautilus. The most active, intelligent invertebrates, with closed circulation.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d14",
    title: "Spiny-Skinned Animals",
    figureNo: "Fig 4.14",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 160, y: 52, text: "Asterias - starfish", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Echinus - sea urchin", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 640, y: 52, text: "Holothuria - sea cucumber", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // starfish
          { kind: "path", d: "M 160 250 L 100 190 L 130 200 L 160 170 L 190 200 L 220 190 Z", fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 160 250 L 95 285 L 125 280 L 140 315 L 180 315 L 195 280 L 225 285 Z", fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.25 },
          { kind: "circle", cx: 160, cy: 250, r: 14, fill: "#fb923c", stroke: "#fb923c", opacity: 0.4 },
          { kind: "circle", cx: 185, cy: 235, r: 5, fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.8 },
          { kind: "text", x: 160, y: 360, text: "5 arms, mouth underneath", size: 13, color: "#94a3b8", anchor: "middle" },
          // sea urchin
          { kind: "circle", cx: 400, cy: 250, r: 48, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 400 250 L 400 165 M 400 250 L 442 175 M 400 250 L 473 208 M 400 250 L 485 250 M 400 250 L 473 292 M 400 250 L 442 325 M 400 250 L 358 325 M 400 250 L 327 292 M 400 250 L 315 250 M 400 250 L 327 208 M 400 250 L 358 175 M 400 250 L 442 175", stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 360, text: "sphere of movable spines", size: 13, color: "#94a3b8", anchor: "middle" },
          // sea cucumber
          { kind: "rect", x: 555, y: 225, w: 170, h: 52, rx: 26, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 580 277 l 0 18 M 610 277 l 0 18 M 640 277 l 0 18 M 670 277 l 0 18 M 700 277 l 0 18", stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "path", d: "M 560 245 q -20 -12 -28 -30", stroke: "#34d399", strokeWidth: 2.5, fill: "none" },
          { kind: "text", x: 640, y: 360, text: "soft, elongated, lies on side", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 420, text: "Echinodermata: calcareous endoskeleton, water vascular system.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Larvae are bilateral - radial symmetry is secondarily acquired.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Pentaradial - five-part symmetry", x: 160, y: 250, lx: 160, ly: 120, anchor: "middle", accent: "orange", info: "Adult echinoderms are radially symmetrical in fives - but their larvae are bilateral like all deuterostomes." },
          { text: "Tube feet - hydraulic grip", x: 130, y: 300, lx: 60, ly: 410, anchor: "middle", accent: "orange", info: "Hundreds of water-filled tube feet on the oral surface grip, walk and pry open bivalve shells." },
          { text: "Water vascular system", x: 400, y: 250, lx: 400, ly: 120, anchor: "middle", accent: "violet", info: "A unique hydraulic network derived from the coelom; it powers tube feet and the madreporite sieve." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Echinoderms - spiny-skinned animals - are exclusively marine and exclusively strange. The starfish hunts with five tube-footed arms; the sea urchin is a living pincushion of movable spines; the sea cucumber has stretched the same body plan into a soft cylinder lying on its side. All share a calcareous endoskeleton and a hydraulic water vascular system found nowhere else.",
    labels: [
      {
        id: "dgm-11-4-4d14-water-vascular",
        name: "Water vascular system",
        description:
          "A hydraulic network of canals unique to echinoderms, opening through the madreporite. It operates the tube feet for locomotion and feeding.",
      },
      {
        id: "dgm-11-4-4d14-pentaradial",
        name: "Pentaradial symmetry",
        description:
          "Five-part radial symmetry of adult echinoderms. It evolved secondarily - the free-swimming larvae are bilaterally symmetrical.",
      },
      {
        id: "dgm-11-4-4d14-endoskeleton",
        name: "Calcareous endoskeleton",
        description:
          "An internal skeleton of calcium carbonate ossicles beneath the skin, bearing the spines that give the phylum its name.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d15",
    title: "Balanoglossus: The Acorn Worm",
    figureNo: "Fig 4.15",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Balanoglossus - a hemichordate", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "ellipse", cx: 170, cy: 250, rx: 42, ry: 26, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.25 },
          { kind: "rect", x: 212, y: 232, w: 44, h: 36, rx: 10, fill: "#fb923c", stroke: "#fb923c", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 256 238 L 660 232 L 660 268 L 256 262 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.14 },
          { kind: "line", x1: 150, y1: 250, x2: 190, y2: 250, stroke: "#fbbf24", strokeWidth: 2.5, dashed: true },
          { kind: "path", d: "M 300 240 l 0 18 M 330 240 l 0 18 M 360 240 l 0 18 M 390 240 l 0 18 M 420 240 l 0 18", stroke: "#38bdf8", strokeWidth: 2 },
          { kind: "text", x: 170, y: 320, text: "proboscis", size: 14, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 234, y: 320, text: "collar", size: 14, color: "#fb923c", anchor: "middle" },
          { kind: "text", x: 460, y: 320, text: "long trunk", size: 14, color: "#38bdf8", anchor: "middle" },
          { kind: "text", x: 400, y: 400, text: "Burrows in marine sand - a worm with a foot, a collar and gill slits.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Once classed with chordates; now its own phylum, Hemichordata.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Proboscis - burrowing organ", x: 170, y: 250, lx: 170, ly: 130, anchor: "middle", accent: "amber", info: "The muscular 'acorn' used to burrow through sand and collect food particles." },
          { text: "Stomochord - not a notochord", x: 170, y: 250, lx: 400, ly: 130, anchor: "middle", accent: "amber", info: "A short stiff rod in the proboscis once mistaken for a notochord - the reason hemichordates were misclassified." },
          { text: "Gill slits in the trunk", x: 360, y: 249, lx: 600, ly: 130, anchor: "middle", accent: "sky", info: "Rows of pharyngeal slits for filter feeding - a genuinely chordate-like character." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Balanoglossus, the acorn worm, is a marine burrower built in three parts: a muscular proboscis for digging, a collar, and a long trunk bearing gill slits. It was long classified as a chordate because of a stiff rod in its proboscis - the stomochord - but that rod is not a true notochord, so hemichordates now stand as their own phylum, the closest non-chordate relatives of chordates.",
    labels: [
      {
        id: "dgm-11-4-4d15-hemichordata",
        name: "Hemichordata",
        description:
          "'Half-chordates': marine worms with pharyngeal gill slits but no true notochord. Balanoglossus is the textbook example.",
      },
      {
        id: "dgm-11-4-4d15-stomochord",
        name: "Stomochord",
        description:
          "A short hollow rod in the hemichordate proboscis. It resembles a notochord but develops differently - the key evidence for reclassification.",
      },
      {
        id: "dgm-11-4-4d15-trunk",
        name: "Trunk",
        description:
          "The long posterior region of the acorn worm containing the gill slits, gut and gonads. It can exceed 2 metres in some species.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d16",
    title: "What Makes a Chordate",
    figureNo: "Fig 4.16",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Four chordate hallmarks - in one body", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 120 250 Q 250 195 450 205 Q 600 210 650 235 L 735 250 L 650 265 Q 500 292 300 285 Q 180 280 120 250 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.1 },
          // notochord
          { kind: "line", x1: 165, y1: 252, x2: 600, y2: 252, stroke: "#fbbf24", strokeWidth: 6, opacity: 0.85 },
          // dorsal nerve cord
          { kind: "line", x1: 165, y1: 216, x2: 600, y2: 216, stroke: "#22d3ee", strokeWidth: 4, opacity: 0.85 },
          // pharyngeal slits
          { kind: "line", x1: 205, y1: 232, x2: 197, y2: 272, stroke: "#34d399", strokeWidth: 4 },
          { kind: "line", x1: 228, y1: 232, x2: 220, y2: 272, stroke: "#34d399", strokeWidth: 4 },
          { kind: "line", x1: 251, y1: 232, x2: 243, y2: 272, stroke: "#34d399", strokeWidth: 4 },
          { kind: "line", x1: 274, y1: 232, x2: 266, y2: 272, stroke: "#34d399", strokeWidth: 4 },
          // myotomes
          { kind: "path", d: "M 340 218 l 22 34 l -22 34 M 400 218 l 22 34 l -22 34 M 460 218 l 22 34 l -22 34 M 520 218 l 22 34 l -22 34", fill: "none", stroke: "#64748b", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "circle", cx: 600, cy: 272, r: 5, fill: "#fb7185", opacity: 0.8 },
          { kind: "text", x: 400, y: 400, text: "All four appear at some stage of life - even if lost in the adult.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "In vertebrates the notochord is replaced by the vertebral column.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Notochord - flexible rod", x: 380, y: 252, lx: 300, ly: 130, anchor: "middle", accent: "amber", info: "A stiff yet flexible rod of vacuolated cells running the body's length - the chordate namesake." },
          { text: "Dorsal hollow nerve cord", x: 480, y: 216, lx: 560, ly: 130, anchor: "middle", accent: "cyan", info: "The nerve cord runs dorsally and is hollow - opposite to the solid ventral cord of invertebrates." },
          { text: "Pharyngeal gill slits", x: 240, y: 252, lx: 140, ly: 130, anchor: "middle", accent: "emerald", info: "Slits in the pharynx wall: gills in fish, but ear and throat structures in terrestrial vertebrates." },
          { text: "Post-anal tail", x: 690, y: 250, lx: 690, ly: 360, anchor: "middle", accent: "sky", info: "The body extends beyond the anus into a muscular tail - reduced to the coccyx in humans." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Four features define every chordate, from sea squirts to humans: a notochord, a dorsal hollow nerve cord, pharyngeal gill slits, and a post-anal tail. They need only appear at some stage of life - a human embryo has gill slits and a tail before remodelling them. In vertebrates the notochord is later replaced by the backbone.",
    labels: [
      {
        id: "dgm-11-4-4d16-notochord",
        name: "Notochord",
        description:
          "A longitudinal rod of turgid cells providing skeletal support. It persists lifelong in lancelets but is replaced by vertebrae in vertebrates.",
      },
      {
        id: "dgm-11-4-4d16-nervecord",
        name: "Dorsal hollow nerve cord",
        description:
          "The central nervous system developing from a dorsal, hollow neural tube. In vertebrates it becomes the brain and spinal cord.",
      },
      {
        id: "dgm-11-4-4d16-gillslits",
        name: "Pharyngeal gill slits",
        description:
          "Openings in the pharynx. Fish use them for breathing; in mammals the same embryonic pouches form the eustachian tube and tonsils.",
      },
      {
        id: "dgm-11-4-4d16-tail",
        name: "Post-anal tail",
        description:
          "A muscular extension of the body beyond the anus, used for swimming or balance. Humans retain only its remnant, the coccyx.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d17",
    title: "Ascidian: The Sea Squirt",
    figureNo: "Fig 4.17",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Ascidia - a urochordate", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "rect", x: 312, y: 150, w: 176, h: 220, rx: 75, fill: "none", stroke: "#a78bfa", strokeWidth: 2, dashed: true, opacity: 0.6 },
          { kind: "rect", x: 330, y: 168, w: 140, h: 184, rx: 62, fill: "#a78bfa", stroke: "#a78bfa", strokeWidth: 2, opacity: 0.16 },
          { kind: "rect", x: 385, y: 112, w: 30, h: 60, rx: 8, fill: "#22d3ee", stroke: "#22d3ee", strokeWidth: 2, opacity: 0.25 },
          { kind: "ellipse", cx: 400, cy: 112, rx: 15, ry: 7, fill: "#0f172a", stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "rect", x: 470, y: 195, w: 52, h: 26, rx: 10, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.25 },
          { kind: "ellipse", cx: 522, cy: 208, rx: 7, ry: 13, fill: "#0f172a", stroke: "#34d399", strokeWidth: 2 },
          { kind: "rect", x: 352, y: 205, w: 96, h: 105, rx: 20, fill: "none", stroke: "#38bdf8", strokeWidth: 1.5, dashed: true, opacity: 0.7 },
          { kind: "arrow", x1: 400, y1: 80, x2: 400, y2: 104, stroke: "#22d3ee", strokeWidth: 2.5 },
          { kind: "arrow", x1: 556, y1: 208, x2: 532, y2: 208, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 420, text: "Sessile filter-feeder - chordate only as a larva", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "The tadpole larva has all four chordate traits; the adult keeps only gill slits.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Incurrent siphon - water in", x: 400, y: 140, lx: 240, ly: 130, anchor: "middle", accent: "cyan", info: "Water enters through the oral siphon, carrying food and oxygen to the pharynx." },
          { text: "Excurrent siphon - water out", x: 496, y: 208, lx: 640, ly: 130, anchor: "middle", accent: "emerald", info: "Filtered water exits through the atrial siphon after passing the gill slits." },
          { text: "Tunic - cellulose coat", x: 330, y: 260, lx: 200, ly: 330, anchor: "middle", accent: "violet", info: "A tough outer test made partly of tunicin, an animal cellulose unique to tunicates." },
          { text: "Pharynx with gill slits", x: 400, y: 258, lx: 600, ly: 330, anchor: "middle", accent: "sky", info: "The huge perforated pharynx sieves food - the adult's surviving chordate character." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The adult sea squirt looks nothing like a chordate: a sessile, barrel-shaped filter-feeder in a cellulose tunic, pumping water in one siphon and out another. But its free-swimming tadpole larva has a notochord, nerve cord, gill slits and tail - all four chordate hallmarks. Urochordates like Ascidia show that 'chordate' is a developmental story, not just an adult shape.",
    labels: [
      {
        id: "dgm-11-4-4d17-urochordata",
        name: "Urochordata",
        description:
          "Tunicates: chordates whose notochord is confined to the larval tail ('uro-'). Adults are sessile filter-feeders in a tunic.",
      },
      {
        id: "dgm-11-4-4d17-tunic",
        name: "Tunic",
        description:
          "The protective outer covering of tunicates, containing tunicin - cellulose made by an animal, unique in the kingdom.",
      },
      {
        id: "dgm-11-4-4d17-retrogressive",
        name: "Retrogressive metamorphosis",
        description:
          "Development from a complex larva to a simpler adult. The ascidian tadpole loses its notochord and nerve cord on settling.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d18",
    title: "Lamprey: The Jawless Fish",
    figureNo: "Fig 4.18",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Petromyzon - the lamprey", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 150 250 Q 280 205 480 218 Q 600 226 675 248 Q 600 272 480 280 Q 280 292 150 250 Z", fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.14 },
          { kind: "circle", cx: 132, cy: 250, r: 27, fill: "#0f172a", stroke: "#fb7185", strokeWidth: 2.5 },
          { kind: "circle", cx: 124, cy: 242, r: 3, fill: "#fb7185", opacity: 0.8 },
          { kind: "circle", cx: 140, cy: 242, r: 3, fill: "#fb7185", opacity: 0.8 },
          { kind: "circle", cx: 132, cy: 258, r: 3, fill: "#fb7185", opacity: 0.8 },
          { kind: "circle", cx: 220, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 244, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 268, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 292, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 316, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 340, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 364, cy: 236, r: 5.5, fill: "#0f172a", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "path", d: "M 520 220 Q 560 192 605 218", fill: "#fb7185", stroke: "#fb7185", strokeWidth: 2, opacity: 0.35 },
          { kind: "circle", cx: 180, cy: 238, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "text", x: 400, y: 400, text: "Eel-like, scaleless, no jaws and no paired fins", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Agnatha: the most primitive living vertebrates.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Suctorial buccal funnel", x: 132, y: 250, lx: 150, ly: 130, anchor: "middle", accent: "rose", info: "A round, jawless mouth ringed with horny teeth; the lamprey latches onto fish and rasps flesh." },
          { text: "7 pairs of gill openings", x: 292, y: 236, lx: 420, ly: 130, anchor: "middle", accent: "amber", info: "Seven separate round gill slits behind the eye - no operculum covers them." },
          { text: "Ectoparasite on fishes", x: 480, y: 250, lx: 620, ly: 360, anchor: "middle", accent: "rose", info: "Adults feed on the blood and tissues of other fish; larvae (ammocoetes) are harmless filter-feeders." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The lamprey is a living fossil of the jawless vertebrates: an eel-like, scaleless fish with a round sucker mouth instead of jaws. Seven pairs of naked gill slits line up behind its eye, and there are no paired fins. Adults are ectoparasites, latching onto other fish with the horny-toothed buccal funnel - while the blind ammocoete larvae live as gentle filter-feeders in river mud.",
    labels: [
      {
        id: "dgm-11-4-4d18-agnatha",
        name: "Agnatha",
        description:
          "Jawless vertebrates: lampreys and hagfish. They lack jaws, paired fins and scales - the most primitive vertebrate body plan alive.",
      },
      {
        id: "dgm-11-4-4d18-buccal",
        name: "Buccal funnel",
        description:
          "The lamprey's circular, jawless mouth armed with horny teeth. It creates suction to grip host fish while the tongue rasps tissue.",
      },
      {
        id: "dgm-11-4-4d18-ammocoete",
        name: "Ammocoete larva",
        description:
          "The blind, filter-feeding larva of the lamprey, so different from the adult that it was once classified as a separate genus.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d19",
    title: "The Cartilaginous Fishes",
    figureNo: "Fig 4.19",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Scoliodon - the dogfish shark", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 110 250 Q 240 198 420 212 Q 540 220 585 238 L 585 264 Q 450 286 300 282 Q 180 278 110 250 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.14 },
          { kind: "path", d: "M 585 251 L 668 188 L 624 251 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.3 },
          { kind: "path", d: "M 585 251 L 648 292 L 604 258 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 340 208 L 372 158 L 398 208 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.3 },
          { kind: "path", d: "M 300 272 L 262 312 L 318 280 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 445 280 L 430 306 L 458 282 Z", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.25 },
          { kind: "line", x1: 205, y1: 226, x2: 199, y2: 274, stroke: "#0f172a", strokeWidth: 3 },
          { kind: "line", x1: 222, y1: 226, x2: 216, y2: 274, stroke: "#0f172a", strokeWidth: 3 },
          { kind: "line", x1: 239, y1: 226, x2: 233, y2: 274, stroke: "#0f172a", strokeWidth: 3 },
          { kind: "line", x1: 256, y1: 226, x2: 250, y2: 274, stroke: "#0f172a", strokeWidth: 3 },
          { kind: "line", x1: 273, y1: 226, x2: 267, y2: 274, stroke: "#0f172a", strokeWidth: 3 },
          { kind: "circle", cx: 150, cy: 240, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "text", x: 400, y: 400, text: "Chondrichthyes: skeleton of cartilage, skin of placoid scales", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Includes sharks, rays, skates and chimaeras - all marine.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Heterocercal tail - upper lobe larger", x: 626, y: 220, lx: 640, ly: 120, anchor: "middle", accent: "sky", info: "An asymmetrical tail: the vertebral column extends into the larger upper lobe, giving lift while swimming." },
          { text: "5 gill slits, no operculum", x: 239, y: 250, lx: 200, ly: 360, anchor: "middle", accent: "sky", info: "Each gill opens separately to the outside - cartilaginous fishes never evolved the bony gill cover." },
          { text: "Placoid scales - tiny teeth", x: 420, y: 250, lx: 480, ly: 360, anchor: "middle", accent: "cyan", info: "Tooth-like dermal denticles make shark skin rough as sandpaper and reduce drag." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Sharks and rays are Chondrichthyes - fishes whose skeleton stayed cartilage instead of turning to bone. The dogfish shark shows the classic design: a streamlined body, an asymmetrical heterocercal tail with the backbone running into the upper lobe, five naked gill slits with no covering flap, and skin armoured in tiny tooth-like placoid scales.",
    labels: [
      {
        id: "dgm-11-4-4d19-chondrichthyes",
        name: "Chondrichthyes",
        description:
          "Cartilaginous fishes: sharks, rays, skates. Endoskeleton of cartilage, placoid scales, separate gill slits, no air bladder.",
      },
      {
        id: "dgm-11-4-4d19-heterocercal",
        name: "Heterocercal tail",
        description:
          "An asymmetrical tail fin with the vertebral column extending into the upper lobe. Generates lift to counteract the shark's sinking body.",
      },
      {
        id: "dgm-11-4-4d19-placoid",
        name: "Placoid scale",
        description:
          "A tiny tooth-like scale of dentine and enamel. Shark skin feels like sandpaper and its denticles streamline water flow.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d20",
    title: "The Bony Fishes",
    figureNo: "Fig 4.20",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Labeo rohita - the rohu", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "path", d: "M 120 250 Q 250 198 430 212 Q 545 222 580 240 L 580 262 Q 450 288 300 284 Q 180 280 120 250 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.14 },
          { kind: "path", d: "M 580 251 L 652 214 L 636 251 L 652 288 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.3 },
          { kind: "path", d: "M 350 206 L 380 160 L 405 206 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.3 },
          { kind: "path", d: "M 310 274 L 272 312 L 326 282 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 285 210 Q 258 250 285 292", fill: "none", stroke: "#34d399", strokeWidth: 3 },
          { kind: "ellipse", cx: 410, cy: 250, rx: 58, ry: 17, fill: "none", stroke: "#22d3ee", strokeWidth: 2, dashed: true, opacity: 0.8 },
          { kind: "line", x1: 300, y1: 250, x2: 560, y2: 250, stroke: "#64748b", strokeWidth: 1.5, dashed: true, opacity: 0.6 },
          { kind: "path", d: "M 360 225 q 12 -10 24 0 M 390 225 q 12 -10 24 0 M 420 225 q 12 -10 24 0 M 360 262 q 12 -10 24 0 M 390 262 q 12 -10 24 0 M 420 262 q 12 -10 24 0", fill: "none", stroke: "#34d399", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "circle", cx: 160, cy: 240, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "text", x: 400, y: 400, text: "Osteichthyes: bony skeleton, operculum, air bladder", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Marine and freshwater - the dominant fishes today.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Operculum - bony gill cover", x: 272, y: 250, lx: 170, ly: 130, anchor: "middle", accent: "emerald", info: "A flap of bone covering the gills; its pumping ventilates them even when the fish is still." },
          { text: "Air bladder - buoyancy control", x: 410, y: 250, lx: 560, ly: 130, anchor: "middle", accent: "cyan", info: "A gas-filled sac that lets the fish hold depth without swimming - sharks lack it entirely." },
          { text: "Homocercal tail - symmetrical", x: 616, y: 251, lx: 660, ly: 360, anchor: "middle", accent: "emerald", info: "Upper and lower lobes equal; the backbone stops at the tail base - built for manoeuvrability." },
          { text: "Cycloid scales - smooth", x: 400, y: 244, lx: 300, ly: 360, anchor: "middle", accent: "emerald", info: "Thin, overlapping bony scales with smooth edges, growing in rings like a tree trunk." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Bony fishes - Osteichthyes - dominate the waters because of three innovations: a bony skeleton, an operculum that pumps water over the gills, and an air bladder for effortless buoyancy. The rohu shows them all, plus the symmetrical homocercal tail and smooth overlapping cycloid scales that distinguish bony fishes from sharks at a glance.",
    labels: [
      {
        id: "dgm-11-4-4d20-osteichthyes",
        name: "Osteichthyes",
        description:
          "Bony fishes: endoskeleton of bone, operculum-covered gills, air bladder, cycloid or ctenoid scales. The vast majority of fishes.",
      },
      {
        id: "dgm-11-4-4d20-operculum",
        name: "Operculum",
        description:
          "The bony flap covering the gill chamber. Its rhythmic movement draws water over the gills - efficient breathing at rest.",
      },
      {
        id: "dgm-11-4-4d20-airbladder",
        name: "Air bladder",
        description:
          "A gas-filled sac adjusting buoyancy so the fish neither sinks nor floats. In some fishes it also works as a lung.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d21",
    title: "Life on Land and Water",
    figureNo: "Fig 4.21",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 140, y: 52, text: "Rana - frog", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Salamandra - salamander", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 650, y: 52, text: "Ichthyophis - caecilian", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // frog
          { kind: "ellipse", cx: 140, cy: 255, rx: 50, ry: 34, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.2 },
          { kind: "circle", cx: 178, cy: 235, r: 20, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.25 },
          { kind: "circle", cx: 182, cy: 222, r: 6, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "path", d: "M 110 280 L 70 330 L 100 335 L 125 295", fill: "none", stroke: "#34d399", strokeWidth: 6, opacity: 0.5 },
          { kind: "path", d: "M 165 285 L 160 325", stroke: "#34d399", strokeWidth: 5, opacity: 0.5 },
          { kind: "text", x: 140, y: 375, text: "tailless, jumping hindlimbs", size: 13, color: "#94a3b8", anchor: "middle" },
          // salamander
          { kind: "path", d: "M 320 255 Q 380 238 440 250 L 520 255 Q 440 270 380 268 Q 345 266 320 255 Z", fill: "#a3e635", stroke: "#a3e635", strokeWidth: 2, opacity: 0.2 },
          { kind: "circle", cx: 335, cy: 250, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "path", d: "M 370 262 L 365 295 M 410 262 L 415 295 M 370 248 L 365 222 M 410 248 L 415 222", stroke: "#a3e635", strokeWidth: 4, opacity: 0.5 },
          { kind: "text", x: 400, y: 375, text: "tailed, lizard-like body", size: 13, color: "#94a3b8", anchor: "middle" },
          // caecilian
          { kind: "path", d: "M 570 255 q 28 -25 56 0 t 56 0 t 56 0", fill: "none", stroke: "#fbbf24", strokeWidth: 11, opacity: 0.55 },
          { kind: "path", d: "M 600 244 l 0 22 M 640 244 l 0 22 M 680 244 l 0 22 M 720 244 l 0 22", stroke: "#fbbf24", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "text", x: 650, y: 375, text: "limbless, burrowing", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 425, text: "Amphibia: 'double life' - larvae in water, adults on land.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Moist skin, 3-chambered heart, eggs laid in water.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Moist glandular skin - breathes", x: 140, y: 255, lx: 140, ly: 130, anchor: "middle", accent: "emerald", info: "Cutaneous respiration through damp skin supplements the lungs - which is why amphibians cannot stray far from water." },
          { text: "Metamorphosis: tadpole to adult", x: 400, y: 255, lx: 400, ly: 130, anchor: "middle", accent: "lime", info: "The aquatic tadpole with gills and tail transforms into the air-breathing adult - the original double life." },
          { text: "Caecilian - the forgotten amphibian", x: 654, y: 255, lx: 650, ly: 130, anchor: "middle", accent: "amber", info: "Limbless, burrowing tropical amphibians with dermal scales - often mistaken for worms or snakes." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Amphibians were the first vertebrates to walk on land, but they never fully left the water - 'amphibia' means double life. The frog is the familiar tailless jumper; the salamander keeps its tail and a lizard-like body; the caecilian Ichthyophis is a limbless burrower most people never see. All share moist, glandular skin that breathes, a three-chambered heart, and eggs that must be laid in water.",
    labels: [
      {
        id: "dgm-11-4-4d21-metamorphosis",
        name: "Metamorphosis",
        description:
          "The transformation from aquatic larva (tadpole) to terrestrial adult. Gills and tail are resorbed; lungs and limbs develop.",
      },
      {
        id: "dgm-11-4-4d21-cutaneous",
        name: "Cutaneous respiration",
        description:
          "Breathing through the skin. Amphibian skin stays moist with mucus glands so oxygen dissolves and diffuses directly into blood.",
      },
      {
        id: "dgm-11-4-4d21-caecilian",
        name: "Caecilian",
        description:
          "Limbless, burrowing amphibians of the tropics (e.g. Ichthyophis). They have tiny dermal scales and are often mistaken for snakes.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d22",
    title: "The Scaly Amniotes",
    figureNo: "Fig 4.22",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 150, y: 52, text: "Lizard", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 400, y: 52, text: "Snake", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "text", x: 640, y: 52, text: "Turtle", size: 18, color: "#e2e8f0", weight: 600, anchor: "middle" },
          // lizard
          { kind: "ellipse", cx: 140, cy: 250, rx: 55, ry: 24, fill: "#a3e635", stroke: "#a3e635", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 195 250 Q 250 245 285 260 Q 250 262 195 258", fill: "#a3e635", stroke: "#a3e635", strokeWidth: 2, opacity: 0.3 },
          { kind: "circle", cx: 95, cy: 245, r: 16, fill: "#a3e635", stroke: "#a3e635", strokeWidth: 2, opacity: 0.25 },
          { kind: "path", d: "M 120 268 L 112 300 M 160 268 L 168 300 M 120 236 L 112 210 M 160 236 L 168 210", stroke: "#a3e635", strokeWidth: 4, opacity: 0.5 },
          { kind: "path", d: "M 115 242 l 10 8 M 135 242 l 10 8 M 155 242 l 10 8", stroke: "#a3e635", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "text", x: 150, y: 345, text: "dry cornified scales", size: 13, color: "#94a3b8", anchor: "middle" },
          // snake
          { kind: "path", d: "M 300 250 q 35 -32 70 0 t 70 0 t 70 0", fill: "none", stroke: "#fb923c", strokeWidth: 13, opacity: 0.55 },
          { kind: "circle", cx: 300, cy: 250, r: 11, fill: "#fb923c", stroke: "#fb923c", opacity: 0.5 },
          { kind: "path", d: "M 295 240 l -10 -12 M 305 240 l 10 -12", stroke: "#fb923c", strokeWidth: 2 },
          { kind: "text", x: 400, y: 345, text: "limbless - ribs walk the body", size: 13, color: "#94a3b8", anchor: "middle" },
          // turtle
          { kind: "path", d: "M 565 285 Q 640 195 715 285 Z", fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.22 },
          { kind: "path", d: "M 600 250 L 600 285 M 640 235 L 640 285 M 680 250 L 680 285", stroke: "#34d399", strokeWidth: 1.5, opacity: 0.5 },
          { kind: "line", x1: 575, y1: 285, x2: 705, y2: 285, stroke: "#34d399", strokeWidth: 3 },
          { kind: "circle", cx: 725, cy: 270, r: 14, fill: "#34d399", stroke: "#34d399", strokeWidth: 2, opacity: 0.25 },
          { kind: "rect", x: 590, y: 285, w: 16, h: 30, rx: 6, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "rect", x: 674, y: 285, w: 16, h: 30, rx: 6, fill: "#34d399", stroke: "#34d399", opacity: 0.3 },
          { kind: "text", x: 640, y: 345, text: "carapace + plastron shell", size: 13, color: "#94a3b8", anchor: "middle" },
          // amniotic egg
          { kind: "ellipse", cx: 400, cy: 420, rx: 34, ry: 44, fill: "none", stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "ellipse", cx: 400, cy: 420, rx: 20, ry: 28, fill: "none", stroke: "#fbbf24", strokeWidth: 1.5, dashed: true, opacity: 0.7 },
          { kind: "text", x: 470, y: 424, text: "amniotic egg - land reproduction", size: 14, color: "#fbbf24", anchor: "start" },
          { kind: "text", x: 150, y: 452, text: "Reptilia: creeping vertebrates, 3-chambered heart (4 in crocodiles).", size: 14, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Dry scaly skin - no glands", x: 140, y: 250, lx: 150, ly: 130, anchor: "middle", accent: "lime", info: "Cornified epidermal scales waterproof the skin - reptiles can live far from water, unlike amphibians." },
          { text: "Amniotic egg", x: 400, y: 420, lx: 400, ly: 360, anchor: "middle", accent: "amber", info: "A shelled egg with amnion, chorion and allantois - the embryo carries its own private pond onto land." },
          { text: "Bony shell from ribs", x: 640, y: 240, lx: 640, ly: 130, anchor: "middle", accent: "emerald", info: "The carapace (top) and plastron (bottom) fuse ribs and vertebrae into armour - turtles breathe with abdominal muscles." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Reptiles were the first vertebrates to truly conquer land, thanks to two inventions: dry, waterproof scaly skin and the amniotic egg. Lizards show the classic creeping body plan; snakes took it to the extreme, losing their limbs and walking on ribs; turtles fused their ribs into a bony carapace and plastron. Most have a three-chambered heart - crocodiles alone have four.",
    labels: [
      {
        id: "dgm-11-4-4d22-amniotic",
        name: "Amniotic egg",
        description:
          "A shelled egg containing the amnion, chorion and allantois membranes. It freed reproduction from water - the reptilian breakthrough.",
      },
      {
        id: "dgm-11-4-4d22-carapace",
        name: "Carapace and plastron",
        description:
          "The turtle's dorsal shell (carapace) and ventral shell (plastron), formed from fused ribs, vertebrae and dermal bone.",
      },
      {
        id: "dgm-11-4-4d22-ectotherm",
        name: "Ectotherm",
        description:
          "An animal that regulates body temperature from the environment - basking and shade-seeking. Reptiles are ectothermic; birds and mammals are not.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d23",
    title: "Built for Flight",
    figureNo: "Fig 4.23",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Columba - the pigeon", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "ellipse", cx: 370, cy: 270, rx: 85, ry: 58, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.14 },
          { kind: "circle", cx: 462, cy: 212, r: 27, fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.2 },
          { kind: "path", d: "M 488 212 L 516 204 L 488 220 Z", fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.8 },
          { kind: "circle", cx: 466, cy: 206, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "path", d: "M 340 250 Q 280 200 210 215 Q 270 235 300 260 Q 260 270 230 290 Q 300 295 345 275", fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, opacity: 0.22 },
          { kind: "path", d: "M 300 235 Q 265 215 230 220 M 305 255 Q 270 240 240 245", fill: "none", stroke: "#38bdf8", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "path", d: "M 290 280 L 235 300 M 295 290 L 245 315 M 305 298 L 260 325", stroke: "#38bdf8", strokeWidth: 3, opacity: 0.5 },
          { kind: "path", d: "M 350 322 L 348 360 M 375 324 L 378 360", stroke: "#fbbf24", strokeWidth: 3 },
          { kind: "path", d: "M 344 360 l -8 10 M 352 360 l 8 10 M 374 360 l -8 10 M 382 360 l 8 10", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "path", d: "M 330 240 q 15 -12 30 0 M 360 250 q 15 -12 30 0 M 330 280 q 15 -12 30 0", fill: "none", stroke: "#38bdf8", strokeWidth: 1.5, opacity: 0.5 },
          { kind: "text", x: 400, y: 425, text: "Aves: feathers, wings, beak - warm-blooded with a 4-chambered heart.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "Forelimbs became wings; bones are hollow and pneumatic.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Feathers - flight + insulation", x: 280, y: 250, lx: 170, ly: 130, anchor: "middle", accent: "sky", info: "Contour feathers shape the wing; down feathers trap heat. No other animal has them." },
          { text: "Beak - no teeth", x: 502, y: 212, lx: 620, ly: 130, anchor: "middle", accent: "amber", info: "A light horny beak replaces heavy jaws and teeth - every gram matters in flight." },
          { text: "Hollow pneumatic bones", x: 370, y: 300, lx: 560, ly: 360, anchor: "middle", accent: "cyan", info: "Air-filled bones strut-braced like aircraft wings: strong yet remarkably light." },
          { text: "Scales on the legs", x: 362, y: 345, lx: 240, ly: 380, anchor: "middle", accent: "amber", info: "The reptilian past shows on the scaly legs and claws - birds are living dinosaurs." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Birds are feathered, warm-blooded vertebrates with forelimbs transformed into wings. The pigeon shows the flight toolkit: contour feathers shaping the wing, a toothless horny beak lightening the head, hollow pneumatic bones, and a four-chambered heart driving the enormous metabolism flight demands. The scaly legs are a quiet reminder that birds are living dinosaurs.",
    labels: [
      {
        id: "dgm-11-4-4d23-feather",
        name: "Feather",
        description:
          "A keratin structure unique to birds. Contour feathers enable flight; down feathers insulate - both evolved from reptilian scales.",
      },
      {
        id: "dgm-11-4-4d23-pneumatic",
        name: "Pneumatic bone",
        description:
          "A hollow, air-filled bone connected to the air-sac system. It cuts weight without losing strength - essential for flight.",
      },
      {
        id: "dgm-11-4-4d23-endotherm",
        name: "Endotherm",
        description:
          "Warm-blooded: maintaining body temperature metabolically. Birds and mammals are endothermic; it powers sustained flight.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-4-4d24",
    title: "The Mammals",
    figureNo: "Fig 4.24",
    classLevel: 11,
    chapterNo: 4,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 500,
        shapes: [
          { kind: "text", x: 400, y: 52, text: "Oryctolagus - the rabbit", size: 22, color: "#e2e8f0", weight: 600, anchor: "middle" },
          { kind: "ellipse", cx: 360, cy: 280, rx: 75, ry: 48, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.14 },
          { kind: "circle", cx: 448, cy: 232, r: 30, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.2 },
          { kind: "ellipse", cx: 440, cy: 168, rx: 11, ry: 36, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.3 },
          { kind: "ellipse", cx: 464, cy: 170, rx: 11, ry: 34, fill: "#fbbf24", stroke: "#fbbf24", strokeWidth: 2, opacity: 0.3 },
          { kind: "circle", cx: 452, cy: 226, r: 5, fill: "#0f172a", stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "path", d: "M 476 238 l 8 4", stroke: "#fbbf24", strokeWidth: 2 },
          { kind: "circle", cx: 288, cy: 268, r: 15, fill: "#fbbf24", stroke: "#fbbf24", opacity: 0.35 },
          { kind: "path", d: "M 330 320 L 325 360 M 360 324 L 360 360 M 395 320 L 400 360 M 425 312 L 432 355", stroke: "#fbbf24", strokeWidth: 6, opacity: 0.5 },
          { kind: "circle", cx: 345, cy: 322, r: 7, fill: "#fb7185", stroke: "#fb7185", opacity: 0.5 },
          { kind: "circle", cx: 375, cy: 324, r: 7, fill: "#fb7185", stroke: "#fb7185", opacity: 0.5 },
          { kind: "circle", cx: 405, cy: 322, r: 7, fill: "#fb7185", stroke: "#fb7185", opacity: 0.5 },
          { kind: "path", d: "M 300 260 l 12 -6 M 320 250 l 12 -6 M 300 280 l 12 -4", stroke: "#fbbf24", strokeWidth: 1.5, opacity: 0.6 },
          { kind: "text", x: 400, y: 425, text: "Mammalia: hair, mammary glands, diaphragm - warm-blooded.", size: 15, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 452, text: "From bats to whales to humans - the most diverse vertebrate class.", size: 15, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          { text: "Hair / fur - insulation", x: 315, y: 265, lx: 180, ly: 130, anchor: "middle", accent: "amber", info: "Keratin filaments covering the body - a mammalian exclusive that conserves metabolic heat." },
          { text: "Pinnae - external ears", x: 452, y: 168, lx: 580, ly: 130, anchor: "middle", accent: "amber", info: "Movable external ears funnel sound - part of the mammalian hearing upgrade with three ear ossicles." },
          { text: "Mammary glands - milk", x: 375, y: 323, lx: 560, ly: 360, anchor: "middle", accent: "rose", info: "Milk-secreting glands that nourish the young - the trait that names the class." },
          { text: "Bat flies, whale swims - both mammals", x: 400, y: 280, lx: 240, ly: 380, anchor: "middle", accent: "amber", info: "Forelimbs became wings in bats and flippers in whales; all breathe air and suckle young." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Mammals are defined by two things no other animal has: hair and mammary glands that produce milk. The rabbit shows the classic features - fur, long pinnae, and a body built around a muscular diaphragm for breathing. The same blueprint stretches from flying bats to swimming whales: all warm-blooded, all air-breathing, all nursing their young.",
    labels: [
      {
        id: "dgm-11-4-4d24-mammary",
        name: "Mammary gland",
        description:
          "A milk-producing skin gland. All female mammals nourish newborns with milk - the single trait that defines Mammalia.",
      },
      {
        id: "dgm-11-4-4d24-diaphragm",
        name: "Diaphragm",
        description:
          "The muscular sheet separating thorax and abdomen, driving mammalian breathing. No other vertebrate class has one.",
      },
      {
        id: "dgm-11-4-4d24-vivipary",
        name: "Vivipary",
        description:
          "Giving birth to live young. Most mammals are viviparous, nourishing the embryo via a placenta - monotremes lay eggs instead.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
];
