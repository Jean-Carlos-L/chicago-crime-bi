import { useSummary } from "../api/hooks";
import { fmt, pct } from "../utils/format";
import ChartState from "./ChartState";

export default function HotspotsTable() {
   const { data, isLoading, error } = useSummary();

   if (error) return <ChartState tone="error" height={260}>Error: {error.message}</ChartState>;
   if (isLoading) return <ChartState height={260}>Cargando hotspots…</ChartState>;
   if (!data?.hotspots.length) return <ChartState height={260}>Sin datos para los filtros.</ChartState>;

   const max = Math.max(...data.hotspots.map((z) => z.total));

   return (
      <div className="min-w-0">
         <h3 className="mb-3 text-base font-semibold text-text">Top 5 zonas (hotspots)</h3>
         <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
               <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                     <th className="py-2 pr-2 font-medium">#</th>
                     <th className="py-2 pr-2 font-medium">Zona</th>
                     <th className="py-2 pr-2 text-right font-medium">Registros</th>
                     <th className="py-2 text-right font-medium">% del total</th>
                  </tr>
               </thead>
               <tbody>
                  {data.hotspots.map((z) => (
                     <tr key={z.zone_id} className="border-b border-border/70 transition-colors hover:bg-surface-2">
                        <td className="py-2 pr-2 tabular-nums text-muted">{z.zone_rank}</td>
                        <td className="max-w-[200px] truncate py-2 pr-2 text-text">{z.zone_label}</td>
                        <td className="py-2 pr-2 text-right">
                           <div className="ml-auto flex w-full max-w-[170px] items-center justify-end gap-2">
                              <span
                                 aria-hidden="true"
                                 className="block h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-border/60"
                              >
                                 <span
                                    className="block h-full rounded-full bg-primary/70"
                                    style={{ width: `${max > 0 ? (z.total / max) * 100 : 0}%` }}
                                 />
                              </span>
                              <span className="w-20 shrink-0 text-right tabular-nums text-text">{fmt(z.total)}</span>
                           </div>
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted">{pct(z.share_pct)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
