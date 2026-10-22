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

export interface TrendRow {
   primary_type: string;
   next_q: number;
   last_q: number;
   year_ago_q: number;
   variation_pct: number;
   variation_lo_pct: number;
   variation_hi_pct: number;
   vs_year_ago_pct: number;
   trend: "UP" | "DOWN" | "STABLE";
   clear: boolean;
   avg_monthly: number;
}

export interface TrendsResponse {
   last_month: string;
   horizon: number;
   stable_threshold_pct: number;
   table: TrendRow[];
   excluded: string[];
}

export interface TypeSeries {
   history: { month: string; total: number }[];
   forecast: { month: string; forecast: number; lo: number; hi: number }[];
}

export interface TrendMetrics {
   origins: number;
   samples: number;
   direction_acc_pct: Record<string, number>;
   variation_mae_pp: Record<string, number>;
   quarter_wape_pct: Record<string, number>;
   interval80_in_sample_coverage_pct: number;
}