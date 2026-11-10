// Chart colours per theme, checked for colour-blind separation and contrast against each surface.
// Income/expense: aqua vs orange (unlike green vs red, distinguishable with colour blindness).
const LIGHT = {
  income: "#1baf7a",
  expense: "#eb6834",
  single: "#7e22ce",
  grid: "#e5e7eb",
  axis: "#6b7280",
  cursor: "rgba(126, 34, 206, 0.06)",
};

const DARK = {
  income: "#1baf7a",
  expense: "#e0612d",
  single: "#a855f7",
  grid: "#2e2d37",
  axis: "#a3a2ad",
  cursor: "rgba(168, 85, 247, 0.12)",
};

export const chartColors = (dark) => (dark ? DARK : LIGHT);

// Light values, for code that does not depend on the theme
export const CHART_COLORS = LIGHT;
