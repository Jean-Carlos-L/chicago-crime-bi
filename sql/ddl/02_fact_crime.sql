CREATE TABLE fact_crime (
    crime_id       BIGINT      NOT NULL,
    case_number    VARCHAR(20)  NOT NULL,   -- dimensión degenerada
    date_key       INTEGER      NOT NULL REFERENCES dim_date (date_key),
    time_key       INTEGER      NOT NULL REFERENCES dim_time (time_key),
    location_key   INTEGER      NOT NULL REFERENCES dim_location (location_key),
    crime_type_key INTEGER      NOT NULL REFERENCES dim_crime_type (crime_type_key),
    loc_desc_key   INTEGER      NOT NULL REFERENCES dim_location_description (loc_desc_key),
    arrest         BOOLEAN      NOT NULL,
    domestic       BOOLEAN      NOT NULL,
    block          VARCHAR(100),            -- dimensión degenerada
    latitude       DOUBLE PRECISION,        -- nulo en ~1,5 % de las filas
    longitude      DOUBLE PRECISION,
    occurred_at    TIMESTAMP    NOT NULL,
    updated_on     TIMESTAMP,
    PRIMARY KEY (crime_id)
) DISTSTYLE EVEN SORTKEY (date_key);