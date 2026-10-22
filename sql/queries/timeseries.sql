WITH base AS ({base})
SELECT d.year, d.month, COUNT(*) AS total
FROM base b
JOIN dim_date d ON d.date_key = b.date_key
GROUP BY d.year, d.month
ORDER BY d.year, d.month