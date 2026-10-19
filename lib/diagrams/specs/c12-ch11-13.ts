import type { FigureDef } from "@/lib/data";

export const figures: FigureDef[] = [
  {
    id: "dgm-12-11-11d1",
    title: "Three shapes of a human age pyramid",
    figureNo: "Fig 11.1",
    classLevel: 12,
    chapterNo: 11,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Age classes (young → old)",
        yLabel: "Relative width",
        xMin: 0,
        xMax: 3,
        yMin: 0,
        yMax: 100,
        series: [
          {
            name: "Expanding (triangular)",
            color: "#34d399",
            points: [
              [0, 88],
              [1, 58],
              [2, 30],
              [3, 12],
            ],
          },
          {
            name: "Stable (bell)",
            color: "#38bdf8",
            points: [
              [0, 55],
              [1, 55],
              [2, 46],
              [3, 30],
            ],
          },
          {
            name: "Declining (urn)",
            color: "#fbbf24",
            points: [
              [0, 24],
              [1, 52],
              [2, 58],
              [3, 44],
            ],
          },
        ],
        note: "Schematic trace — the three classic human age-pyramid outlines (not measured data).",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "An age pyramid plots the proportion of pre-reproductive, reproductive and post-reproductive individuals as its outline. A triangular expanding pyramid has a wide young base and keeps growing; a bell-shaped stable pyramid has roughly equal age classes and holds steady. An urn-shaped declining pyramid narrows at the base, so the population is set to shrink. Reading the shape tells you a population's future without waiting decades to watch it.",
    labels: [
      {
        id: "expanding",
        name: "Expanding population",
        description:
          "Triangular outline with a very wide base of young individuals. High birth rates keep feeding new cohorts in, so the population is growing.",
      },
      {
        id: "stable",
        name: "Stable population",
        description:
          "Bell-shaped outline where pre-reproductive and reproductive widths are nearly equal. Births roughly balance deaths, so numbers stay level.",
      },
      {
        id: "declining",
        name: "Declining population",
        description:
          "Urn-shaped outline with a narrow young base. Too few children are being born to replace the old, so the population will shrink.",
      },
      {
        id: "age-classes",
        name: "Age classes",
        description:
          "The three horizontal bands of a pyramid: pre-reproductive (young), reproductive (middle) and post-reproductive (old). Their relative sizes reveal the trend.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-11-11d2",
    title: "The four forces that change population size",
    figureNo: "Fig 11.2",
    classLevel: 12,
    chapterNo: 11,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          {
            kind: "rect",
            x: 280,
            y: 195,
            w: 240,
            h: 110,
            rx: 14,
            fill: "#0f172a",
            stroke: "#38bdf8",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 400,
            y: 262,
            text: "Nt+1 = Nt + (B+I) − (D+E)",
            size: 22,
            color: "#e2e8f0",
            weight: 600,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 60,
            y: 64,
            w: 180,
            h: 64,
            rx: 10,
            fill: "#052e22",
            stroke: "#34d399",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 150,
            y: 104,
            text: "Births · B",
            size: 17,
            color: "#a7f3d0",
            weight: 600,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 60,
            y: 392,
            w: 180,
            h: 64,
            rx: 10,
            fill: "#052e22",
            stroke: "#34d399",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 150,
            y: 432,
            text: "Immigration · I",
            size: 17,
            color: "#a7f3d0",
            weight: 600,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 560,
            y: 64,
            w: 180,
            h: 64,
            rx: 10,
            fill: "#3f1620",
            stroke: "#fb7185",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 650,
            y: 104,
            text: "Deaths · D",
            size: 17,
            color: "#fecdd3",
            weight: 600,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 560,
            y: 392,
            w: 180,
            h: 64,
            rx: 10,
            fill: "#3f1620",
            stroke: "#fb7185",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 650,
            y: 432,
            text: "Emigration · E",
            size: 17,
            color: "#fecdd3",
            weight: 600,
            anchor: "middle",
          },
          { kind: "arrow", x1: 240, y1: 112, x2: 292, y2: 216, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "arrow", x1: 240, y1: 408, x2: 292, y2: 288, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "arrow", x1: 508, y1: 216, x2: 560, y2: 112, stroke: "#fb7185", strokeWidth: 2.5 },
          { kind: "arrow", x1: 508, y1: 288, x2: 560, y2: 408, stroke: "#fb7185", strokeWidth: 2.5 },
          { kind: "text", x: 258, y: 168, text: "+", size: 18, color: "#34d399", weight: 700, anchor: "middle" },
          { kind: "text", x: 258, y: 356, text: "+", size: 18, color: "#34d399", weight: 700, anchor: "middle" },
          { kind: "text", x: 542, y: 168, text: "−", size: 18, color: "#fb7185", weight: 700, anchor: "middle" },
          { kind: "text", x: 542, y: 356, text: "−", size: 18, color: "#fb7185", weight: 700, anchor: "middle" },
        ],
        labels: [
          { text: "Natality (B)", x: 150, y: 64, lx: 150, ly: 32, anchor: "middle", accent: "emerald", info: "Births add new individuals to the population, raising density." },
          { text: "Immigration (I)", x: 150, y: 456, lx: 150, ly: 490, anchor: "middle", accent: "emerald", info: "Individuals arriving from other populations add to the density." },
          { text: "Mortality (D)", x: 650, y: 64, lx: 650, ly: 32, anchor: "middle", accent: "rose", info: "Deaths remove individuals from the population, lowering density." },
          { text: "Emigration (E)", x: 650, y: 456, lx: 650, ly: 490, anchor: "middle", accent: "rose", info: "Individuals leaving for other populations reduce the density." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Population density does not change by magic — it changes through exactly four basic processes. Births and immigration push density up; deaths and emigration pull it down. The equation Nt+1 = Nt + (B+I) − (D+E) packs this whole idea into one line: tomorrow's density equals today's, plus arrivals, minus departures.",
    labels: [
      {
        id: "natality",
        name: "Natality (B)",
        description:
          "The number of births in the population during the time interval. It is one of the two processes that increase population density.",
      },
      {
        id: "mortality",
        name: "Mortality (D)",
        description:
          "The number of deaths in the population during the time interval. It is one of the two processes that decrease population density.",
      },
      {
        id: "immigration",
        name: "Immigration (I)",
        description:
          "Individuals of the same species arriving from outside the habitat. Like births, it adds to the population.",
      },
      {
        id: "emigration",
        name: "Emigration (E)",
        description:
          "Individuals of the same species leaving the habitat for elsewhere. Like deaths, it subtracts from the population.",
      },
      {
        id: "nt",
        name: "Nt — population density",
        description:
          "The number of individuals of the species per unit area at time t. Nt+1 is the density after the interval, once the four processes have acted.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-11-11d3",
    title: "J-shaped versus S-shaped population growth",
    figureNo: "Fig 11.3",
    classLevel: 12,
    chapterNo: 11,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Time",
        yLabel: "Population size (N)",
        xMin: 0,
        xMax: 8,
        yMin: 0,
        yMax: 110,
        series: [
          {
            name: "Exponential (J-shaped)",
            color: "#34d399",
            points: [
              [0, 4],
              [1, 6],
              [2, 9],
              [3, 14],
              [4, 22],
              [5, 35],
              [6, 55],
              [7, 84],
              [8, 105],
            ],
          },
          {
            name: "Logistic (S-shaped)",
            color: "#38bdf8",
            points: [
              [0, 4],
              [1, 6],
              [2, 10],
              [3, 17],
              [4, 30],
              [5, 48],
              [6, 62],
              [7, 70],
              [8, 74],
            ],
          },
          {
            name: "Carrying capacity (K)",
            color: "#fb7185",
            dashed: true,
            points: [
              [0, 78],
              [8, 78],
            ],
          },
        ],
        annotations: [{ x: 7.4, y: 78, text: "Carrying capacity K" }],
        note: "Schematic trace — the exponential vs logistic growth models (not measured data).",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "When resources are unlimited, every individual reproduces freely and growth explodes in a J-shaped exponential curve. In the real world resources are limited, so competition slows growth and the curve flattens into an S-shaped sigmoid near the habitat's carrying capacity K. No natural population keeps a J-shape for long — limits always catch up.",
    labels: [
      {
        id: "exponential",
        name: "Exponential growth",
        description:
          "Growth with unlimited resources, where the population doubles in fixed time. The plot is a J-shaped curve with an ever-steepening rise.",
      },
      {
        id: "logistic",
        name: "Logistic growth",
        description:
          "Growth with limited resources, where competition slows the rate as density rises. The plot is an S-shaped (sigmoid) curve that flattens near K.",
      },
      {
        id: "carrying-capacity",
        name: "Carrying capacity (K)",
        description:
          "The maximum population size a habitat's resources can sustain. Logistic growth asymptotically approaches K but cannot exceed it for long.",
      },
      {
        id: "lag-phase",
        name: "Lag phase",
        description:
          "The slow start of the sigmoid, when the population is small and individuals are few. Growth accelerates only after this phase.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-11-11d4",
    title: "Fig and wasp: a partnership with no escape",
    figureNo: "Fig 11.4",
    classLevel: 12,
    chapterNo: 11,
    modelKey: null,
    diagram: {
      template: "flow",
      spec: {
        direction: "horizontal",
        steps: [
          {
            title: "Wasp enters syconium",
            detail: "Crawls into the fig through the ostiole",
            info: "The fig's flower head is an enclosed hollow syconium with a tiny entrance, the ostiole. Only this wasp species can squeeze through.",
            accent: "emerald",
          },
          {
            title: "Pollinates the flowers",
            detail: "Dusts the female flowers with pollen",
            info: "While searching for a place to lay eggs, the wasp brushes pollen from another fig onto the fig's female flowers.",
            accent: "sky",
          },
          {
            title: "Lays her eggs",
            detail: "Oviposits inside short-styled flowers",
            info: "The wasp deposits eggs inside a few of the flowers. Those flowers sacrifice seed production to become a nursery.",
            accent: "violet",
          },
          {
            title: "Larvae develop",
            detail: "Feed on nutritive tissue, then pupate",
            info: "Wasp larvae grow inside the fig on its nutritive tissue, while the pollinated flowers mature into seeds and the fig swells into fruit.",
            accent: "amber",
          },
          {
            title: "Winged wasps emerge",
            detail: "Females collect pollen and fly out",
            info: "New wingless males mate inside, then the winged females pick up pollen and leave to find another syconium — restarting the cycle.",
            accent: "orange",
          },
        ],
        arrowLabels: ["via ostiole", "pollen transfer", "oviposition", "inside the fig"],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The fig and its wasp are locked in one of the tightest partnerships in nature — neither can complete its life without the other. The wasp gets a nursery for its larvae; the fig gets a pollinator small enough to reach its hidden flowers. Each fig species is pollinated by exactly one wasp species, so the whole system depends on perfect synchrony.",
    labels: [
      {
        id: "mutualism",
        name: "Mutualism",
        description:
          "An interaction in which both partners benefit. The fig gains pollination and the wasp gains a protected breeding site.",
      },
      {
        id: "syconium",
        name: "Syconium",
        description:
          "The fig's enclosed, urn-like inflorescence with hundreds of tiny flowers hidden inside. Its only entrance is the ostiole.",
      },
      {
        id: "pollination",
        name: "Pollination",
        description:
          "The wasp carries pollen from the fig it was born in and deposits it on another fig's female flowers, fertilising them.",
      },
      {
        id: "oviposition",
        name: "Oviposition",
        description:
          "Egg-laying. The wasp inserts eggs into short-styled flowers, which develop into galls housing the larvae.",
      },
      {
        id: "obligate",
        name: "Obligate partnership",
        description:
          "A relationship so specialised that both species depend on each other for survival. Remove either and both die out locally.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-11-11d5",
    title: "The orchid that fooled a male bee",
    figureNo: "Fig 11.5",
    classLevel: 12,
    chapterNo: 11,
    modelKey: null,
    diagram: {
      template: "flow",
      spec: {
        direction: "horizontal",
        steps: [
          {
            title: "Orchid mimics female bee",
            detail: "Petal shaped, coloured, scented like one",
            info: "The Mediterranean orchid Ophrys produces flowers that look and smell exactly like a female bee — a deception, not a reward.",
            accent: "rose",
          },
          {
            title: "Male bee is deceived",
            detail: "Arrives and attempts to mate",
            info: "A male bee of the same species is fooled by the sight and pheromone-like scent and tries to copulate with the flower.",
            accent: "amber",
          },
          {
            title: "Pollen smeared on bee",
            detail: "Pollinia stick to the bee's body",
            info: "During the failed mating the flower's pollen packets (pollinia) glue themselves to the bee — the orchid's only goal.",
            accent: "sky",
          },
          {
            title: "Bee fooled again",
            detail: "Visits another mimicking orchid",
            info: "The male flies off and is tricked by a second orchid flower, repeating the fake mating attempt.",
            accent: "violet",
          },
          {
            title: "Pollination achieved",
            detail: "Pollen delivered, flower fertilised",
            info: "The pollinia rub off onto the second flower's stigma. Cross-pollination is complete — with the bee none the wiser.",
            accent: "emerald",
          },
        ],
        arrowLabels: ["sight + scent lure", "pseudocopulation", "bee flies on", "pollen transfer"],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Some orchids never offer nectar — they offer an illusion. The Ophrys orchid copies the body and scent of a female bee so convincingly that males attempt to mate with its flowers. The bee gains nothing, but the orchid gets a free pollen courier. It is mutualism's mirror image: one-sided deception driving perfect pollination.",
    labels: [
      {
        id: "mimicry",
        name: "Sexual mimicry",
        description:
          "A flower copying the shape, colour and pheromones of a female insect. The deception targets the male's mating drive, not his hunger.",
      },
      {
        id: "pseudocopulation",
        name: "Pseudocopulation",
        description:
          "A male insect's attempted mating with a flower. The physical struggle is what attaches and then dislodges the pollen packets.",
      },
      {
        id: "pollinia",
        name: "Pollinia",
        description:
          "Solid packets of pollen found in orchids. They stick as a unit to the pollinator and arrive intact at the next flower's stigma.",
      },
      {
        id: "cross-pollination",
        name: "Cross-pollination",
        description:
          "Pollen transfer between flowers of different plants. The fooled bee visiting two orchids guarantees outcrossing and genetic diversity.",
      },
      {
        id: "commensalism",
        name: "Not quite mutualism",
        description:
          "The bee gets nothing from this exchange — the benefit flows only to the orchid. Classic examples remind us interactions range from help to trickery.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-12-12d2",
    title: "Who eats whom: the four trophic levels",
    figureNo: "Fig 12.2",
    classLevel: 12,
    chapterNo: 12,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          {
            kind: "rect",
            x: 120,
            y: 360,
            w: 560,
            h: 64,
            rx: 10,
            fill: "#052e22",
            stroke: "#34d399",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 400,
            y: 400,
            text: "T1 · Producers",
            size: 18,
            color: "#a7f3d0",
            weight: 700,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 190,
            y: 272,
            w: 420,
            h: 64,
            rx: 10,
            fill: "#1a2e05",
            stroke: "#a3e635",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 400,
            y: 312,
            text: "T2 · Primary consumers",
            size: 18,
            color: "#d9f99d",
            weight: 700,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 250,
            y: 184,
            w: 300,
            h: 64,
            rx: 10,
            fill: "#2f2005",
            stroke: "#fbbf24",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 400,
            y: 224,
            text: "T3 · Secondary consumers",
            size: 18,
            color: "#fde68a",
            weight: 700,
            anchor: "middle",
          },
          {
            kind: "rect",
            x: 310,
            y: 96,
            w: 180,
            h: 64,
            rx: 10,
            fill: "#2e1505",
            stroke: "#fb923c",
            strokeWidth: 2,
          },
          {
            kind: "text",
            x: 400,
            y: 136,
            text: "T4 · Top consumers",
            size: 18,
            color: "#fed7aa",
            weight: 700,
            anchor: "middle",
          },
          {
            kind: "arrow",
            x1: 700,
            y1: 420,
            x2: 700,
            y2: 110,
            stroke: "#fbbf24",
            strokeWidth: 2.5,
            dashed: true,
          },
        ],
        labels: [
          { text: "Grasses (producers)", x: 150, y: 392, lx: 60, ly: 478, anchor: "start", accent: "emerald", info: "Green plants fix solar energy into biomass — the entry point of energy into the ecosystem." },
          { text: "Rabbit, mouse, insects", x: 230, y: 304, lx: 60, ly: 250, anchor: "start", accent: "lime", info: "Herbivores feeding directly on producers are the primary consumers." },
          { text: "Frog, small birds", x: 530, y: 216, lx: 560, ly: 170, anchor: "start", accent: "amber", info: "Carnivores that eat herbivores form the secondary-consumer level." },
          { text: "Snake, hawk", x: 470, y: 128, lx: 560, ly: 60, anchor: "start", accent: "orange", info: "Predators at the top, feeding on smaller carnivores — fewest in number." },
          { text: "Energy flows up", x: 700, y: 270, lx: 716, ly: 270, anchor: "start", accent: "amber", info: "Energy moves one way through trophic levels, shrinking about tenfold at each step." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Every organism in a grassland slots into a feeding rank called a trophic level. Producers form the wide base, herbivores sit above them, then small carnivores, then the top predators. Energy flows upward through these levels — but never fully, which is why the pyramid narrows toward the top.",
    labels: [
      {
        id: "producer",
        name: "Producer",
        description:
          "Green plants (here, grasses) that trap solar energy by photosynthesis. They build the biomass every other level feeds on.",
      },
      {
        id: "primary-consumer",
        name: "Primary consumer",
        description:
          "Herbivores such as rabbits, mice and insects that eat producers directly. They form trophic level T2.",
      },
      {
        id: "secondary-consumer",
        name: "Secondary consumer",
        description:
          "Carnivores such as frogs and small birds that eat herbivores. They form trophic level T3.",
      },
      {
        id: "tertiary-consumer",
        name: "Tertiary consumer",
        description:
          "Top predators such as snakes and hawks that feed on smaller carnivores. They sit at T4, the narrowest level.",
      },
      {
        id: "trophic-level",
        name: "Trophic level",
        description:
          "A feeding rank in the food chain. A species' level is fixed by what it eats — the same species always occupies the same level.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-12-12d3",
    title: "Only ten percent moves up the food chain",
    figureNo: "Fig 12.3",
    classLevel: 12,
    chapterNo: 12,
    modelKey: null,
    diagram: {
      template: "flow",
      spec: {
        direction: "vertical",
        steps: [
          {
            title: "Sunlight captured",
            detail: "1,000,000 J of solar radiation arrives",
            info: "Plants can trap only a tiny fraction — about one percent — of the sunlight falling on them. The rest reflects or heats the ground.",
            accent: "sky",
          },
          {
            title: "Producers",
            detail: "10,000 J fixed as plant biomass",
            info: "Photosynthesis stores roughly 10,000 J of the million as standing crop. The rest is never captured.",
            accent: "emerald",
          },
          {
            title: "Primary consumers",
            detail: "1,000 J — herbivores",
            info: "Herbivores retain about ten percent of what they eat; the other ninety percent is lost to respiration and waste.",
            accent: "lime",
          },
          {
            title: "Secondary consumers",
            detail: "100 J — small carnivores",
            info: "The ten-percent rule repeats: only a tenth of the herbivore energy passes into small carnivores.",
            accent: "amber",
          },
          {
            title: "Top carnivores",
            detail: "10 J — largest predators",
            info: "By the fifth level, a million joules of sunlight have dwindled to ten — which is why top predators are always few.",
            accent: "orange",
          },
        ],
        arrowLabels: ["~10% retained", "~10% retained", "~10% retained", "~10% retained"],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Energy enters an ecosystem as sunlight and exits as heat — and at every feeding step, about ninety percent is lost. Only roughly ten percent of the energy at one trophic level is transferred to the next. This ten-percent law explains both the shrinking pyramid of biomass and why food chains rarely run past four or five levels.",
    labels: [
      {
        id: "ten-percent-law",
        name: "10 percent law",
        description:
          "Lindeman's rule: only about ten percent of energy at one trophic level moves to the next. The rest is lost as heat, respiration and waste.",
      },
      {
        id: "standing-crop",
        name: "Standing crop",
        description:
          "The total biomass present at a trophic level at a given time. Each higher level's standing crop is a fraction of the one below.",
      },
      {
        id: "respiration-loss",
        name: "Respiration loss",
        description:
          "Most of the energy an organism eats is burned in respiration to stay alive and move. This dissipated heat never returns to the food chain.",
      },
      {
        id: "energy-flow",
        name: "Energy flow",
        description:
          "The one-way passage of energy from sun to producers to consumers. Unlike nutrients, energy cannot be recycled.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-12-12d4",
    title: "The upright pyramid of numbers in a grassland",
    figureNo: "Fig 12.4",
    classLevel: 12,
    chapterNo: 12,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "bar",
        xLabel: "Trophic level",
        yLabel: "Relative number",
        xMin: 0,
        xMax: 3,
        yMin: 0,
        yMax: 100,
        series: [],
        bars: [
          { label: "Producers", value: 100, color: "#34d399" },
          { label: "Primary consumers", value: 45, color: "#a3e635" },
          { label: "Secondary consumers", value: 15, color: "#fbbf24" },
          { label: "Top consumers", value: 4, color: "#fb923c" },
        ],
        note: "Schematic counts — the upright pyramid of numbers in a grassland (not measured data).",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Counting individuals at each trophic level of a grassland gives an upright pyramid: countless grasses, fewer herbivores, fewer small carnivores, and only a handful of top predators. The shape is a direct consequence of the ten-percent law — less energy supports fewer mouths. Pyramids of numbers can invert in some forests, but in grasslands they stand tall and upright.",
    labels: [
      {
        id: "pyramid-of-numbers",
        name: "Pyramid of numbers",
        description:
          "A graphical count of individuals at each trophic level. Its shape reveals how energy limits higher levels to fewer individuals.",
      },
      {
        id: "upright-pyramid",
        name: "Upright pyramid",
        description:
          "A pyramid that narrows toward the top — many producers at the base, few top consumers. Typical of grassland and most ecosystems.",
      },
      {
        id: "inverted-exception",
        name: "When it inverts",
        description:
          "In a tree-based ecosystem one large producer can support many herbivores, flipping the pyramid. Grasslands never invert this way.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-13-13d1",
    title: "Insects own the largest slice of life",
    figureNo: "Fig 13.1",
    classLevel: 12,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "bar",
        xLabel: "Taxon",
        yLabel: "Described species (thousands)",
        xMin: 0,
        xMax: 4,
        yMin: 0,
        yMax: 1100,
        series: [],
        bars: [
          { label: "Insects", value: 1025, color: "#34d399" },
          { label: "Angiosperms", value: 270, color: "#a3e635" },
          { label: "Other invertebrates", value: 200, color: "#38bdf8" },
          { label: "Other plants", value: 88, color: "#fbbf24" },
          { label: "Vertebrates", value: 62, color: "#a78bfa" },
        ],
        note: "Schematic counts — thousands of described species per taxon; insects dominate (not measured data).",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Of the roughly 1.5 million species science has described, insects alone account for more than two-thirds of all animals — over a million species and counting. Angiosperms are the only plant group that comes close to a big share; vertebrates, the group humans belong to, are a small slice. Biodiversity is overwhelmingly a story of small invertebrates, not the familiar mammals and birds.",
    labels: [
      {
        id: "insects",
        name: "Insects",
        description:
          "The most diverse animal taxon on Earth, with over a million described species — beetles alone outnumber all vertebrates combined.",
      },
      {
        id: "described-species",
        name: "Described species",
        description:
          "Species formally named and recorded by science — about 1.5 million so far. The true total, including undescribed ones, may be several times larger.",
      },
      {
        id: "angiosperms",
        name: "Angiosperms",
        description:
          "Flowering plants, the largest plant group by far with around 270,000 described species. They dominate most terrestrial habitats.",
      },
      {
        id: "taxon",
        name: "Taxon",
        description:
          "Any named group of organisms, such as a class or phylum. Comparing taxa shows where biodiversity is concentrated.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-13-13d2",
    title: "Bigger area, more species: the S = cA^z curve",
    figureNo: "Fig 13.2",
    classLevel: 12,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Area (A)",
        yLabel: "Species richness (S)",
        xMin: 0,
        xMax: 36,
        yMin: 0,
        yMax: 40,
        series: [
          {
            name: "S = cA^z",
            color: "#22d3ee",
            points: [
              [1, 10],
              [4, 15],
              [9, 21],
              [16, 27],
              [25, 32],
              [36, 36],
            ],
          },
        ],
        annotations: [{ x: 31, y: 33, text: "Rectangular hyperbola" }],
        note: "Schematic trace — the species–area relationship follows a rectangular hyperbola (not measured data).",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Ecologists noticed that as you survey larger areas, you keep finding new species — following the curve S = cA^z. Species richness climbs steeply at first, then levels off as new ground stops adding many novel species. On a log-log scale this hyperbola straightens into a line, and its slope z falls between 0.1 and 0.2 for most groups. It is why large, contiguous reserves protect more species than small fragments.",
    labels: [
      {
        id: "species-richness",
        name: "Species richness",
        description:
          "The count of different species in an area — the simplest measure of biodiversity. It is what S stands for in the equation.",
      },
      {
        id: "scaz",
        name: "S = cA^z",
        description:
          "The species–area equation: S is richness, A is area, c is a constant for the region, and z is the slope of the relationship.",
      },
      {
        id: "hyperbola",
        name: "Rectangular hyperbola",
        description:
          "The shape of the raw curve — rising fast, then flattening. It shows that new species arrive with diminishing returns as area grows.",
      },
      {
        id: "log-log",
        name: "Log–log plot",
        description:
          "Plotting log S against log A turns the hyperbola into a straight line whose slope is z. Linearity makes the pattern easy to measure.",
      },
      {
        id: "z-value",
        name: "z value",
        description:
          "The regression slope, typically 0.1–0.2. A higher z means species accumulate faster with area — a fingerprint of the taxon and region.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
];
