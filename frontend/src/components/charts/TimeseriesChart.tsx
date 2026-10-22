import Plot from "../Plot";
import { useTimeseries } from "../../api/hooks";
import ChartState from "../ChartState";
import { THEME, TIMESERIES_FILL } from "../../theme/plotlyTheme";

interface Props {
   granularity?: "month" | "year";
   height?: number;
}

export default function TimeseriesChart({ granularity = "month", height = 360 }: Props) {
   const { data, isLoading, error } = useTimeseries(granularity);

   if (isLoading) return <ChartState height={height}>Cargando serie…</ChartState>;
   if (error) return <ChartState tone="error" height={height}>Error: {error.message}</ChartState>;
   if (!data?.length) return <ChartState height={height}>Sin datos para los filtros.</ChartState>;

   if (granularity === "year") {
      return (
         <Plot
            height={height}
            data={[
               {
                  type: "bar",
                  x: data.map((r) => r.year),
                  y: data.map((r) => r.total),
                  marker: { color: THEME.primary },
                  hovertemplate: "%{x}<br>%{y:,} registros<extra></extra>",
               },
            ]}
            layout={{ yaxis: { title: { text: "Registros" } }, bargap: 0.35, showlegend: false }}
         />
      );
   }

   const x = data.map((r) => `${r.year}-${String(r.month ?? 1).padStart(2, "0")}-01`);
   const y = data.map((r) => r.total);

   return (
      <Plot
         height={height}
         data={[
            {
               x,
               y,
               type: "scatter",
               mode: "lines",
               name: "Delitos",
               line: { color: THEME.primarySoft, width: 2.5 },
               fill: "tozeroy",
               fillcolor: TIMESERIES_FILL,
               hovertemplate: "%{x|%b %Y}<br>%{y:,} registros<extra></extra>",
            },
         ]}
         layout={{ yaxis: { title: { text: "Registros" } }, hovermode: "x unified", showlegend: false }}
      />
   );
}
