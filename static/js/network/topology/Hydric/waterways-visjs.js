"use strict";

/**
 * Todos los métodos que afecten directamente a los canales (Waterways).
 */

function parseWaterways(waterways, hydricTopology){
  console.log("pasando por parseWaterways");
//   console.log("hydricTopology: ", hydricTopology)
  var graph = [];
  
  var currentSet = [];
  var setSize = 0;
  var nextSet = [];
  var indexes = {};
  
  for(var i=0; i < hydricTopology.junctions.length; i++) {
    graph.push([]);
	currentSet.push(true);
	setSize++;
	nextSet.push(false);
  }

  var amountOfSeaNodes = 0;
  var riverMouths = [];

  /**
	 * Entrega el color según el tipo de waterway que sea.
   * @param type String que contiene el tipo.
   */
  function parseInputToColor(type) {

  	if(type === null) return '#00AAAA';
  	switch(type.toLowerCase()){
			case "spillover":
				return '#F22C2C';
			case "extraction":
				return '#000000';
			case "generation":
				return '#1E70EB';
			case "filtration":
				return '#38D71F';
			default:
				return '#00AAAA';
		}
  }
//   console.log("graph: ",graph)
  for (var i = 0; i < waterways.length; i++) {

    // Variable para dejar en el label si esta activo en forma intuitiva.
    var active = waterways[i].active === 1 ? "Si" : "No";

    var title = "Nombre: " + waterways[i].name +
      "<br/> Delay : " + waterways[i].delay +
      "<br/> Activo: " + active + 
	  "<br/> ID: " + waterways[i].id;

    var junc_from = waterways[i].junc_a_id;
    var junc_to = waterways[i].junc_b_id;
	
	// Poblar el grafo ignorando el mar
	if (junc_to !== 0) {
		graph[junctionIdToIndice[junc_from]].push(junctionIdToIndice[junc_to]);
		// Detectar los "source"
		if (currentSet[junctionIdToIndice[junc_to]]) {
			currentSet[junctionIdToIndice[junc_to]] = false;
			setSize--;
		}
	}
	
	// Define el tipo de arrow y shadow a usar en el dibujo
	// Importante para destacar las líneas de generación 
	// simulando la central de pasada
	var arrowType = 'to';
	var shadowType = false;
	if (waterways[i].type === 'generation') {
		arrowType = {
			to: {
				enabled: true,
				type: 'arrow'
			},
			from: {
				enabled: true,
				type: 'circle'
			}
		};
		shadowType = true;
	}

    // Pasamos los datos de json a formato visjs.
    var waterway =
      {
        lineNumber: waterways[i].id,
        color: parseInputToColor(waterways[i].type), // Colores de las aristas dependientes del voltaje.
        from: junc_from, // desde que nodo empíeza la arista.
        to: junc_to, // hasta que nodo termina la arista.
        arrows: arrowType,
        title: title,
        category: 'junc-to-junc',
        position: 0,
		shadow: shadowType
      };

    if(!waterways[i].active) waterway.dashes = true;
	
    if (junc_to === 0) {
		amountOfSeaNodes++;
		var newSeaNode = {
		  id: -amountOfSeaNodes,
		  shape: 'image',
		  image: {
			selected: "./resources/network/icons/seanode/selected/seanode.png",
			unselected: "./resources/network/icons/seanode/normal/seanode.png"
		  },
		  category: 'seanode',
		  nodeName: "Sea"
		};
		
		riverMouths.push([junctionIdToIndice[junc_from], hydricTopology.junctions.length]);
		hydricTopology.junctions.push(newSeaNode);
		
		waterway.to = newSeaNode.id;
		waterway.category = 'junc-to-sea';
		
    } else {
    	if(! (junc_from in indexes)){
    		indexes[junc_from] = {};
    	}
    	if(! (junc_to in indexes[junc_from])){
    		indexes[junc_from][junc_to] = [];
    	}
    	indexes[junc_from][junc_to].push(waterway);
    }
	
    // Agregamos el camino acuático a la lista de las aristas.
    hydricTopology.waterways.push(waterway);
  }
  
  for(var junc_from in indexes){
  	if(! indexes.hasOwnProperty(junc_from)) continue;
  	for(var junc_to in indexes[junc_from]){
  		if(! indexes[junc_from].hasOwnProperty(junc_to)) continue;
  		var siblings = indexes[junc_from][junc_to];
  		var n = siblings.length;
  		if(n===1) continue;
  		for(var i=0; i<n; i++){
  			var roundness = (i-(n-1)/2)/n;
  			var type;
  			if(roundness>0){
  				type='curvedCW';
  			} else {
  				roundness = -roundness;
  				type='curvedCCW';
  			}
  			siblings[i].smooth = {type: type,roundness : roundness};
  		}

  	}
  }

  var currentLevel = 0;
  var i = currentSet.length;
  while (i--) {
	if (currentSet[i]) hydricTopology.junctions[i].level = 0;
  } 
  
  while (setSize > 0) {
	currentLevel++;
	setSize = 0;
	var i = currentSet.length;
	while (i--) {
		if (currentSet[i]) {
			var j = graph[i].length;
			while (j--) {
				if (!nextSet[graph[i][j]]) {
					setSize++;
					nextSet[graph[i][j]] = true;
					hydricTopology.junctions[graph[i][j]].level = currentLevel;
				}
			}
		}
	}
	
	var i = currentSet.length;
	while (i--) {
		currentSet[i] = nextSet[i];
		nextSet[i] = false;
	}
  }
  
  var i = riverMouths.length;
  while (i--) {
	hydricTopology.junctions[riverMouths[i][1]].level = hydricTopology.junctions[riverMouths[i][0]].level + 1;
  }
  
  //hydricTopology.junctions[i].level;

  
}


function addWaterwaysToNetwork(waterways){
  console.log("pasando por addWaterwaysToNetwork");
//   console.log("waterways: ",waterways);
  // Agregamos las líneas a la red (Network).
  edgesHArray = edgesHArray.concat(waterways);
}