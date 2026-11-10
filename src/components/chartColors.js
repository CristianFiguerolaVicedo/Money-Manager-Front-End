// Chart colours per theme, checked for colour-blind separation and contrast against each surface.
// Income/expense: green vs coral (unlike green vs red, distinguishable with colour blindness).
// `single` (steel blue) is for neutral magnitudes such as the per-category breakdown.
const LIGHT = {
  income: "#1baf7a",
  expense: "#eb6834",
  single: "#5b8fd1",
  grid: "#e3e7e5",
  axis: "#5c625f",
  cursor: "rgba(4, 120, 87, 0.06)",
};

const DARK = {
  income: "#1baf7a",
  expense: "#e0612d",
  single: "#5b8fd1",
  grid: "#29322f",
  axis: "#9aa5a1",
  cursor: "rgba(110, 231, 183, 0.08)",
};

export const chartColors = (dark) => (dark ? DARK : LIGHT);

// Light values, for code that does not depend on the theme
export const CHART_COLORS = LIGHT;
