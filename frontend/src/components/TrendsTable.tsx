import { useTrends } from "../api/hooks";
import { fmt } from "../utils/format";

const signed = (n: number) => `${n > 0 ? "+" : ""}${fmt(n, 1)} %`;

function Badge({ trend, clear }: { trend: string; clear: boolean }) {
   if (!clear || trend === "STABLE")
      return <span className="text-muted">● Dentro del margen de error</span>;
   return trend === "UP"
      ? <span className="font-medium text-red-500">▲ Aumento</span>
      : <span className="font-medium text-green-500">▼ Descenso</span>;
}

export default function TrendsTable({ selected, onSelect }: { selected: string; onSelect: (t: string) => void }) {
   const { data, isLoading, error } = useTrends();
   if (isLoading) return <p className="text-sm text-muted">Cargando…</p>;
   if (error) return <p className="text-sm text-red-500">Error: {error.message}</p>;
   if (!data) return null;

   return (
      <div className="overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
               <tr>
                  <th className="py-2">Tipo de delito</th>
                  <th className="text-right">Último trim.</th>
                  <th className="text-right">Próx. trim.</th>
                  <th className="text-right">Vs. trim. anterior</th>
                  <th className="text-right">Vs. mismo trim. año anterior</th>
                  <th className="pl-4">Tendencia vs. trim. anterior</th>
               </tr>
            </thead>
            <tbody>
               {data.table.map((r) => (
                  <tr key={r.primary_type} onClick={() => onSelect(r.primary_type)}
                     className={`cursor-pointer border-t border-gray-800 hover:bg-white/5 ${selected === r.primary_type ? "bg-white/10" : ""}`}>
                     <td className="py-2">{r.primary_type}</td>
                     <td className="text-right tabular-nums">{fmt(r.last_q)}</td>
                     <td className="text-right tabular-nums">{fmt(r.next_q)}</td>
                     <td className="text-right tabular-nums">
                        {signed(r.variation_pct)}
                        <div className="text-xs text-muted">
                           ({signed(r.variation_lo_pct)} a {signed(r.variation_hi_pct)})
                        </div>
                     </td>
                     <td className="text-right tabular-nums">{signed(r.vs_year_ago_pct)}</td>
                     <td className="pl-4"><Badge trend={r.trend} clear={r.clear} /></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}