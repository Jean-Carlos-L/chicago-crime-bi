WITH base AS ({base})
SELECT COALESCE(primary_type, 'TOTAL') AS category,
       COUNT(*) AS total,
       SUM(CAST(weapon_involved AS INT)) AS with_weapon,
       CAST(ROUND(100.0 * SUM(CAST(weapon_involved AS INT)) / COUNT(*), 2) AS FLOAT8) AS weapon_pct
FROM base
WHERE primary_type IN ('ROBBERY', 'ASSAULT', 'BATTERY')
GROUP BY ROLLUP (primary_type)
ORDER BY GROUPING(primary_type), total DESC