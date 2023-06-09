import sys
import json
import random
import subprocess

centrals={}
lines={}
buses={}
reservoirs={}

ROOT_FOLDER = sys.argv[1];
SIM_NUMBER = sys.argv[2];

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

print "Parseando centrales...";
for i in range(0, len(centrals)):
    with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Centrals/central_' + str(centrals[i]['id']) + '.json', 'r') as f2:
        data2 = json.load(f2)

        for j in range(0, len(data2)):

            data2[j]['CenPgen'] = data2[j]['value']
            data2[j]['CenCVar'] = 0
            data2[j]['CenQgen'] = 0
            data2[j]['bus_id'] = centrals[i]['bus_id']
            data2[j]['id'] = centrals[i]['id']
            data2[j]['name'] =  centrals[i]['name']

        with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Centrals/central_' + str(centrals[i]['id']) + '.json', 'w+') as f3:
            json.dump(data2, f3)

print "Parseando lineas...";
for i in range(0, len(lines)):
    with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Lines/line_' + str(lines[i]['id']) + '.json', 'r') as f2:
        data2 = json.load(f2)

        for j in range(0, len(data2)):

            data2[j]['flow'] = data2[j]['value']
            data2[j]['bus_a'] = lines[i]['bus_a']
            data2[j]['bus_b'] = lines[i]['bus_b']
            data2[j]['id'] = lines[i]['id']

        with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Lines/line_' + str(lines[i]['id']) + '.json', 'w+') as f3:
            json.dump(data2, f3)

print "Parseando barras...";
for i in range(0, len(buses)):
    with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_cost_' + str(buses[i]['id']) + '.json', 'r') as f2:
        data2 = json.load(f2)
        with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_load_' + str(buses[i]['id']) + '.json', 'r') as fload:

            dataLoad = json.load(fload)

            for j in range(0, len(data2)):

                data2[j]['marginal_cost'] = data2[j]['value']
                data2[j]['BarRetP'] = dataLoad[j]['value']
                data2[j]['id'] = buses[i]['id']
                data2[j]['name'] =  buses[i]['name']

            with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_' + str(buses[i]['id']) + '.json', 'w+') as f3:
                json.dump(data2, f3)

    subprocess.call(["rm",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_cost_' + str(buses[i]['id']) + '.json']);
    subprocess.call(["rm",
                        ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Bus/bus_load_' + str(buses[i]['id']) + '.json']);

print "Parseando embalses...";
for i in range(0, len(reservoirs)):
    with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Reservoirs/reservoir_' + str(reservoirs[i]['id']) + '.json', 'r') as f2:
        data2 = json.load(f2)

        for j in range(0, len(data2)):

            data2[j]['level'] = data2[j]['value']
            data2[j]['junction_id'] = reservoirs[i]['junction_id']
            data2[j]['id'] = reservoirs[i]['id']
            data2[j]['name'] =  reservoirs[i]['name']

        with open(ROOT_FOLDER + '/Scenarios/' + str(SIM_NUMBER) + '/Reservoirs/reservoir_' + str(reservoirs[i]['id']) + '.json', 'w+') as f3:
            json.dump(data2, f3)
