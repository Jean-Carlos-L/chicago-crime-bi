CREATE TABLE dim_date (
    date_key     INTEGER      NOT NULL,   -- YYYYMMDD
    full_date    DATE         NOT NULL,
    year         INTEGER      NOT NULL,
    quarter      INTEGER      NOT NULL,
    month        INTEGER      NOT NULL,
    month_name   VARCHAR(12)  NOT NULL,
    week_of_year INTEGER      NOT NULL,
    day_of_week  INTEGER      NOT NULL,   -- 1 = lunes
    day_name     VARCHAR(12)  NOT NULL,
    is_weekend   BOOLEAN      NOT NULL,
    is_holiday   BOOLEAN      NOT NULL,
    PRIMARY KEY (date_key)
) DISTSTYLE ALL SORTKEY (date_key);

CREATE TABLE dim_time (
    time_key    INTEGER     NOT NULL,     -- hora 0-23
    hour        INTEGER     NOT NULL,
    part_of_day VARCHAR(12) NOT NULL,
    PRIMARY KEY (time_key)
) DISTSTYLE ALL;

CREATE TABLE dim_location (
    location_key        INTEGER     NOT NULL,
    beat                VARCHAR(4)  NOT NULL,
    district            INTEGER     NOT NULL,   -- -1 = UNKNOWN
    ward                INTEGER     NOT NULL,   -- -1 = UNKNOWN
    community_area      INTEGER     NOT NULL,   -- -1 = UNKNOWN
    community_area_name VARCHAR(64) NOT NULL,
    PRIMARY KEY (location_key)
) DISTSTYLE ALL;

CREATE TABLE dim_crime_type (
    crime_type_key  INTEGER      NOT NULL,
    iucr            VARCHAR(8)   NOT NULL,
    primary_type    VARCHAR(64)  NOT NULL,
    description     VARCHAR(128) NOT NULL,
    fbi_code        VARCHAR(8)   NOT NULL,
    crime_group     VARCHAR(16)  NOT NULL,
    is_property     BOOLEAN      NOT NULL,
    weapon_involved BOOLEAN      NOT NULL,
    PRIMARY KEY (crime_type_key)
) DISTSTYLE ALL;

CREATE TABLE dim_location_description (
    loc_desc_key         INTEGER      NOT NULL,
    location_description VARCHAR(128) NOT NULL,
    PRIMARY KEY (loc_desc_key)
) DISTSTYLE ALL;