import { useMemo, useState, type ReactNode } from "react";
import type { Filters } from "../types/api";
import { FiltersContext, type FiltersCtx } from "./filtersContextValue";

const INITIAL: Filters = {
   date_from: "",
   date_to: "",
   primary_types: "",
   community_areas: "",
};

export function FiltersProvider({ children }: { children: ReactNode }) {
   const [filters, setFilters] = useState<Filters>(INITIAL);
   const value = useMemo<FiltersCtx>(
      () => ({
         filters,
         setFilters,
         update: (patch) => setFilters((f) => ({ ...f, ...patch })),
      }),
      [filters]
   );
   return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}
