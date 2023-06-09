import json
import random
data = {}
tiempos = 10;
numberOfSimulation = 1
times = []


# Reading data back
with open('.././data/CHL/Topology/bus.json', 'r') as f:
	data = json.load(f)

for i in range(0, len(data)):
	times = []
	for j in range(0, tiempos):
		barRepRandom = 5000 * random.random()
		marginal_cost_Random = 8 * random.random()

		new_time = {}
		new_time['marginal_cost'] = marginal_cost_Random
		new_time['BarRetP'] = barRepRandom
		new_time['id'] = data[i]['id']
		new_time['name'] = data[i]['name']
		new_time['time'] = j + 1

		times.append(new_time)

	with open('../data/CHL/Scenarios/' + str(numberOfSimulation) + '/Bus/bus_' + str(data[i]['id']) + '.json', 'w+') as f:
		json.dump(times, f)


# Reading data back
with open('.././data/CHL/Topology/lines.json', 'r') as f:
	data = json.load(f)

for i in range(0, len(data)):
	times = []
	for j in range(0, tiempos):
		flow = data[i]['max_flow_a_b'] * random.random() * 2 - data[i]['max_flow_a_b']

		new_time = {}
		new_time['flow'] = flow
		new_time['bus_b'] = data[i]['bus_b'] 
		new_time['bus_a'] = data[i]['bus_a'] 
		new_time['id'] = data[i]['id']
		new_time['time'] = j + 1

		times.append(new_time)

	with open('../data/CHL/Scenarios/' + str(numberOfSimulation) + '/Lines/line_' + str(data[i]['id']) + '.json', 'w+') as f:
		json.dump(times, f)
