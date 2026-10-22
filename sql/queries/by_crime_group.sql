WITH base AS ({base})
SELECT crime_group,
       COUNT(*) AS total,
       CAST(ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS FLOAT8) AS share_pct
FROM base
GROUP BY crime_group
ORDER BY total DESC