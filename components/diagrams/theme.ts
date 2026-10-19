/** Shared dark-lab visual language for all diagram templates. */
export const T = {
  bg: "transparent",
  panel: "#0d1e38",
  panelBorder: "#1e3a5f",
  text: "#e2e8f0",
  muted: "#94a3b8",
  faint: "#64748b",
  line: "#334155",
  leader: "#475569",
  accent: "#22d3ee",
  chipFill: "#132a4a",
  chipStroke: "#2b4d7d",
  selected: "#22d3ee",
} as const;

export const FONT = "inherit";

export const labelStyle = {
  fontSize: 12.5,
  fill: T.text,
  fontWeight: 600,
} as const;

export const subLabelStyle = {
  fontSize: 11,
  fill: T.muted,
  fontWeight: 400,
} as const;

export const smallMuted = {
  fontSize: 10.5,
  fill: T.faint,
  fontWeight: 400,
} as const;
