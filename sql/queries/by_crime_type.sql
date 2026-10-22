WITH base AS ({base})
SELECT primary_type,
       COUNT(*) AS total,
       CAST(ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS FLOAT8) AS share_pct,
       SUM(CAST(arrest AS INT)) AS arrests,
       CAST(ROUND(100.0 * SUM(CAST(arrest AS INT)) / COUNT(*), 2) AS FLOAT8) AS arrest_rate_pct
FROM base
GROUP BY primary_type
ORDER BY total DESC