import Card from "../components/Card";

const INDICATORS = [
   "Total de delitos",
   "Tipo más frecuente",
   "Contra la propiedad",
   "Violentos",
   "Variación vs. año anterior",
   "Promedio diario",
   "Zona con más delitos",
   "Top 5 zonas (hotspots)",
   "Tasa por 100.000 hab. (ciudad, anualizada)",
   "Registros con arresto",
   "Con arma registrada",
];

export default function About() {
   return (
      <div className="space-y-6">
         <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card>
               <h3 className="mb-3 text-base font-semibold text-text">Fuente de datos</h3>
               <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                  <li>
                     Chicago Data Portal, dataset{" "}
                     <span className="font-medium text-text">"Crimes – 2001 to Present"</span>.
                  </li>
                  <li>Se filtran los registros desde el 2021-01-01.</li>
                  <li>
                     Se excluye el mes en curso incompleto y la categoría{" "}
                     <span className="font-medium text-text">NON-CRIMINAL</span>.
                  </li>
                  <li>
                     El total corresponde a registros: en homicidios hay una fila por víctima, no por incidente.
                  </li>
               </ul>
            </Card>

            <Card>
               <h3 className="mb-3 text-base font-semibold text-text">Definiciones</h3>
               <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                  <li>
                     <span className="font-medium text-text">Total de registros:</span> filas del dataset que pasan los
                     filtros activos.
                  </li>
                  <li>
                     <span className="font-medium text-text">Violentos:</span> ROBBERY, ASSAULT, BATTERY, HOMICIDE,
                     CRIMINAL SEXUAL ASSAULT, KIDNAPPING.
                  </li>
                  <li>
                     <span className="font-medium text-text">No violentos:</span> THEFT, BURGLARY, NARCOTICS, MOTOR
                     VEHICLE THEFT, CRIMINAL DAMAGE, DECEPTIVE PRACTICE, CRIMINAL TRESPASS. El resto se agrupa como{" "}
                     <span className="font-medium text-text">otros</span>.
                  </li>
                  <li>
                     <span className="font-medium text-text">Contra la propiedad:</span> THEFT, BURGLARY, MOTOR VEHICLE
                     THEFT, CRIMINAL DAMAGE, ARSON.
                  </li>
                  <li>
                     <span className="font-medium text-text">Armas:</span> no existe una columna específica; se infieren
                     de la descripción del registro y solo para ROBBERY, ASSAULT y BATTERY.
                  </li>
               </ul>
            </Card>
         </div>

         <Card>
            <h3 className="mb-3 text-base font-semibold text-text">Limitaciones</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
               <li>
                  Los datos reflejan lo reportado y patrullado, no necesariamente lo ocurrido. Una mayor presencia
                  policial puede aumentar el número de registros.
               </li>
               <li>
                  Las tasas usan población ACS 2014-2018. Son aproximadas y se inflan en Loop y Near North Side por su
                  alta población diurna.
               </li>
               <li>Cerca del 1,5 % de los registros no tienen coordenadas y no aparecen en el mapa de puntos.</li>
               <li>El último año con datos puede estar incompleto.</li>
               <li>
                  La variación vs. año anterior se muestra como <span className="font-medium text-text">N/D</span>{" "}
                  cuando no existe un año previo comparable.
               </li>
            </ul>
         </Card>

         <Card className="border-warn/40 bg-warn/5">
            <h3 className="mb-2 text-base font-semibold text-warn">Uso ético</h3>
            <p className="text-sm leading-relaxed text-muted">
               Este dashboard es una herramienta analítica y no debe usarse para decidir patrullaje o intervenciones sin
               revisión humana. Los sesgos de reporte y de vigilancia pueden amplificarse si se interpretan los conteos
               como una medida directa de criminalidad.
            </p>
         </Card>

         <Card>
            <h3 className="mb-3 text-base font-semibold text-text">Indicadores del dashboard</h3>
            <ol className="grid gap-2 text-sm text-muted sm:grid-cols-2">
               {INDICATORS.map((label, index) => (
                  <li key={label} className="flex gap-2">
                     <span className="w-5 shrink-0 text-right font-medium tabular-nums text-primary-soft">
                        {index + 1}
                     </span>
                     <span>{label}</span>
                  </li>
               ))}
            </ol>
         </Card>
      </div>
   );
}
