WITH p AS (
    SELECT CAST(:date_from AS INT) AS cur_from,
           CAST(:date_to   AS INT) AS cur_to,
           CAST(TO_CHAR(DATEADD(year, -1, TO_DATE(:date_from, 'YYYYMMDD')), 'YYYYMMDD') AS INT) AS prev_from,
           CAST(TO_CHAR(DATEADD(year, -1, TO_DATE(:date_to,   'YYYYMMDD')), 'YYYYMMDD') AS INT) AS prev_to
),
agg AS (
    SELECT COALESCE(SUM(CASE WHEN f.date_key BETWEEN p.cur_from  AND p.cur_to  THEN 1 ELSE 0 END), 0) AS current_total,
           COALESCE(SUM(CASE WHEN f.date_key BETWEEN p.prev_from AND p.prev_to THEN 1 ELSE 0 END), 0) AS previous_total
    FROM fact_crime f
    CROSS JOIN p
    JOIN dim_crime_type ct ON ct.crime_type_key = f.crime_type_key
    JOIN dim_location   l  ON l.location_key   = f.location_key
    WHERE (f.date_key BETWEEN p.cur_from AND p.cur_to OR f.date_key BETWEEN p.prev_from AND p.prev_to)
      AND (:primary_types = 'ALL'
           OR STRPOS(',' || :primary_types || ',', ',' || ct.primary_type || ',') > 0)
      AND (:community_areas = 'ALL'
           OR STRPOS(',' || :community_areas || ',', ',' || CAST(l.community_area AS VARCHAR) || ',') > 0)
)
SELECT agg.current_total,
       agg.previous_total,
       CAST(ROUND(100.0 * (agg.current_total - agg.previous_total)
                  / NULLIF(agg.previous_total, 0), 2) AS FLOAT8) AS variation_pct,
       p.prev_from,
       p.prev_to,
       (p.prev_from >= (SELECT MIN(date_key) FROM dim_date)) AS prev_available
FROM agg CROSS JOIN p