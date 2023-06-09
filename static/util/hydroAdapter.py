import json
import subprocess
import sys

ROOT_FOLDER = sys.argv[1]

print "Adaptando hydrologies.json...";
parsedHydro = []

try:
    with open(ROOT_FOLDER + '/Scenarios/hidrologies.json') as hydro:
        dataHydro = json.load(hydro)

        for i in dataHydro['available']:
            parsedHydro.append(i[0])

    print parsedHydro

except Exception:
    print ""

with open(ROOT_FOLDER + '/Scenarios/hydrologies.json', 'w+') as hydrodump:
    json.dump(parsedHydro, hydrodump);

subprocess.call(["rm",
                    ROOT_FOLDER + '/Scenarios/hidrologies.json']);
