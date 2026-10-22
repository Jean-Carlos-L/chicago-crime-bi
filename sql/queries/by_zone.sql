WITH base AS ({base})
SELECT {zone_id}    AS zone_id,
       {zone_label} AS zone_label,
       COUNT(*)     AS total,
       CAST(ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS FLOAT8) AS share_pct,
       RANK() OVER (ORDER BY COUNT(*) DESC) AS zone_rank
FROM base
GROUP BY {zone_id}, {zone_label}
ORDER BY total DESC