"use strict";

// Manejo de vistas generales
/**
 * Diccionario de opciones de las vistas
 * @type {{false, false, false: [string,string,string], false, false, true: [string,string,string],
 *  false, true, false: [string,string,string], false, true, true: [string,string,string], true, false, false: [string,string,string],
 *  true, false, true: [string,string,string], true, true, false: [string,string,string], true, true, true: [string,string,string]}}
 */
var view_assignation_dict = {
    // opts, vis, chart -> column size
    "false, false, false" : ["hidden", "hidden", "hidden"],
    "false, false, true" : ["hidden", "hidden", "col-md-12"],
    "false, true, false" : ["hidden", "col-md-12", "hidden"],
    "false, true, true" : ["hidden", "col-md-8", "col-md-4"],
    "true, false, false" : ["col-md-12", "hidden", "hidden"],
    "true, false, true" : ["col-md-2", "hidden", "col-md-10"],
    "true, true, false" : ["col-md-2", "col-md-10", "hidden"],
    "true, true, true" : ["col-md-2", "col-md-6", "col-md-4"]
};
/**
 * Cambia vista de acuerdo a selección
 */
$(".view-selector").on("change", function() {
    let view_assignation = $('#options-view').is(':checked') + ", " + 
                        $('#vis-view').is(':checked') + ", " + 
                        $('#chart-view').is(':checked');
    let column_size = view_assignation_dict[view_assignation];
    
    $('#options-column').prop("class", column_size[0]);
    $('#vis-column').prop("class", column_size[1]);
    $('#chart-column').prop("class", column_size[2] + " scrollable");
});


/**
 * Revisa si es necesario cambio de vista al cliquear sobre
 * algún botón de alguna vista particular
 * @param new_bool Opción que es true si se quiere preguntar si el chequeo es necesario.
 */
function toggleChartViewTo(new_bool) {
    $('#chart-view').prop("checked", new_bool);
    $('#chart-view').trigger("change");
}

// Alerta al salir sin guardar

var unsavedChanges = false;

window.onbeforeunload = confirmExit;

/**
 * Confirmación de salida. Consulta en caso de haber cambios sin guardar
 * @returns {string} Mensaje de confirmación
 */
function confirmExit() {
	if (unsavedChanges) {
		return "Hay cambios sin guardar, está seguro que quiere salir?";
		// Mensaje inútil que el navegador overridea a su gusto
	}
}

/**
 * Visualización de los mapas
 * @param active
 */
function mapVision(active) {

  if (active) {
    $("#map-select")[0].children[2].disabled = false;
    $("#map-select")[0].children[3].disabled = false;
  } else {
    $("#map-select")[0].children[2].disabled = true;
    $("#map-select")[0].children[3].disabled = true;
  }

  $("#map-select").chosen({disable_search_threshold: 10, width: "95%"});
  $("#map-select").trigger("chosen:updated");
}

// Manejo de vistas de redes

var fitInit = [true, false, false];

/**
 * Cambio de vista a visión de datos hídricos.
 */
function toHydricView() {

  currentTopologyType = TOPOLOGY_TYPES.HYDRIC;

  $.each($(".geo"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".electric"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".hydric"), function(index, value) { value.classList.remove("hidden"); });

  if(! fitInit[TOPOLOGY_TYPES.HYDRIC] ) {
    hydricNetwork.fit();
    fitInit[TOPOLOGY_TYPES.HYDRIC] = true;
  }
  currentNetwork = hydricNetwork;
  currentNodes = hydricNodes;
  currentEdges = hydricEdges;
  currentContainer = hydricContainer;
  currentNetwork.emit("zoom", {scale: currentNetwork.getScale()});
  buildDropdown(currentNodes);
  mapVision(false);
}

/**
 * Vista de la red eléctrica
 */
function toElectricView() {

  currentTopologyType = TOPOLOGY_TYPES.ELECTRIC;

  $.each($(".geo"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".hydric"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".electric"), function(index, value) { value.classList.remove("hidden"); });

  currentNetwork = electricNetwork;
  currentNodes = electricNodes;
  currentEdges = electricEdges;
  currentContainer = electricContainer;
  electricNetwork.emit("zoom", {scale: electricNetwork.getScale()});
  buildDropdown(currentNodes);
  mapVision(false);
}

/**
 * Vista de la red eléctrica con geografía incluída.
 */
function toGeoView() {

  currentTopologyType = TOPOLOGY_TYPES.GEO;

  $.each($(".electric"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".hydric"), function(index, value) { value.classList.add("hidden"); });
  $.each($(".geo"), function(index, value) { value.classList.remove("hidden"); });

  if(! fitInit[TOPOLOGY_TYPES.GEO] ) {
    fitInit[TOPOLOGY_TYPES.GEO] = true;
  }
  currentNetwork = geoNetwork;
  currentNodes = electricNodes;
  currentEdges = electricEdges;
  currentContainer = geoContainer;
  makeLLdropdown(currentNodes);
  mapVision(true);
  window.dispatchEvent(new Event('resize'));
}


$("#openViewModal").click( ()=>$("#valid_file").text(""));
logTime("action-index.js");