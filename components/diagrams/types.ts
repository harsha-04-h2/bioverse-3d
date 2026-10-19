/**
 * Data-driven SVG diagram specs for BioVerse 3D.
 *
 * Every template takes a single JSON-serialisable `spec` prop and renders a
 * premium dark-lab diagram. Authors: keep every label SHORT (see max lengths
 * in each interface) — SVG has no text wrapping.
 */

export type DiagramTemplate =
  | "cycle"
  | "flow"
  | "schematic"
  | "pedigree"
  | "punnett"
  | "graph"
  | "timeline";

/* ------------------------------------------------------------------ */
/* Shared                                                               */
/* ------------------------------------------------------------------ */

/** Category accent colours — pick from these, don't invent new ones. */
export const ACCENTS = {
  cyan: "#22d3ee",
  sky: "#38bdf8",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  orange: "#fb923c",
  lime: "#a3e635",
} as const;
export type AccentKey = keyof typeof ACCENTS;

/* ------------------------------------------------------------------ */
/* cycle — circular processes (nutrient cycles, life cycles)            */
/* ------------------------------------------------------------------ */

export interface CycleNode {
  /** short label, max ~22 chars */
  label: string;
  /** optional second line, max ~30 chars */
  sub?: string;
  /** longer explanation shown when the node is clicked */
  info?: string;
  accent?: AccentKey;
}

export interface CycleSpec {
  nodes: CycleNode[]; // 3–8 nodes, auto-placed around a circle
  /** arrows override the default sequential ring; labels drawn on arcs */
  arrows?: { from: number; to: number; label?: string }[];
  centerLabel?: string;
  centerSub?: string;
}

/* ------------------------------------------------------------------ */
/* flow — linear multi-step processes (experiments, pathways)          */
/* ------------------------------------------------------------------ */

export interface FlowStep {
  /** step title, max ~26 chars */
  title: string;
  /** one-line detail, max ~60 chars */
  detail?: string;
  /** explanation shown when the step is clicked */
  info?: string;
  accent?: AccentKey;
}

export interface FlowSpec {
  steps: FlowStep[]; // 2–8 steps
  direction?: "horizontal" | "vertical";
  /** labels drawn on the arrows between steps (length = steps-1) */
  arrowLabels?: string[];
}

/* ------------------------------------------------------------------ */
/* schematic — annotated textbook-style schematic with leader lines    */
/* ------------------------------------------------------------------ */

export type SchematicShape =
  | {
      kind: "rect";
      x: number; y: number; w: number; h: number; rx?: number;
      fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; dashed?: boolean;
    }
  | {
      kind: "ellipse";
      cx: number; cy: number; rx: number; ry: number;
      fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; dashed?: boolean;
    }
  | {
      kind: "circle";
      cx: number; cy: number; r: number;
      fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; dashed?: boolean;
    }
  | {
      kind: "line" | "arrow";
      x1: number; y1: number; x2: number; y2: number;
      stroke?: string; strokeWidth?: number; dashed?: boolean; opacity?: number;
    }
  | {
      kind: "path";
      d: string;
      fill?: string; stroke?: string; strokeWidth?: number; dashed?: boolean; opacity?: number;
    }
  | {
      kind: "text";
      x: number; y: number; text: string;
      size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end";
    };

export interface SchematicLabel {
  /** label text, max ~28 chars */
  text: string;
  /** point on the structure the leader points at */
  x: number; y: number;
  /** where the label text sits */
  lx: number; ly: number;
  anchor?: "start" | "middle" | "end";
  accent?: AccentKey;
  /** explanation shown when the label is clicked */
  info?: string;
}

export interface SchematicSpec {
  width: number; // viewBox width, e.g. 800
  height: number; // viewBox height, e.g. 500
  shapes: SchematicShape[];
  labels: SchematicLabel[];
}

/* ------------------------------------------------------------------ */
/* pedigree — standard human pedigree charts                            */
/* ------------------------------------------------------------------ */

export interface PedigreePerson {
  id: string;
  sex: "m" | "f";
  affected: boolean;
  /** carrier (dot) or heterozygous hint */
  carrier?: boolean;
  deceased?: boolean;
  /** viewBox coordinates */
  x: number; y: number;
  /** label under symbol, max ~14 chars */
  label?: string;
  info?: string;
}

export interface PedigreeMating {
  a: string; // person id
  b: string; // person id
  children: string[]; // person ids, left → right
}

export interface PedigreeSpec {
  width: number;
  height: number;
  persons: PedigreePerson[];
  matings: PedigreeMating[];
  /** generation labels, e.g. ["I", "II", "III"] drawn at given y positions */
  generations?: { label: string; y: number }[];
  note?: string; // max ~120 chars, shown under chart
}

/* ------------------------------------------------------------------ */
/* punnett — interactive Punnett squares                                */
/* ------------------------------------------------------------------ */

export interface PunnettSpec {
  /** e.g. "Seed shape" */
  trait: string;
  /** gamete labels along the top, e.g. ["R", "r"] or ["RY","Ry","rY","ry"] */
  gametesTop: string[];
  /** gamete labels along the left */
  gametesLeft: string[];
  /** dominant allele symbol, e.g. "R" */
  dominant?: string;
  /** what the dominant phenotype looks like, max ~40 chars */
  dominantPhenotype?: string;
  /** what the recessive phenotype looks like, max ~40 chars */
  recessivePhenotype?: string;
  /** optional expected ratio note, e.g. "Phenotypic ratio 3 : 1" */
  ratioNote?: string;
}

/* ------------------------------------------------------------------ */
/* graph — line/bar data visualisations                                */
/* ------------------------------------------------------------------ */

export interface GraphSeries {
  name: string;
  color: string; // hex
  points: [number, number][];
  dashed?: boolean;
}

export interface GraphAnnotation {
  x: number; y: number;
  text: string; // max ~30 chars
}

export interface GraphSpec {
  kind: "line" | "bar";
  xLabel: string;
  yLabel: string;
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  series: GraphSeries[]; // line kind
  bars?: { label: string; value: number; color?: string }[]; // bar kind
  annotations?: GraphAnnotation[];
  /** optional note under the graph, max ~140 chars */
  note?: string;
}

/* ------------------------------------------------------------------ */
/* timeline — experiment / stage sequences                              */
/* ------------------------------------------------------------------ */

export interface TimelineEvent {
  /** event title, max ~34 chars */
  title: string;
  /** one-line detail, max ~90 chars */
  detail?: string;
  /** tag chip, e.g. a year or stage name, max ~16 chars */
  tag?: string;
  accent?: AccentKey;
  info?: string;
}

export interface TimelineSpec {
  events: TimelineEvent[]; // 2–10 events
}

/* ------------------------------------------------------------------ */
/* Discriminated union                                                  */
/* ------------------------------------------------------------------ */

export type DiagramDef =
  | { template: "cycle"; spec: CycleSpec }
  | { template: "flow"; spec: FlowSpec }
  | { template: "schematic"; spec: SchematicSpec }
  | { template: "pedigree"; spec: PedigreeSpec }
  | { template: "punnett"; spec: PunnettSpec }
  | { template: "graph"; spec: GraphSpec }
  | { template: "timeline"; spec: TimelineSpec };
