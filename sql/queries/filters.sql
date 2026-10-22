SELECT 'primary_type' AS kind, primary_type AS value, primary_type AS label
FROM dim_crime_type
GROUP BY primary_type
UNION ALL
SELECT 'community_area', CAST(community_area AS VARCHAR), community_area_name
FROM dim_location
WHERE community_area <> -1
GROUP BY community_area, community_area_name
UNION ALL
SELECT 'date_range', CAST(MIN(date_key) AS VARCHAR), CAST(MAX(date_key) AS VARCHAR)
FROM dim_date