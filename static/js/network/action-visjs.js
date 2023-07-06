"use strict";

/**
 * En este archivo irán los métodos que afecten directamente a la inicialización de visjs.
 *
 * @param lines
 * @returns {Array}
 */

function getAllTimes(buses) {
  let tiempos = new Set();

  for (var bus in buses) {
    if (!buses.hasOwnProperty(bus)){
      continue;
    }

    for (var i = 0; i < buses[bus].length; i++) {
      tiempos.add(buses[bus][i].time);
    }
  }
  let res = Array.from(tiempos).map(t => Number(t));
  res.sort(function (a, b) { return a-b; });
  return res.map(t => t.toString());
}


/**
 * Función que se encarga de dibujar el grafo y todas sus propiedades.
 *
 * @param container Elemento HTML donde se dibujará la red.
 * @param nodesInput nodos que irán en la red.
 * @param edgesInput aristas de la red.
 * @param topologyType tipo de red que se creará.
 *
 * @returns {{network: (vis.Network|*), nodes: (vis.DataSet|*), edges: (vis.DataSet|*)}}
 */
async function generateNetwork(container, nodesInput, edgesInput, topologyType) {

/*
 * 1: eléctrica
 * 2: hídrica
 * 3: geo
 */
  console.log(" function: generateNetwork");
  let t0 = performance.now();
  // Variables para contruir el grafo.
  let network, nodes, edges;

  // Se crean las estructuras de datos de visjs para los arcos y nodos.
  nodes = new vis.DataSet(nodesInput);
  edges = new vis.DataSet(edgesInput);

  // Los datos estarán en el dictionario data.
  data = {
    nodes: nodes,
    edges: edges
  };

  // Opciones para las físicas que se ejecutaran para un grafo en general.
  let physicsOptions = {
    barnesHut:{
      centralGravity: 0.1,
      gravitationalConstant: -200000,
      springConstant: 0.2
    },
    stabilization: {
      iterations: 10 // Cuantas iteraciones se hacen.
    }
  };

  // Características con respecto a como se forman los datos, esto puede incluir contruir de forma jerárquica.
  let layoutOptions = {
    improvedLayout: false,
    randomSeed: 0 // Esto nos da la seguridad de que visjs nos entregue el mismo grafo siempre.
  };

  // Cuando estan georeferenciados no activamos las físicas.
  if (topologyType === TOPOLOGY_TYPES.GEO) {
    physicsOptions = physicsMap();
  }

  // Cuando existe una red hídrica se crea de forma jerarquica.
  if (topologyType === TOPOLOGY_TYPES.HYDRIC){
    layoutOptions.hierarchical = {
      direction: 'UD' // Dirección up-to-down.
    };
  }

  if(defaultPhysicsOptions){} else {
    defaultPhysicsOptions = physicsOptions;
  }

  // Opciones generales de la red generada por visjs.
  options =
    {
      autoResize: true, // Opción para que el grafo se escale a la pantalla dada.
      physics: physicsOptions, // opciones en la física predefinidas.
      nodes: {
        scaling: {
          label: {
            enabled: true,
          }
        },
		borderWidth: 0,
		shapeProperties: {
		//	useImageSize: true
		}
      },
      edges: { // Esto es para que las aristas no sean curvas.
        smooth: {
          // type: 'dynamic',
          type: 'continuous',
          // type: 'discrete',
          // type: 'diagonalCross',
          // type: 'straightCross',
          // type: 'horizontal',
          // type: 'vertical',
          // type: 'curvedCW',
          // type: 'curvedCCW',
          // type: 'cubicBezier',
          roundness: 0
        }
      },
      interaction: { // Botones y seleccion multiple en el grafo.
        multiselect: true,
        hover: true,
        navigationButtons: true,
        keyboard: false, // Desactiva las teclas en visjs.
        tooltipDelay: 50
      },
      layout: layoutOptions // Para que los nodos salgan ordenados por nivel en caso de ser red hídrica.
    };
    console.log(options.edges.smooth.type);
  // Se crea la red en visjs.
  network = new vis.Network(container, data, options);

  // Los nodos que estén seleccionados (múltiples, con ctrl) muestran sus generadores
  var currentSelectedNodes = [];

  // Se cargan datos específicos para la red georeferenciada (mapa detallado, mapa poco detallado).
  if (topologyType === TOPOLOGY_TYPES.GEO) {
     loadGeoData(network);
  }

  // Se agregan los eventos en esta red.
  addTriggerEvents(network, topologyType, nodes, edges);

  // Dado que es la primera que se carga, se contruyen los search a partir de la red electrica.
  if (topologyType === TOPOLOGY_TYPES.ELECTRIC && chosenHydrology in hydrologyTimes && 'buses' in hydrologyTimes[chosenHydrology]) {
    buildDropdownTimes(getAllTimes(hydrologyTimes[chosenHydrology].buses), nodes);
    await updateTime(edges);
  } // TODO hacer lo mismo pero con junctions.

  // Retornamos las variables necesarias para poder actualizar los nodos y aristas.
  let t1 = performance.now();
  console.log("generateNetwork tardó " + (t1-t0) + " milisegundos.")
  return {network: network, nodes: nodes, edges: edges};
}


/**
 * Permite seleccionar múltiples
 * @param network Red desde la cual se seleccionan los nodos
 * @param container Elemento HTML donde descansa la red
 * @param nodes Conjunto de nodos
 */

function enableDrag(network, container, nodes) {
  let t0 = performance.now();
	var rect = {}, drag = false;
  //Funcion que selecciona los nodos contenidos en el rectangulo
  function selectNodesFromHighlight(network, nodes) {

    var nodesIdInDrawing = [];
    //Si el rectangulo tiene volumen 0, como cuando simplemente hago click derecho, retorno
    if(rect.h ===0 || rect.w ===0){
      return;
    }

    var xRange = getStartToEnd(rect.startX, rect.w);
    var yRange = getStartToEnd(rect.startY, rect.h);

    var allNodes = nodes.get({
      filter: function (node) {
        return node.category === "central"? (!node.hidden): true;
    }});
    for (var i = 0; i < allNodes.length; i++) {
      var curNode = allNodes[i];
      var nodePosition = network.getPositions([curNode.id]);
      var nodeXY = network.canvasToDOM({x: nodePosition[curNode.id].x, y: nodePosition[curNode.id].y});
      //Si el nodo esta contenido en la seleccion lo agrego a los nodos por seleccionar
      if (xRange.start <= nodeXY.x && nodeXY.x <= xRange.end && yRange.start <= nodeXY.y && nodeXY.y <= yRange.end) {
        nodesIdInDrawing.push(curNode.id);
      }
    }
    network.selectNodes(nodesIdInDrawing);
  }

  //Evita intervalos con ancho negativo
  function getStartToEnd(start, theLen) {
    return theLen > 0 ? {start: start, end: start + theLen} : {start: start + theLen, end: start};
  }

  //Saber la posicion absoluta de un elemento
  function getBoundingRect( el ) {
    el = el.getBoundingClientRect();
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY
    }
  }

  network.on("afterDrawing",function(){
    // console.log(container);
    var boundingrect = getBoundingRect(container[0]);
    if(! ("w" in rect))return;
    if(rect.h==0 && rect.w==0) return;
    //dibujo el nuevo rectangulo de seleccion
    canvas = network.canvas.frame.canvas;
    var visjsctx = canvas.getContext('2d');
    visjsctx.save();
    visjsctx.setTransform(window.devicePixelRatio,0,0,window.devicePixelRatio,0,0);
    //dibujo el nuevo rectangulo de seleccion
    visjsctx.lineWidth = 1;
    visjsctx.setLineDash([5]);
    visjsctx.strokeStyle = "rgb(100, 100, 100)";
    visjsctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    visjsctx.setLineDash([]);
    visjsctx.fillStyle = "rgba(150, 150, 150, 0.2)";
    visjsctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
    visjsctx.restore();
  });
  
  container.on("mousemove", function(e) {
    //al arrastrar el mouse
    if (drag) {
      //borro el rectangulo de seleccion
      //recalculo el rectanguolo de seleccion
      //boundingrect indica la posicion del canvas en la pagina
      var boundingrect = getBoundingRect(container[0]);
      rect.w = (e.pageX - boundingrect.left) - rect.startX;
      rect.h = (e.pageY - boundingrect.top) - rect.startY ;
    }
  });

  container.on("mousedown", function(e) {
    //al apretar click derecho
    if (e.button == 2) {
      rect.h = 0;
      rect.w = 0;
      //por ahora control no permite seleccionar mas
      let selectedNodes = e.ctrlKey ? network.getSelectedNodes() : null;
      //almaceno el canvas para poder dibujar el rectangulo de seleccion y borrarlo
      //Obtengo el offset del canvas en la pagina y almaceno donde empieza el rectangulo
      var boundingrect = getBoundingRect(container[0]);
      rect.startX = e.pageX - boundingrect.left;
      rect.startY = e.pageY - boundingrect.top;
      drag = true;
      container[0].style.cursor = "crosshair";
    }
  });
  //permito soltar click derecho fuera del canvas de la red
  $("#body").on("mouseup", function(e) {
    if (e.button === 2) {
      drag = false;
      container[0].style.cursor = "default";
      selectNodesFromHighlight(network, nodes);
      rect.h = 0;
      rect.w = 0;
    }
  });

  document.body.oncontextmenu = function() {return false;};
  //network = new vis.Network(container, data, options);
  canvas = network.canvas.frame.canvas;
  visjsctx = canvas.getContext('2d');
  
  let t1 = performance.now();
  console.log("enableDrag tardó " + (t1-t0) + " milisegundos.")
}
logTime("action-visjs.js");