import ChartCard from "../components/ChartCard";
import KpiRow from "../components/KpiRow";
import CrimeTypesChart from "../components/charts/CrimeTypesChart";
import GroupsChart from "../components/charts/GroupsChart";
import TimeseriesChart from "../components/charts/TimeseriesChart";

export default function Overview() {
   return (
      <div className="space-y-6">
         <KpiRow ids={["total", "top_type", "variation", "daily_avg"]} />

         <ChartCard title="Evolución mensual de delitos" subtitle="Registros por mes">
            <TimeseriesChart />
         </ChartCard>

         <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <ChartCard title="Top 10 tipos de delito" subtitle="Los más frecuentes en el periodo filtrado">
               <CrimeTypesChart />
            </ChartCard>
            <ChartCard title="Violentos vs. no violentos" subtitle="Distribución de los registros por grupo">
               <GroupsChart />
            </ChartCard>
         </div>
      </div>
   );
}
