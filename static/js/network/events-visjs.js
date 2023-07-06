"use strict";

/**
 * Todos los eventos (doubleclick, click derecho, keyboard G, etc.) en visjs.
 */

/**
 *
 * Función que agrega todos los eventos usuario-red.
 *
 * @param network A que red se le agregan los eventos
 * @param topologyType Tipo de la red (ELECTRIC, HYDRIC, GEO)
 * @param nodes nodos de la red
 * @param edges aristas de la red
 */
function addTriggerEvents(network, topologyType, nodes, edges) {
  console.log("Function: addTriggerEvents")
  // Oculta la barra de los graficos en caso de hacer click.
  // Definimos una función que realiza el zoom
  let zoomFunction = function (scale) {
    // Iteramos sobre los nodos y le cambiamos los tamaños de acuerdo a la escala.

    const nodeUpdates = [];
    const edgeUpdates = [];
    const nodos = currentNodes.get();
    const aristas = currentEdges.get();
    let i;
    // Se obtiene la escala inicial del zoom para tener una referencia.
    let initialScale = network.getScale();
    //console.log(initialScale);
    initialScale = 0.03975509545639787; // FIXME: encontrado por experimentación.

    // Cambiamos la escala de los nodos.
    for (i = 0; i < nodos.length; i++) {
      nodeUpdates.push({id: nodos[i].id, size: nodos[i].maxSize * Math.sqrt(initialScale / scale)});
    }

    // Cambiamos la escala de las aristas.
    for (i = 0; i < aristas.length; i++) {
      edgeUpdates.push({id: aristas[i].id, width: aristas[i].maxWidth * Math.sqrt(initialScale / scale)});
    }

    // Actualizamos los nodos y aristas correspondientes.
    currentNodes.update(nodeUpdates);
    currentEdges.update(edgeUpdates);

    
  };
  network.on("click", function (params) {
    if ($('#chart-column').is(':visible')) {
      toggleChartViewTo(false);
  }
    
    $("#context-menu").addClass('hidden');
  });

  /**
   * En esta estructura se guardan los cambios/estados de la red.
   * Se usa para implementar el undo y redo.
   * Tanto past como future son arreglos de objetos {undo:, redo:}.
   * Undo contiene las actualizaciones necesarias para deshacer el cambio (Ctrl+Z), Redo para rehacer (Ctrl+Y).
   */
  network.changes = {
    past : [],
    future : []
  };

  // Esto se ejecuta al arrastrar con el click, mantener apretado click.
  network.on("dragStart",function(params){
    if(params.nodes.length === 0) return;
    //Al iniciar un drag guardo las posiciones iniciales de los nodos seleccionados para el undo.
    var pastPositions = network.getPositions(params.nodes);
    network.changes.past.push({undo: Object.keys(pastPositions).map(id => ({id: id, x: pastPositions[id].x, y: pastPositions[id].y}))});
  });

  // Esto se ejecuta al soltar el arrastrado del click.
  network.on("dragEnd",function(params){
    if(params.nodes.length === 0) return;
    //Al terminar el drag guardo las posiciones nuevas para el redo.
    var newPositions = network.getPositions(params.nodes);
    network.changes.past[network.changes.past.length-1].redo = Object.keys(newPositions).map(id => ({id: id, x: newPositions[id].x, y: newPositions[id].y}));

    if(network.changes.past.length > 50){
      network.changes.past.splice(0,5);
    }
    network.changes.future = [];
  });

  //al hacer doble click a un nodo, se muestran los generadores
  network.on("doubleClick", function (params) {
    var clickedNode = network.getNodeAt(params.pointer.DOM);
    if (clickedNode) {
      toggleGenerators(clickedNode);
    }
  });

  // Al mantener con el click derecho
  network.on("hold", function (params) {
    let clickedElementID = network.getNodeAt(params.pointer.DOM);
    console.log(params.pointer.DOM);
    let clickedElementObject = currentNodes.get(clickedElementID);
    if (clickedElementObject.category == "bus") {
      createBusImage(clickedElementObject, true);
      currentNodes.update(clickedElementObject);

      if($("#marginal-cost-toggle").is(":checked") && electricNodes && currentNodes){
        // Actualizamos electricTopology con los datos más actualizados de electricNodes
        for (let i = 0; i < electricTopology.buses.length; i++){
          let id = electricTopology.buses[i].id;
          electricTopology.buses[i] = electricNodes._data[id];
        }
      }
      // Llamamos a la función zoomFunction con la escala actual
      zoomFunction(network.getScale());

      // console.log("clickedElementObject.id: ",clickedElementObject.id);
      // const index = electricTopology.buses.findIndex(bus => bus.id === clickedElementObject.id);
      // if (index !== -1){
      //   electricTopology.buses[index] = clickedElementObject;
      //   console.log(clickedElementObject);
      //   console.log(electricTopology.buses[index]);
      //   console.log(index);
      // }
      // else{
      //   console.log(electricTopology.buses)
      //   console.log(clickedElementObject.id);
      // }
    
    }
  });

  network.on('hoverNode', function (params) {
    // Acciones a realizar cuando el cursor se coloca sobre un nodo
    console.log("sobre Barra");
    
  });

  network.on('hoverEdge', function(params) {
    // Acciones a realizar cuando el cursor se coloca sobre una arista
    let lineNumb = currentEdges.get(params.edge).lineNumber;
    console.log("sobre Linea: ",lineNumb);
    // edgeTitleCallback(lineNumb);

  });

  

  let lineTimeCallback = function(x, id) {
    return function() {
      if (x.readyState === 4) {
        hydrologyTimes[chosenHydrology].lines[id] = JSON.parse(x.responseText);
      }
    };
  };
  
  let edgeTitleCallback = function(edge) {
    // Cargar la información del archivo JSON y almacenarla en el objeto "hydrologyTimes"
    checkHydrologyTimes(chosenHydrology);
    if (!(edge in hydrologyTimes[chosenHydrology].lines)) {
      try {
        let chartReq = new XMLHttpRequest();
        chartReq.onreadystatechange = lineTimeCallback(chartReq, edge);
        chartReq.open("GET", CONFIG.LINES_FOLDER + "line_" + edge + ".json", false);
        chartReq.send();
      } catch (e) {
        console.log("Error: ", e);
        console.log("El borde " + edge + " no tiene archivo de resultados.");
      }
    }
  };
  
  
  

  //click derecho muestra un menú para realizar graficos
  network.on("oncontext", function (params) {
    console.log("pasando por network.on(oncontext")
    if(CONFIG.RESULTS_DISABLED) return;
    var coordX = params.event.pageX - window.outerWidth/6 - 30;
    var coordY = params.event.pageY - 30;
    // posiciona y muestra el menu para graficar
    $("#context-menu").toggleClass('hidden');
    $("#context-menu").css({
      top: coordY + "px",
      left: coordX + "px"
    });

    // datos graficables de una barra, Los titulos se observan al hacer click derecho sobre una barra
    var bus_datatype_dict = {
      "Costo Marginal":
        new PlotableDataType(
          "Gráfico de costos",
          "Tiempo",
          "Costo Marginal",
          "[Bloques]",
          "[USD/MWh]",
          "time",
          "marginal_cost"
        ),
        "Percentiles Costos Marginales":
        new PlotableDataType(
          "Percentiles de Costos Marginales",
          "Tiempo",
          "Costo Marginal",
          "[Bloques]",
          "[USD/MWh]",
          "time",
          "percentils"

        ),
      "Demanda Energía":
        new PlotableDataType(
          "Gráfico de demanda de Energía",
          "Tiempo",
          "Demanda-Energía",
          "[Bloques]",
          "[MWh]",
          "time",
          "DemBarE"
        ),
      "Demanda Potencia":
        new PlotableDataType(
          "Gráfico de demanda de Potencia",
          "Tiempo",
          "Demanda-Potencia",
          "[Bloques]",
          "[MW]",
          "time",
          "DemBarP"
        ),
      "Flujos":
        new PlotableDataType(
          "Flujos hacía una barra",
          "Tiempo",
          "Flujo",
          "[Bloques]",
          "[MW]",
          "time",
          "flow"
        ),
      "Generación":
        new PlotableDataType(
          "Generación de la barra",
          "Tiempo",
          "Generación",
          "[Bloques]",
          "[MW]",
          "time",
          "CenPgen"
        )
    };

    // datos graficables de una línea, Los titulos se observan al hacer click derecho sobre una linea
    var line_datatype_dict = {

      "Flujo":
        new PlotableDataType(
          "Flujo en una línea",
          "Tiempo",
          "Flujo",
          "[Bloques]",
          "[MW]",
          "time",
          "flow"
        ),
      "Percentiles Flujo de Lineas":
      new PlotableDataType(
        "Percentiles de Flujos de Linea",
        "Tiempo",
        "Flujo",
        "[Bloques]",
        "[MW]",
        "time",
        "percentils"
      )
    };

    // Datos graficables en un embalse, Los titulos se observan al hacer click derecho sobre un embalse
    let reservoir_datatype_dict = {
      "Volumen de Embalse":
        new PlotableDataType(
          "Cota",
          "Tiempo",
          "Nivel",
          "[Bloques]",
          "[metros sobre el nivel del mar]",
          "time",
          "level"
        )
    };

    // Datos graficables en una central, Los titulos se observan al hacer click derecho sobre una central
    let central_datatype_dict = {
      "Generación" :
        new PlotableDataType(
          "Generación",
          "Tiempo",
          "Voltaje",
          "[Bloques]",
          "[MW]",
          "time",
          "CenPgen"
        ),

      "Partidas" :
        new PlotableDataType(
          "Partidas",
          "Tiempo",
          "Voltaje",
          "[Bloques]",
          "[MW]",
          "time",
          "value" // FIXME: cambiar por el que se definirá
        ),

      "Capacidad" :
        new PlotableDataType(
          "Capacidad generador",
          "Tiempo",
          "Voltaje",
          "[Bloques]",
          "[MW]",
          "time",
          "value" // FIXME: cambiar por el que se definirá
        )
    };

    var clickedElementID;
    var clickedElementObject;
    var datatype_dict = {};

    // Si el elemento clickeado es un nodo, se ejecutan estas acciones.
    if (network.getNodeAt(params.pointer.DOM)) {
      clickedElementID = network.getNodeAt(params.pointer.DOM);
      clickedElementObject = currentNodes.get(clickedElementID);

      // Vemos el tipo del nodo para crear el menú correspondiente.
      switch (clickedElementObject.category) {
        case "bus":
          datatype_dict = bus_datatype_dict;
          break;
        case "central":
          datatype_dict = central_datatype_dict;
          break;
        case "reservoir":
          datatype_dict = reservoir_datatype_dict;
          break;
        default:
          console.log(clickedElementObject);
          console.log("Error: Elemento seleccionado no tiene una categoría válida");
          $("#context-menu").addClass('hidden');
          return;
      }

      // Si el elemento clickeado es una arista, se ejecutan estas acciones.
    } else if (network.getEdgeAt(params.pointer.DOM)) {
      console.log("arista");
      clickedElementID = network.getEdgeAt(params.pointer.DOM);
      clickedElementObject = currentEdges.get(clickedElementID);
      // Dependiendo de la categoria se despliega un menú con sus opciones.
      switch (clickedElementObject.category) {
        case "bus-to-bus":
          datatype_dict = line_datatype_dict;
          break;
        default:
          console.log("Error: Elemento seleccionado no tiene una categoría válida");
          $("#context-menu").addClass('hidden');
          return;
      }
      // no hay elemento seleccionado
    } else {
      $("#context-menu").addClass('hidden');
      return;
    }

    // añade las opciones al menú contextual
    $("#context-menu").children(".list").empty();
    for (let datatype in datatype_dict) {
      let datatype_option = document.createElement('li');
      datatype_option.innerHTML = datatype;
      datatype_option.addEventListener("click", wrapper_drawGraph(clickedElementID, clickedElementObject, datatype_dict[datatype]));
      $("#context-menu").children(".list").append(datatype_option);
    }
  });


  // Al terminar un drag, si es que estaba moviendo un nodo, avisa que hay cambios sin guardar
  network.on("dragEnd", function(params) {
    if (params.nodes.length > 0) {
      unsavedChanges = true;
    }
  });

  let firstTime = true;
  // Funcion que se activa al momento de estabilización de nodos en el grafo,
  // se usa principalmente a crear eventos una vez que ya esta formada la red.
  network.on("stabilizationIterationsDone", function() {
    if (!firstTime) {
      //Si la fisica esta habilitada la dejo andando
      if ($("#disablephysics").hasClass("hidden")) {
        network.setOptions({physics: false});
      }
      return;
    }
    logTime("first iter stabilizationIterationsDone start");

    // Cambiamos el layout para que no afecte en las ediciones.
    network.setOptions(
      {
        layout: {
          improvedLayout: false,
          randomSeed: 0,
          hierarchical: false // Desactiva la jerarquía en la red hídrica.
        }
      });

    // Desactiva las físicas para poder manejar el grafo.
    network.setOptions({physics: false});

    // Radio del circulo
    let currentRadius = 0;

    //
    function updateFrameTimer() {
      if ($("#animation-enabled")[0].checked) {
        currentRadius += 0.05;
      }
    }

    setInterval(function () {
        network.redraw();
        updateFrameTimer();
    }, 60);

    // guardamos el tiempo actual, para ir creando la animación de la corriente.
    let lastUpdateTime = getCurrentTime();

    if(topologyType === TOPOLOGY_TYPES.GEO){
      var bReq = new XMLHttpRequest();

      bReq.onreadystatechange = function () {
        if (this.readyState === 4) {
          var loaded_data = JSON.parse(this.responseText);
          loadViewFromObject(loaded_data);
        }
      };
      bReq.open("GET", CONFIG.BASE_FOLDER_NAME+CONFIG.MODEL_FOLDER_NAME+"/Topology/view.json", false);
      try{
        bReq.send();
      } catch (e){
        console.log("No hay view por defecto");
      }
      
      if (firstTime) {
        updateHydrology();
      }
      firstTime = false;
    }

    // Esto se ejecuta al terminar de dibujar la red.
    network.on("afterDrawing", function (ctx) {

      // En caso de tener activada la animación.
      if ($("#animation-enabled")[0].checked) {
        // console.log("pasando por iff de events-visjs")
        // Variables necesarias para determinar la posición del círculo(corriente) en cada arco.
        let iedge;
        let nodePosition = network.getPositions();
        let arrayLength = edgesArray.length;

        // Tomamos el tiempo que tomó la última actualización del canvas.
        let timeDelta = getCurrentTime() - lastUpdateTime;

        // En caso de que no haya pasado tiempo o no necesite de la animación retornamos.
        if (timeDelta === 0 || currentTopologyType === TOPOLOGY_TYPES.HYDRIC){
          console.log("se entro a timedelta === 0");
           return;}
        

        function lineTimeCallback(x, id) {
          return function() {
            if (x.readyState === 4){
              hydrologyTimes[chosenHydrology].lines[id] = JSON.parse(x.responseText);
            }
          };
        }
          
        // Se itera sobre todas las aristas para dibujar el círculo que representa la corriente si es necesario.
        for (iedge = 0; iedge < arrayLength; iedge++) {
          
          let currentEdge = edgesArray[iedge];
          
          // No neceistamos corriente desde una central (no hay datos de esto.)
          if (currentEdge.category.localeCompare('central-to-bus') === 0) continue;

          let currentLineTime = { flow: 0 };
          
          checkHydrologyTimes(chosenHydrology);
          if(!(currentEdge.lineNumber in hydrologyTimes[chosenHydrology].lines)) {
            try {
              let chartReq = new XMLHttpRequest();
              chartReq.onreadystatechange = lineTimeCallback(chartReq, currentEdge.lineNumber);
              chartReq.open("GET", CONFIG.LINES_FOLDER + "line_" + currentEdge.lineNumber + ".json", false);
              chartReq.send();
            } catch (e) {
              console.log("--------------------------------------------")
              console.log("La línea: " + currentEdge.lineNumber + " no tiene archivo de resultados.")
            }
          }

          // Verificar si se cargaron los datos. Si no hay datos asumimos corriente 0.
          if (currentEdge.lineNumber in hydrologyTimes[chosenHydrology].lines) {
      
            currentLineTime = hydrologyTimes[chosenHydrology].lines[currentEdge.lineNumber][chosenTime];
          }
          if(typeof currentLineTime === 'undefined') {
            console.log("tipo indefinido",currentEdge.lineNumber)
            continue;}
          let flow = currentLineTime.flow;
          if(zero(currentLineTime.flow)) continue; // Si no hay corriente no dibujamos nada.

          // Variables que se usarán para calcular la posición del círculo.
          let maxFlow = currentEdge.max_flow_positive;
          let NodeA = nodePosition[currentEdge.from];
          let NodeB = nodePosition[currentEdge.to];

          // Si el flujo es negativo, cambiamos el sentido del circulo cambiando el desde donde parte y donde finaliza.
          if (flow < 0) {
            maxFlow = currentEdge.max_flow_negative;
            NodeA =  nodePosition[currentEdge.to];
            NodeB = nodePosition[currentEdge.from];
          }

          // El valor absoluto es para sacar distancias positivas.
          maxFlow = Math.abs(maxFlow);

		  let r = 0;
		  let g = 0;
		  let b = 0;
		  
		  if ((Math.abs(flow) / maxFlow) > 0.9) {
			  // Si la línea está congestionada (con 10% de cercanía al máximo) se usa color rojo.
			  r = 255;
		  } else {
			  // Si no, se hace lo siguiente, tomando como pseudo-máximo 1.5 * maxFlow, para que el máximo real quede naranjo.
			  // Aquí se calcula una escala entre dos colores, en este caso entre verde (mínimo) y rojo (máximo).
			  // Verde representa valores cercanos a un flujo 0, y Rojo representa una línea congestionada.
			  let resizer = (maxFlow * 1.5) / 255;
			  g = Math.min(255, Math.floor(510 - 2 * ( Math.abs(flow) / resizer)));
			  r = Math.min(255, 2 * Math.floor(Math.abs(flow) / resizer));
		  }

          // Guardamos los colores que se pintarán en el círculo, el borde será negro.
          let colorCircle = 'rgba(' + r + ',' + g + ',' + b + ', 0.8)';
          ctx.strokeStyle = 'rgba(0.0,0.0,0.0,1.0)';
          ctx.fillStyle = colorCircle;

          // FIXME: Cambiar el radio del círculo, zoom!!!
          let radius = Math.abs(10); //* Math.sin(currentRadius + inode / 50.0));
          let largo_barra = Math.sqrt(Math.pow(NodeA.y - NodeB.y, 2) + Math.pow(NodeA.x - NodeB.x, 2));

          // Obtenemos el valor de la velocidad de animación para calcular la siguiente posición.
          let animationSpeed = $("#animation-speed")[0].value;
          let stepSize = animationSpeed / largo_barra;
          let maximumStepSize = largo_barra / 20.0;
          currentEdge.position = (currentEdge.position + Math.min(stepSize, maximumStepSize) * timeDelta / 1000) % 1;

          // Finalmente se dibuja el círculo en pantalla.
          ctx.circle(NodeA.x + currentEdge.position * (NodeB.x - NodeA.x), NodeA.y + currentEdge.position * (NodeB.y - NodeA.y), radius);
          ctx.fill();
          // ctx.stroke();
          ctx.closePath();
          ctx.beginPath();
        }
        // Se actualiza el tiempo.
        lastUpdateTime += timeDelta;
      } else { // Si está desactivada, se actualiza la dirección de las flechas

      }
    });



    let currentTimeout;

    // En caso de no ser una red hídrica, se utiliza el zoom para reescalar las imagenes.
    if(TOPOLOGY_TYPES.HYDRIC !== topologyType) {
      // Evento para reescalar los tamaños de las barras.
      network.on("zoom", function (params) {
        const scale = params.scale;

        // Se usa un timeout para hacer una vez zoom al acercarse en la red.
        if (currentTimeout) {
          clearTimeout(currentTimeout);
        }
        currentTimeout = setTimeout(function(){zoomFunction(scale);}, 50);
      });
    }

    // Emitimos un zoom al inicio de la carga de la red, para que se configure de inmediato.
    if(topologyType === TOPOLOGY_TYPES.ELECTRIC)
      network.emit("zoom", {scale: network.getScale()});


    // Se ocultan las centrales en el inicio.
    if (topologyType === 1 || topologyType === 3) {
      saveGeneratorsPositions(network, nodes, edges);
    }
    logTime("first iter stabilizationIterationsDone end");
  });
}

//Diccionario de eventos
let dictEvent = {};
let dictEventCtrl = {};

//Al apretar T las barras seleccionadas cambian su estado entre mostrar y no mostrar generadores.
dictEvent.T = function(){
  let currentSelection = currentNetwork.getSelectedNodes();
  toggleGenerators(currentSelection);
};

// Oculta (Hide) generadores al presionar la tecla H.
dictEvent.H = function(){
  toggleGeneratorsOff(currentNetwork.getSelectedNodes());
};

// Muestra los generadores de las barras seleccionadas al presionar la tecla G.
dictEvent.G = function(){
  toggleGeneratorsOn(currentNetwork.getSelectedNodes());
};

// Ejecuta la acción undo con Control+Z
dictEventCtrl.Z = function(){
  // Si no hay eventos pasados no hace nada.
  if(currentNetwork.changes.past.length === 0) return;

  // Sacamos el primer evento pasado.
  let prev = currentNetwork.changes.past.pop();

  // Tenemos que tener la precaución de revisar si la acción esta completa.
  if(!('redo' in prev && 'undo' in prev)) return;

  // Ejecutamos la acción undo.
  currentNodes.update(prev.undo);
  currentNetwork.changes.future.push(prev);
};

// Ejecuta la acción redo con Control+Y
dictEventCtrl.Y = function(){
  // Si no hay eventos futuros no se ejecuta.
  if(currentNetwork.changes.future.length === 0) return;

  // Sacamos el primer evento futuro.
  let next = currentNetwork.changes.future.pop();

  // Tenemos que tener la precaución de revisar si la acción esta completa.
  if(!('redo' in next && 'undo' in next)) return;

  // Ejecutamos la acción redo.
  currentNodes.update(next.redo);
  currentNetwork.changes.past.push(next);
};

/**
 * Aquí creamos el controlador de las teclas.
 * dictEvent controla los eventos de las teclas simples (solo una).
 * dictEventCtrl controla los eventos de las acciones Control+Algo.
 *
 */
$(document).ready(function () {

  // Agregamos las acciones cuando las teclas son presionadas (en verdad es cuando las sueltan)
  $('body').on('keyup',function(e){
    // Obtenemos el código de la tecla.
    let code = String.fromCharCode(e.which);
    // Si esta implementada la función se ejecuta.
    if (code in dictEvent){
      let focused = $(':focus');
      if(! (focused.hasClass('chosen') || focused.hasClass('chosen-search-input'))) {
        dictEvent[code]();
      }
    }
    // Ejecuta las opciones control+algo.
    if(e.ctrlKey && code in dictEventCtrl){
      dictEventCtrl[code]();
    }
  });
});

// Se ejecuta al cambiar el valor en el seleccionador de tiempos.
/**
 * Cuando se selecciona el tiempo.
 */
async function updateTime(){

  // Cargamos el valor que contiene el seleccionador.
  let slider = document.getElementById("time-slider");
  chosenTime = parseInt(slider.value - 1);
  
  // Actualiza el chosen con el valor del slider
  let picker = document.getElementById("time-picker");
  
  for (var i = 0; i < picker.options.length; i++) {
      // Quitar selected y seleccionar el que posea el valor necesario
      let option = picker.options[i];
      option.removeAttribute("selected");
      if (option.value === slider.value) {
        option.selected = true;
      }
  }
  
  $("#time-picker").trigger("chosen:updated");

  if(currentTopologyType === TOPOLOGY_TYPES.HYDRIC) return;

  // En caso de que no esten definidas las redes no actualizamos nada.
  if(typeof electricEdges === 'undefined'){
    console.log("Error: tipos indefinidos en updatetime")
    return;
    }

  // Se actualizan según el nuevo tiempo dado.
  // updateLines(electricEdges);

  // Se actualizan los valores de las barras.
  await updateBuses(electricNodes,false);

  // Se actualizan los valores de las barras.
  // updateCentrals(electricNodes);

}

/**
 * Actualiza slider de tiempos (time-picker)
 */
async function updateSlider() {
  let picker = document.getElementById("time-picker");
  let slider = document.getElementById("time-slider");

  slider.value = picker.options[picker.selectedIndex].value;
  await updateTime();
}

/**
 * Enciende las físicas en la red actual, solo se puede en la red electrica.
 */
function togglePhysics(enable){
  if (enable) {
    electricNetwork.setOptions({physics:defaultPhysicsOptions});
    electricNetwork.startSimulation();
    $("#enablephysics").addClass("hidden");
    $("#disablephysics").removeClass("hidden");
  } else {
    electricNetwork.setOptions({physics:false});
    $("#enablephysics").removeClass("hidden");
    $("#disablephysics").addClass("hidden");
  }
}

/**
 * Esta función conecta el módulo de eventos con el módulo de graficos.
 * Genera un gráfico a partir de los datos entregados. Hace la distincción de que elemento se quiere graficar.
 * @param elementID Identificador del elemento a graficar
 * @param elementObject Datos del nodo desde donde se obtienen los datos a graficar
 * @param PDTO Abstracción de datos de etiquetado del gráfico
 * @returns {Function} Función que configura elementos del gráfico
 */
function wrapper_drawGraph(elementID, elementObject, PDTO) { // PDTO === Plotable DataType Object
  // console.log("pasando por wrapper_drawGraph")
  // console.log("elementObject.category: ",elementObject.category)
  return function() {
    if (elementObject.category === "bus") { // Caso en que se quiera graficar algo de la barra
      let mycanvas = createCanvas(elementID, PDTO);
      if (PDTO.idY === "CenPgen") { // gráficos de generación en una barra
        generatePiledGraph(mycanvas, elementID, 'line', PDTO,
          elementObject.generadores, elementObject.nodeName);
      } else if (PDTO.idY === "flow") { // gráfico de los flujos hacia una barra
        generateFlowBusChart(
          mycanvas,
          elementID,
          'line',
          PDTO,
          currentEdges,
          elementObject.nodeName,
          elementObject.id
        );
      }

      else if (PDTO.idY === "percentils"){
        percentilGraph(
          mycanvas,
          elementID,
          'line',
          PDTO,
          elementObject
        ); 

      }
      
      else {
        generateBusChart(mycanvas, elementID, 'line', PDTO, elementObject.nodeName); // Dibujamos un gráfico con esta información // FIXME
      }

    } else if (elementObject.category === "reservoir") { // En el caso de un embalse

      let mycanvas = createCanvas(elementID, PDTO);
      if (PDTO.idY === "level") { // Creamos gráfico de nivel del agua
        generateLevelChart(
          mycanvas,
          elementID,
          'line',
          PDTO,
          elementObject.nodeName,
          elementObject.reservoirId
        );
      }
    } else if (elementObject.category === "bus-to-bus"){ // En el caso de una línea
      console.log("Pasando por la parte de flujo lineas, con pdto: ",PDTO.idY)
      let mycanvas = createCanvas(elementObject.id, PDTO);
      let bus_b = elementObject.to;
      let bus_a = elementObject.from;
      if (PDTO.idY ==="flow"){
        generateFlowLineChart(
          mycanvas,
          elementObject,
          'line',
          PDTO,
          currentNodes.get(bus_a).nodeName,
          currentNodes.get(bus_b).nodeName,
          chosenHydrology
        );
      }
      else if (PDTO.idY === "percentils"){
        percentilGraph(
          mycanvas,
          elementID,
          'line',
          PDTO,
          elementObject
        ); 
      }
      else {

      console.log("No está definido un grafico")
      }
    } else if (elementObject.category === 'central') { // En el caso de una central

      if (PDTO.idY === 'CenPgen'){ // Si el gráfico es de generación.
        let mycanvas = createCanvas(elementID, PDTO);
        generateGenerationChart(mycanvas, elementID, 'line', PDTO, elementObject.nodeName, elementObject.tipo, chosenHydrology);
      }
    } else { // Si no cae en ningun caso anterior (central-bus)
      console.log(elementObject.category);
    }
    $("#context-menu").addClass('hidden');
    toggleChartViewTo(true);
  };
}

// clase de los tipos de dato graficables
class PlotableDataType {
  constructor(title, labelX, labelY, unitX, unitY, idX, idY) {
    this.title = title;
    this.labelX = labelX;
    this.labelY = labelY;
    this.unitX = unitX;
    this.unitY = unitY;
    this.idX = idX;
    this.idY = idY;
  }

  // Entrega un string con los identificadores del gráfico.
  print(){
    return this.pdtoToString();
  }

  pdtoToString() {
    return this.idX + "-"
      + this.idY;
  }
}

// Boton de play/pausa para animaciones
{
  //Variables necesarias
  let playing = false;
  let was_playing = false;
  let playButton  = $("#playTime");
  let pauseButton = $("#pauseTime");
  let start = $("#start_time");
  let end = $("#end_time");
  let picker = $("#time-picker");
  let slider = $("#time-slider");
  //Toggle de los botones, setean la flag playing y 
  //esconden un boton y muestran el otro
  playButton.click(evt => {
    playButton.addClass("hidden");
    pauseButton.removeClass("hidden");
    playing = true;
  });

  pauseButton.click(evt => {
    playButton.removeClass("hidden");
    pauseButton.addClass("hidden");
    playing = false;
  });


  let time_speed_slider = $("#time_speed_slider");
  //Avanzar en 1 tiempo la iteracion
  let nextIterationPlay = async function() {
    setTimeout(nextIterationPlay,playing?1000-time_speed_slider.val():200);
    if(playing) {
      //Cuando empiezo me pongo en start
      if(! was_playing){
        was_playing = true;
        picker.val(start.val());
        //Si estoy fuera de rango vuelvo a start
      } else if(parseInt(picker.val()) + 1 > parseInt(end.val()) ||
        parseInt(picker.val()) < parseInt(start.val())) {
        picker.val(parseInt(start.val()));
        playButton.removeClass("hidden");
        pauseButton.addClass("hidden");
        playing = false;
        return;
        //Caso normal avanzo en 1
      } else {
        picker.val(parseInt(picker.val())+ 1);
      }
      //Actualizo el slider
      slider.val(picker.val()); 
      //Actualizo la vista
      await updateTime();
      //Una vez actualizado agendo el siguiente paso para 0-1s dependiendo del slider.
      
    } else {
      was_playing = false;
    }
  };

  nextIterationPlay();
}
logTime("events-visjs.js");

/*$(()=>{
  if(!CONFIG.RESULTS_DISABLED){
    $("#animation-enabled").click();
    setTimeout(()=>$("#marginal-cost-toggle").click(),1000);
  }
})/* */

