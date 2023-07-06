"use strict";




var BASE_FOLDER_NAME = "Casos/";
// var BASE_FOLDER_NAME = "file:///home/user/Documents/data/";
// var BASE_FOLDER_NAME = "file:///C:/Users/user/Documents/data/";
var MODEL_FOLDER_NAME = getParameterByName("model");


// "ENABLE_TIME_LOG"       :   (getParameterByName('debug') === 'true')
let base_cfg = {
    "BASE_FOLDER_NAME"      :  BASE_FOLDER_NAME,
    "MODEL_FOLDER_NAME"     :  MODEL_FOLDER_NAME,
    "ENABLE_TIME_LOG"       :  (getParameterByName('debug') === 'true'),
    "RESULTS_DISABLED"      : !(getParameterByName('results') === 'true'),
    "standalone"            :  (getParameterByName('standalone') === 'true')
};





var CONFIG =
  {
    "URL_BUSES"                     : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Electric/bus.json",
    "URL_LINES"                     : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Electric/lines.json",
    "URL_CENTRALS"                  : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Electric/centrals.json",
    "URL_WATERWAYS"                 : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Hydric/waterways.json",
    "URL_JUNCTIONS"                 : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Hydric/junctions.json",
    "URL_RESERVOIRS"                : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/Hydric/reservoirs.json",
    "URL_SHAPE_BASIC"               : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/shape.json",
    "URL_SHAPE_DETAILED"            : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/shapeDetails.json",
    "URL_HYDROLOGIES"               : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/hydrologies.json",
    "URL_INDHOR"                    : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/indhor.json",
    "URL_VIEW"                      :  BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/view.json",
    "URL_VIEW_INICIO"               :  BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Topology/view_inicio.json",

    "SCENARIOS_FOLDER"              : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/",
    "BUSES_FOLDER"                  : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/{hydrology}/Bus/",
    "CENTRALS_FOLDER"               : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/{hydrology}/Centrals/",
    "LINES_FOLDER"                  : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/{hydrology}/Lines/",
    "RESERVOIRS_FOLDER"             : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/{hydrology}/Reservoirs/",
    "PERCENTIL_MARGINAL_COST_FOLDER": BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/Marginal_cost_percentil/",
    "PERCENTIL_FLOW_LINE_FOLDER"    : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/Flow_Line_percentil/",
    "PILED_GENERATION_GRAPH_FOLDER" : BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/Generation_system/",

    "LOW_MARGINAL_COST"             : 10,
    "HIGH_MARGINAL_COST"            : 150,
    "FAILURE_THRESHOLD"             : 200,
	  "NUMBER_OF_QUANTILES"		      	: 10,


    "ESCALADOR"                     : 3.5,

    "COLOR_CARBON"                  : "rgba(33, 33, 33, 1)", // Grey 90%
    "COLOR_DIESEL"                  : "rgba(158, 158, 158, 1)", // Grey 50%
    "COLOR_GEOTERMIA"               : "rgba(128, 0, 32, 1)",
    "COLOR_GLP"                     : "rgba(51, 102, 0, 1)",
    "COLOR_GNL"                     : "rgba(255, 125, 7, 0.5)", // Deep Orange
    "COLOR_SERIE"                   : "rgba(33, 150, 243, 1)", // Blue
    "COLOR_EMBALSE"                 : "rgba(63, 81, 181, 1)", // Indigo
    "COLOR_PASADA"                  : "rgba(3, 169, 244, 1)", // Light Blue
    "COLOR_MINIHIDRO"               : "rgba(0, 188, 212, 1)", // Cyan
    "COLOR_SOLAR"                   : "rgba(255, 193, 7, 1)", // Amber (almost yellow)
    "COLOR_SOLAR_CSP"               : "rgba(204, 153, 51, 1)",
    "COLOR_EOLICA"                  : "rgba(139, 195, 74, 1)", // Light Green
    "COLOR_OTROS"                   : "rgba(128, 0, 128, 1)",
    "COLOR_OTROS_TERMICO"           : "rgba(165, 42, 42, 0.6)",
    "COLOR_BIOMASA"                 : "rgba(121, 85, 72, 1)", // Brown
    "COLOR_COGENERACION"            : "rgba(128, 222, 234, 1)"  // Cyan 20%
  };

//Le agrego lo que viene en base_cfg a CONFIG
Object.assign(CONFIG, base_cfg);

//Si la aplicacion no es el standalone con el gestor de proyectos
if(!base_cfg.standalone){
    $(".standalone").addClass('hidden');
}
// API
// "URL_BUSES": "http://172.17.50.97:8080/input/bus",
// "URL_LINES": "http://172.17.50.97:8080/input/lines",
// "URL_CENTRALS": "http://172.17.50.97:8080/input/centrals"

// Local
// "URL_BUSES": "./data/bus29.json",
// "URL_LINES": "./data/lines29.json",
// "URL_CENTRALS": "./data/centrals29.json"
