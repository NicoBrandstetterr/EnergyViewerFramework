import sys
import subprocess
import urllib2
import json

centrals={}
lines={}
buses={}
reservoirs={}

BASE_URL = sys.argv[1];
ROOT_FOLDER = sys.argv[2];
SIM_NUMBER = sys.argv[3];
MAX_TIME = sys.argv[4];

# Reading data back
with open(ROOT_FOLDER + '/Topology/Electric/centrals.json', 'r') as f:
    centrals = json.load(f)

# Reading data back
with open(ROOT_FOLDER + '/Topology/Electric/bus.json', 'r') as f:
    buses = json.load(f)

# Reading data back
with open(ROOT_FOLDER + '/Topology/Electric/lines.json', 'r') as f:
    lines = json.load(f)

# Reading data back
with open(ROOT_FOLDER + '/Topology/Hydric/reservoirs.json', 'r') as f:
    reservoirs = json.load(f)

# Chevy
print "Descargando resultados de centrales...";
for i in range(0, len(centrals)):
    subprocess.call([   "wget",
                        "-c",
                        "-nv",
                        BASE_URL + '/statistics/central/' + str(centrals[i]['id']) + '/pgen?hidrology=' + str(SIM_NUMBER) + "&since=1&to=" + str(MAX_TIME),
                        "-O",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Centrals/central_' + str(centrals[i]['id']) + '.json']);

print "Descargando resultados de lineas...";
for i in range(0, len(lines)):
    subprocess.call([   "wget",
                        "-c",
                        "-nv",
                        BASE_URL + '/statistics/line/' + str(lines[i]['id']) + '/flow?hidrology=' + str(SIM_NUMBER) + "&since=1&to=" + str(MAX_TIME),
                        "-O",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Lines/line_' + str(lines[i]['id']) + '.json']);

print "Descargando resultados de barras...";
for i in range(0, len(buses)):
    subprocess.call([   "wget",
                        "-c",
                        "-nv",
                        BASE_URL + '/statistics/bus/' + str(buses[i]['id']) + '/cost?hidrology=' + str(SIM_NUMBER) + "&since=1&to=" + str(MAX_TIME),
                        "-O",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_cost_' + str(buses[i]['id']) + '.json']);
    subprocess.call([   "wget",
                        "-c",
                        "-nv",
                        BASE_URL + '/statistics/bus/' + str(buses[i]['id']) + '/load?hidrology=' + str(SIM_NUMBER) + "&since=1&to=" + str(MAX_TIME),
                        "-O",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_load_' + str(buses[i]['id']) + '.json']);

print "Descargando resultados de embalses...";
for i in range(0, len(reservoirs)):
    subprocess.call([   "wget",
                        "-c",
                        "-nv",
                        BASE_URL + '/statistics/reservoir/' + str(reservoirs[i]['id']) + '/level?hidrology=' + str(SIM_NUMBER) + "&since=1&to=" + str(MAX_TIME),
                        "-O",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Reservoirs/reservoir_' + str(reservoirs[i]['id']) + '.json']);

# PLP
#print "Descargando resultados de centrales...";
#for i in range(0, len(centrals)):
#    subprocess.call([   "wget",
#                        "-c",
#                        "-nv",
#                        BASE_URL + '/results/centrals/' + str(centrals[i]['id']) + '?hidrology=' + str(SIM_NUMBER),
#                        "-O",
#                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Centrals/central_' + str(centrals[i]['id']) + '.json']);
#
#print "Descargando resultados de lineas...";
#for i in range(0, len(lines)):
#    subprocess.call([   "wget",
#                        "-c",
#                        "-nv",
#                        BASE_URL + '/results/lines/' + str(lines[i]['id']) + '?hidrology=' + str(SIM_NUMBER),
#                        "-O",
#                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Lines/line_' + str(lines[i]['id']) + '.json']);
#
#print "Descargando resultados de barras...";
#for i in range(0, len(buses)):
#    subprocess.call([   "wget",
#                        "-c",
#                        "-nv",
#                        BASE_URL + '/results/bus/' + str(buses[i]['id']) + '?hidrology=' + str(SIM_NUMBER),
#                        "-O",
#                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_' + str(buses[i]['id']) + '.json']);
#
#print "Descargando resultados de embalses...";
#for i in range(0, len(reservoirs)):
#    subprocess.call([   "wget",
#                        "-c",
#                        "-nv",
#                        BASE_URL + '/results/reservoirs/' + str(reservoirs[i]['id']) + '?hidrology=' + str(SIM_NUMBER),
#                        "-O",
#                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Reservoirs/reservoir_' + str(reservoirs[i]['id']) + '.json']);
