"use strict";

/**
 * Todos los métodos que afecten directamente a las uniones (Junctions).
 */

function parseJunctions(junctions, hydricTopology){
  console.log("pasando por parseJunctions");
  /*
   * Iterar sobre las uniones y parsearlas como nodos.
   */
  for (var i = 0; i < junctions.length; i++){

    // Variable para dejar en el label si esta activo en forma intuitiva.
    var active = junctions[i].active === 1 ? "Si" : "No";
    var title = "<span> Unión: " + junctions[i].name.replace(/_/gi," ") + "</span>" +
      "<br/> <span> Activo: " +  active + "</span>" +
      "<br/><span> Drenaje: " + junctions[i].drainage + "</span>";

    // Guardamos el id maximo para no topar entre id de generador y id de barra
    maxid = Math.max(junctions[i].id, maxid);

    // Creamos el nodo de la union con sus caracteristicas correspondientes.
    var union = {
      id: junctions[i].id,
      junctionId: junctions[i].id,
      label: junctions[i].name.replace(/_/gi," "),
      font: {
        size: 30
      },
      shape: 'square',
      level : 0,
      size : 20,
      //color : "rgba(100,100,100,.8)",
      category: 'junction',
      nodeName: junctions[i].name.replace(/_/gi," "),
      title: title
    };

    // La red hídrica no necesita coordenadas.
    //if (CONFIG.GEO_ENABLED) {
      //union.x = junctions[i].longitude * -escala;
      //union.y = junctions[i].latitude * escala;
    //}

    if (junctions[i].id !== 0) {
		junctionIdToIndice[junctions[i].id] = hydricTopology.junctions.length;
		hydricTopology.junctions.push(union);
	}
	
  }
}


function addJunctionsToNetwork(junctions){
  console.log("pasando por addJunctionsToNetwork");

  // Agregamos las barras a la red (Network).
  nodesHArray = nodesHArray.concat(junctions);
}