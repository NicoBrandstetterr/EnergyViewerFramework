"use strict";


var currentElectricHighlighted;
var currentHydricHighlighted;
var currentGeoHighlighted;


/*sin uso*/
function highlightNode(nodes, id) {
	highlightNodeWrapped(nodes, id, currentTopologyType);
}

/*sin uso*/
function highlightNodeWrapped(nodes, id, topologyType) {
	
	switch (topologyType) {
		case TOPOLOGY_TYPES.ELECTRIC:
			if (currentElectricHighlighted) 
				nodes.update([currentElectricHighlighted]);
			break;
		case TOPOLOGY_TYPES.HYDRIC:
			if (currentHydricHighlighted) 
				nodes.update([currentHydricHighlighted]);
			break;
		case TOPOLOGY_TYPES.GEO:
			if (currentGeoHighlighted) 
				nodes.update([currentGeoHighlighted]);
			break;
	}
    
	var node = nodes._data[id];
	
	switch (topologyType) {
		case TOPOLOGY_TYPES.ELECTRIC:
			currentElectricHighlighted = {id:id, image:node.image};
			break;
		case TOPOLOGY_TYPES.HYDRIC:
			currentHydricHighlighted = {id:id, image:node.image};
			break;
		case TOPOLOGY_TYPES.GEO:
			currentGeoHighlighted = {id:id, image:node.image};
			break;
	}
	
	var category = node.category;
	var tipo = category;
	if (category === "central") {
		switch (node.tipo.toLowerCase()) {
			case "biomasa":
			case "carbon":
			case "cogeneracion":
			case "diesel":
			case "embalse":
			case "eolica":
			case "gnl":
			case "pasada":
			case "solar":
				tipo = node.tipo.toLowerCase();
				break;
			default:
				tipo = "energia";
		}
	}
    nodes.update([{
		id: id, 
		image: "./resources/network/icons/" + category + "/highlighted/" + tipo + ".png"
	}]);
    
}


var easingFunction = "easeInOutQuad";
/**
 * Enfoque en nodo al buscar
 * @param network La red en la que se busca el nodo
 * @param id Identificador del nodo buscado
 */
function focusNode(network, id)
{
  var options =
  {
    scale: 1,
    animation:
    {
        //duration: duration,
      easingFunction: easingFunction
    }
  };
  var node = currentNodes.get(id);
  if(node.category === 'central'){
  	toggleGeneratorsOn(node.reference.barra);
  }
  network.focus(id, options);
}

/**
 * Lista los nodos del grafo para realizar búsqueda. Los muestra en un dropdown.
 * @param nodes Arreglo de nodos del gráfico.
 */
function buildDropdown(nodes)
{
    document.getElementById("search-dropdown").options.length = 1;

    nodesArray = nodes.get();
    var select = document.getElementById('search-dropdown');
    for (var i = 0; i < nodesArray.length; i++)
    {
        let option = document.createElement('option');
        option.setAttribute('value', nodesArray[i].id);
        option.innerHTML = nodesArray[i].nodeName;
        select.appendChild(option);

    }
    $("#search-dropdown").chosen({width: "95%"});
    $("#search-dropdown").trigger("chosen:updated");
}

/**
 * Construye lista (dropdown) con los valores de tiempos con
 * datos de nodes
 * @param times Arreglo con tiempos asociados a datos.
 * @param nodes Lista de nodos del grafo.
 */
function buildDropdownTimes(times)
{
  let time_pickers = $(".time_picker");

  for (var i = 0; i < times.length; i++) {
    time_pickers.append($('<option>', {
      value: times[i],
      text: times[i]
    }));
  }
  
  var slider = document.getElementById('time-slider');
  slider.setAttribute("min", times[0]);
  slider.setAttribute("max", times[times.length - 1]);
  time_pickers.val(times[0]);
  $("#end_time").val(times[times.length-1]);
  time_pickers.chosen({width: "35%"});
  time_pickers.trigger("chosen:updated");
}

/***
 * Desplaza vista a nodo seleccionado
 */
function goToSelectedNode()
{
	var select = document.getElementById('search-dropdown');
  switch (currentTopologyType){
    case 3:
      goToGeoNode(currentNetwork, currentNodes, select.value);
    break;
    default:
      goToNode(currentNetwork, currentNodes, select.value);
  }
}

/**
 * Realiza zoom hacia nodo seleccionado
 * @param network Red que se está visualizando actualmente
 * @param id ID del nodo del grafo visualizado en la red (grafo).
 */
function goToNode(network,nodes,id)
{
  focusNode(network, id);
  network.emit("zoom", {scale: network.getScale()});
}

function goToGeoNode(network,nodes,id){
  let obj = nodes.get(id);
  network.flyTo([obj.latitude, obj.longitude], 13, {duration: 1.25});
}

/**
 *Construye lista (o dropdown) de hidrologías disponibles
 */
function buildDropdownHydrology()
{
  var select = document.getElementById('hydrology-picker');
  var first = true;
  var hydrologies = hydrologyList;
  document.getElementById("hydrology-picker").options.length = 1;
  for (var i = 0; i < hydrologies.length; i++)
  {
    var option = document.createElement('option');
    if(first){
      option.setAttribute('selected', 'true');
      first= false;
    }
    option.setAttribute('value', hydrologies[i]);
    option.innerHTML = hydrologies[i];
    select.appendChild(option);

  }
  $("#hydrology-picker").chosen({disable_search_threshold: 10,width: "95%"});
}

$(".map-select").chosen({ disable_search_threshold: 10, width: "95%" });
$("#search-dropdown").change( function () {
  //$("#search-dropdown").trigger("chosen:close");
  goToSelectedNode();
});

if(!CONFIG.RESULTS_DISABLED)  $("#div-resultados").removeClass("hidden");

logTime("action-search.js");
