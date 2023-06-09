"use strict";

/**
 * En este archivo irán los métodos que afecten a los generadores de manera transversal al tipo de grafo.
 *
 */

function aggregateGens(generators){
  var generators_dict = {};
  for (var i = 0; i < generators.length; i++){
    var gen = generators[i];
    if(!(gen.bus_id in generators_dict)){
      generators_dict[gen.bus_id] = {}
    }
    if(gen.type === null){
      generators_dict[gen.bus_id][gen.name] = gen;
    }
    else if(gen.type in generators_dict[gen.bus_id]){
      generators_dict[gen.bus_id][gen.type] .capacity = generators_dict[gen.bus_id][gen.type].capacity + gen.capacity;
      generators_dict[gen.bus_id][gen.type] .max_power = generators_dict[gen.bus_id][gen.type].max_power + gen.max_power;
    } else {
      generators_dict[gen.bus_id][gen.type] = gen;
      generators_dict[gen.bus_id][gen.type]["name"] = dictBarras[gen.bus_id].name+" "+gen.type;
    }
  }
  var generators_array = [];
  for(var bus in generators_dict){
    if(!generators_dict.hasOwnProperty(bus)){
      continue;
    }
    for(var generator in generators_dict[bus]){
      if(!generators_dict[bus].hasOwnProperty(generator)){
        continue;
      }
      generators_array.push(generators_dict[bus][generator]);
    }
  }
  return generators_array;
}

function centralType(type){
  if(type == null) return "energia";
  switch (type.toLowerCase()) {
    case "biomasa":
    case "carbon":
    case "cogeneracion":
    case "diesel":
    case "embalse":
    case "eolica":
    case "gnl":
    case "pasada":
    case "solar":
      return type.toLowerCase();
      break;
    default:
      return "energia";
  }
}

// Existe una variable generators que contiene los datos de las centrales.
function parseCentrals(centrals, electricTopology, topologyType) {
  // Aqui tenemos que agregar cada generador con su arista respectiva.
  console.log("function: parseCentrals");
  if(CONFIG.AGGREGATE_GENERATORS_ENABLED){
    centrals = aggregateGens(centrals);
  }
  // Iteramos sobre todos los generadores existentes.
  for (var i = 0; i < centrals.length; i++){

    // Variable para dejar en el label si esta activo en forma intuitiva.
    var active = centrals[i].active === 1 ? "Si" : "No";

    // Agregamos tooltip a cada generador
    var tooltip =  generateTooltip(["Generador: " + centrals[i].name,
                                   "Tipo: " + centrals[i].type,
                                   "Capacidad: " + parseFloat(centrals[i].capacity).toFixed(2) + " [MW]",
                                   "Generación máxima: " + parseFloat(centrals[i].max_power).toFixed(2) + " [MW]"]);

    // Incrementamos el id para asignarle uno nuevo al generador.
    maxid = maxid + 2;

    // Generamos el nodo de cada generador con las características propias de cada uno.
    // Por ejemplo la imagen se determina por el tipo.
    centrals[i].name = centrals[i].name.toString();
	  let tipo = centralType(centrals[i].type);

    let generador =
      {
        id: maxid,
        centralId: centrals[i].id,
        //label: centrals[i].name,
        reference:{
          barra: dictBarras[centrals[i].bus_id]
        },
        image: {
		    selected: "./resources/network/icons/central/selected/"+tipo+".png",
		   	unselected: "./resources/network/icons/central/normal/"+tipo+".png"
		},
        shape: 'image',
        size: 50,
        maxSize: 50,
        nodeName: centrals[i].name.replace(/_/gi," "),
        title: tooltip,
        generation: 'undefined',
        category: 'central',
        capacity: centrals[i].capacity,
        max_power: centrals[i].max_power,
        tipo: centrals[i].type,
        arista: {    // Generamos la linea entre el generador y la barra.
          id: maxid + 1,
          color: "black", // Colores de las aristas dependientes del voltaje.
          from: maxid, // desde que nodo empieza la arista.
          to: centrals[i].bus_id, // hasta que nodo termina la arista.
          category: 'central-to-bus',
		  length: 1,
		  physics: { 
			barnesHut: {
				springLength: 1
			}
		  }
        }
      };

    var barraGenerador = electricTopology.buses[dictBarras[centrals[i].bus_id].indice];
    var aleatorio = 2 * Math.PI * Math.random();
	
	if (!barraGenerador.hasGenerators) {
		barraGenerador.hasGenerators = true;
    createBusImage(barraGenerador);
	}

	var centralToBarDistance = 10;

    generador.x = barraGenerador.x + centralToBarDistance* Math.cos(aleatorio);
    generador.y = barraGenerador.y + centralToBarDistance* Math.sin(aleatorio);


    // Agregamos generadores al grafo.


    generador.hidden = true;
    generador.arista.hidden = true;


    electricTopology.centrals.push(generador);


    // Agregamos el generador a su barra correspondiente.
    try {
      electricTopology.buses[dictBarras[centrals[i].bus_id].indice]["generadores"].push(generador);
    }
    catch (e) {
      alert("Problemas con los datos, no se pueden asociar generadores a las barras.");
      break;
    }

  }
}


// Aqui guardamos las posiciones de los generadores para poder mostrarlos pósteriormente.
function saveGeneratorsPositions(network, nodes, edges){
  // Iteramos sobre todas las barras.
  var items = nodes.get({
    filter: function (item) {
      return (item.category === 'bus');
    }
  });

  for (var j = 0; j < items.length; j++) {
    var barra = items[j];
    if (barra.generadores.length > 0) {
      // iteramos sobre todos los generadores para ponerles la posición correspondiente.
      for (var i = 0; i < barra.generadores.length; i++) {
        // Obtenemos las posiciones de los generadores en el grafo creado.
        var positions = network.getPositions(barra.generadores[i].id);

        // Test porfa (Entra dos veces)
        if (barra.generadores[i].id in positions) {//barra.generadores[i].id in positions) {
          var nodex = positions[barra.generadores[i].id].x;
          var nodey = positions[barra.generadores[i].id].y;

          // Guardamos las posiciones en la estructura.
          barra.generadores[i].x = nodex;
          barra.generadores[i].y = nodey;

          barra.generadores[i].reference.barra = barra.id;

          positions = network.getPositions(barra.id);
          barra.generadores[i].reference.x = positions[barra.id].x;
          barra.generadores[i].reference.y = positions[barra.id].y;

          // Borramos del grafo los nodos y aristas
          //edges.remove(barra.generadores[i].arista);
          //nodes.remove(barra.generadores[i]);
        }
      }
    }
  }

  buildDropdown(currentNodes);
}



function toggleGeneratorsOn(nodeIds,network,nodes,edges){
  if(typeof network === 'undefined') network = currentNetwork;
  if(typeof nodes === 'undefined') nodes = currentNodes;
  if(typeof edges === 'undefined') edges = currentEdges;
  if(!Array.isArray(nodeIds)){
    nodeIds = [nodeIds];
  }
  var nodeUpdates = [];
  var edgeUpdates = [];

  for(var i=0; i<nodeIds.length; i++){
    var item  = nodes.get(nodeIds[i]);

    if (item.category === 'bus') {
      var generadores = item.generadores;
      if (!item.displaying) {
        // Iteramos sobre todos los generadores del nodo.
        for (var j = 0; j < generadores.length; j++) {
          var generador = generadores[j];

          var key = generador.reference.barra;
          var positions = network.getPositions(key);
          generador.x += positions[key].x-generador.reference.x;
          generador.y += positions[key].y-generador.reference.y;

          generador.reference.x = positions[key].x;
          generador.reference.y = positions[key].y;
          nodeUpdates.push({id: generador.id, hidden: false, x:generador.x, y:generador.y});
          edgeUpdates.push({id: generador.arista.id, hidden: false});
        }
        nodeUpdates.push({id: item.id, displaying: true});
      }
    }
  }
  nodes.update(nodeUpdates);
  edges.update(edgeUpdates);
}


function toggleGeneratorsOff(nodeIds,network,nodes,edges){
  if(typeof network === 'undefined') network = currentNetwork;
  if(typeof nodes === 'undefined') nodes = currentNodes;
  if(typeof edges === 'undefined') edges = currentEdges;

  if(!Array.isArray(nodeIds)){
    nodeIds = [nodeIds];
  }
  var nodeUpdates = [];
  var edgeUpdates = [];

  for(var i=0; i<nodeIds.length; i++){
    var item  = nodes.get(nodeIds[i]);

    if (item.category === 'bus') {
      var generadores = item.generadores;
      if (item.displaying) {
        // Iteramos sobre todos los generadores del nodo.
        for (var j = 0; j < generadores.length; j++) {
          var generador = generadores[j];
          var key = generador.reference.barra;
          var positions = network.getPositions(key);

          generador.reference.x = positions[key].x;
          generador.reference.y = positions[key].y;


          positions = network.getPositions(generador.id);
          generador.x = positions[generador.id].x;
          generador.y = positions[generador.id].y;

          nodeUpdates.push({id: generador.id,hidden: true});
          edgeUpdates.push({id: generador.arista.id, hidden: true});
        }
        nodeUpdates.push({id: item.id, displaying: false});
      }
    }
  }
  nodes.update(nodeUpdates);
  edges.update(edgeUpdates);
}


// Activo si inactivos y viceversa
function toggleGenerators(nodeIds,network,nodes,edges){
  if(typeof network === 'undefined') network = currentNetwork;
  if(typeof nodes === 'undefined') nodes = currentNodes;
  if(typeof edges === 'undefined') edges = currentEdges;
  if(!Array.isArray(nodeIds)){
    nodeIds = [nodeIds];
  }
  var displayingNodes = nodeIds.filter(node => (nodes.get(node).category === 'bus' && !nodes.get(node).displaying));
  var hiddenNodes = nodeIds.filter(node => (nodes.get(node).category === 'bus' && nodes.get(node).displaying));
  toggleGeneratorsOn(displayingNodes,network,nodes,edges);
  toggleGeneratorsOff(hiddenNodes,network,nodes,edges);
}



function addCentralsToNetwork(centrals){

  // Agregamos las centrales a la red (Network).
  for (var i = 0; i < centrals.length; i++) {
    nodesArray.push(centrals[i]);
    edgesArray.push(centrals[i].arista);
  }
}

function addCentralsToMapNetwork(centrals){

  // Agregamos las centrales a la red (Network).
  for (var i = 0; i < centrals.length; i++) {
    nodesMArray.push(centrals[i]);
    edgesMArray.push(centrals[i].arista);
  }
}


function getCentralsUpdates() {
  let inodes;
  if (currentTopologyType === TOPOLOGY_TYPES.ELECTRIC)
    inodes = electricTopology.centrals;
  else if (currentTopologyType === TOPOLOGY_TYPES.GEO)
    inodes = electricMapTopology.centrals;
  else 
      return [];

  let updates = [];
  let datosInvalidosLog;
  /* Se cargan los datos de la barra seleccionada. */
  let callBack = function (x,hydro,identificador) {
    return function() {
      if (x.readyState === 4){
        let centralData = JSON.parse(x.responseText);

        if(!(identificador in hydrologyTimes[hydro]['centrals'])) {
          hydrologyTimes[hydro]['centrals'][identificador] = centralData;
        }
      }
    };
  };

  /* Si los datos estan cargados se ejecuta este método. */
  let preLoad = function (data) {};

  inodes.forEach(function(inode) {
    
    let currentCentralTime = {
      CenPgen: 0
    };
    let inodesI = inode


    /* se cargan los datos y si existen se crea el gráfico. */
    loadCenFile(inodesI.centralId, preLoad, callBack, chosenHydrology);

    // Verificar posibles errores
    if (chosenHydrology in hydrologyTimes && 'centrals' in hydrologyTimes[chosenHydrology]) {
        if (inodesI.centralId in hydrologyTimes[chosenHydrology].centrals) {
            let tempCentral = hydrologyTimes[chosenHydrology].centrals[inodesI.centralId][chosenTime];
            if (tempCentral !== undefined) {
                currentCentralTime = tempCentral;
            } else {
                if (typeof datosInvalidosLog === 'undefined') {
                    //datosInvalidosLog = createLog("La hidrologia " + chosenHydrology + " tiene centrales inválidas", LOG_TYPE.WARNING);
                }
                //addDetailsToLog(datosInvalidosLog, "La central " + inodesI.nodeName + " no contiene datos válidos");
            }
        } else {
            if (typeof datosInvalidosLog === 'undefined') {
                //datosInvalidosLog = createLog("La hidrologia " + chosenHydrology + " tiene centrales inválidas", LOG_TYPE.WARNING);
            }
            //addDetailsToLog(datosInvalidosLog, "La central " + inodesI.nodeName + " no se encontró o se cargó incorrectamente");
        }
    }

    let capacity = parseFloat(inodesI.capacity).toFixed(1);
    let maxPower = parseFloat(inodesI.max_power).toFixed(1);
    let currentGeneration = parseFloat(currentCentralTime.CenPgen).toFixed(1);

    let tooltip = generateTooltip(["Generador: " + inodesI.nodeName,
                                    "Tipo: " + inodesI.tipo,
                                    "Capacidad: " + capacity + " [MW]",
                                    "Generación máxima: " + maxPower + " [MW]",
                                    "Generación actual: " + currentGeneration + " [MW]"]);
    let generador =
      {
        id: inodesI.id,
        generation: currentCentralTime.CenPgen
      };
    inodesI.generation = currentCentralTime.CenPgen;
    inodesI.title = tooltip;
    generador.title = tooltip;

    updates.push(generador);

  })

  return updates;
}
function updateCentrals(nodes){
  nodes.update(getCentralsUpdates());
}
