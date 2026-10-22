import { useState } from "react";
import type { Data, Layout } from "plotly.js-dist-min";
import { useCommunityGeo, useMapPoints, useSummary, useZones } from "../../api/hooks";
import ChartState from "../ChartState";
import Plot from "../Plot";
import { MAP_COLORSCALE, THEME, colorbarTheme } from "../../theme/plotlyTheme";

type Metric = "count" | "rate";

const TABS: { id: Metric; label: string }[] = [
   { id: "count", label: "Número de delitos" },
   { id: "rate", label: "Tasa por 100.000 hab." },
];

export default function ChoroplethMap() {
   const [metric, setMetric] = useState<Metric>("count");
   const [showZones, setShowZones] = useState(true);
   const [showPoints, setShowPoints] = useState(true);

   const geo = useCommunityGeo();
   const zones = useZones("community_area");
   const summary = useSummary();
   const points = useMapPoints();

   if (geo.isLoading || zones.isLoading || summary.isLoading) {
      return <ChartState height={620}>Cargando mapa…</ChartState>;
   }
   if (geo.error) return <ChartState tone="error" height={620}>{geo.error.message}</ChartState>;
   if (zones.error) return <ChartState tone="error" height={620}>Error: {zones.error.message}</ChartState>;
   if (summary.error) return <ChartState tone="error" height={620}>Error: {summary.error.message}</ChartState>;
   if (!geo.data || !zones.data) return <ChartState height={620}>Sin datos para los filtros.</ChartState>;

   const rows =
      metric === "count"
         ? zones.data.map((z) => ({ id: Number(z.zone_id), name: z.zone_label, value: z.total }))
         : (summary.data?.rate_per_100k.by_area ?? []).map((r) => ({
              id: r.zone_id,
              name: r.zone_label,
              value: r.rate_annualized,
           }));

   const unit = metric === "count" ? "registros" : "por 100.000 hab. (anualizada)";
   const traces: Data[] = [];

   if (showZones) {
      traces.push({
         type: "choroplethmap",
         geojson: geo.data,
         locations: rows.map((r) => r.id),
         z: rows.map((r) => r.value),
         text: rows.map((r) => r.name),
         colorscale: MAP_COLORSCALE,
         marker: { opacity: 0.55, line: { color: THEME.primarySoft, width: 0.6 } },
         colorbar: {
            ...colorbarTheme(metric === "count" ? "Registros" : "Tasa"),
            bgcolor: THEME.surface,
         },
         hovertemplate: `<b>%{text}</b><br>%{z:,.1f} ${unit}<extra></extra>`,
      } as unknown as Data);
   }

   const pts = points.data ?? [];
   if (showPoints && pts.length) {
      const max = Math.max(...pts.map((p) => p.total));
      traces.push({
         type: "scattermap",
         lat: pts.map((p) => p.lat),
         lon: pts.map((p) => p.lon),
         mode: "markers",
         marker: {
            size: pts.map((p) => 4 + 16 * Math.sqrt(p.total / max)),
            color: THEME.warn,
            opacity: 0.6,
         },
         customdata: pts.map((p) => p.total),
         hovertemplate: "%{customdata:,} registros en esta celda<extra></extra>",
         name: "Delitos",
      } as unknown as Data);
   }

   const layout = {
      margin: { t: 10, r: 0, b: 0, l: 0 },
      showlegend: false,
      map: {
         style: "carto-positron",
         center: { lat: 41.835, lon: -87.68 },
         zoom: 9.3,
      },
   } as unknown as Partial<Layout>;

   return (
      <div>
         <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
               {TABS.map((t) => (
                  <button
                     key={t.id}
                     type="button"
                     onClick={() => setMetric(t.id)}
                     disabled={!showZones}
                     aria-pressed={metric === t.id}
                     className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        metric === t.id
                           ? "border-primary bg-primary text-bg hover:bg-primary-soft"
                           : "border-border bg-surface-2 text-muted hover:border-primary/50 hover:text-text"
                     }`}
                  >
                     {t.label}
                  </button>
               ))}
            </div>
            <label className="ml-auto flex items-center gap-1.5 text-sm text-muted">
               <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                  className="size-4 accent-primary"
               />
               Zonas
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted">
               <input
                  type="checkbox"
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                  className="size-4 accent-primary"
               />
               Puntos de delitos
            </label>
         </div>

         <Plot height={620} data={traces} layout={layout} scrollZoom />

         <p className="mt-3 text-xs text-muted">
            Los puntos son celdas de ~100 m; se muestran las 5.000 con más registros, no todos los delitos. Los
            registros sin coordenadas (~1,5 %) no aparecen en los puntos, pero sí en las zonas.
            {metric === "rate" &&
               " Loop y Near North Side tienen mucha población diurna, por lo que su tasa sale inflada."}
         </p>
      </div>
   );
}
