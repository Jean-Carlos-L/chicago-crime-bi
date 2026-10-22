import { useSummary } from "../../api/hooks";
import Plot from "../Plot";
import ChartState from "../ChartState";
import { THEME } from "../../theme/plotlyTheme";

export default function ArrestChart() {
   const { data, isLoading, error } = useSummary();
   const rows = data?.arrest.by_type ?? [];

   if (isLoading) return <ChartState>Cargando…</ChartState>;
   if (error) return <ChartState tone="error">Error: {error.message}</ChartState>;
   if (!rows.length) {
      return <ChartState>Selecciona THEFT, ROBBERY o ASSAULT, o quita el filtro de tipos.</ChartState>;
   }

   const max = Math.max(...rows.map((r) => r.arrest_rate_pct));

   return (
      <Plot
         data={[
            {
               type: "bar",
               x: rows.map((r) => r.primary_type),
               y: rows.map((r) => r.arrest_rate_pct),
               text: rows.map((r) => `${r.arrest_rate_pct} %`),
               textposition: "outside",
               cliponaxis: false,
               textfont: { color: THEME.text, size: 11 },
               hovertemplate: "%{x}<br>%{y:.1f} % con arresto<extra></extra>",
               marker: { color: THEME.good },
            },
         ]}
         layout={{
            yaxis: { title: { text: "%" }, range: [0, Math.max(max * 1.18, 1)] },
            bargap: 0.45,
            showlegend: false,
         }}
      />
   );
}
