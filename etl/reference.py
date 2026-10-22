# etl/reference.py
_NAMES = """Rogers Park|West Ridge|Uptown|Lincoln Square|North Center|Lake View|
Lincoln Park|Near North Side|Edison Park|Norwood Park|Jefferson Park|Forest Glen|
North Park|Albany Park|Portage Park|Irving Park|Dunning|Montclare|Belmont Cragin|
Hermosa|Avondale|Logan Square|Humboldt Park|West Town|Austin|West Garfield Park|
East Garfield Park|Near West Side|North Lawndale|South Lawndale|Lower West Side|
Loop|Near South Side|Armour Square|Douglas|Oakland|Fuller Park|Grand Boulevard|
Kenwood|Washington Park|Hyde Park|Woodlawn|South Shore|Chatham|Avalon Park|
South Chicago|Burnside|Calumet Heights|Roseland|Pullman|South Deering|East Side|
West Pullman|Riverdale|Hegewisch|Garfield Ridge|Archer Heights|Brighton Park|
McKinley Park|Bridgeport|New City|West Elsdon|Gage Park|Clearing|West Lawn|
Chicago Lawn|West Englewood|Englewood|Greater Grand Crossing|Ashburn|
Auburn Gresham|Beverly|Washington Heights|Mount Greenwood|Morgan Park|O'Hare|
Edgewater"""

COMMUNITY_AREAS = {
    i: name.strip().upper()
    for i, name in enumerate(_NAMES.replace("\n", "").split("|"), start=1)
}
assert len(COMMUNITY_AREAS) == 77

VIOLENT = {"ROBBERY", "ASSAULT", "BATTERY", "HOMICIDE", "CRIMINAL SEXUAL ASSAULT", "KIDNAPPING"}
NON_VIOLENT = {"THEFT", "BURGLARY", "NARCOTICS", "MOTOR VEHICLE THEFT", "CRIMINAL DAMAGE", "DECEPTIVE PRACTICE", "CRIMINAL TRESPASS"}


CRIME_GROUP = {**{t: "VIOLENT" for t in VIOLENT}, **{t: "NON_VIOLENT" for t in NON_VIOLENT}}

# Delitos contra la propiedad. CRIMINAL DAMAGE por definición daña bienes;
PROPERTY_TYPES = {"THEFT", "BURGLARY", "MOTOR VEHICLE THEFT", "CRIMINAL DAMAGE", "ARSON"}

# Armas: el dataset NO tiene una columna de armas. Se infiere del texto de `description`
# y solo para robos y agresiones.
WEAPON_ELIGIBLE = {"ROBBERY", "ASSAULT", "BATTERY"}
WEAPON_REGEX = r"HANDGUN|FIREARM|KNIFE|CUTTING|DANG|^ARMED"