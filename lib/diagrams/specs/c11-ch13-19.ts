import type { FigureDef } from "@/lib/data";

export const figures: FigureDef[] = [
  {
    id: "dgm-11-13-13d1",
    title: "From Seed to Seedling: Bean Germination Stages",
    figureNo: "Fig 13.1",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "timeline",
      spec: {
        events: [
          {
            tag: "Stage A",
            title: "Dry, dormant seed",
            detail: "The bean seed rests with minimal metabolic activity, waiting for water.",
            accent: "amber",
          },
          {
            tag: "Stage B",
            title: "Water uptake begins",
            detail: "Imbibition swells the seed; the coat softens and dormant enzymes reactivate.",
            accent: "sky",
          },
          {
            tag: "Stage C",
            title: "Radicle breaks out",
            detail: "The embryonic root is the first structure to pierce the seed coat and anchor down.",
            accent: "emerald",
          },
          {
            tag: "Stage D",
            title: "Hypocotyl hook rises",
            detail: "The curved stem arches upward, dragging the cotyledons through the soil.",
            accent: "lime",
          },
          {
            tag: "Stage E",
            title: "Cotyledons unfold",
            detail: "Seed leaves spread flat and the first true leaves begin to expand.",
            accent: "cyan",
          },
          {
            tag: "Stage F",
            title: "Seedling established",
            detail: "Photosynthesis takes over as the root system branches and grows.",
            accent: "violet",
          },
        ],
      },
    },
    status: "ready",
    vizType: "timeline",
    description:
      "Bean germination unfolds as an ordered relay: the radicle always leads, anchoring the plant before the shoot commits to emerging. The hypocotyl's hook is a protection strategy — the delicate tip stays tucked while the arch bulldozes through soil. Once the cotyledons spread, the plant switches from seed reserves to sunlight.",
    labels: [
      {
        id: "germ-radicle",
        name: "Radicle",
        description:
          "The embryonic root that emerges first, anchoring the seedling and starting water uptake.",
      },
      {
        id: "germ-hypocotyl",
        name: "Hypocotyl",
        description:
          "The stem segment below the cotyledons that arches upward to lift the shoot clear of the soil.",
      },
      {
        id: "germ-cotyledon",
        name: "Cotyledon",
        description:
          "The seed leaf — in beans it carries stored food that fuels early growth before photosynthesis starts.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d10",
    title: "The Auxin Tip Experiment on Oat Coleoptiles",
    figureNo: "Fig 13.10",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          { kind: "circle", cx: 40, cy: 70, r: 20, fill: "#fbbf24", opacity: 0.85 },
          { kind: "text", x: 40, y: 118, text: "Light", size: 15, color: "#fbbf24", anchor: "middle" },
          // Panel A — bent coleoptile, tip intact
          {
            kind: "path", d: "M 92 400 L 92 270 Q 92 225 68 195",
            stroke: "#34d399", strokeWidth: 13, fill: "none",
          },
          { kind: "ellipse", cx: 64, cy: 182, rx: 13, ry: 18, fill: "#fbbf24", opacity: 0.55, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "text", x: 88, y: 445, text: "A · Tip intact", size: 16, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 88, y: 468, text: "bends toward light", size: 13, color: "#94a3b8", anchor: "middle" },
          // Panel B — tip removed, stays straight
          { kind: "path", d: "M 252 400 L 252 210", stroke: "#34d399", strokeWidth: 13, fill: "none", opacity: 0.45 },
          { kind: "line", x1: 240, y1: 210, x2: 264, y2: 210, stroke: "#fb7185", strokeWidth: 4 },
          { kind: "text", x: 252, y: 445, text: "B · Tip removed", size: 16, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 252, y: 468, text: "no bending", size: 13, color: "#94a3b8", anchor: "middle" },
          // Panel C — opaque cap, stays straight
          { kind: "path", d: "M 416 400 L 416 210", stroke: "#34d399", strokeWidth: 13, fill: "none", opacity: 0.45 },
          { kind: "rect", x: 402, y: 178, w: 28, h: 40, rx: 6, fill: "#1e293b", stroke: "#64748b", strokeWidth: 2 },
          { kind: "text", x: 416, y: 445, text: "C · Opaque cap", size: 16, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 416, y: 468, text: "no bending", size: 13, color: "#94a3b8", anchor: "middle" },
          // Panel D — agar block with auxin offset, bends away
          {
            kind: "path", d: "M 580 400 L 580 275 Q 580 235 556 210",
            stroke: "#34d399", strokeWidth: 13, fill: "none",
          },
          { kind: "rect", x: 586, y: 178, w: 26, h: 34, rx: 4, fill: "#fbbf24", opacity: 0.6, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "text", x: 599, y: 445, text: "D · Agar + auxin", size: 16, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 599, y: 468, text: "bends away from block", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Auxin made in tip", x: 64, y: 182, lx: 88, ly: 60,
            anchor: "middle", accent: "amber",
            info: "The tip is the site of auxin synthesis; shading or removing it changes the growth response.",
          },
          {
            text: "Impermeable cap blocks signal", x: 416, y: 198, lx: 416, ly: 130,
            anchor: "middle", accent: "rose",
            info: "An opaque, sealed cap over the tip stops the light signal reaching the auxin source.",
          },
          {
            text: "Agar block replaces tip", x: 599, y: 195, lx: 640, ly: 60,
            anchor: "middle", accent: "sky",
            info: "An agar block loaded with auxin, placed off-centre, mimics the tip and restores bending.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "This classic experiment proves the bending signal comes from the coleoptile tip. Remove the tip and the seedling goes blind to light; replace it with an agar block soaked in auxin and bending returns — even with no tip at all. The growth hormone, not the light itself, is what the cells below are listening to.",
    labels: [
      {
        id: "aux-coleoptile",
        name: "Coleoptile",
        description:
          "The protective sheath over a young grass shoot — the tissue used in these bending experiments.",
      },
      {
        id: "aux-auxin",
        name: "Auxin",
        description:
          "The growth hormone made in the tip; uneven distribution makes one side elongate faster, causing bending.",
      },
      {
        id: "aux-phototropism",
        name: "Phototropism",
        description:
          "Growth toward light. Auxin migrates to the shaded side, which elongates more and curves the shoot toward the source.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d11",
    title: "Apical Dominance: One Bud Rules the Branches",
    figureNo: "Fig 13.11",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          // Left plant — apical bud present
          { kind: "line", x1: 220, y1: 420, x2: 220, y2: 130, stroke: "#34d399", strokeWidth: 8 },
          { kind: "ellipse", cx: 220, cy: 115, rx: 14, ry: 20, fill: "#fbbf24", opacity: 0.7, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "ellipse", cx: 200, cy: 260, rx: 8, ry: 11, fill: "#64748b", opacity: 0.6 },
          { kind: "ellipse", cx: 240, cy: 260, rx: 8, ry: 11, fill: "#64748b", opacity: 0.6 },
          { kind: "ellipse", cx: 200, cy: 330, rx: 8, ry: 11, fill: "#64748b", opacity: 0.6 },
          { kind: "ellipse", cx: 240, cy: 330, rx: 8, ry: 11, fill: "#64748b", opacity: 0.6 },
          { kind: "line", x1: 205, y1: 130, x2: 205, y2: 400, stroke: "#fbbf24", strokeWidth: 2, dashed: true, opacity: 0.7 },
          { kind: "text", x: 220, y: 465, text: "Apical bud present", size: 17, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 220, y: 488, text: "lateral buds stay dormant", size: 13, color: "#94a3b8", anchor: "middle" },
          // Right plant — apical bud removed
          { kind: "line", x1: 580, y1: 420, x2: 580, y2: 200, stroke: "#34d399", strokeWidth: 8 },
          { kind: "line", x1: 572, y1: 200, x2: 588, y2: 200, stroke: "#fb7185", strokeWidth: 4 },
          { kind: "path", d: "M 580 300 L 505 230", stroke: "#34d399", strokeWidth: 6, fill: "none" },
          { kind: "path", d: "M 580 300 L 655 230", stroke: "#34d399", strokeWidth: 6, fill: "none" },
          { kind: "ellipse", cx: 500, cy: 222, rx: 10, ry: 14, fill: "#a3e635", opacity: 0.7 },
          { kind: "ellipse", cx: 660, cy: 222, rx: 10, ry: 14, fill: "#a3e635", opacity: 0.7 },
          { kind: "path", d: "M 580 360 L 520 305", stroke: "#34d399", strokeWidth: 6, fill: "none" },
          { kind: "path", d: "M 580 360 L 640 305", stroke: "#34d399", strokeWidth: 6, fill: "none" },
          { kind: "text", x: 580, y: 465, text: "Apical bud removed", size: 17, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 580, y: 488, text: "lateral buds sprout", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Apical bud", x: 220, y: 115, lx: 220, ly: 55,
            anchor: "middle", accent: "amber",
            info: "The terminal bud whose auxin output suppresses the buds below it.",
          },
          {
            text: "Auxin flows downward", x: 205, y: 265, lx: 120, ly: 210,
            anchor: "end", accent: "amber",
            info: "Auxin transported down the stem inhibits lateral bud outgrowth.",
          },
          {
            text: "Dormant lateral buds", x: 240, y: 260, lx: 330, ly: 230,
            anchor: "start", accent: "sky",
          },
          {
            text: "Cut releases inhibition", x: 580, y: 200, lx: 580, ly: 120,
            anchor: "middle", accent: "rose",
            info: "Decapitation removes the auxin source, so lateral buds activate and branch.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "A plant with its top bud intact grows tall and unbranched, while a decapitated plant bursts into side branches. The difference is auxin streaming down from the apex, holding every lateral bud in check. Gardeners exploit this daily — pinching the tip is the fastest way to make a plant bushy.",
    labels: [
      {
        id: "apical-dominance",
        name: "Apical dominance",
        description:
          "Suppression of lateral buds by the shoot apex, keeping the plant growing upward rather than outward.",
      },
      {
        id: "apical-auxin",
        name: "Auxin inhibition",
        description:
          "Auxin from the apical bud travels down the stem and keeps lateral buds dormant until the apex is removed.",
      },
      {
        id: "apical-decapitation",
        name: "Decapitation effect",
        description:
          "Cutting off the shoot tip removes the auxin supply, releasing lateral buds to grow into branches.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d2",
    title: "Where Growth Lives: The Three Meristems",
    figureNo: "Fig 13.2",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          // shoot
          { kind: "line", x1: 400, y1: 300, x2: 400, y2: 120, stroke: "#34d399", strokeWidth: 9 },
          { kind: "circle", cx: 400, cy: 105, r: 13, fill: "#a78bfa", opacity: 0.8 },
          {
            kind: "path", d: "M 400 180 Q 340 150 300 170 Q 350 200 400 190",
            fill: "#34d399", opacity: 0.45, stroke: "#34d399", strokeWidth: 1.5,
          },
          {
            kind: "path", d: "M 400 230 Q 460 200 500 220 Q 450 250 400 240",
            fill: "#34d399", opacity: 0.45, stroke: "#34d399", strokeWidth: 1.5,
          },
          // cambium band along stem
          { kind: "rect", x: 392, y: 190, w: 16, h: 100, rx: 8, fill: "#38bdf8", opacity: 0.5 },
          // root
          { kind: "path", d: "M 400 300 L 400 400 Q 400 425 385 435 L 415 435 Q 400 425 400 400", fill: "none", stroke: "#34d399", strokeWidth: 9 },
          { kind: "circle", cx: 400, cy: 408, r: 11, fill: "#a78bfa", opacity: 0.8 },
          { kind: "path", d: "M 385 432 L 415 432 L 400 458 Z", fill: "#fb923c", opacity: 0.55 },
          // soil line
          { kind: "line", x1: 240, y1: 302, x2: 560, y2: 302, stroke: "#64748b", strokeWidth: 2, dashed: true },
          { kind: "text", x: 245, y: 292, text: "soil surface", size: 13, color: "#64748b", anchor: "start" },
        ],
        labels: [
          {
            text: "Shoot apical meristem", x: 400, y: 105, lx: 620, ly: 80,
            anchor: "start", accent: "violet",
            info: "Dividing cells at the shoot tip that produce new leaves, buds and stem length.",
          },
          {
            text: "Lateral meristem (cambium)", x: 408, y: 240, lx: 620, ly: 250,
            anchor: "start", accent: "sky",
            info: "A cylinder of dividing cells that adds girth — secondary growth in thickness.",
          },
          {
            text: "Root apical meristem", x: 400, y: 408, lx: 180, ly: 430,
            anchor: "end", accent: "violet",
            info: "Dividing cells at the root tip that extend the root deeper into the soil.",
          },
          {
            text: "Root cap shields the tip", x: 400, y: 446, lx: 180, ly: 480,
            anchor: "end", accent: "orange",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Plants grow only where meristems are — everything else is finished tissue. The two apical meristems stretch the plant longer at top and bottom, while the cambium ring quietly adds girth along the stem. This map explains why pruning the tip redirects growth and why a tree trunk thickens year after year.",
    labels: [
      {
        id: "mer-apical",
        name: "Apical meristem",
        description:
          "Growth zones at root and shoot tips responsible for primary growth in length.",
      },
      {
        id: "mer-lateral",
        name: "Lateral meristem",
        description:
          "The vascular cambium — a dividing cylinder that drives secondary growth in thickness.",
      },
      {
        id: "mer-rootcap",
        name: "Root cap",
        description:
          "A protective thimble of cells covering the root apical meristem as it pushes through soil.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d3",
    title: "Pinpointing Growth: Zones of a Root Tip",
    figureNo: "Fig 13.3",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          // root body tapering to tip
          {
            kind: "path",
            d: "M 360 130 L 360 330 Q 360 400 400 450 Q 440 400 440 330 L 440 130",
            fill: "#34d399", opacity: 0.12, stroke: "#34d399", strokeWidth: 2.5,
          },
          // root cap
          { kind: "path", d: "M 382 432 L 418 432 L 400 460 Z", fill: "#fb923c", opacity: 0.55 },
          // parallel marker lines — spacing widens in the elongation zone
          { kind: "line", x1: 360, y1: 165, x2: 440, y2: 165, stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "line", x1: 360, y1: 195, x2: 440, y2: 195, stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "line", x1: 360, y1: 235, x2: 440, y2: 235, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 360, y1: 285, x2: 440, y2: 285, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 362, y1: 345, x2: 438, y2: 345, stroke: "#e2e8f0", strokeWidth: 1.5 },
          { kind: "line", x1: 368, y1: 395, x2: 432, y2: 395, stroke: "#e2e8f0", strokeWidth: 1.5 },
          // zone brackets on the left
          { kind: "line", x1: 330, y1: 140, x2: 330, y2: 210, stroke: "#64748b", strokeWidth: 2 },
          { kind: "line", x1: 330, y1: 215, x2: 330, y2: 310, stroke: "#22d3ee", strokeWidth: 2 },
          { kind: "line", x1: 330, y1: 315, x2: 330, y2: 405, stroke: "#64748b", strokeWidth: 2 },
          { kind: "text", x: 400, y: 70, text: "Parallel lines marked on a young root", size: 17, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 400, y: 95, text: "— after growth, lines are farthest apart where cells elongated", size: 13, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Zone of maturation", x: 330, y: 175, lx: 150, ly: 175,
            anchor: "end", accent: "emerald",
            info: "Cells are fully differentiated; root hairs absorb water here. Little length increase.",
          },
          {
            text: "Zone of elongation", x: 330, y: 262, lx: 150, ly: 262,
            anchor: "end", accent: "cyan",
            info: "Cells enlarge rapidly — the marked lines spread apart most in this zone.",
          },
          {
            text: "Zone of cell division", x: 330, y: 360, lx: 150, ly: 360,
            anchor: "end", accent: "violet",
            info: "Meristematic cells divide continuously just behind the root cap.",
          },
          {
            text: "Root cap", x: 400, y: 446, lx: 640, ly: 470,
            anchor: "start", accent: "orange",
            info: "Protects the dividing tip as it pushes through the soil.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Mark evenly spaced lines on a young root and wait — only the lines just behind the tip drift apart. That simple observation reveals where growth actually happens: the elongation zone, where cells swell in length. The dividing cells near the cap supply new cells, but elongation does the stretching.",
    labels: [
      {
        id: "root-division",
        name: "Zone of cell division",
        description:
          "The meristematic region near the tip where new root cells are continuously produced.",
      },
      {
        id: "root-elongation",
        name: "Zone of elongation",
        description:
          "The region where cells rapidly increase in length — the true engine of root extension.",
      },
      {
        id: "root-maturation",
        name: "Zone of maturation",
        description:
          "Differentiated cells, including root hairs, specialised for absorption rather than growth.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d4",
    title: "Arithmetic vs Geometric Growth",
    figureNo: "Fig 13.4",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          { kind: "text", x: 400, y: 45, text: "Two ways living tissue increases", size: 18, color: "#e2e8f0", anchor: "middle" },
          // Arithmetic row — steady increments
          { kind: "text", x: 120, y: 120, text: "Arithmetic", size: 16, color: "#fbbf24", anchor: "middle" },
          { kind: "text", x: 120, y: 142, text: "+ constant amount", size: 12, color: "#94a3b8", anchor: "middle" },
          { kind: "circle", cx: 260, cy: 130, r: 12, fill: "#fbbf24", opacity: 0.35, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "circle", cx: 360, cy: 130, r: 18, fill: "#fbbf24", opacity: 0.35, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "circle", cx: 470, cy: 130, r: 24, fill: "#fbbf24", opacity: 0.35, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "circle", cx: 590, cy: 130, r: 30, fill: "#fbbf24", opacity: 0.35, stroke: "#fbbf24", strokeWidth: 1.5 },
          { kind: "arrow", x1: 700, y1: 130, x2: 745, y2: 130, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "text", x: 722, y: 118, text: "linear", size: 13, color: "#fbbf24", anchor: "middle" },
          // Geometric row — doubling cells
          { kind: "text", x: 120, y: 300, text: "Geometric", size: 16, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 120, y: 322, text: "cells keep doubling", size: 12, color: "#94a3b8", anchor: "middle" },
          { kind: "circle", cx: 250, cy: 300, r: 14, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "text", x: 250, y: 345, text: "1", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "circle", cx: 330, cy: 293, r: 13, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 360, cy: 307, r: 13, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "text", x: 345, y: 345, text: "2", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "circle", cx: 430, cy: 290, r: 12, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 460, cy: 290, r: 12, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 430, cy: 312, r: 12, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 460, cy: 312, r: 12, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "text", x: 445, y: 345, text: "4", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "circle", cx: 540, cy: 288, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 566, cy: 288, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 540, cy: 312, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 566, cy: 312, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 610, cy: 288, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 636, cy: 288, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 610, cy: 312, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "circle", cx: 636, cy: 312, r: 11, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "text", x: 588, y: 345, text: "8", size: 14, color: "#94a3b8", anchor: "middle" },
          { kind: "arrow", x1: 690, y1: 300, x2: 745, y2: 300, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 717, y: 288, text: "exponential", size: 13, color: "#34d399", anchor: "middle" },
          { kind: "text", x: 400, y: 440, text: "Many plant organs begin geometrically, then slow — tracing the sigmoid curve.", size: 14, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Arithmetic: + constant", x: 590, y: 130, lx: 590, ly: 210,
            anchor: "middle", accent: "amber",
            info: "One daughter cell keeps dividing while the other differentiates — growth adds a fixed amount each round.",
          },
          {
            text: "Geometric: doubling", x: 588, y: 300, lx: 588, ly: 395,
            anchor: "middle", accent: "emerald",
            info: "Every cell divides, so numbers double each generation — 1, 2, 4, 8, 16…",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "In arithmetic growth only one cell of each pair keeps dividing, so tissue increases by a steady trickle. In geometric growth every cell divides, and numbers explode exponentially. Real organs usually start geometric and then run out of steam — which is exactly why the growth curve bends into an S.",
    labels: [
      {
        id: "growth-arithmetic",
        name: "Arithmetic growth",
        description:
          "Following mitosis, only one daughter cell divides; growth increases at a constant rate, plotted as a straight line.",
      },
      {
        id: "growth-geometric",
        name: "Geometric growth",
        description:
          "Both daughter cells keep dividing, so cell number doubles each round — growth accelerates exponentially.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d5",
    title: "The Straight Line of Arithmetic Growth",
    figureNo: "Fig 13.5",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Time",
        yLabel: "Length",
        xMin: 0,
        xMax: 10,
        yMin: 0,
        yMax: 11,
        series: [
          {
            name: "Arithmetic growth",
            color: "#fbbf24",
            points: [[0, 0], [2, 2], [4, 4], [6, 6], [8, 8], [10, 10]],
          },
        ],
        note: "Schematic trace — a constant growth rate plots as a straight line.",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "When a root or shoot elongates at a steady rate, length plotted against time is a perfect straight line. The slope of that line is the growth rate itself. It is the simplest growth pattern in biology — and the baseline every other curve is compared against.",
    labels: [
      {
        id: "lin-slope",
        name: "Constant slope",
        description:
          "Equal time intervals add equal length, so the trace is straight and the growth rate never changes.",
      },
      {
        id: "lin-rate",
        name: "Growth rate",
        description:
          "Length added per unit time — read directly as the steepness of the line.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d6",
    title: "The S-Curve of a Growing Organ",
    figureNo: "Fig 13.6",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Time",
        yLabel: "Growth (size)",
        xMin: 0,
        xMax: 10,
        yMin: 0,
        yMax: 11,
        series: [
          {
            name: "Sigmoid growth curve",
            color: "#34d399",
            points: [[0, 0.01], [1, 0.03], [2, 0.11], [3, 0.47], [4, 1.82], [5, 5], [6, 8.18], [7, 9.53], [8, 9.89], [9, 9.98], [10, 10]],
          },
        ],
        annotations: [
          { x: 1.2, y: 2.6, text: "Lag phase — slow start" },
          { x: 4.2, y: 6.8, text: "Log phase — rapid growth" },
          { x: 8.3, y: 9.4, text: "Stationary phase" },
        ],
        note: "Schematic trace — the sigmoid curve of a cell, tissue or organ over time.",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Real growth is never a straight line: it starts slow while cells settle in, accelerates through a rapid log phase, then levels off as the organ reaches its final size. The result is the famous S-curve seen in everything from a growing leaf to a bacterial culture. Each phase reflects what the cells are doing inside.",
    labels: [
      {
        id: "sig-lag",
        name: "Lag phase",
        description:
          "Slow initial growth as cells prepare; the curve barely rises off the axis.",
      },
      {
        id: "sig-log",
        name: "Log phase",
        description:
          "Exponential growth — the steep middle of the S where size increases fastest.",
      },
      {
        id: "sig-stationary",
        name: "Stationary phase",
        description:
          "Growth plateaus as the organ reaches maturity and the curve flattens.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d7",
    title: "Same Absolute Gain, Very Different Relative Growth",
    figureNo: "Fig 13.7",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          { kind: "text", x: 400, y: 45, text: "Two leaves, same absolute growth — different story", size: 18, color: "#e2e8f0", anchor: "middle" },
          // Leaf A
          { kind: "ellipse", cx: 220, cy: 220, rx: 70, ry: 95, fill: "#34d399", opacity: 0.18, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "line", x1: 220, y1: 130, x2: 220, y2: 310, stroke: "#34d399", strokeWidth: 2, opacity: 0.6 },
          { kind: "arrow", x1: 130, y1: 360, x2: 310, y2: 360, stroke: "#fbbf24", strokeWidth: 3 },
          { kind: "text", x: 220, y: 400, text: "Leaf A: 5 → 10 cm²", size: 17, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 220, y: 424, text: "absolute +5 · relative +100%", size: 13, color: "#fbbf24", anchor: "middle" },
          // Leaf B
          { kind: "ellipse", cx: 580, cy: 220, rx: 105, ry: 140, fill: "#38bdf8", opacity: 0.14, stroke: "#38bdf8", strokeWidth: 2.5 },
          { kind: "line", x1: 580, y1: 85, x2: 580, y2: 355, stroke: "#38bdf8", strokeWidth: 2, opacity: 0.6 },
          { kind: "arrow", x1: 470, y1: 395, x2: 690, y2: 395, stroke: "#fbbf24", strokeWidth: 3 },
          { kind: "text", x: 580, y: 435, text: "Leaf B: 50 → 55 cm²", size: 17, color: "#e2e8f0", anchor: "middle" },
          { kind: "text", x: 580, y: 459, text: "absolute +5 · relative +10%", size: 13, color: "#38bdf8", anchor: "middle" },
          { kind: "text", x: 400, y: 500, text: "Absolute growth is identical; relative growth reveals the small leaf is working far harder.", size: 14, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Absolute growth rate", x: 220, y: 360, lx: 220, ly: 90,
            anchor: "middle", accent: "amber",
            info: "Net increase per unit time — here 5 cm² per day for both leaves.",
          },
          {
            text: "Relative growth rate", x: 580, y: 395, lx: 580, ly: 90,
            anchor: "middle", accent: "sky",
            info: "Increase expressed per unit of starting size — 100% vs 10% per day.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Two leaves can add exactly the same area yet tell opposite stories. Absolute growth counts the raw square centimetres; relative growth divides by where the leaf started. The tiny leaf doubled itself while the big one barely noticed — relative rate is what lets you compare growth fairly across sizes.",
    labels: [
      {
        id: "rate-absolute",
        name: "Absolute growth rate",
        description:
          "The raw increase in size per unit time, e.g. 5 cm² per day — identical for both leaves here.",
      },
      {
        id: "rate-relative",
        name: "Relative growth rate",
        description:
          "Growth expressed as a fraction of initial size, e.g. 100% vs 10% per day — the fair comparison.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d8",
    title: "A Cell's Journey to Maturity",
    figureNo: "Fig 13.8",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "timeline",
      spec: {
        events: [
          {
            tag: "Division",
            title: "Meristematic cell",
            detail: "Small, thin-walled, dense cytoplasm with a large nucleus — built to divide.",
            accent: "violet",
          },
          {
            tag: "Enlargement",
            title: "Cell enlargement",
            detail: "The vacuole swells, the wall stretches, and the cell grows dramatically in size.",
            accent: "cyan",
          },
          {
            tag: "Specialisation",
            title: "Cell differentiation",
            detail: "Walls thicken or thin, plastids develop — structure begins to match the future job.",
            accent: "emerald",
          },
          {
            tag: "Maturity",
            title: "Mature, functional cell",
            detail: "Fully specialised and working: xylem vessel, guard cell, or whatever the tissue needs.",
            accent: "amber",
          },
        ],
      },
    },
    status: "ready",
    vizType: "timeline",
    description:
      "Every plant cell passes through the same three acts: divide, enlarge, specialise. The sequence runs continuously behind every growing tip, turning identical meristematic cells into the full cast of tissues. Differentiation is the quiet step that makes a root hair different from a vessel.",
    labels: [
      {
        id: "celldiv-meristem",
        name: "Meristematic cell",
        description:
          "An undifferentiated dividing cell — thin wall, dense cytoplasm, prominent nucleus.",
      },
      {
        id: "celldiv-enlarge",
        name: "Cell enlargement",
        description:
          "Vacuole-driven expansion that increases cell volume far more than division alone.",
      },
      {
        id: "celldiv-differ",
        name: "Differentiation",
        description:
          "Structural and chemical changes that commit a cell to a specific tissue role.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-13-13d9",
    title: "One Plant, Different Leaves: Heterophylly",
    figureNo: "Fig 13.9",
    classLevel: 11,
    chapterNo: 13,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 520,
        shapes: [
          // Larkspur panel
          { kind: "text", x: 200, y: 50, text: "Larkspur", size: 19, color: "#e2e8f0", anchor: "middle" },
          {
            kind: "path",
            d: "M 130 180 L 150 140 L 160 175 L 185 135 L 190 175 L 215 145 L 215 185 L 240 160 L 235 200 L 200 215 L 160 215 L 135 200 Z",
            fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5,
          },
          { kind: "text", x: 200, y: 250, text: "aerial — finely dissected", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "ellipse", cx: 200, cy: 360, rx: 55, ry: 75, fill: "#34d399", opacity: 0.35, stroke: "#34d399", strokeWidth: 1.5 },
          { kind: "text", x: 200, y: 465, text: "terrestrial — simple leaf", size: 13, color: "#94a3b8", anchor: "middle" },
          // Buttercup panel
          { kind: "text", x: 600, y: 50, text: "Buttercup", size: 19, color: "#e2e8f0", anchor: "middle" },
          {
            kind: "path",
            d: "M 530 180 L 545 145 L 555 180 L 575 140 L 580 180 L 605 150 L 605 190 L 625 170 L 620 205 L 590 220 L 555 220 L 535 205 Z",
            fill: "#38bdf8", opacity: 0.35, stroke: "#38bdf8", strokeWidth: 1.5,
          },
          { kind: "text", x: 600, y: 250, text: "submerged — finely dissected", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "ellipse", cx: 600, cy: 360, rx: 70, ry: 60, fill: "#38bdf8", opacity: 0.3, stroke: "#38bdf8", strokeWidth: 1.5 },
          { kind: "text", x: 600, y: 465, text: "aerial — broad leaf", size: 13, color: "#94a3b8", anchor: "middle" },
          { kind: "text", x: 400, y: 510, text: "Same genome, different environment — leaves reshape themselves to fit.", size: 14, color: "#94a3b8", anchor: "middle" },
        ],
        labels: [
          {
            text: "Finely dissected leaves", x: 200, y: 180, lx: 400, ly: 130,
            anchor: "middle", accent: "emerald",
            info: "Feathery, divided leaves of larkspur's aerial shoots — and of buttercup underwater.",
          },
          {
            text: "Simple broad leaves", x: 600, y: 360, lx: 400, ly: 300,
            anchor: "middle", accent: "sky",
            info: "Larkspur's ground leaves and buttercup's aerial leaves stay broad and simple.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Heterophylly is plasticity you can see: one genome producing strikingly different leaves. Larkspur switches between feathery aerial leaves and simple ground leaves, while buttercup grows dissected leaves underwater and broad ones in air. The environment — not new genes — redraws the leaf.",
    labels: [
      {
        id: "hetero-def",
        name: "Heterophylly",
        description:
          "The occurrence of different leaf forms on the same plant in response to environmental conditions.",
      },
      {
        id: "hetero-plasticity",
        name: "Phenotypic plasticity",
        description:
          "One genotype expressing different forms — development responding to light, water or habitat.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-14-14d5",
    title: "How Haemoglobin Loads and Unloads Oxygen",
    figureNo: "Fig 14.5",
    classLevel: 11,
    chapterNo: 14,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "PO₂ (mmHg)",
        yLabel: "Hb saturation (%)",
        xMin: 0,
        xMax: 100,
        yMin: 0,
        yMax: 100,
        series: [
          {
            name: "O₂–haemoglobin dissociation curve",
            color: "#fb7185",
            points: [[10, 10], [20, 32], [30, 57], [40, 75], [50, 84], [60, 90], [70, 93], [80, 95], [90, 96.5], [100, 97.5]],
          },
        ],
        annotations: [
          { x: 26, y: 50, text: "P50 ≈ 26 mmHg" },
          { x: 62, y: 78, text: "Tissues unload O₂ here" },
        ],
        note: "Schematic trace — haemoglobin's affinity for O₂ under normal blood conditions.",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Haemoglobin's oxygen affinity is sigmoid by design. In the lungs, high oxygen pressure drives the curve onto its flat top, so blood leaves nearly saturated. In the tissues, a small pressure drop slides down the steep middle, dumping large amounts of oxygen exactly where it is needed. P50 marks the pressure at which haemoglobin is half-saturated.",
    labels: [
      {
        id: "hb-p50",
        name: "P50",
        description:
          "The partial pressure of oxygen at which haemoglobin is 50% saturated — a standard measure of O₂ affinity.",
      },
      {
        id: "hb-sigmoid",
        name: "Sigmoid shape",
        description:
          "Cooperative binding: each O₂ captured makes the next easier, producing the steep middle of the curve.",
      },
      {
        id: "hb-unload",
        name: "Tissue unloading",
        description:
          "In respiring tissues the steep region lets a modest PO₂ fall release a large share of carried oxygen.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-15-15d3",
    title: "Reading a Heartbeat: The Standard ECG Trace",
    figureNo: "Fig 15.3",
    classLevel: 11,
    chapterNo: 15,
    modelKey: null,
    diagram: {
      template: "graph",
      spec: {
        kind: "line",
        xLabel: "Time",
        yLabel: "Voltage (mV)",
        xMin: 0,
        xMax: 100,
        yMin: -1,
        yMax: 4,
        series: [
          {
            name: "ECG — one cardiac cycle",
            color: "#34d399",
            points: [
              [0, 0], [8, 0], [12, 0.1], [14, 0.35], [16, 0.5], [18, 0.35], [20, 0.1], [22, 0],
              [28, 0], [30, -0.05], [32, -0.3], [33.5, 0.4], [35, 3], [36.5, 0.4], [38, -0.6],
              [40, -0.1], [42, 0], [52, 0], [56, 0.2], [58, 0.6], [60, 0.8], [62, 0.6],
              [64, 0.2], [68, 0], [100, 0],
            ],
          },
        ],
        annotations: [
          { x: 16, y: 0.95, text: "P: atrial depolarisation" },
          { x: 35, y: 3.45, text: "QRS: ventricles depolarise" },
          { x: 60, y: 1.25, text: "T: ventricular repolarisation" },
        ],
        note: "Schematic trace — one cardiac cycle; atrial repolarisation hides inside the QRS.",
      },
    },
    status: "ready",
    vizType: "graph",
    description:
      "Every heartbeat writes the same electrical signature. The small P wave is the atria firing, the tall QRS spike is the ventricles contracting with far more muscle, and the T wave is the ventricles resetting. Doctors read this single trace to time each chamber — a whole cardiac cycle compressed into one line.",
    labels: [
      {
        id: "ecg-p",
        name: "P wave",
        description:
          "Electrical depolarisation of the atria, which then contract and push blood into the ventricles.",
      },
      {
        id: "ecg-qrs",
        name: "QRS complex",
        description:
          "Depolarisation of the ventricles — the tall spike that triggers the main pumping contraction.",
      },
      {
        id: "ecg-t",
        name: "T wave",
        description:
          "Repolarisation of the ventricles as they relax and prepare for the next beat.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-15-15d4",
    title: "Two Loops, One Heart: Double Circulation",
    figureNo: "Fig 15.4",
    classLevel: 11,
    chapterNo: 15,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 540,
        shapes: [
          // heart
          { kind: "ellipse", cx: 400, cy: 270, rx: 72, ry: 82, fill: "#fb7185", opacity: 0.12, stroke: "#fb7185", strokeWidth: 2.5 },
          { kind: "line", x1: 400, y1: 195, x2: 400, y2: 345, stroke: "#fb7185", strokeWidth: 1.5, dashed: true },
          { kind: "text", x: 352, y: 275, text: "Right", size: 15, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 448, y: 275, text: "Left", size: 15, color: "#22d3ee", anchor: "middle" },
          // lungs
          { kind: "ellipse", cx: 165, cy: 140, rx: 70, ry: 55, fill: "#38bdf8", opacity: 0.16, stroke: "#38bdf8", strokeWidth: 2.5 },
          { kind: "ellipse", cx: 635, cy: 140, rx: 70, ry: 55, fill: "#38bdf8", opacity: 0.16, stroke: "#38bdf8", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 80, text: "LUNGS", size: 16, color: "#38bdf8", anchor: "middle" },
          // body
          { kind: "rect", x: 300, y: 440, w: 200, h: 62, rx: 12, fill: "#34d399", opacity: 0.14, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 477, text: "BODY TISSUES", size: 16, color: "#34d399", anchor: "middle" },
          // pulmonary loop — deoxygenated (rose) to lungs, oxygenated (cyan) back
          { kind: "arrow", x1: 345, y1: 205, x2: 235, y2: 150, stroke: "#fb7185", strokeWidth: 3 },
          { kind: "arrow", x1: 565, y1: 150, x2: 455, y2: 205, stroke: "#22d3ee", strokeWidth: 3 },
          // systemic loop — oxygenated (cyan) to body, deoxygenated (rose) back
          { kind: "arrow", x1: 455, y1: 340, x2: 455, y2: 435, stroke: "#22d3ee", strokeWidth: 3 },
          { kind: "arrow", x1: 345, y1: 435, x2: 345, y2: 340, stroke: "#fb7185", strokeWidth: 3 },
          // legend
          { kind: "line", x1: 60, y1: 500, x2: 90, y2: 500, stroke: "#22d3ee", strokeWidth: 3 },
          { kind: "text", x: 100, y: 505, text: "oxygen-rich", size: 13, color: "#94a3b8", anchor: "start" },
          { kind: "line", x1: 220, y1: 500, x2: 250, y2: 500, stroke: "#fb7185", strokeWidth: 3 },
          { kind: "text", x: 260, y: 505, text: "oxygen-poor", size: 13, color: "#94a3b8", anchor: "start" },
        ],
        labels: [
          {
            text: "Pulmonary circulation", x: 400, y: 150, lx: 400, ly: 110,
            anchor: "middle", accent: "sky",
            info: "Right heart → lungs → left heart: blood picks up oxygen and drops off CO₂.",
          },
          {
            text: "Systemic circulation", x: 400, y: 390, lx: 400, ly: 415,
            anchor: "middle", accent: "emerald",
            info: "Left heart → body → right heart: oxygen delivered to tissues, CO₂ collected.",
          },
          {
            text: "Right heart pumps to lungs", x: 345, y: 250, lx: 150, ly: 300,
            anchor: "end", accent: "rose",
          },
          {
            text: "Left heart pumps to body", x: 455, y: 300, lx: 650, ly: 330,
            anchor: "start", accent: "cyan",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "Blood makes two separate journeys through one heart. The right side drives the short pulmonary loop to the lungs for gas exchange, while the left side drives the long systemic loop to every tissue. Keeping the two streams apart lets mammals sustain the high blood pressure active bodies demand.",
    labels: [
      {
        id: "dc-pulmonary",
        name: "Pulmonary circulation",
        description:
          "The short loop: right ventricle to lungs and back to the left atrium for oxygenation.",
      },
      {
        id: "dc-systemic",
        name: "Systemic circulation",
        description:
          "The long loop: left ventricle to the body tissues and back to the right atrium.",
      },
      {
        id: "dc-double",
        name: "Double circulation",
        description:
          "Blood passes through the heart twice per circuit — the hallmark of birds and mammals.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
  {
    id: "dgm-11-19-19d2",
    title: "Command Chain: Hypothalamus–Pituitary Control",
    figureNo: "Fig 19.2",
    classLevel: 11,
    chapterNo: 19,
    modelKey: null,
    diagram: {
      template: "schematic",
      spec: {
        width: 800,
        height: 540,
        shapes: [
          // hypothalamus
          { kind: "rect", x: 290, y: 60, w: 220, h: 66, rx: 12, fill: "#fbbf24", opacity: 0.16, stroke: "#fbbf24", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 99, text: "HYPOTHALAMUS", size: 17, color: "#fbbf24", anchor: "middle" },
          // pituitary halves
          { kind: "rect", x: 290, y: 190, w: 105, h: 78, rx: 10, fill: "#fb7185", opacity: 0.16, stroke: "#fb7185", strokeWidth: 2.5 },
          { kind: "text", x: 342, y: 226, text: "Posterior", size: 14, color: "#fb7185", anchor: "middle" },
          { kind: "text", x: 342, y: 246, text: "(neurohypophysis)", size: 11, color: "#94a3b8", anchor: "middle" },
          { kind: "rect", x: 405, y: 190, w: 105, h: 78, rx: 10, fill: "#a78bfa", opacity: 0.16, stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "text", x: 457, y: 226, text: "Anterior", size: 14, color: "#a78bfa", anchor: "middle" },
          { kind: "text", x: 457, y: 246, text: "(adenohypophysis)", size: 11, color: "#94a3b8", anchor: "middle" },
          // nerve fibres to posterior (solid)
          { kind: "arrow", x1: 355, y1: 126, x2: 335, y2: 185, stroke: "#fb7185", strokeWidth: 2.5 },
          // portal vessels to anterior (dashed)
          { kind: "arrow", x1: 445, y1: 126, x2: 445, y2: 185, stroke: "#a78bfa", strokeWidth: 2.5, dashed: true },
          { kind: "arrow", x1: 475, y1: 126, x2: 470, y2: 185, stroke: "#a78bfa", strokeWidth: 2.5, dashed: true },
          // target glands
          { kind: "rect", x: 170, y: 380, w: 140, h: 56, rx: 10, fill: "#34d399", opacity: 0.14, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 240, y: 414, text: "Thyroid", size: 15, color: "#34d399", anchor: "middle" },
          { kind: "rect", x: 330, y: 380, w: 140, h: 56, rx: 10, fill: "#34d399", opacity: 0.14, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 400, y: 414, text: "Adrenal cortex", size: 15, color: "#34d399", anchor: "middle" },
          { kind: "rect", x: 490, y: 380, w: 140, h: 56, rx: 10, fill: "#34d399", opacity: 0.14, stroke: "#34d399", strokeWidth: 2.5 },
          { kind: "text", x: 560, y: 414, text: "Gonads", size: 15, color: "#34d399", anchor: "middle" },
          // anterior -> glands
          { kind: "arrow", x1: 430, y1: 268, x2: 260, y2: 375, stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "arrow", x1: 457, y1: 268, x2: 410, y2: 375, stroke: "#a78bfa", strokeWidth: 2.5 },
          { kind: "arrow", x1: 480, y1: 268, x2: 545, y2: 375, stroke: "#a78bfa", strokeWidth: 2.5 },
          // feedback dashed back up
          {
            kind: "path", d: "M 650 408 L 700 408 L 700 93 L 515 93",
            stroke: "#64748b", strokeWidth: 2, dashed: true, fill: "none",
          },
          { kind: "text", x: 712, y: 250, text: "negative feedback", size: 13, color: "#64748b", anchor: "middle" },
        ],
        labels: [
          {
            text: "Releasing hormones", x: 458, y: 155, lx: 660, ly: 155,
            anchor: "start", accent: "violet",
            info: "Hypothalamic hormones travel via portal vessels to command the anterior pituitary.",
          },
          {
            text: "Nerve fibres to posterior lobe", x: 345, y: 155, lx: 130, ly: 155,
            anchor: "end", accent: "rose",
            info: "Hormones made in the hypothalamus are released directly from the posterior pituitary.",
          },
          {
            text: "Tropic hormones → glands", x: 430, y: 310, lx: 130, ly: 330,
            anchor: "end", accent: "violet",
            info: "Anterior pituitary hormones (TSH, ACTH, gonadotropins) drive the target glands.",
          },
          {
            text: "Target glands", x: 400, y: 408, lx: 400, ly: 480,
            anchor: "middle", accent: "emerald",
            info: "Thyroid, adrenal cortex and gonads — whose hormones feed back on the brain.",
          },
        ],
      },
    },
    status: "ready",
    vizType: "diagram-2d",
    description:
      "The hypothalamus sits at the top of the endocrine command chain, controlling the pituitary through two different channels: direct nerve fibres to the posterior lobe and a private portal blood supply to the anterior lobe. The anterior pituitary then relays orders to the thyroid, adrenals and gonads, whose hormones loop back to shut the system down — a feedback circuit that keeps hormone levels steady.",
    labels: [
      {
        id: "hp-portal",
        name: "Hypophyseal portal vessels",
        description:
          "The dedicated blood link carrying releasing hormones from hypothalamus to anterior pituitary.",
      },
      {
        id: "hp-neurohypo",
        name: "Neurohypophysis",
        description:
          "The posterior pituitary — releases hypothalamic hormones (ADH, oxytocin) via nerve fibres.",
      },
      {
        id: "hp-adenohypo",
        name: "Adenohypophysis",
        description:
          "The anterior pituitary — secretes tropic hormones that regulate the thyroid, adrenals and gonads.",
      },
      {
        id: "hp-feedback",
        name: "Negative feedback",
        description:
          "Gland hormones act back on the hypothalamus and pituitary to switch further secretion off.",
      },
    ],
    explode: false,
    cutaway: false,
    camera: [0, 0, 7],
  },
];
