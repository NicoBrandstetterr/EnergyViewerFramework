"use strict";

/**
 * Todos los métodos relevantes al generar la hidrología.
 *
 */
var hydricTopology = {
  junctions: [],
  waterways: []
 // reservoirs: []
};



//graph es un arreglo de arreglos de adyacencia y src es la posicion del nodo a buscar
function dijkstra(graph,src){
  var Q = [],dist=[];
  for(var i=0; i<graph.length; i++){
    Q.push(i);
    dist.push(Number.MAX_SAFE_INTEGER);
  }
  dist[src] = 0;
  while(Q.length){
    var min_dist = dist[Q[0]];
    var u = Q[0];
    var ind = 0;
    for(var i=1;i<Q.length;i++){
      if(dist[Q[i]] < min_dist){
        min_dist = dist[Q[i]];
        u = Q[i];
        ind = i;
      }
    }
    console.log(min_dist,u,ind);
    Q.splice(ind,1);
    for(var i=0;i<graph[u].length; i++){
      var neigh = graph[u][i];
      var alt = dist[u] -1;
      if(alt < dist[neigh]){
        dist[neigh] = alt;
      }
    }

  }
  return dist;
}

var junctionIdToIndice = {};

function loadHydricTopology(junctions, waterways, reservoirs){
  console.log("function: loadHydricTopology");
  // Parseamos las variables recibidas.
  // console.log("hydricTopology: ", hydricTopology);
  parseJunctions(junctions, hydricTopology);
  // console.log("hydricTopology: ", hydricTopology);
  parseReservoirs(reservoirs, hydricTopology);
  // console.log("waterways: ", waterways);
  // console.log("hydricTopology: ",hydricTopology);
  parseWaterways(waterways, hydricTopology);
  // console.log("hydricTopology: ", hydricTopology);
}

function parseHydricTopologyToNetwork(){
  console.log("pasando por parseHydricTopologyToNetwork");
 // nodesHArray = [];
 // edgesHArray = [];

  addJunctionsToNetwork(hydricTopology.junctions);
  addWaterwaysToNetwork(hydricTopology.waterways);
//  addReservoirsToNetwork(hydricTopology.reservoirs);

  
}

logTime("hydric-topology-visjs.js");