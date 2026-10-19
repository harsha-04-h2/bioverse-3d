import type { FigureDef } from "@/lib/data";

/**
 * Batch 5 diagrams — Class 12, chapters 8–10.
 * Ch 8 Microbes in Human Welfare, Ch 9 Biotechnology: Principles and
 * Processes, Ch 10 Biotechnology and its Applications.
 * All eight figures are `schematic` templates (viz tag: diagram-2d).
 */

export const figures: FigureDef[] = [
  {
    id: "dgm-12-8-8d3",
    title: "Colonies on a Plate",
    figureNo: "Fig 8.3",
    classLevel: 12,
    chapterNo: 8,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 460,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "Microbial colonies on nutrient agar", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          { kind: "text", x: 250, y: 72, text: "Bacteria — day 2", size: 13, anchor: "middle", color: "#fbbf24" },
          { kind: "text", x: 590, y: 72, text: "Fungi — day 5", size: 13, anchor: "middle", color: "#34d399" },
          // dish 1 — bacteria
          { kind: "circle", cx: 250, cy: 225, r: 122, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2.5 },
          { kind: "circle", cx: 250, cy: 225, r: 108, fill: "#0e2239", stroke: "#1e3a5f", strokeWidth: 1.5 },
          // dish 2 — fungi
          { kind: "circle", cx: 590, cy: 225, r: 122, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2.5 },
          { kind: "circle", cx: 590, cy: 225, r: 108, fill: "#0e2239", stroke: "#1e3a5f", strokeWidth: 1.5 },
          // bacterial colonies — small, smooth, round
          { kind: "circle", cx: 190, cy: 195, r: 6, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 220, cy: 165, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 260, cy: 150, r: 5, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 300, cy: 180, r: 7, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 320, cy: 215, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 295, cy: 250, r: 6, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 260, cy: 280, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 225, cy: 265, r: 7, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 180, cy: 240, r: 5, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 205, cy: 300, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 170, cy: 160, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 280, cy: 205, r: 3, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 322, cy: 261, r: 4, fill: "#fbbf24", opacity: 0.85 },
          { kind: "circle", cx: 245, cy: 235, r: 5, fill: "#fbbf24", opacity: 0.85 },
          // fungal colonies — larger, fuzzy-edged
          { kind: "circle", cx: 540, cy: 190, r: 18, fill: "#34d399", opacity: 0.3, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 540, cy: 190, r: 25, fill: "none", stroke: "#34d399", strokeWidth: 1.2, dashed: true, opacity: 0.6 },
          { kind: "circle", cx: 620, cy: 170, r: 20, fill: "#a78bfa", opacity: 0.3, stroke: "#a78bfa", strokeWidth: 1.5 },
          { kind: "circle", cx: 620, cy: 170, r: 28, fill: "none", stroke: "#a78bfa", strokeWidth: 1.2, dashed: true, opacity: 0.6 },
          { kind: "circle", cx: 650, cy: 235, r: 16, fill: "#34d399", opacity: 0.3, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 650, cy: 235, r: 23, fill: "none", stroke: "#34d399", strokeWidth: 1.2, dashed: true, opacity: 0.6 },
          { kind: "circle", cx: 580, cy: 270, r: 22, fill: "#a78bfa", opacity: 0.3, stroke: "#a78bfa", strokeWidth: 1.5 },
          { kind: "circle", cx: 580, cy: 270, r: 30, fill: "none", stroke: "#a78bfa", strokeWidth: 1.2, dashed: true, opacity: 0.6 },
          { kind: "circle", cx: 520, cy: 265, r: 14, fill: "#34d399", opacity: 0.3, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 520, cy: 265, r: 20, fill: "none", stroke: "#34d399", strokeWidth: 1.2, dashed: true, opacity: 0.6 },
          // spore dots at colony centres
          { kind: "circle", cx: 540, cy: 190, r: 3, fill: "#34d399" },
          { kind: "circle", cx: 620, cy: 170, r: 3, fill: "#a78bfa" },
          { kind: "circle", cx: 650, cy: 235, r: 3, fill: "#34d399" },
          { kind: "circle", cx: 580, cy: 270, r: 3, fill: "#a78bfa" },
          // bench line
          { kind: "line", x1: 60, y1: 372, x2: 740, y2: 372, stroke: "#1e3a5f", strokeWidth: 2 },
          { kind: "text", x: 400, y: 410, text: "Each colony grew from a single cell — count colonies to count cells", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Bacterial colonies", x: 190, y: 195, lx: 60, ly: 120, anchor: "start", accent: "amber", info: "Small, smooth, round dots — the classic bacterial look after 2 days of incubation." },
          { text: "Fungal colonies", x: 650, y: 170, lx: 740, ly: 120, anchor: "end", accent: "emerald", info: "Larger and spreading, with fuzzy edges made by thread-like hyphae reaching outward." },
          { text: "Nutrient agar", x: 250, y: 333, lx: 90, ly: 430, anchor: "start", accent: "sky", info: "The jelly-like growth medium. Agar stays solid at incubation temperature, so colonies form on its surface." },
          { text: "Petri dish", x: 590, y: 347, lx: 700, ly: 430, anchor: "end", accent: "cyan" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "A nutrient-agar plate turns invisible microbes into visible colonies, each growing from a single cell. Bacterial colonies stay small, smooth and round, while fungal colonies spread wider with fuzzy, thread-like edges. Comparing the two side by side trains the eye to tell them apart in the lab.",
    labels: [
      { id: "8d3-nutrient-agar", name: "Nutrient agar", description: "A jelly-like growth medium that feeds microbes. Agar stays solid at incubation temperatures, so colonies form on its surface." },
      { id: "8d3-bacterial-colony", name: "Bacterial colony", description: "A visible dot of millions of bacteria grown from one cell. Small, smooth and round colonies are the classic bacterial look." },
      { id: "8d3-fungal-colony", name: "Fungal colony", description: "A larger, spreading colony grown from fungal spores or hyphae. The fuzzy edge comes from thread-like hyphae reaching outward." },
      { id: "8d3-pure-culture", name: "Pure culture", description: "Colonies of a single microbe type, uncontaminated. Microbiologists pick one colony to start a pure culture for study." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-8-8d5",
    title: "Industrial Fermentation Plant",
    figureNo: "Fig 8.5",
    classLevel: 12,
    chapterNo: 8,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 580,
        shapes: [
          { kind: "text", x: 400, y: 28, text: "Stirred-tank fermenter", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // cooling jacket (outer dashed shell)
          { kind: "rect", x: 288, y: 170, w: 224, h: 280, rx: 34, fill: "none", stroke: "#38bdf8", strokeWidth: 1.5, dashed: true, opacity: 0.45 },
          { kind: "line", x1: 288, y1: 210, x2: 258, y2: 210, stroke: "#38bdf8", strokeWidth: 2, opacity: 0.6 },
          { kind: "line", x1: 512, y1: 410, x2: 542, y2: 410, stroke: "#38bdf8", strokeWidth: 2, opacity: 0.6 },
          // vessel body + head
          { kind: "rect", x: 310, y: 140, w: 180, h: 330, rx: 28, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "ellipse", cx: 400, cy: 140, rx: 90, ry: 16, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          // culture broth
          { kind: "rect", x: 324, y: 242, w: 152, h: 216, rx: 18, fill: "#fbbf24", opacity: 0.16 },
          { kind: "line", x1: 324, y1: 242, x2: 476, y2: 242, stroke: "#fbbf24", strokeWidth: 1.5, dashed: true, opacity: 0.7 },
          // baffles
          { kind: "rect", x: 336, y: 252, w: 8, h: 196, rx: 3, fill: "#1e3a5f" },
          { kind: "rect", x: 456, y: 252, w: 8, h: 196, rx: 3, fill: "#1e3a5f" },
          // air bubbles rising
          { kind: "circle", cx: 392, cy: 420, r: 4, fill: "#38bdf8", opacity: 0.65 },
          { kind: "circle", cx: 410, cy: 406, r: 3, fill: "#38bdf8", opacity: 0.65 },
          { kind: "circle", cx: 400, cy: 386, r: 4.5, fill: "#38bdf8", opacity: 0.65 },
          { kind: "circle", cx: 414, cy: 366, r: 3, fill: "#38bdf8", opacity: 0.65 },
          { kind: "circle", cx: 390, cy: 348, r: 2.5, fill: "#38bdf8", opacity: 0.65 },
          { kind: "circle", cx: 404, cy: 328, r: 3, fill: "#38bdf8", opacity: 0.65 },
          // sparger ring
          { kind: "rect", x: 366, y: 436, w: 68, h: 18, rx: 4, fill: "#132a4a", stroke: "#38bdf8", strokeWidth: 1.5 },
          { kind: "circle", cx: 378, cy: 445, r: 2, fill: "#38bdf8" },
          { kind: "circle", cx: 392, cy: 445, r: 2, fill: "#38bdf8" },
          { kind: "circle", cx: 406, cy: 445, r: 2, fill: "#38bdf8" },
          { kind: "circle", cx: 420, cy: 445, r: 2, fill: "#38bdf8" },
          // air inlet pipe
          { kind: "arrow", x1: 150, y1: 445, x2: 362, y2: 445, stroke: "#38bdf8", strokeWidth: 2, dashed: true },
          // medium inlet pipe
          { kind: "arrow", x1: 150, y1: 190, x2: 306, y2: 190, stroke: "#38bdf8", strokeWidth: 2, dashed: true },
          // impeller
          { kind: "ellipse", cx: 400, cy: 400, rx: 48, ry: 10, fill: "none", stroke: "#34d399", strokeWidth: 2 },
          { kind: "circle", cx: 400, cy: 400, r: 9, fill: "#0d1e38", stroke: "#34d399", strokeWidth: 2 },
          // shaft + motor
          { kind: "line", x1: 400, y1: 100, x2: 400, y2: 400, stroke: "#94a3b8", strokeWidth: 5 },
          { kind: "rect", x: 368, y: 64, w: 64, h: 36, rx: 6, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "rect", x: 384, y: 52, w: 32, h: 12, rx: 3, fill: "#1e3a5f" },
          // pH / temperature probe
          { kind: "line", x1: 462, y1: 140, x2: 462, y2: 280, stroke: "#64748b", strokeWidth: 3 },
          { kind: "rect", x: 454, y: 280, w: 16, h: 42, rx: 4, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          // harvest outlet
          { kind: "line", x1: 400, y1: 470, x2: 400, y2: 528, stroke: "#334155", strokeWidth: 3 },
          { kind: "path", d: "M400,492 l10,8 -10,8 -10,-8 z", fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          { kind: "arrow", x1: 400, y1: 508, x2: 400, y2: 528, stroke: "#a3e635", strokeWidth: 3 },
          { kind: "text", x: 400, y: 560, text: "Bubbles + stirring keep every microbe fed, oxygenated and at one temperature", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Agitator motor", x: 368, y: 82, lx: 190, ly: 82, anchor: "start", accent: "cyan", info: "Drives the stirrer shaft from the vessel head. Speed is tuned so mixing is thorough but shear does not damage the cells." },
          { text: "Impeller (agitator)", x: 448, y: 400, lx: 545, ly: 400, anchor: "start", accent: "emerald", info: "The spinning blade that stirs the culture broth, spreading nutrients, oxygen and heat evenly." },
          { text: "Air sparger", x: 380, y: 454, lx: 170, ly: 505, anchor: "start", accent: "sky", info: "A perforated ring at the base that releases fine sterile air bubbles for aerobic microbes." },
          { text: "Sterile air in", x: 200, y: 445, lx: 130, ly: 400, anchor: "start", accent: "sky" },
          { text: "Culture broth", x: 470, y: 300, lx: 560, ly: 300, anchor: "start", accent: "amber", info: "The sterile nutrient medium the microbes grow in. Product is harvested from it when fermentation finishes." },
          { text: "Cooling jacket", x: 512, y: 220, lx: 595, ly: 150, anchor: "start", accent: "sky", info: "A water-filled sleeve around the vessel that carries away the heat growing microbes generate." },
          { text: "Harvest outlet", x: 400, y: 516, lx: 460, ly: 556, anchor: "start", accent: "lime" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Industrial microbes work inside giant steel vessels called fermenters, where every condition is controlled. A motor-driven impeller stirs the broth for even mixing, while a sparger bubbles sterile air up from the bottom. The cooling jacket holds the temperature steady as microbes churn out products like enzymes, acids and ethanol.",
    labels: [
      { id: "8d5-impeller", name: "Impeller", description: "A spinning blade that stirs the culture broth. Even mixing keeps nutrients and oxygen reaching every microbe." },
      { id: "8d5-sparger", name: "Air sparger", description: "A ring at the vessel base that releases fine sterile air bubbles. Rising bubbles supply the oxygen aerobic microbes need." },
      { id: "8d5-jacket", name: "Cooling jacket", description: "A water-filled sleeve around the vessel wall. It carries away the heat that growing microbes generate." },
      { id: "8d5-broth", name: "Culture broth", description: "The sterile nutrient medium the microbes grow in. Product is harvested from this broth once fermentation finishes." },
      { id: "8d5-sterile-air", name: "Sterile air", description: "Filtered air, free of contaminating microbes. Only sterile air may enter, or the culture gets spoiled." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-8-8d6",
    title: "The Secondary Clarifier",
    figureNo: "Fig 8.6",
    classLevel: 12,
    chapterNo: 8,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 540,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "Secondary settling tank — side section", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // walkway + drive
          { kind: "line", x1: 180, y1: 104, x2: 620, y2: 104, stroke: "#475569", strokeWidth: 3 },
          { kind: "rect", x: 392, y: 86, w: 16, h: 40, rx: 3, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          // water zone
          { kind: "rect", x: 180, y: 120, w: 440, h: 120, fill: "#38bdf8", opacity: 0.12, stroke: "#334155", strokeWidth: 2 },
          // hopper bottom + sludge blanket
          { kind: "path", d: "M180,240 L330,350 L470,350 L620,240 Z", fill: "#fbbf24", opacity: 0.14, stroke: "#334155", strokeWidth: 2 },
          { kind: "path", d: "M228,272 L332,338 L468,338 L572,272 Z", fill: "#fbbf24", opacity: 0.22 },
          // feed well
          { kind: "rect", x: 372, y: 120, w: 56, h: 170, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          // influent
          { kind: "arrow", x1: 100, y1: 160, x2: 368, y2: 160, stroke: "#38bdf8", strokeWidth: 2.5 },
          // rake shaft + blades
          { kind: "line", x1: 400, y1: 126, x2: 400, y2: 322, stroke: "#94a3b8", strokeWidth: 4 },
          { kind: "line", x1: 400, y1: 322, x2: 302, y2: 340, stroke: "#94a3b8", strokeWidth: 4 },
          { kind: "line", x1: 400, y1: 322, x2: 498, y2: 340, stroke: "#94a3b8", strokeWidth: 4 },
          // rotation indicator
          { kind: "path", d: "M330,150 A90,90 0 0 1 470,150", fill: "none", stroke: "#34d399", strokeWidth: 1.8, dashed: true, opacity: 0.8 },
          // effluent overflow
          { kind: "arrow", x1: 620, y1: 140, x2: 700, y2: 140, stroke: "#a3e635", strokeWidth: 2.5 },
          // sludge outlet
          { kind: "line", x1: 400, y1: 350, x2: 400, y2: 412, stroke: "#334155", strokeWidth: 3 },
          { kind: "arrow", x1: 400, y1: 380, x2: 400, y2: 412, stroke: "#fb923c", strokeWidth: 3 },
          { kind: "text", x: 268, y: 146, text: "calm water zone", size: 11, anchor: "middle", color: "#64748b" },
          { kind: "text", x: 400, y: 300, text: "sludge blanket", size: 11, anchor: "middle", color: "#b98a3c" },
          { kind: "text", x: 400, y: 470, text: "Settled flocs are recycled to the aeration tank; excess sludge is wasted", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Influent (mixed liquor)", x: 220, y: 160, lx: 60, ly: 230, anchor: "start", accent: "sky", info: "Microbe-rich water arriving from the aeration tank. It must enter gently so flocs are not torn apart." },
          { text: "Feed well", x: 428, y: 200, lx: 620, ly: 200, anchor: "start", accent: "cyan", info: "A central cylinder that calms the incoming flow, letting solids settle instead of being stirred up." },
          { text: "Rotating scraper", x: 470, y: 330, lx: 620, ly: 330, anchor: "start", accent: "emerald", info: "A slow-moving arm that sweeps settled sludge toward the centre outlet, keeping the floor clear." },
          { text: "Clarified effluent", x: 660, y: 140, lx: 660, ly: 90, anchor: "middle", accent: "lime", info: "Clear water spilling over the rim weirs. Most solids have settled out, so it leaves the plant clean." },
          { text: "Settled sludge", x: 290, y: 312, lx: 70, ly: 390, anchor: "start", accent: "amber", info: "The blanket of floc-forming microbes on the tank floor — mostly recycled, the rest sent for digestion." },
          { text: "Sludge outlet", x: 400, y: 396, lx: 460, ly: 440, anchor: "start", accent: "orange" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "After aeration, the microbial soup flows gently into a wide circular tank where everything settles. A slowly rotating scraper pushes the settled sludge toward the centre outlet. Clear water rises, spills over the rim weirs, and leaves as treated effluent.",
    labels: [
      { id: "8d6-feed-well", name: "Feed well", description: "A central cylinder that calms the incoming flow. Still water lets solids settle instead of being stirred up." },
      { id: "8d6-scraper", name: "Rotating scraper", description: "A slow-moving arm that sweeps settled sludge to the centre. It keeps the tank bottom clear so settling never stops." },
      { id: "8d6-effluent", name: "Clarified effluent", description: "The clear water that overflows the tank rim. Most solids have settled out, so it looks clean." },
      { id: "8d6-sludge", name: "Activated sludge", description: "The settled mass of floc-forming microbes. Part of it is recycled to seed the next aeration cycle." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-8-8d7",
    title: "Anatomy of a Sewage Plant",
    figureNo: "Fig 8.7",
    classLevel: 12,
    chapterNo: 8,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 560,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "Sewage treatment plant — plan view", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // 1. bar screen
          { kind: "rect", x: 40, y: 180, w: 90, h: 60, rx: 4, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "line", x1: 56, y1: 186, x2: 56, y2: 234, stroke: "#475569", strokeWidth: 2 },
          { kind: "line", x1: 71, y1: 186, x2: 71, y2: 234, stroke: "#475569", strokeWidth: 2 },
          { kind: "line", x1: 86, y1: 186, x2: 86, y2: 234, stroke: "#475569", strokeWidth: 2 },
          { kind: "line", x1: 101, y1: 186, x2: 101, y2: 234, stroke: "#475569", strokeWidth: 2 },
          { kind: "line", x1: 116, y1: 186, x2: 116, y2: 234, stroke: "#475569", strokeWidth: 2 },
          // 2. grit chamber
          { kind: "rect", x: 150, y: 180, w: 100, h: 60, rx: 4, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "circle", cx: 172, cy: 200, r: 2.5, fill: "#94a3b8" },
          { kind: "circle", cx: 192, cy: 216, r: 2.5, fill: "#94a3b8" },
          { kind: "circle", cx: 212, cy: 204, r: 2.5, fill: "#94a3b8" },
          { kind: "circle", cx: 228, cy: 222, r: 2.5, fill: "#94a3b8" },
          { kind: "circle", cx: 182, cy: 226, r: 2.5, fill: "#94a3b8" },
          // 3. primary clarifier
          { kind: "rect", x: 270, y: 170, w: 120, h: 80, rx: 4, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "line", x1: 276, y1: 244, x2: 384, y2: 176, stroke: "#475569", strokeWidth: 2, dashed: true },
          // 4. aeration tank
          { kind: "rect", x: 410, y: 170, w: 150, h: 80, rx: 4, fill: "#38bdf8", opacity: 0.1, stroke: "#334155", strokeWidth: 2 },
          { kind: "circle", cx: 435, cy: 190, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 470, cy: 190, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 505, cy: 190, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 540, cy: 190, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 435, cy: 212, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 470, cy: 212, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 505, cy: 212, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 540, cy: 212, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 435, cy: 234, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 470, cy: 234, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 505, cy: 234, r: 4, fill: "#38bdf8", opacity: 0.7 },
          { kind: "circle", cx: 540, cy: 234, r: 4, fill: "#38bdf8", opacity: 0.7 },
          // 5. secondary clarifier
          { kind: "circle", cx: 660, cy: 210, r: 52, fill: "#38bdf8", opacity: 0.1, stroke: "#334155", strokeWidth: 2 },
          { kind: "circle", cx: 660, cy: 210, r: 34, fill: "none", stroke: "#334155", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 608, y1: 210, x2: 712, y2: 210, stroke: "#475569", strokeWidth: 3 },
          { kind: "circle", cx: 660, cy: 210, r: 6, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          // flow arrows between units
          { kind: "arrow", x1: 10, y1: 210, x2: 36, y2: 210, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "arrow", x1: 130, y1: 210, x2: 146, y2: 210, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "arrow", x1: 250, y1: 210, x2: 266, y2: 210, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "arrow", x1: 390, y1: 210, x2: 406, y2: 210, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "arrow", x1: 560, y1: 210, x2: 604, y2: 210, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "arrow", x1: 712, y1: 210, x2: 768, y2: 210, stroke: "#a3e635", strokeWidth: 2 },
          { kind: "text", x: 25, y: 274, text: "sewage in", size: 10, anchor: "middle", color: "#64748b" },
          { kind: "text", x: 741, y: 192, text: "treated effluent", size: 10, anchor: "middle", color: "#64748b" },
          // air blower line
          { kind: "arrow", x1: 485, y1: 322, x2: 485, y2: 254, stroke: "#38bdf8", strokeWidth: 2, dashed: true },
          { kind: "text", x: 485, y: 340, text: "air in", size: 10, anchor: "middle", color: "#64748b" },
          // sludge lines to digester
          { kind: "path", d: "M330,250 V330 H500 V372", fill: "none", stroke: "#fbbf24", strokeWidth: 2, dashed: true },
          { kind: "path", d: "M660,262 V330 H560 V372", fill: "none", stroke: "#fbbf24", strokeWidth: 2, dashed: true },
          // anaerobic sludge digester (egg)
          { kind: "path", d: "M410,445 C410,390 450,365 500,365 C550,365 590,390 590,445 C590,470 550,480 500,480 C450,480 410,470 410,445 Z", fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "path", d: "M432,438 C452,418 548,418 568,438", fill: "none", stroke: "#334155", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 500, y1: 365, x2: 500, y2: 342, stroke: "#475569", strokeWidth: 2 },
          { kind: "circle", cx: 500, cy: 334, r: 5, fill: "#fb923c" },
          // sludge to drying beds
          { kind: "path", d: "M590,440 H626", fill: "none", stroke: "#fbbf24", strokeWidth: 2, dashed: true },
          // drying beds
          { kind: "rect", x: 630, y: 390, w: 140, h: 90, rx: 4, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "line", x1: 676, y1: 390, x2: 676, y2: 480, stroke: "#1e3a5f", strokeWidth: 1.5 },
          { kind: "line", x1: 723, y1: 390, x2: 723, y2: 480, stroke: "#1e3a5f", strokeWidth: 1.5 },
          { kind: "line", x1: 630, y1: 435, x2: 770, y2: 435, stroke: "#1e3a5f", strokeWidth: 1.5 },
          { kind: "text", x: 400, y: 522, text: "Dashed amber lines = sludge flow · blue arrows = water flow", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Bar screen", x: 85, y: 180, lx: 85, ly: 138, anchor: "middle", accent: "cyan", info: "Metal bars that catch rags, plastics and large debris before they reach pumps and tanks." },
          { text: "Grit chamber", x: 200, y: 240, lx: 200, ly: 282, anchor: "middle", accent: "sky", info: "Slows the flow so sand and grit sink out — they would otherwise wear down machinery." },
          { text: "Primary clarifier", x: 330, y: 170, lx: 330, ly: 128, anchor: "middle", accent: "violet", info: "Settles the fine suspended solids that screens miss, before biological treatment begins." },
          { text: "Aeration tank", x: 485, y: 250, lx: 400, ly: 302, anchor: "middle", accent: "emerald", info: "Pumped air feeds floc-forming microbes that digest the dissolved organic waste." },
          { text: "Secondary clarifier", x: 660, y: 262, lx: 660, ly: 312, anchor: "middle", accent: "lime", info: "The microbial flocs settle here; clear water overflows as treated effluent." },
          { text: "Sludge digester", x: 440, y: 420, lx: 240, ly: 462, anchor: "start", accent: "amber", info: "A sealed tank where anaerobic bacteria break down settled sludge, releasing biogas." },
          { text: "Drying beds", x: 700, y: 390, lx: 700, ly: 350, anchor: "middle", accent: "orange" },
          { text: "Biogas", x: 500, y: 334, lx: 562, ly: 318, anchor: "start", accent: "rose", info: "Methane-rich gas from anaerobic digestion, burned for heat and electricity." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "A sewage treatment plant is a sequence of stages, each removing a different pollutant. Screens and grit chambers take out large solids, clarifiers settle the fine ones, and the aeration tank lets microbes digest dissolved waste. Sludge from settling is digested anaerobically, releasing useful biogas.",
    labels: [
      { id: "8d7-bar-screen", name: "Bar screen", description: "The first barrier — metal bars that catch rags, plastics and large debris. It protects pumps and tanks downstream." },
      { id: "8d7-aeration", name: "Aeration tank", description: "A basin where air is pumped into sewage. Oxygen-hungry microbes form flocs and digest the dissolved organic waste." },
      { id: "8d7-digester", name: "Sludge digester", description: "A sealed tank where anaerobic bacteria break down settled sludge. The process releases biogas, mostly methane." },
      { id: "8d7-biogas", name: "Biogas", description: "Methane-rich gas from anaerobic digestion. Plants burn it for heat and electricity, turning waste into energy." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-9-9d3",
    title: "Sorting DNA by Size",
    figureNo: "Fig 9.3",
    classLevel: 12,
    chapterNo: 9,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "Agarose gel electrophoresis", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // tank + buffer
          { kind: "rect", x: 100, y: 120, w: 600, h: 240, rx: 10, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "rect", x: 112, y: 132, w: 576, h: 216, rx: 6, fill: "#38bdf8", opacity: 0.07 },
          // gel slab
          { kind: "rect", x: 150, y: 170, w: 520, h: 150, rx: 4, fill: "#14294a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          // electrode wires
          { kind: "line", x1: 126, y1: 140, x2: 126, y2: 348, stroke: "#64748b", strokeWidth: 1.5, dashed: true },
          { kind: "line", x1: 674, y1: 140, x2: 674, y2: 348, stroke: "#64748b", strokeWidth: 1.5, dashed: true },
          // cathode / anode terminals
          { kind: "circle", cx: 126, cy: 245, r: 15, fill: "none", stroke: "#fb7185", strokeWidth: 2 },
          { kind: "text", x: 126, y: 251, text: "−", size: 16, anchor: "middle", color: "#fb7185", weight: 700 },
          { kind: "circle", cx: 674, cy: 245, r: 15, fill: "none", stroke: "#34d399", strokeWidth: 2 },
          { kind: "text", x: 674, y: 251, text: "+", size: 16, anchor: "middle", color: "#34d399", weight: 700 },
          // sample wells
          { kind: "rect", x: 176, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          { kind: "rect", x: 266, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          { kind: "rect", x: 356, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          { kind: "rect", x: 446, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          { kind: "rect", x: 536, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          { kind: "rect", x: 616, y: 176, w: 30, h: 18, rx: 2, fill: "#0d1e38", stroke: "#64748b", strokeWidth: 1.5 },
          // lane dividers
          { kind: "line", x1: 221, y1: 200, x2: 221, y2: 314, stroke: "#334155", strokeWidth: 1, dashed: true, opacity: 0.7 },
          { kind: "line", x1: 311, y1: 200, x2: 311, y2: 314, stroke: "#334155", strokeWidth: 1, dashed: true, opacity: 0.7 },
          { kind: "line", x1: 401, y1: 200, x2: 401, y2: 314, stroke: "#334155", strokeWidth: 1, dashed: true, opacity: 0.7 },
          { kind: "line", x1: 491, y1: 200, x2: 491, y2: 314, stroke: "#334155", strokeWidth: 1, dashed: true, opacity: 0.7 },
          { kind: "line", x1: 581, y1: 200, x2: 581, y2: 314, stroke: "#334155", strokeWidth: 1, dashed: true, opacity: 0.7 },
          // lane 1 — DNA ladder
          { kind: "rect", x: 169, y: 212, w: 44, h: 9, rx: 4, fill: "#22d3ee" },
          { kind: "rect", x: 169, y: 232, w: 44, h: 9, rx: 4, fill: "#22d3ee" },
          { kind: "rect", x: 169, y: 252, w: 44, h: 9, rx: 4, fill: "#22d3ee" },
          { kind: "rect", x: 169, y: 272, w: 44, h: 9, rx: 4, fill: "#22d3ee" },
          { kind: "rect", x: 169, y: 292, w: 44, h: 9, rx: 4, fill: "#22d3ee" },
          // lane 2
          { kind: "rect", x: 259, y: 222, w: 44, h: 9, rx: 4, fill: "#fb7185" },
          { kind: "rect", x: 259, y: 282, w: 44, h: 9, rx: 4, fill: "#fb7185" },
          // lane 3
          { kind: "rect", x: 349, y: 252, w: 44, h: 9, rx: 4, fill: "#fbbf24" },
          // lane 4
          { kind: "rect", x: 439, y: 218, w: 44, h: 9, rx: 4, fill: "#a78bfa" },
          { kind: "rect", x: 439, y: 262, w: 44, h: 9, rx: 4, fill: "#a78bfa" },
          // lane 5
          { kind: "rect", x: 529, y: 278, w: 44, h: 9, rx: 4, fill: "#34d399" },
          // migration arrow + note
          { kind: "arrow", x1: 200, y1: 400, x2: 600, y2: 400, stroke: "#38bdf8", strokeWidth: 2, dashed: true },
          { kind: "text", x: 400, y: 388, text: "migration toward anode (+)", size: 12, anchor: "middle", color: "#94a3b8" },
          { kind: "text", x: 400, y: 448, text: "DNA is negatively charged → smaller fragments run farther", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Gel tank", x: 100, y: 300, lx: 30, ly: 420, anchor: "start", accent: "cyan" },
          { text: "Agarose gel", x: 400, y: 320, lx: 400, ly: 478, anchor: "middle", accent: "sky", info: "A porous jelly whose microscopic pores sieve DNA — small fragments slip through faster than large ones." },
          { text: "Sample wells", x: 191, y: 176, lx: 120, ly: 70, anchor: "start", accent: "violet", info: "Pockets where DNA samples are loaded; each well feeds one lane of the gel." },
          { text: "DNA bands", x: 281, y: 222, lx: 430, ly: 70, anchor: "middle", accent: "rose", info: "Glowing bands where fragments of one size piled up. Each band = fragments of the same length." },
          { text: "Cathode (−)", x: 126, y: 230, lx: 30, ly: 190, anchor: "start", accent: "rose", info: "The negative electrode sits by the wells — DNA is loaded here because it moves away from the negative pole." },
          { text: "Anode (+)", x: 674, y: 230, lx: 770, ly: 190, anchor: "end", accent: "emerald", info: "The positive electrode at the far end. Negatively charged DNA migrates toward it." },
          { text: "DNA ladder", x: 191, y: 252, lx: 30, ly: 260, anchor: "start", accent: "amber", info: "Lane 1 holds fragments of known sizes — unknown bands are sized by matching against it." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Gel electrophoresis pulls DNA fragments through an agarose gel using an electric field. Because DNA is negatively charged, every fragment drifts toward the positive electrode. Small fragments slip through the gel pores faster, so bands separate neatly by size — with a ladder of known sizes for comparison.",
    labels: [
      { id: "9d3-agarose", name: "Agarose gel", description: "A porous jelly made from seaweed extract. Its microscopic pores act as a sieve that slows larger DNA fragments." },
      { id: "9d3-ladder", name: "DNA ladder", description: "A lane loaded with fragments of known sizes. Unknown bands are sized by matching them against the ladder." },
      { id: "9d3-cathode", name: "Cathode (−)", description: "The negative electrode, placed near the sample wells. DNA is loaded here because it will move away from the negative pole." },
      { id: "9d3-anode", name: "Anode (+)", description: "The positive electrode at the far end of the gel. Negatively charged DNA migrates toward it." },
      { id: "9d3-wells", name: "Sample wells", description: "Small pockets at the gel's edge where DNA samples are loaded. Each well feeds one lane of the gel." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-9-9d5",
    title: "Spooling Out Pure DNA",
    figureNo: "Fig 9.5",
    classLevel: 12,
    chapterNo: 9,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 540,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "DNA isolation — spooling", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // beaker
          { kind: "rect", x: 320, y: 110, w: 160, h: 330, rx: 14, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "ellipse", cx: 400, cy: 110, rx: 80, ry: 12, fill: "none", stroke: "#334155", strokeWidth: 2 },
          // ethanol layer
          { kind: "rect", x: 332, y: 122, w: 136, h: 128, rx: 8, fill: "#38bdf8", opacity: 0.22 },
          { kind: "text", x: 400, y: 152, text: "ice-cold", size: 11, anchor: "middle", color: "#7dd3fc" },
          { kind: "text", x: 400, y: 168, text: "ethanol", size: 11, anchor: "middle", color: "#7dd3fc" },
          // lysate layer
          { kind: "rect", x: 332, y: 262, w: 136, h: 166, rx: 10, fill: "#fbbf24", opacity: 0.2 },
          { kind: "text", x: 400, y: 330, text: "cell", size: 11, anchor: "middle", color: "#fcd34d" },
          { kind: "text", x: 400, y: 346, text: "lysate", size: 11, anchor: "middle", color: "#fcd34d" },
          // interface line
          { kind: "line", x1: 332, y1: 255, x2: 468, y2: 255, stroke: "#e2e8f0", strokeWidth: 1.5, dashed: true, opacity: 0.6 },
          // precipitated DNA strands at the interface
          { kind: "path", d: "M340,250 q12,-10 24,0 t24,0 t24,0 t24,0", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.6, opacity: 0.85 },
          { kind: "path", d: "M348,259 q10,8 22,0 t22,0 t22,0", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.4, opacity: 0.7 },
          { kind: "path", d: "M362,243 q10,-8 20,0 t20,0", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.4, opacity: 0.7 },
          // glass rod
          { kind: "line", x1: 520, y1: 60, x2: 398, y2: 302, stroke: "#94a3b8", strokeWidth: 7 },
          { kind: "circle", cx: 520, cy: 60, r: 15, fill: "#132a4a", stroke: "#2b4d7d", strokeWidth: 1.5 },
          // fibres wound around the rod
          { kind: "path", d: "M428,194 q11,-8 22,-2 t22,4", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.6, opacity: 0.9 },
          { kind: "path", d: "M414,220 q11,-8 22,-2 t22,4", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.6, opacity: 0.9 },
          { kind: "path", d: "M402,246 q11,-8 22,-2 t22,4", fill: "none", stroke: "#e2e8f0", strokeWidth: 1.6, opacity: 0.9 },
          { kind: "text", x: 400, y: 490, text: "Twirl the rod at the interface — long DNA fibres wind around it like thread", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Glass rod", x: 520, y: 60, lx: 600, ly: 50, anchor: "start", accent: "cyan", info: "A smooth rod twirled at the liquid interface; sticky DNA fibres wind around it and lift out clean." },
          { text: "Ice-cold ethanol", x: 468, y: 185, lx: 565, ly: 175, anchor: "start", accent: "sky", info: "Chilled alcohol layered over the lysate. DNA is insoluble in it, so the long molecules clump into visible fibres." },
          { text: "Precipitated DNA", x: 352, y: 250, lx: 140, ly: 250, anchor: "start", accent: "violet", info: "White, thread-like strands gathering at the alcohol boundary — DNA separating from everything dissolved." },
          { text: "Cell lysate", x: 468, y: 340, lx: 575, ly: 360, anchor: "start", accent: "amber", info: "The soup left after cells are broken open — DNA mixed with proteins, lipids and debris." },
          { text: "Wound DNA fibres", x: 436, y: 222, lx: 200, ly: 150, anchor: "start", accent: "emerald" },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "After breaking cells open, DNA can be pulled out of the lysate as visible threads. Ice-cold ethanol poured over the lysate makes DNA precipitate at the boundary between the layers. Twirling a glass rod at the interface winds the long DNA fibres around it like thread on a spool.",
    labels: [
      { id: "9d5-lysate", name: "Cell lysate", description: "The soup left after cells are broken open. It holds DNA mixed with proteins, lipids and other cell debris." },
      { id: "9d5-ethanol", name: "Ice-cold ethanol", description: "Chilled alcohol layered over the lysate. DNA is insoluble in it, so the long molecules clump into visible fibres." },
      { id: "9d5-precipitate", name: "Precipitated DNA", description: "White, thread-like strands of DNA at the alcohol boundary. Precipitation separates DNA from everything dissolved." },
      { id: "9d5-rod", name: "Glass rod", description: "A smooth rod twirled at the liquid interface. Sticky DNA fibres wind around it and can be lifted out clean." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-10-10d1",
    title: "The Boll That Fights Back",
    figureNo: "Fig 10.1",
    classLevel: 12,
    chapterNo: 10,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "Bt cotton resists the bollworm", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          { kind: "text", x: 240, y: 78, text: "non-Bt — damaged", size: 14, anchor: "middle", color: "#fbbf24" },
          { kind: "text", x: 560, y: 78, text: "Bt cotton — protected", size: 14, anchor: "middle", color: "#34d399" },
          { kind: "line", x1: 400, y1: 90, x2: 400, y2: 460, stroke: "#334155", strokeWidth: 1.5, dashed: true },
          // LEFT — damaged boll
          { kind: "line", x1: 240, y1: 330, x2: 240, y2: 430, stroke: "#64748b", strokeWidth: 5 },
          { kind: "path", d: "M240,300 C210,270 180,262 150,272 C178,296 208,306 240,312 Z", fill: "#b98a3c", opacity: 0.55 },
          { kind: "path", d: "M240,300 C270,270 300,262 330,272 C302,296 272,306 240,312 Z", fill: "#b98a3c", opacity: 0.55 },
          { kind: "path", d: "M240,312 C225,342 225,367 235,387 C250,367 252,342 248,320 Z", fill: "#b98a3c", opacity: 0.55 },
          { kind: "ellipse", cx: 240, cy: 235, rx: 68, ry: 78, fill: "#8b93a3", opacity: 0.55, stroke: "#334155", strokeWidth: 2 },
          { kind: "path", d: "M240,163 C235,200 245,240 238,302", fill: "none", stroke: "#1e293b", strokeWidth: 4 },
          { kind: "circle", cx: 215, cy: 210, r: 9, fill: "#0f172a" },
          { kind: "circle", cx: 262, cy: 250, r: 7, fill: "#0f172a" },
          { kind: "circle", cx: 230, cy: 285, r: 8, fill: "#0f172a" },
          // bollworm
          { kind: "circle", cx: 292, cy: 262, r: 10, fill: "#fb7185", opacity: 0.85 },
          { kind: "circle", cx: 310, cy: 268, r: 10, fill: "#fb7185", opacity: 0.85 },
          { kind: "circle", cx: 328, cy: 264, r: 10, fill: "#fb7185", opacity: 0.85 },
          { kind: "circle", cx: 344, cy: 270, r: 9, fill: "#fb7185", opacity: 0.85 },
          { kind: "circle", cx: 282, cy: 257, r: 8, fill: "#f43f5e" },
          { kind: "circle", cx: 272, cy: 256, r: 6, fill: "#0f172a" },
          // RIGHT — healthy Bt boll
          { kind: "line", x1: 560, y1: 330, x2: 560, y2: 430, stroke: "#34d399", strokeWidth: 5, opacity: 0.7 },
          { kind: "path", d: "M560,300 C530,270 500,262 470,272 C498,296 528,306 560,312 Z", fill: "#34d399", opacity: 0.6 },
          { kind: "path", d: "M560,300 C590,270 620,262 650,272 C622,296 592,306 560,312 Z", fill: "#34d399", opacity: 0.6 },
          { kind: "path", d: "M560,312 C545,342 545,367 555,387 C570,367 572,342 568,320 Z", fill: "#34d399", opacity: 0.6 },
          { kind: "ellipse", cx: 560, cy: 235, rx: 68, ry: 78, fill: "#f1f5f9", opacity: 0.92, stroke: "#cbd5e1", strokeWidth: 2 },
          { kind: "path", d: "M530,200 q15,10 30,0", fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5 },
          { kind: "path", d: "M545,250 q15,10 30,0", fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5 },
          { kind: "path", d: "M530,290 q15,8 28,2", fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5 },
          // cry shield badge
          { kind: "path", d: "M655,118 l20,9 v15 c0,15 -10,24 -20,29 c-10,-5 -20,-14 -20,-29 v-15 z", fill: "#22d3ee", opacity: 0.22, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "text", x: 655, y: 153, text: "cry", size: 11, anchor: "middle", color: "#22d3ee", weight: 700 },
          { kind: "line", x1: 608, y1: 162, x2: 618, y2: 152, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 700, y1: 182, x2: 710, y2: 174, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "text", x: 400, y: 490, text: "The cry gene makes every Bt cell toxic to the bollworm — no spray needed", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Damaged boll", x: 175, y: 235, lx: 40, ly: 160, anchor: "start", accent: "amber", info: "A boll chewed open by feeding larvae — torn fibre and rot make it worthless at harvest." },
          { text: "Bollworm feeding", x: 320, y: 264, lx: 330, ly: 112, anchor: "middle", accent: "rose", info: "The caterpillar pest that bores into cotton bolls, once fought with heavy insecticide sprays." },
          { text: "Healthy Bt boll", x: 625, y: 235, lx: 740, ly: 160, anchor: "end", accent: "emerald", info: "Clean, unopened fibre — the worm's first bites of Cry protein poisoned it before it could feed." },
          { text: "Cry protein shield", x: 655, y: 140, lx: 740, ly: 80, anchor: "end", accent: "cyan", info: "The cry gene from Bacillus thuringiensis makes an insecticidal protein in every plant cell." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Bt cotton carries a bacterial gene that makes the Cry protein, a toxin deadly to bollworm larvae. On ordinary cotton the worm chews through the boll, but on Bt cotton the first bites poison the pest. The result is a clean, healthy boll without heavy spraying.",
    labels: [
      { id: "10d1-bollworm", name: "Bollworm", description: "The caterpillar pest that bores into cotton bolls. Its feeding ruins the fibre and was once fought with heavy insecticides." },
      { id: "10d1-cry", name: "Cry protein", description: "An insecticidal protein from the bacterium Bacillus thuringiensis. It punches holes in the pest's gut but is harmless to humans." },
      { id: "10d1-bt", name: "Bt cotton", description: "Cotton engineered with the cry gene from B. thuringiensis. Every cell of the plant, including the boll, makes the toxin." },
      { id: "10d1-damaged", name: "Damaged boll", description: "A boll chewed open by feeding larvae. Torn fibre and rot make it worthless at harvest." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-12-10-10d2",
    title: "Silencing the Nematode",
    figureNo: "Fig 10.2",
    classLevel: 12,
    chapterNo: 10,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 560,
        shapes: [
          { kind: "text", x: 400, y: 40, text: "RNAi protects roots from nematodes", size: 15, weight: 700, anchor: "middle", color: "#e2e8f0" },
          // ground line
          { kind: "line", x1: 40, y1: 250, x2: 360, y2: 250, stroke: "#475569", strokeWidth: 2 },
          // shoot
          { kind: "line", x1: 250, y1: 110, x2: 250, y2: 250, stroke: "#a3e635", strokeWidth: 6 },
          { kind: "path", d: "M250,150 C215,130 185,128 165,145 C192,158 220,162 250,162 Z", fill: "#34d399", opacity: 0.65 },
          { kind: "path", d: "M250,150 C285,130 315,128 335,145 C308,158 280,162 250,162 Z", fill: "#34d399", opacity: 0.65 },
          // root system
          { kind: "path", d: "M250,250 C248,320 252,400 250,490", fill: "none", stroke: "#b8a888", strokeWidth: 4 },
          { kind: "path", d: "M250,300 C210,330 180,360 150,400", fill: "none", stroke: "#b8a888", strokeWidth: 3 },
          { kind: "path", d: "M250,330 C290,360 320,390 348,430", fill: "none", stroke: "#b8a888", strokeWidth: 3 },
          { kind: "path", d: "M250,380 C220,410 205,440 195,475", fill: "none", stroke: "#b8a888", strokeWidth: 3 },
          { kind: "path", d: "M250,420 C280,440 300,460 315,485", fill: "none", stroke: "#b8a888", strokeWidth: 3 },
          // nematode on a root
          { kind: "path", d: "M298,408 q12,-10 24,-2 q12,8 26,2", fill: "none", stroke: "#fb7185", strokeWidth: 5 },
          { kind: "circle", cx: 298, cy: 408, r: 4, fill: "#fb7185" },
          { kind: "line", x1: 298, y1: 408, x2: 288, y2: 400, stroke: "#fb7185", strokeWidth: 2 },
          // callout to magnifier
          { kind: "line", x1: 330, y1: 420, x2: 470, y2: 380, stroke: "#64748b", strokeWidth: 1.5, dashed: true },
          // magnifier inset
          { kind: "circle", cx: 600, cy: 380, r: 115, fill: "#0d1e38", stroke: "#334155", strokeWidth: 2 },
          { kind: "text", x: 600, y: 512, text: "root cell — enlarged", size: 11, anchor: "middle", color: "#64748b" },
          // root cell
          { kind: "circle", cx: 600, cy: 380, r: 58, fill: "#fbbf24", opacity: 0.12, stroke: "#fbbf24", strokeWidth: 1.5, dashed: true },
          // nematode stylet blocked
          { kind: "line", x1: 688, y1: 300, x2: 648, y2: 342, stroke: "#fb7185", strokeWidth: 4 },
          { kind: "path", d: "M648,342 l-12,-4 l8,12 z", fill: "#fb7185" },
          { kind: "circle", cx: 648, cy: 342, r: 11, fill: "none", stroke: "#fb7185", strokeWidth: 2 },
          { kind: "line", x1: 640, y1: 350, x2: 656, y2: 334, stroke: "#fb7185", strokeWidth: 2 },
          // dsRNA hairpin
          { kind: "path", d: "M562,352 v34 M576,352 v34 M562,352 q7,-12 14,0", fill: "none", stroke: "#22d3ee", strokeWidth: 2.5 },
          { kind: "text", x: 569, y: 404, text: "dsRNA", size: 10, anchor: "middle", color: "#22d3ee" },
          // chopped mRNA
          { kind: "line", x1: 612, y1: 404, x2: 636, y2: 404, stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "line", x1: 620, y1: 398, x2: 630, y2: 410, stroke: "#fb7185", strokeWidth: 2 },
          { kind: "line", x1: 630, y1: 398, x2: 620, y2: 410, stroke: "#fb7185", strokeWidth: 2 },
          { kind: "line", x1: 612, y1: 420, x2: 632, y2: 420, stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "line", x1: 617, y1: 414, x2: 627, y2: 426, stroke: "#fb7185", strokeWidth: 2 },
          { kind: "line", x1: 627, y1: 414, x2: 617, y2: 426, stroke: "#fb7185", strokeWidth: 2 },
          { kind: "text", x: 624, y: 442, text: "mRNA cut", size: 10, anchor: "middle", color: "#a78bfa" },
          { kind: "text", x: 200, y: 525, text: "The plant makes dsRNA — the worm's feeding genes go silent", size: 12, anchor: "middle", color: "#94a3b8" },
        ],
        labels: [
          { text: "Transgenic root", x: 250, y: 400, lx: 90, ly: 340, anchor: "start", accent: "lime", info: "Roots of the engineered plant make double-stranded RNA matching a vital nematode gene." },
          { text: "Root-knot nematode", x: 322, y: 412, lx: 90, ly: 505, anchor: "start", accent: "rose", info: "Meloidogyne — a soil worm that invades roots and forms galls, stunting the plant." },
          { text: "dsRNA hairpin", x: 569, y: 352, lx: 430, ly: 250, anchor: "start", accent: "cyan", info: "The double-stranded RNA trigger. It starts the silencing machinery inside the feeding worm." },
          { text: "mRNA silenced", x: 624, y: 412, lx: 730, ly: 270, anchor: "end", accent: "violet", info: "The nematode's messenger RNA is chopped up before it can make protein — the target gene goes silent." },
          { text: "Feeding blocked", x: 648, y: 342, lx: 740, ly: 450, anchor: "end", accent: "amber", info: "Without the silenced gene's protein, the worm cannot feed — and starves." },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Root-knot nematodes attack plant roots, but RNA interference can disarm them. The plant is engineered to make double-stranded RNA matching a vital nematode gene. When the worm feeds, the dsRNA triggers destruction of its own messenger RNA — the gene goes silent and the parasite starves.",
    labels: [
      { id: "10d2-nematode", name: "Root-knot nematode", description: "A tiny soil worm (Meloidogyne) that invades roots and forms galls. Infested plants wilt and yield poorly." },
      { id: "10d2-dsrna", name: "dsRNA", description: "Double-stranded RNA made by the transgenic plant. It is the trigger that starts the gene-silencing machinery." },
      { id: "10d2-rnai", name: "RNA interference", description: "A natural defence that destroys messenger RNA matching a dsRNA trigger. Here it is aimed at the nematode's essential genes." },
      { id: "10d2-silencing", name: "mRNA silencing", description: "Destruction of the nematode's messenger RNA before it can make protein. Without the protein, the worm cannot feed or survive." },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
];
