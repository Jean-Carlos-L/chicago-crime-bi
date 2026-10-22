import { useState } from "react";
import ChartCard from "../components/ChartCard";
import HeatmapChart from "../components/charts/HeatmapChart";
import TimeseriesChart from "../components/charts/TimeseriesChart";

type Granularity = "month" | "year";

export default function Temporal() {
   const [granularity, setGranularity] = useState<Granularity>("month");

   const buttonClass = (active: boolean) =>
      `rounded-lg border px-3 py-1 text-sm transition-colors ${
         active
            ? "border-primary bg-primary text-bg hover:bg-primary-soft"
            : "border-border bg-surface-2 text-muted hover:border-primary/50 hover:text-text"
      }`;

   return (
      <div className="space-y-6">
         <ChartCard
            title="Evolución de delitos"
            subtitle={granularity === "month" ? "Serie mensual" : "Serie anual agregada"}
            actions={
               <div className="flex gap-2" role="group" aria-label="Granularidad de la serie">
                  <button
                     type="button"
                     aria-pressed={granularity === "month"}
                     onClick={() => setGranularity("month")}
                     className={buttonClass(granularity === "month")}
                  >
                     Mensual
                  </button>
                  <button
                     type="button"
                     aria-pressed={granularity === "year"}
                     onClick={() => setGranularity("year")}
                     className={buttonClass(granularity === "year")}
                  >
                     Anual
                  </button>
               </div>
            }
         >
            <TimeseriesChart granularity={granularity} height={380} />
         </ChartCard>

         <ChartCard
            title="Delitos por día de la semana y hora"
            subtitle="Promedio de registros por día en cada franja horaria"
         >
            <HeatmapChart height={420} />
            <p className="mt-2 text-xs text-muted">Color = promedio de registros por día, no el total.</p>
         </ChartCard>
      </div>
   );
}
