import { useSummary } from "../api/hooks";
import { fmt } from "../utils/format";
import ChartState from "./ChartState";

export default function RatesTable() {
   const { data, isLoading, error } = useSummary();

   if (error) return <ChartState tone="error" height={260}>Error: {error.message}</ChartState>;
   if (isLoading) return <ChartState height={260}>Cargando tasas…</ChartState>;

   const rows = [...(data?.rate_per_100k.by_area ?? [])]
      .sort((a, b) => b.rate_annualized - a.rate_annualized)
      .slice(0, 10);

   if (!rows.length) return <ChartState height={260}>Sin datos para los filtros.</ChartState>;

   const maxRate = Math.max(...rows.map((r) => r.rate_annualized));
   const maxTotal = Math.max(...rows.map((r) => r.total));

   return (
      <div className="min-w-0">
         <h3 className="mb-3 text-base font-semibold text-text">10 áreas con mayor tasa anualizada</h3>
         <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-sm">
               <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                     <th className="py-2 pr-2 font-medium">Área</th>
                     <th className="py-2 pr-2 text-right font-medium">Población</th>
                     <th className="py-2 pr-2 text-right font-medium">Registros</th>
                     <th className="py-2 text-right font-medium">Tasa anualizada</th>
                  </tr>
               </thead>
               <tbody>
                  {rows.map((r) => (
                     <tr key={r.zone_id} className="border-b border-border/70 transition-colors hover:bg-surface-2">
                        <td className="max-w-[180px] truncate py-2 pr-2 text-text">{r.zone_label}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-muted">{fmt(r.population)}</td>
                        <td className="py-2 pr-2 text-right">
                           <div className="ml-auto flex w-full max-w-[170px] items-center justify-end gap-2">
                              <span
                                 aria-hidden="true"
                                 className="block h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-border/60"
                              >
                                 <span
                                    className="block h-full rounded-full bg-primary/70"
                                    style={{ width: `${maxTotal > 0 ? (r.total / maxTotal) * 100 : 0}%` }}
                                 />
                              </span>
                              <span className="w-20 shrink-0 text-right tabular-nums text-text">{fmt(r.total)}</span>
                           </div>
                        </td>
                        <td className="py-2 text-right">
                           <div className="ml-auto flex w-full max-w-[170px] items-center justify-end gap-2">
                              <span
                                 aria-hidden="true"
                                 className="block h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-border/60"
                              >
                                 <span
                                    className="block h-full rounded-full bg-primary-soft/80"
                                    style={{
                                       width: `${maxRate > 0 ? (r.rate_annualized / maxRate) * 100 : 0}%`,
                                    }}
                                 />
                              </span>
                              <span className="w-20 shrink-0 text-right tabular-nums font-medium text-primary-soft">
                                 {fmt(r.rate_annualized, 1)}
                              </span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
