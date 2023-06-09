#!/bin/bash

API_URL="http://172.17.50.180:8080";
SCENARIOS_SUBFOLDERS=("Bus" "Centrals" "Lines" "Reservoirs");
TOPOLOGY_SUBFOLDERS=("Electric" "Hydric");
MAX_TIME=193;

# Uso
if [ $# -ne 1 ]
then
    echo "Uso: ./dataget.sh nombre_carpeta_base";
    exit 1;
fi

ROOT_FOLDER=$1;

# Se crean las carpetas base
mkdir -p "${ROOT_FOLDER}/Scenarios";
mkdir -p "${ROOT_FOLDER}/Topology";

# Descarga de índices de hidrologías
wget -c -nv "${API_URL}/hidrologies" -O "${ROOT_FOLDER}/Scenarios/hidrologies.json";

HYDRO_STRING=$(python2 "hydroAvailability.py" "${ROOT_FOLDER}/Scenarios/hidrologies.json");
SCENARIOS=($HYDRO_STRING);

# Se crean las carpetas de escenarios
for i in ${SCENARIOS[*]}
do
    for f in ${SCENARIOS_SUBFOLDERS[*]}
    do
        mkdir -p "${ROOT_FOLDER}/Scenarios/$i/$f";
    done
done

# Se crean las carpetas de topologías
for f in ${TOPOLOGY_SUBFOLDERS[*]}
do
    mkdir -p "${ROOT_FOLDER}/Topology/$f";
done

# Descarga de topologías
for t in "bus" "lines" "centrals"
do
    wget -c -nv "${API_URL}/input/$t" -O "${ROOT_FOLDER}/Topology/${TOPOLOGY_SUBFOLDERS[0]}/$t.json";
done

for t in "junctions" "reservoirs" "waterways"
do
    wget -c -nv "${API_URL}/input/$t" -O "${ROOT_FOLDER}/Topology/${TOPOLOGY_SUBFOLDERS[1]}/$t.json";
done

# Descarga masiva de datos
for i in ${SCENARIOS[*]}
do
    python2 "urlGet.py" "$API_URL" "${ROOT_FOLDER}" "$i" "${MAX_TIME}";
done

# Parseo de datos
for i in ${SCENARIOS[*]}
do
    python2 "parseJson.py" "${ROOT_FOLDER}" "$i";
done

# Adaptación final de archivo hidrologies.json -> hydrologies.json
python2 "hydroAdapter.py" "${ROOT_FOLDER}"
