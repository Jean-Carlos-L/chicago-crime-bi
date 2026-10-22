export interface Filters {
   date_from: string;
   date_to: string;
   primary_types: string;
   community_areas: string;
}

export interface CrimeTypeRow {
   primary_type: string;
   total: number;
   share_pct: number;
   arrests: number;
   arrest_rate_pct: number;
}

export interface GroupRow {
   crime_group: "VIOLENT" | "NON_VIOLENT" | "OTHER";
   total: number;
   share_pct: number;
}

export interface ZoneRow {
   zone_id: number | string;
   zone_label: string;
   total: number;
   share_pct: number;
   zone_rank: number;
}

export interface RateRow {
   zone_id: number;
   zone_label: string;
   population: number;
   total: number;
   rate_period: number;
   rate_annualized: number;
}

export interface WeaponRow {
   category: string;
   total: number;
   with_weapon: number;
   weapon_pct: number;
}

export interface Summary {
   filters: Filters;
   total: number;
   top_crime_type: CrimeTypeRow | null;
   property_pct: number | null;
   groups: GroupRow[];
   variation: {
      current: number;
      previous: number;
      pct: number | null;
      previous_period: [number, number];
   };
   daily_avg: number | null;
   top_zone: ZoneRow | null;
   hotspots: ZoneRow[];
   rate_per_100k: { city_annualized: number | null; by_area: RateRow[] };
   arrest: { overall_pct: number | null; by_type: CrimeTypeRow[] };
   weapons: WeaponRow[];
}

export interface TimeseriesRow {
   year: number;
   /** Ausente cuando la serie se pide con granularidad anual. */
   month?: number;
   total: number;
}

export interface HeatmapRow {
   day_of_week: number; // 1 = lunes
   day_name: string;
   hour_of_day: number;
   total: number;
   avg_per_day: number;
}

export interface CommunityFeature {
   type: "Feature";
   id?: number;
   properties: { area_numbe: string | number; community: string;[k: string]: unknown };
   geometry: unknown;
}

export interface CommunityGeoJson {
   type: "FeatureCollection";
   features: CommunityFeature[];
}

export interface PointRow {
   lat: number;
   lon: number;
   total: number;
}