"use strict";

/**
 * En este archivo irán los métodos que afecten a las líneas de manera transversal al tipo de grafo.
 */

// Existe una letiable lines en donde se cargan los datos de las líneas previamente.
function parseLines(lines, electricTopology) {
  console.log("pasando por parseLines")
  // Formamos todas las aristas del grafo que estan representadas por las líneas electricas.
  // Cada arista es de la forma {from: idOrigen, to: idDestino}

  // Colores obtenidos desde coordinador eléctrico nacional
  let voltageColor = {};
  voltageColor["500"] = "#0076C0";
  voltageColor["345"] = "#25A7E1";
  voltageColor["220"] = "#00963F";
  voltageColor["154"] = "#E53013";
  voltageColor["110"] = "#F07D00";
  voltageColor["66"] = "#565656";
  
  let springLength = {};
  springLength["500"] = 7;
  springLength["345"] = 6;
  springLength["220"] = 5;
  springLength["154"] = 4;
  springLength["110"] = 3;
  springLength["66"] = 2;


  // Calcula el ancho de la línea.
  let lineWidth = function (voltaje) {
    let scale = 1/(500-66);
    return 30*Math.max(0,(voltaje)*scale);
  };
  
  for (let i = 0; i < lines.length; i++){

    // Variable para dejar en el label si esta activo en forma intuitiva.
    let active = lines[i].active === 1 ? "Si" : "No";

    let currentLineTime = {
      flow: 0,
      capacity: 0
    };
    
    // Verificar posibles errores
    if (chosenHydrology in hydrologyTimes && 'lines' in hydrologyTimes[chosenHydrology]) {
        if (lines[i].id in hydrologyTimes[chosenHydrology].lines) {
            let tempLine = hydrologyTimes[chosenHydrology].lines[lines[i].id][chosenTime];
            if (tempLine !== undefined) {
                currentLineTime = tempLine;
            } else {
                console.log("Error: La línea " + lines[i].id + " no contiene datos válidos"); //FIXME
            }
        } else {
            // console.log("Error: La línea " + lines[i].id+ " no se encontró o se cargó incorrectamente"); //FIXME
        }
    } else {
         console.log("Error: La carga de la hidrología actual falló"); //FIXME
    }
    
    let tooltip = generateTooltip([
                                  "Línea: " + lines[i].name,
                                  "Activo: " + active,
                                  "Capacidad: " + lines[i].capacity + " [MW]", 
                                  // "Flujo máximo: " + parseFloat(currentLineTime.capacity).toFixed(1) + " [MW]", 
                                  "Flujo máximo: " + lines[i].max_flow_a_b + " [MW]",
                                  "Flujo actual: " + parseFloat(currentLineTime.flow).toFixed(1) + " [MW]", 
                                  "Resistencia: " + parseFloat(lines[i].r).toFixed(1) + " [Ω]",
                                  "Reactancia: " + parseFloat(lines[i].x).toFixed(1) + " [Ω]",
                                  "Voltaje: " + lines[i].voltage + " [kV]"]);

    let bus_from_id = lines[i].bus_a;
    let bus_to_id = lines[i].bus_b;
	
	/*
    if (currentLineTime.flow < 0) {
      bus_from_id = lines[i].bus_b;
      bus_to_id = lines[i].bus_a;
    }
	//*/

  maxid = maxid + 1;
	let circuits = lines[i].circuits;
  if(typeof circuits === 'undefined') circuits = "";
	// Pasamos los datos de json a formato visjs.
  let linea =
    {
      id: maxid,
      name: lines[i].name,
      lineNumber: lines[i].id,
      capacity: lines[i].capacity,
      resistance: lines[i].r,
      reactance: lines[i].x,
      active: lines[i].active,
      width: lineWidth(lines[i].voltage),
      maxWidth: lineWidth(lines[i].voltage),
      voltage: lines[i].voltage,
      length: springLength[lines[i].voltage], // FIXME Largo según voltaje.
      max_flow_positive: lines[i].max_flow_a_b,
      max_flow_negative: lines[i].max_flow_b_a,
      flow: currentLineTime.flow,
      color: voltageColor[lines[i].voltage], // FIXME Colores de las aristas dependientes del voltaje."Reactancia: " + parseFloat(currentLineTime.x).toFixed(1) + " [Ω]",
      label : ("{0}").formatUnicorn(circuits),
      font : { //La font para el label
        align : 'middle',
        background : '#f2f2f2 ',
        size : 35
      },
      from: bus_from_id, // desde que nodo empíeza la arista.
      to: bus_to_id, // hasta que nodo termina la arista.
      title: tooltip,
      category: 'bus-to-bus',
      position: 0
    };	
	// cosas opcionales o dependientes de la lógica
    if(!lines[i].active) linea.dashes = true;
	
    // Agregamos la línea a la lista de las aristas.
    electricTopology.lines.push(linea);
    electricMapTopology.lines.push(linea);
  }
}
function parseline(){
  let voltageColor = {};
  voltageColor["500"] = "#0076C0";
  voltageColor["345"] = "#25A7E1";
  voltageColor["220"] = "#00963F";
  voltageColor["154"] = "#E53013";
  voltageColor["110"] = "#F07D00";
  voltageColor["66"] = "#565656";
  
  let springLength = {};
  springLength["500"] = 7;
  springLength["345"] = 6;
  springLength["220"] = 5;
  springLength["154"] = 4;
  springLength["110"] = 3;
  springLength["66"] = 2;


  // Calcula el ancho de la línea.
  let lineWidth = function (voltaje) {
    let scale = 1/(500-66);
    return 30*Math.max(0,(voltaje)*scale);
  };

}
function addLinesToNetwork(lines){

  // Agregamos las líneas a la red (Network).
  edgesArray = edgesArray.concat(lines);

}

function addLinesToMapNetwork(lines){

  // Agregamos las líneas a la red (Network).
  edgesMArray = edgesMArray.concat(lines);

}

function getUpdates(){
  console.log("pasando por modulo lines-visjs función getupdates")
  let iedges;
  if (currentTopologyType === TOPOLOGY_TYPES.ELECTRIC)
    iedges = electricTopology.lines;
  else if (currentTopologyType === TOPOLOGY_TYPES.GEO)
    iedges = electricMapTopology.lines;
  else
    return [];

  let updates = [];
  let datosInvalidosLog;
  for (let i = 0; i < iedges.length; i++) {

    let currentLineTime = {
      flow: 0,
      name: 'No Data'
    };
    
    // Nombre de la línea
    let lineName = iedges[i].name;
    
    // Verificar posibles errores
    if (chosenHydrology in hydrologyTimes && 'lines' in hydrologyTimes[chosenHydrology]) {
        if (iedges[i].lineNumber in hydrologyTimes[chosenHydrology].lines) {
            let tempLine = hydrologyTimes[chosenHydrology].lines[iedges[i].lineNumber][chosenTime];
            if (tempLine !== undefined) {
                currentLineTime = tempLine;
            } else {
                if (typeof datosInvalidosLog === 'undefined') {
                    datosInvalidosLog = createLog("La hidrologia " + chosenHydrology + " tiene líneas inválidas", LOG_TYPE.WARNING);
                }
                addDetailsToLog(datosInvalidosLog, "La línea " + lineName + " no contiene datos válidos");
            }
        } else {
            if (typeof datosInvalidosLog === 'undefined') {
                datosInvalidosLog = createLog("La hidrologia " + chosenHydrology + " tiene líneas inválidas", LOG_TYPE.WARNING);
            }
            addDetailsToLog(datosInvalidosLog, "La línea " + lineName + " no se encontró o se cargó incorrectamente");
        }
    }

    let edge = {
      id: iedges[i].id,
      flow: currentLineTime.flow
    };
 
      if (($("#animation-enabled")[0].checked) || edge.flow === 0) {
          // edge['arrow'] = undefined;
          iedges[i]['arrow'] = undefined;
          //console.log('updating arrow to undefined')
      } else {
          // edge['arrow'] = edge.flow > 0 ? 'to' : 'from';
          iedges[i]['arrow'] = edge.flow > 0 ? 'to' : 'from';
          //console.log('updating arrow to ', iedges[i]['arrow'])
      }

    //if(i==0) console.log(iedges[i].flow, currentLineTime.flow);
    // Cambia direccion de las flechas.
    /*if(currentLineTime.flow * iedges[i].flow < 0){
      edge.from = iedges[i].to;
      edge.to = iedges[i].from;

      iedges[i].from = edge.from;
      iedges[i].to = edge.to;
    }*/
    
    // Variable para dejar en el label si esta activo en forma intuitiva.
    let active = iedges[i].active === 1 ? "Si" : "No";
    
    // tooltip es la barra de información que aparece al posar el mouse sobre una linea.
    let tooltip = generateTooltip(["Línea: " + lineName,
                                    "Activo: " + active,
                                    "Capacidad: " + iedges[i].capacity + " [MW]", 
                                    "Flujo máximo: " + iedges[i].max_flow_positive + " [MW]", 
                                    "Flujo actual: " + parseFloat(currentLineTime.flow).toFixed(1) + " [MW]", 
                                    "Resistencia: " + parseFloat(iedges[i].resistance).toFixed(1) + " [Ω]",
                                    "Reactancia: " + parseFloat(iedges[i].reactance).toFixed(1) + " [Ω]",
                                    "Voltaje: " + iedges[i].voltage + " [kV]"]);

    iedges[i].flow = currentLineTime.flow;
    iedges[i].title = tooltip;
    edge.title = tooltip;

    updates.push(edge);
  }
  return updates;
}

function updateLines(edges){
  console.log("Pasando por updateLines")
  edges.update(getUpdates());
}

