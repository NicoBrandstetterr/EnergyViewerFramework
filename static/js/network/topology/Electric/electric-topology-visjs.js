"use strict";

/**
 * Todos los métodos relevantes al generar la topología.
 *
 */
var electricTopology = {
  buses: [],
  lines: [],
  centrals: []
};

var electricMapTopology = {
  buses: [],
  lines: [],
  centrals: []
};

async function loadElectricTopology(buses, lines, centrals){
  console.log("function: loadElectricTopology");
  // console.log("hidrotimes 0: ",hydrologyTimes)
  // Parseamos las variables recibidas.

  await parseBuses(buses, electricTopology, TOPOLOGY_TYPES.ELECTRIC);
 
  await parseBuses(buses, electricMapTopology, TOPOLOGY_TYPES.GEO);

  parseLines(lines, electricTopology);

  parseCentrals(centrals, electricTopology, TOPOLOGY_TYPES.ELECTRIC);
  
  parseCentrals(centrals, electricMapTopology, TOPOLOGY_TYPES.GEO);

}

function parseElectricTopologyToNetwork(){

 // nodesArray = [];
 // edgesArray = [];
  console.log("Funcion: parseElectricTopologyToNetwork")
  let t0 = performance.now();
  addBusesToNetwork(electricTopology.buses);
  addLinesToNetwork(electricTopology.lines);
  addCentralsToNetwork(electricTopology.centrals);

  var bus_ids = electricTopology.buses.map(bus => bus.id);
  var owners = connexComponents(bus_ids,electricTopology.lines.map(line => [line.from,line.to]));
  var count = {};
  for(var i=0; i<owners.length; i++){
    if(! (owners[i] in count)){
      count[owners[i]] = 0;
    }
    count[owners[i]] = count[owners[i]] + 1;
  }
  var loners = [];
  for(var i=0; i<owners.length; i++){
    if(count[owners[i]] === 1){
      loners.push(bus_ids[i]);
    }
  }
  var i = loners.length;
  var myLog;
  if(i){
    myLog = createLog("Hay barras disconexas",LOG_TYPE.WARNING);
  }
  while(i--){
    var id = i;
    addDetailsToLog(myLog,
      {
        message: "La barra " +
                  electricTopology.buses[dictBarras[loners[id]].indice].label +
                  " se encuentra disconexa",
        fun: () => {if(currentTopologyType === TOPOLOGY_TYPES.ELECTRIC) goToNode(electricNetwork, electricNodes, loners[id])}});
  }
  let t1 = performance.now();
  console.log("parseElectricTopologyToNetwork tardó " + (t1-t0) + " milisegundos.")
}

function addDataToMapNetwork(){
  let t0 = performance.now();
  console.log("pasando por addDataToMapNetwork")
  addBusesToMapNetwork(electricMapTopology.buses);
  addLinesToMapNetwork(electricMapTopology.lines);
  addCentralsToMapNetwork(electricMapTopology.centrals);
  let t1 = performance.now();
  console.log("addDataToMapNetwork tardó " + (t1-t0) + " milisegundos.")

}

function generateTooltip(labels) {
    // Generación del tooltip
    
    let tooltip = document.createElement('div');
    
    for (var i = 0; i < labels.length; i++) {
        let tooltip_i = document.createElement('p');
        tooltip_i.innerHTML = labels[i];
        tooltip.appendChild(tooltip_i);
    }
    
    return tooltip;
}

logTime("electric-topology-visjs.js");
