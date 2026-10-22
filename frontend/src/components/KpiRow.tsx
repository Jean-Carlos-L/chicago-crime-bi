import { useSummary } from "../api/hooks";
import { fmt, pct } from "../utils/format";
import KpiCard from "./KpiCard";

export type KpiId =
   | "total"
   | "top_type"
   | "property"
   | "violent"
   | "variation"
   | "daily_avg"
   | "top_zone"
   | "rate"
   | "arrest"
   | "weapon";

interface KpiDefinition {
   title: string;
   value: string | null | undefined;
   hint?: string;
   tone?: "good" | "bad" | "neutral" | "muted";
}

interface Props {
   ids: KpiId[];
}

export default function KpiRow({ ids }: Props) {
   const { data: d, isLoading, error } = useSummary();

   if (error) {
      return (
         <p role="alert" className="rounded-xl border border-bad/40 bg-bad/10 p-4 text-sm text-bad">
            Error: {error.message}
         </p>
      );
   }

   const share = (g: string) => d?.groups.find((x) => x.crime_group === g)?.share_pct ?? null;
   const v = d?.variation.pct;
   const weaponTotal = d?.weapons.find((w) => w.category === "TOTAL");
   const variationTone: KpiDefinition["tone"] = v == null ? "muted" : v === 0 ? "neutral" : v > 0 ? "bad" : "good";

   const definitions: Record<KpiId, KpiDefinition> = {
      total: {
         title: "Total de delitos",
         value: fmt(d?.total),
         hint: "Registros (en homicidios, una fila por víctima)",
      },
      top_type: {
         title: "Tipo más frecuente",
         value: d?.top_crime_type?.primary_type,
         hint: d?.top_crime_type
            ? `${fmt(d.top_crime_type.total)} registros · ${pct(d.top_crime_type.share_pct)}`
            : undefined,
      },
      property: {
         title: "Contra la propiedad",
         value: pct(d?.property_pct),
         hint: "THEFT, BURGLARY, MOTOR VEHICLE THEFT, CRIMINAL DAMAGE, ARSON",
      },
      violent: {
         title: "Violentos",
         value: pct(share("VIOLENT")),
         hint: `No violentos ${pct(share("NON_VIOLENT")) ?? "—"} · Otros ${pct(share("OTHER")) ?? "—"}`,
      },
      variation: {
         title: "Variación vs. año anterior",
         value:
            v == null
               ? d
                  ? "N/D"
                  : null
               : `${v > 0 ? "▲ +" : v < 0 ? "▼ " : ""}${fmt(v, 1)} %`,
         tone: variationTone,
         hint: d ? `${fmt(d.variation.current)} vs ${fmt(d.variation.previous)}` : undefined,
      },
      daily_avg: {
         title: "Promedio diario",
         value: fmt(d?.daily_avg, 1),
         hint: "Registros por día",
      },
      top_zone: {
         title: "Zona con más delitos",
         value: d?.top_zone?.zone_label,
         hint: d?.top_zone ? `${fmt(d.top_zone.total)} registros` : undefined,
      },
      rate: {
         title: "Tasa por 100.000 hab.",
         value: fmt(d?.rate_per_100k.city_annualized, 1),
         hint: "Ciudad, anualizada (población ACS 2014-2018)",
      },
      arrest: {
         title: "Registros con arresto",
         value: pct(d?.arrest.overall_pct),
         hint: "Arrest = True sobre el total",
      },
      weapon: {
         title: "Con arma registrada",
         value: pct(weaponTotal?.weapon_pct),
         hint: "Robos y agresiones (inferido de la descripción)",
      },
   };

   const gridClass =
      ids.length === 2 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";

   return (
      <div className={gridClass}>
         {ids.map((id) => {
            const item = definitions[id];
            return (
               <KpiCard
                  key={id}
                  title={item.title}
                  value={item.value}
                  hint={item.hint}
                  tone={item.tone}
                  loading={isLoading}
               />
            );
         })}
      </div>
   );
}
