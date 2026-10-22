import { useState } from "react";
import { useTrendMetrics, useTrends } from "../api/hooks";
import Card from "../components/Card";
import ForecastChart from "../components/charts/ForecastChart";
import TrendsTable from "../components/TrendsTable";
import { fmt } from "../utils/format";

export default function Predictions() {
   const [type, setType] = useState("TOTAL");
   const [months, setMonths] = useState<6 | 12>(6);
   const { data: trends } = useTrends();
   const { data: m } = useTrendMetrics();

   return (
      <div className="space-y-6">
         <Card>
            <div className="mb-3 flex flex-wrap items-center gap-3">
               <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de delito"
                  className="rounded-md border border-gray-700 bg-transparent px-3 py-1.5 text-sm">
                  {(trends?.table ?? []).map((r) => (
                     <option key={r.primary_type} value={r.primary_type} className="bg-gray-900">{r.primary_type}</option>
                  ))}
               </select>
               <div className="flex gap-2">
                  {([6, 12] as const).map((n) => (
                     <button key={n} onClick={() => setMonths(n)}
                        className={`rounded-md px-3 py-1 text-sm ${months === n ? "bg-blue-600 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
                        Últimos {n} meses
                     </button>
                  ))}
               </div>
               {trends && <span className="ml-auto text-xs text-muted">Datos hasta {trends.last_month} · pronóstico a {trends.horizon} meses</span>}
            </div>
            <ForecastChart primaryType={type} historyMonths={months} />
         </Card>

         <Card>
            <h3 className="mb-1 text-sm font-semibold">Variación prevista del próximo trimestre</h3>
            <p className="mb-3 text-xs text-muted">
               Gran parte del descenso frente al trimestre anterior es estacional (verano → invierno). Compara con la
               columna del año anterior. Sin flecha = el intervalo del 80 % incluye el 0 %. Haz clic en una fila para graficarla.
            </p>
            <TrendsTable selected={type} onSelect={setType} />
         </Card>

         {m && (
            <Card>
               <h3 className="mb-2 text-sm font-semibold">Validación del modelo</h3>
               <p className="text-xs text-muted">
                  Backtest temporal con {m.origins} orígenes mensuales. Acierto de dirección:{" "}
                  {fmt(m.direction_acc_pct.gbm, 1)} % (referencia estacional {fmt(m.direction_acc_pct.seasonal_naive, 1)} %).
                  Error del volumen trimestral (WAPE): {fmt(m.quarter_wape_pct.gbm, 1)} % frente a{" "}
                  {fmt(m.quarter_wape_pct.seasonal_naive, 1)} %. Los intervalos son aproximados y la muestra es corta.
                  {trends && trends.excluded.length > 0 && ` Tipos excluidos por bajo volumen (<20/mes): ${trends.excluded.length}.`}
               </p>
            </Card>
         )}
      </div>
   );
}