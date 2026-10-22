import { useHeatmap } from "../../api/hooks";
import { DAY_LABEL } from "../../utils/format";
import Plot from "../Plot";
import ChartState from "../ChartState";
import { HEATMAP_COLORSCALE, colorbarTheme } from "../../theme/plotlyTheme";

interface Props {
   height?: number;
}

export default function HeatmapChart({ height = 360 }: Props) {
   const { data, isLoading, error } = useHeatmap();

   if (isLoading) return <ChartState height={height}>Cargando…</ChartState>;
   if (error) return <ChartState tone="error" height={height}>Error: {error.message}</ChartState>;
   if (!data?.length) return <ChartState height={height}>Sin datos para los filtros.</ChartState>;

   // Matriz 7 (días) x 24 (horas), 0 donde no hay registros.
   const z: number[][] = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
   for (const r of data) z[r.day_of_week - 1][r.hour_of_day] = r.avg_per_day;

   return (
      <Plot
         height={height}
         data={[
            {
               type: "heatmap",
               z,
               x: Array.from({ length: 24 }, (_, h) => `${h}h`),
               y: DAY_LABEL,
               colorscale: HEATMAP_COLORSCALE,
               colorbar: colorbarTheme("Prom. por día"),
               hovertemplate: "%{y} %{x}<br>%{z:.1f} registros/día<extra></extra>",
            },
         ]}
         layout={{
            yaxis: { autorange: "reversed" },
            xaxis: { title: { text: "Hora" } },
            margin: { t: 10, r: 80, b: 44, l: 62 },
         }}
      />
   );
}
