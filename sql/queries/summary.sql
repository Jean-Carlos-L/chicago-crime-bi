WITH base AS ({base}),
days AS (
    SELECT COUNT(*) AS n_days
    FROM dim_date
    WHERE date_key BETWEEN CAST(:date_from AS INT) AND CAST(:date_to AS INT)
),
agg AS (
    SELECT COUNT(*) AS total,
           COALESCE(SUM(CAST(is_property AS INT)), 0) AS property_total,
           COALESCE(SUM(CAST(arrest AS INT)), 0)      AS arrests
    FROM base
)
SELECT agg.total,
       agg.property_total,
       CAST(ROUND(100.0 * agg.property_total / NULLIF(agg.total, 0), 2) AS FLOAT8) AS property_pct,
       agg.arrests,
       CAST(ROUND(100.0 * agg.arrests / NULLIF(agg.total, 0), 2) AS FLOAT8)        AS arrest_rate_pct,
       days.n_days,
       CAST(ROUND(CAST(agg.total AS FLOAT8) / NULLIF(days.n_days, 0), 1) AS FLOAT8) AS daily_avg
FROM agg CROSS JOIN days