/** Aggregates all 2D diagram figure specs into the catalog. */
import type { FigureDef } from "@/lib/data";

import { figures as g1 } from "./specs/c11-ch01-04";
import { figures as g2 } from "./specs/c11-ch05-07";
import { figures as g3 } from "./specs/c11-ch08-12";
import { figures as g4 } from "./specs/c11-ch13-19";
import { figures as g5 } from "./specs/c12-ch01-04";
import { figures as g6 } from "./specs/c12-ch05-07";
import { figures as g7 } from "./specs/c12-ch08-10";
import { figures as g8 } from "./specs/c12-ch11-13";
import { figures as gaps } from "./specs/c12-gaps";

export const diagramFigures: FigureDef[] = [...g1, ...g2, ...g3, ...g4, ...g5, ...g6, ...g7, ...g8, ...gaps];

export function diagramFigureCount(): number {
  return diagramFigures.length;
}
