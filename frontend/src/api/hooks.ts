import { useQuery } from "@tanstack/react-query";
import { get } from "./client";
import { useFilters } from "../context/useFilters";
import type { Summary, TimeseriesRow, HeatmapRow, CrimeTypeRow, ZoneRow, CommunityGeoJson, PointRow, TypeSeries, TrendsResponse, TrendMetrics } from "../types/api";

const PREDICT = import.meta.env.VITE_PREDICT_API_URL;

function useApi<T>(key: string, path: string, extra: Record<string, string | number> = {}) {
   const { filters } = useFilters();
   const params = { ...filters, ...extra };
   return useQuery<T>({
      queryKey: [key, params],
      queryFn: () => get<T>(path, params),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
   });
}

export const useSummary = () => useApi<Summary>("summary", "/analytics/summary");

export const useTimeseries = (granularity: "month" | "year" = "month") =>
   useApi<TimeseriesRow[]>("timeseries", "/analytics/timeseries", { granularity });

export interface FilterOptions {
   primary_types: string[];
   community_areas: { id: number; name: string }[];
   date_range: { min: string; max: string };
}

export const useFilterOptions = () =>
   useQuery<FilterOptions>({
      queryKey: ["filter-options"],
      queryFn: () => get<FilterOptions>("/analytics/filters"),
      staleTime: Infinity,
   });

export const useCrimeTypes = (top = 10) =>
   useApi<CrimeTypeRow[]>("crime-types", "/analytics/crime-types", { top });

export const useHeatmap = () => useApi<HeatmapRow[]>("heatmap", "/analytics/heatmap");

export const useZones = (zone = "community_area") =>
   useApi<ZoneRow[]>("zones", "/analytics/map/zones", { zone });

export const useCommunityGeo = () =>
   useQuery<CommunityGeoJson>({
      queryKey: ["geo-community-areas"],
      staleTime: Infinity,
      queryFn: async () => {
         const res = await fetch("/geo/community_areas.geojson");
         if (!res.ok) throw new Error("No se pudo cargar el GeoJSON de community areas");
         const gj = (await res.json()) as CommunityGeoJson;
         // Normaliza: id numérico para cruzar con zone_id de la API
         gj.features.forEach((f) => {
            f.id = Number(f.properties.area_numbe);
         });
         return gj;
      },
   });

export const useMapPoints = () => useApi<PointRow[]>("map-points", "/analytics/map/points");

export const useTrends = () =>
   useQuery<TrendsResponse>({
      queryKey: ["trends"], staleTime: Infinity,
      queryFn: () => get<TrendsResponse>("/predict/trends", {}, PREDICT),
   });

export const useTypeSeries = (primaryType: string) =>
   useQuery<TypeSeries>({
      queryKey: ["type-series", primaryType], staleTime: Infinity,
      queryFn: () => get<TypeSeries>(`/predict/series/${encodeURIComponent(primaryType)}`, {}, PREDICT),
   });

export const useTrendMetrics = () =>
   useQuery<TrendMetrics>({
      queryKey: ["trend-metrics"], staleTime: Infinity,
      queryFn: () => get<TrendMetrics>("/predict/metrics", {}, PREDICT),
   });