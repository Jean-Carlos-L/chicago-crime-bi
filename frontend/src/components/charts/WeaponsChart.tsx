import { useSummary } from "../../api/hooks";
import Plot from "../Plot";
import ChartState from "../ChartState";
import { THEME } from "../../theme/plotlyTheme";
import { fmt } from "../../utils/format";

export default function WeaponsChart() {
   const { data, isLoading, error } = useSummary();
   const rows = (data?.weapons ?? []).filter((w) => w.category !== "TOTAL");

   if (isLoading) return <ChartState>Cargando…</ChartState>;
   if (error) return <ChartState tone="error">Error: {error.message}</ChartState>;
   if (!rows.length) return <ChartState>Sin datos para los filtros.</ChartState>;

   const max = Math.max(...rows.map((r) => r.weapon_pct));

   return (
      <div>
         <Plot
            data={[
               {
                  type: "bar",
                  x: rows.map((r) => r.category),
                  y: rows.map((r) => r.weapon_pct),
                  text: rows.map((r) => `${fmt(r.weapon_pct, 1)} %`),
                  textposition: "outside",
                  cliponaxis: false,
                  textfont: { color: THEME.text, size: 11 },
                  hovertemplate: "%{x}<br>%{y:.1f} % con arma<extra></extra>",
                  marker: { color: THEME.warn },
               },
            ]}
            layout={{
               yaxis: { title: { text: "% con arma" }, range: [0, Math.max(max * 1.18, 1)] },
               bargap: 0.45,
               showlegend: false,
            }}
         />
         <p className="mt-2 text-xs text-muted">Arma inferida de la descripción del registro.</p>
      </div>
   );
}
