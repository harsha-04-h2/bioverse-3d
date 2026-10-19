export interface BioModelProps {
  /** 0..1 exploded-view amount */
  explode: number;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** seconds, monotonic; drive ALL motion deterministically from this */
  animTime: number;
  /** HumanHeart only: clip the front to reveal interiors */
  cutaway?: boolean;
}
