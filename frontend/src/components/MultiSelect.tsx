import { useMemo, useState } from "react";

export interface Option {
   value: string;
   label: string;
}

interface Props {
   label: string;
   options: Option[];
   selected: string[];
   onChange: (values: string[]) => void;
}

export default function MultiSelect({ label, options, selected, onChange }: Props) {
   const [q, setQ] = useState("");
   const visible = useMemo(
      () => options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())),
      [options, q]
   );

   const toggle = (v: string) =>
      onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

   return (
      <details className="group relative min-w-0">
         <summary
            aria-label={label}
            className="flex h-9 min-w-[170px] cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 text-sm text-text transition-colors hover:border-primary/60 group-open:border-primary"
         >
            <span className="truncate">{selected.length ? `${selected.length} seleccionados` : "Todos"}</span>
            <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
               ▾
            </span>
         </summary>
         <div className="absolute left-0 z-40 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface-2 p-2 shadow-xl shadow-black/50">
            <input
               value={q}
               onChange={(e) => setQ(e.target.value)}
               placeholder="Buscar…"
               aria-label={`Buscar en ${label}`}
               className="mb-2 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="max-h-60 overflow-y-auto">
               {visible.length === 0 && <p className="px-2 py-3 text-sm text-muted">Sin resultados.</p>}
               {visible.map((o) => (
                  <label
                     key={o.value}
                     className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text hover:bg-surface"
                  >
                     <input
                        type="checkbox"
                        checked={selected.includes(o.value)}
                        onChange={() => toggle(o.value)}
                        className="size-4 accent-primary"
                     />
                     {o.label}
                  </label>
               ))}
            </div>
            {selected.length > 0 && (
               <button
                  type="button"
                  onClick={() => onChange([])}
                  className="mt-2 text-xs font-medium text-primary-soft hover:underline"
               >
                  Limpiar selección
               </button>
            )}
         </div>
      </details>
   );
}
