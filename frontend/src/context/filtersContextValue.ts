import { createContext } from "react";
import type { Filters } from "../types/api";

export interface FiltersCtx {
   filters: Filters;
   setFilters: (f: Filters) => void;
   update: (patch: Partial<Filters>) => void;
}

export const FiltersContext = createContext<FiltersCtx | null>(null);
