import { useCrimeTypes } from "../../api/hooks";
import Plot from "../Plot";
import ChartState from "../ChartState";
import { THEME } from "../../theme/plotlyTheme";
import { fmt } from "../../utils/format";

export default function CrimeTypesChart() {
   const { data, isLoading, error } = useCrimeTypes(10);

   if (isLoading) return <ChartState>Cargando…</ChartState>;
   if (error) return <ChartState tone="error">Error: {error.message}</ChartState>;
   if (!data?.length) return <ChartState>Sin datos para los filtros.</ChartState>;

   return (
      <Plot
         data={[
            {
               type: "bar",
               orientation: "h",
               x: data.map((r) => r.total),
               y: data.map((r) => r.primary_type),
               text: data.map((r) => fmt(r.total) ?? ""),
               textposition: "outside",
               cliponaxis: false,
               textfont: { color: THEME.text, size: 11 },
               hovertemplate: "%{y}<br>%{x:,} registros<extra></extra>",
               marker: {
                  color: data.map((_, i) => (i === 0 ? THEME.primarySoft : THEME.primary)),
               },
            },
         ]}
         layout={{
            yaxis: { autorange: "reversed" },
            xaxis: { title: { text: "Registros" } },
            margin: { t: 10, r: 70, b: 44, l: 10 },
            bargap: 0.3,
            showlegend: false,
         }}
      />
   );
}
