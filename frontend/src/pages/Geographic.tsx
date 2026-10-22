import Card from "../components/Card";
import ChartCard from "../components/ChartCard";
import HotspotsTable from "../components/HotspotsTable";
import KpiRow from "../components/KpiRow";
import RatesTable from "../components/RatesTable";
import ChoroplethMap from "../components/charts/ChoroplethMap";

export default function Geographic() {
   return (
      <div className="space-y-6">
         <KpiRow ids={["top_zone", "rate"]} />

         <ChartCard title="Mapa de delitos por community area" subtitle="Conteo y tasa anualizada por zona">
            <ChoroplethMap />
         </ChartCard>

         <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card>
               <HotspotsTable />
            </Card>
            <Card>
               <RatesTable />
            </Card>
         </div>
      </div>
   );
}
