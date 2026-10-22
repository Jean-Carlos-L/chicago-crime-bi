-- Recarga completa: primero la tabla de hechos, luego las dimensiones
DROP TABLE IF EXISTS fact_crime;
DROP TABLE IF EXISTS dim_date;
DROP TABLE IF EXISTS dim_time;
DROP TABLE IF EXISTS dim_location;
DROP TABLE IF EXISTS dim_crime_type;
DROP TABLE IF EXISTS dim_location_description;
DROP TABLE IF EXISTS ref_community_population;