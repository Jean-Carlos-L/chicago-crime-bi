import { useSummary } from "../../api/hooks";
import { GROUP_LABEL, fmt } from "../../utils/format";
import Plot from "../Plot";
import ChartState from "../ChartState";
import { THEME } from "../../theme/plotlyTheme";

const COLORS: Record<string, string> = {
   VIOLENT: THEME.bad,
   NON_VIOLENT: THEME.primary,
   OTHER: THEME.other,
};

export default function GroupsChart() {
   const { data, isLoading, error } = useSummary();

   if (isLoading) return <ChartState>Cargando…</ChartState>;
   if (error) return <ChartState tone="error">Error: {error.message}</ChartState>;
   if (!data?.groups.length) return <ChartState>Sin datos para los filtros.</ChartState>;

   const total = data.groups.reduce((acc, g) => acc + g.total, 0);

   return (
      <Plot
         data={[
            {
               type: "pie",
               hole: 0.62,
               sort: false,
               labels: data.groups.map((g) => GROUP_LABEL[g.crime_group] ?? g.crime_group),
               values: data.groups.map((g) => g.total),
               marker: { colors: data.groups.map((g) => COLORS[g.crime_group] ?? THEME.other) },
               textinfo: "label+percent",
               textposition: "inside",
               textfont: { color: THEME.text, size: 12 },
               hovertemplate: "<b>%{label}</b><br>%{value:,} registros · %{percent}<extra></extra>",
            },
         ]}
         layout={{
            showlegend: false,
            annotations: [
               {
                  text: `<b>${fmt(total)}</b><br>registros`,
                  x: 0.5,
                  y: 0.5,
                  showarrow: false,
                  font: { color: THEME.text, size: 17 },
               },
            ],
            margin: { t: 10, r: 10, b: 10, l: 10 },
         }}
      />
   );
}
