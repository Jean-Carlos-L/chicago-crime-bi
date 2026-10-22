SELECT f.crime_id, f.date_key, f.time_key, f.arrest, f.domestic, f.latitude, f.longitude,
       ct.primary_type, ct.crime_group, ct.is_property, ct.weapon_involved,
       l.community_area, l.community_area_name, l.district, l.beat
FROM fact_crime f
JOIN dim_crime_type ct ON ct.crime_type_key = f.crime_type_key
JOIN dim_location   l  ON l.location_key   = f.location_key
WHERE f.date_key BETWEEN CAST(:date_from AS INT) AND CAST(:date_to AS INT)
  AND (:primary_types = 'ALL'
       OR STRPOS(',' || :primary_types || ',', ',' || ct.primary_type || ',') > 0)
  AND (:community_areas = 'ALL'
       OR STRPOS(',' || :community_areas || ',', ',' || CAST(l.community_area AS VARCHAR) || ',') > 0)