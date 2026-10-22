import { useFilterOptions } from "../api/hooks";
import { useFilters } from "../context/useFilters";
import { isoToKey, keyToIso } from "../utils/format";
import MultiSelect from "./MultiSelect";

const split = (s: string) => (s ? s.split(",") : []);

const fieldLabel = "text-[11px] font-medium uppercase tracking-wide text-muted";
const inputClass =
   "h-9 rounded-lg border border-border bg-surface-2 px-2.5 text-sm text-text transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function FilterBar() {
   const { filters, update, setFilters } = useFilters();
   const { data: opts } = useFilterOptions();

   const min = keyToIso(opts?.date_range.min ?? "");
   const max = keyToIso(opts?.date_range.max ?? "");
   const dirty = Object.values(filters).some(Boolean);

   const types = split(filters.primary_types);
   const areas = split(filters.community_areas);
   const areaName = (id: string) => opts?.community_areas.find((a) => String(a.id) === id)?.name ?? id;
   const hasChips = types.length > 0 || areas.length > 0;

   const reset = () => setFilters({ date_from: "", date_to: "", primary_types: "", community_areas: "" });

   return (
      <div className="border-t border-border/70 py-3">
         <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
               <label htmlFor="filter-from" className={fieldLabel}>
                  Desde
               </label>
               <input
                  id="filter-from"
                  type="date"
                  min={min}
                  max={max}
                  value={keyToIso(filters.date_from)}
                  onChange={(e) => update({ date_from: isoToKey(e.target.value) })}
                  className={inputClass}
               />
            </div>

            <div className="flex flex-col gap-1">
               <label htmlFor="filter-to" className={fieldLabel}>
                  Hasta
               </label>
               <input
                  id="filter-to"
                  type="date"
                  min={min}
                  max={max}
                  value={keyToIso(filters.date_to)}
                  onChange={(e) => update({ date_to: isoToKey(e.target.value) })}
                  className={inputClass}
               />
            </div>

            <div className="flex min-w-0 flex-col gap-1">
               <span className={fieldLabel}>Tipo de delito</span>
               <MultiSelect
                  label="Tipo de delito"
                  options={(opts?.primary_types ?? []).map((t) => ({ value: t, label: t }))}
                  selected={types}
                  onChange={(v) => update({ primary_types: v.join(",") })}
               />
            </div>

            <div className="flex min-w-0 flex-col gap-1">
               <span className={fieldLabel}>Community area</span>
               <MultiSelect
                  label="Community area"
                  options={(opts?.community_areas ?? []).map((a) => ({
                     value: String(a.id),
                     label: `${a.id} · ${a.name}`,
                  }))}
                  selected={areas}
                  onChange={(v) => update({ community_areas: v.join(",") })}
               />
            </div>

            {dirty && (
               <button
                  type="button"
                  onClick={reset}
                  className="ml-auto inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
               >
                  Restablecer filtros
               </button>
            )}
         </div>

         {hasChips && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
               <span className="text-xs text-muted">Filtros activos:</span>
               {types.map((t) => (
                  <span
                     key={`type-${t}`}
                     className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-text"
                  >
                     <span className="text-muted">Tipo</span>
                     {t}
                     <button
                        type="button"
                        aria-label={`Quitar filtro de tipo ${t}`}
                        onClick={() => update({ primary_types: types.filter((x) => x !== t).join(",") })}
                        className="ml-0.5 rounded-full px-0.5 text-muted hover:text-bad"
                     >
                        ×
                     </button>
                  </span>
               ))}
               {areas.map((a) => (
                  <span
                     key={`area-${a}`}
                     className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-text"
                  >
                     <span className="text-muted">Área</span>
                     {a} · {areaName(a)}
                     <button
                        type="button"
                        aria-label={`Quitar filtro de área ${areaName(a)}`}
                        onClick={() => update({ community_areas: areas.filter((x) => x !== a).join(",") })}
                        className="ml-0.5 rounded-full px-0.5 text-muted hover:text-bad"
                     >
                        ×
                     </button>
                  </span>
               ))}
            </div>
         )}
      </div>
   );
}
