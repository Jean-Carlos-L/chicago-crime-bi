-- La Lambda consulta con su propio usuario IAM. Se reaplica en cada recarga completa.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;