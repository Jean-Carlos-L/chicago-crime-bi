SELECT 'huerfanos date' AS check_name, COUNT(*) AS bad_rows
FROM fact_crime f LEFT JOIN dim_date d ON f.date_key = d.date_key
WHERE d.date_key IS NULL
UNION ALL
SELECT 'huerfanos time', COUNT(*)
FROM fact_crime f LEFT JOIN dim_time d ON f.time_key = d.time_key
WHERE d.time_key IS NULL
UNION ALL
SELECT 'huerfanos location', COUNT(*)
FROM fact_crime f LEFT JOIN dim_location d ON f.location_key = d.location_key
WHERE d.location_key IS NULL
UNION ALL
SELECT 'huerfanos crime_type', COUNT(*)
FROM fact_crime f LEFT JOIN dim_crime_type d ON f.crime_type_key = d.crime_type_key
WHERE d.crime_type_key IS NULL
UNION ALL
SELECT 'huerfanos loc_desc', COUNT(*)
FROM fact_crime f LEFT JOIN dim_location_description d ON f.loc_desc_key = d.loc_desc_key
WHERE d.loc_desc_key IS NULL
UNION ALL
SELECT 'crime_id duplicados', COUNT(*) - COUNT(DISTINCT crime_id)
FROM fact_crime