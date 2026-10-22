import type { ColorScale, Layout, LayoutAxis } from "plotly.js-dist-min";

export const THEME = {
   bg: "#05080F",
   surface: "#0B1220",
   surface2: "#111B30",
   border: "#1B2A47",
   primary: "#3B82F6",
   primarySoft: "#60A5FA",
   text: "#E6EDF7",
   muted: "#8FA0BD",
   good: "#22C55E",
   bad: "#EF4444",
   warn: "#F59E0B",
   cyan: "#22D3EE",
   violet: "#A78BFA",
   other: "#64748B",
   transparent: "rgba(0,0,0,0)",
} as const;

export const FONT_FAMILY = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

export const PLOTLY_COLORWAY = [
   THEME.primary,
   THEME.primarySoft,
   THEME.cyan,
   THEME.warn,
   THEME.bad,
   THEME.violet,
];

export const TIMESERIES_FILL = "rgba(59,130,246,0.15)";

export const HEATMAP_COLORSCALE: ColorScale = [
   [0, "#0B1220"],
   [0.35, "#1D4ED8"],
   [0.65, "#22D3EE"],
   [1, "#FDE68A"],
];

export const MAP_COLORSCALE: ColorScale = [
   [0, "#0B1F4D"],
   [0.5, "#2563EB"],
   [1, "#93C5FD"],
];

const AXIS: Partial<LayoutAxis> = {
   gridcolor: THEME.border,
   zerolinecolor: THEME.border,
   linecolor: THEME.border,
   tickfont: { color: THEME.muted, family: FONT_FAMILY, size: 12 },
   title: { font: { color: THEME.muted, family: FONT_FAMILY, size: 12 } },
   automargin: true,
};

export const PLOTLY_BASE_LAYOUT: Partial<Layout> = {
   paper_bgcolor: THEME.transparent,
   plot_bgcolor: THEME.transparent,
   font: { color: THEME.text, family: FONT_FAMILY, size: 12 },
   colorway: PLOTLY_COLORWAY,
   hoverlabel: {
      bgcolor: THEME.surface2,
      bordercolor: THEME.primary,
      font: { color: THEME.text, family: FONT_FAMILY, size: 12 },
   },
   legend: {
      bgcolor: THEME.transparent,
      font: { color: THEME.muted, family: FONT_FAMILY, size: 12 },
   },
   margin: { t: 16, r: 20, b: 44, l: 56 },
   xaxis: AXIS,
   yaxis: AXIS,
};

export const colorbarTheme = (title: string) => ({
   title: {
      text: title,
      side: "right" as const,
      font: { color: THEME.text, family: FONT_FAMILY, size: 12 },
   },
   tickfont: { color: THEME.muted, family: FONT_FAMILY, size: 11 },
   outlinecolor: THEME.border,
   outlinewidth: 1,
   bgcolor: THEME.transparent,
   len: 0.6,
});
