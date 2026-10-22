import { useContext } from "react";
import { FiltersContext, type FiltersCtx } from "./filtersContextValue";

export function useFilters(): FiltersCtx {
   const ctx = useContext(FiltersContext);
   if (!ctx) throw new Error("useFilters debe usarse dentro de <FiltersProvider>");
   return ctx;
}
