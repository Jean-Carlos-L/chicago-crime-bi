import ChartCard from "../components/ChartCard";
import KpiRow from "../components/KpiRow";
import ArrestChart from "../components/charts/ArrestChart";
import CrimeTypesChart from "../components/charts/CrimeTypesChart";
import GroupsChart from "../components/charts/GroupsChart";
import WeaponsChart from "../components/charts/WeaponsChart";

export default function CrimeTypes() {
   return (
      <div className="space-y-6">
         <KpiRow ids={["property", "violent", "arrest", "weapon"]} />

         <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <ChartCard title="Top 10 tipos de delito" subtitle="Los más frecuentes en el periodo filtrado">
               <CrimeTypesChart />
            </ChartCard>
            <ChartCard title="Arrestos por tipo" subtitle="Porcentaje de registros con arresto">
               <ArrestChart />
            </ChartCard>
         </div>

         <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <ChartCard title="Armas por categoría" subtitle="ROBBERY, ASSAULT y BATTERY">
               <WeaponsChart />
            </ChartCard>
            <ChartCard title="Violentos vs. no violentos" subtitle="Distribución de los registros por grupo">
               <GroupsChart />
            </ChartCard>
         </div>
      </div>
   );
}
