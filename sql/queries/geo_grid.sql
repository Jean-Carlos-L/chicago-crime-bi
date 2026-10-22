WITH base AS ({base})
SELECT CAST(ROUND(latitude, 3)  AS FLOAT8) AS lat,
       CAST(ROUND(longitude, 3) AS FLOAT8) AS lon,
       COUNT(*) AS total
FROM base
WHERE latitude IS NOT NULL
GROUP BY 1, 2
ORDER BY total DESC
LIMIT 5000