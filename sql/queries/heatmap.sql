WITH base AS ({base}),
weekday_counts AS (
    SELECT day_of_week, COUNT(*) AS n_days
    FROM dim_date
    WHERE date_key BETWEEN CAST(:date_from AS INT) AND CAST(:date_to AS INT)
    GROUP BY day_of_week
)
SELECT d.day_of_week,
       d.day_name,
       b.time_key AS hour_of_day,
       COUNT(*)   AS total,
       CAST(ROUND(CAST(COUNT(*) AS FLOAT8) / w.n_days, 2) AS FLOAT8) AS avg_per_day
FROM base b
JOIN dim_date d ON d.date_key = b.date_key
JOIN weekday_counts w ON w.day_of_week = d.day_of_week
GROUP BY d.day_of_week, d.day_name, b.time_key, w.n_days
ORDER BY d.day_of_week, hour_of_day