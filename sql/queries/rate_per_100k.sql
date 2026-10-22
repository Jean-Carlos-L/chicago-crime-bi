WITH base AS ({base}),
days AS (
    SELECT COUNT(*) AS n_days
    FROM dim_date
    WHERE date_key BETWEEN CAST(:date_from AS INT) AND CAST(:date_to AS INT)
)
SELECT b.community_area      AS zone_id,
       b.community_area_name AS zone_label,
       p.population,
       COUNT(*) AS total,
       CAST(ROUND(COUNT(*) * 100000.0 / p.population, 1) AS FLOAT8) AS rate_period,
       CAST(ROUND(COUNT(*) * 100000.0 / p.population * 365.0 / days.n_days, 1) AS FLOAT8) AS rate_annualized
FROM base b
JOIN ref_community_population p ON p.community_area = b.community_area
CROSS JOIN days
GROUP BY b.community_area, b.community_area_name, p.population, days.n_days
ORDER BY rate_annualized DESC