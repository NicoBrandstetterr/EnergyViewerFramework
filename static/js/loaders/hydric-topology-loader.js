"use strict";

async function loadHydricData() {
  const [jtResponse, wtResponse, rsResponse] = await Promise.all([
    fetch(CONFIG.URL_JUNCTIONS),
    fetch(CONFIG.URL_WATERWAYS),
    fetch(CONFIG.URL_RESERVOIRS)
  ]);

  if (!jtResponse.ok) {
    createLog("No está el archivo de junctions (junctions.json)", LOG_TYPE.ERROR);
    return;
  }
  if (!wtResponse.ok) {
    createLog("No está el archivo de waterways (waterways.json)", LOG_TYPE.ERROR);
    return;
  }
  if (!rsResponse.ok) {
    createLog("No está el archivo de embalses (reservoirs.json)", LOG_TYPE.ERROR);
    return;
  }

  const [jt, wt, rs] = await Promise.all([
    jtResponse.json(),
    wtResponse.json(),
    rsResponse.json()
  ]);
  
  createLog('Archivo de junctions leído', LOG_TYPE.SUCCESS);
  createLog('Archivo de waterways leído', LOG_TYPE.SUCCESS);
  createLog('Archivo de embalses leído', LOG_TYPE.SUCCESS);

  loadHydricTopology(jt, wt, rs);
  parseHydricTopologyToNetwork();
  const result = await generateNetwork(hydricContainer, nodesHArray, edgesHArray, TOPOLOGY_TYPES.HYDRIC);
  createLog('Red hídrica generada correctamente!', LOG_TYPE.SUCCESS);

  hydricNetwork = result.network;
  hydricNodes = result.nodes;
  hydricEdges = result.edges;
  enableDrag(hydricNetwork, $('#my-hydric-network'), hydricNodes);
}

// loadHydricData();

logTime("hydric-topology-loader.js");