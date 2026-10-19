"use client";

import type { DiagramDef } from "./types";
import CycleDiagram from "./CycleDiagram";
import ProcessFlow from "./ProcessFlow";
import LabeledSchematic from "./LabeledSchematic";
import PedigreeChart from "./PedigreeChart";
import PunnettSquare from "./PunnettSquare";
import DataGraph from "./DataGraph";
import Timeline from "./Timeline";

/** Renders the right SVG template for a diagram spec. */
export default function DiagramRenderer({ diagram }: { diagram: DiagramDef }) {
  switch (diagram.template) {
    case "cycle":
      return <CycleDiagram spec={diagram.spec} />;
    case "flow":
      return <ProcessFlow spec={diagram.spec} />;
    case "schematic":
      return <LabeledSchematic spec={diagram.spec} />;
    case "pedigree":
      return <PedigreeChart spec={diagram.spec} />;
    case "punnett":
      return <PunnettSquare spec={diagram.spec} />;
    case "graph":
      return <DataGraph spec={diagram.spec} />;
    case "timeline":
      return <Timeline spec={diagram.spec} />;
  }
}
