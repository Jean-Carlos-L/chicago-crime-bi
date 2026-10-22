CREATE TABLE ref_community_population (
    community_area INTEGER NOT NULL,
    population     INTEGER NOT NULL,
    source_year    INTEGER NOT NULL,
    PRIMARY KEY (community_area)
) DISTSTYLE ALL;