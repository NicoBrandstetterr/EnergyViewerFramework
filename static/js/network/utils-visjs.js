"use strict";

/**
 *  En este archivo irán todas las variables necesarias para el funcionamiento de visjs.
 *  También tendrá métodos auxiliares.
 */

/**
 * Enumerador que sirve para mejor entendimiento de código.
 * @type {{ELECTRIC: number, HYDRIC: number, GEO: number}}
 */
let TOPOLOGY_TYPES = {
	ELECTRIC: 1,
	HYDRIC: 2,
	GEO: 3
};

/**
 * Variables relacionadas con la red electrica.
 */
let electricNetwork;
const electricContainer = document.getElementById('my-electric-network');
let electricNodes;
let electricEdges;
let edgesArray = [];
let nodesArray = [];

/**
 * Variables relacionadas con la red georeferenciada.
 */
let geoNetwork;
const geoContainer = document.getElementById('my-geo-network');
let geoNodes;
let geoEdges;
let edgesMArray = [];
let nodesMArray = [];

/**
 * Variables relacionadas con la red hídrica.
 */
let hydricNetwork;
const hydricContainer = document.getElementById('my-hydric-network');
let hydricNodes;
let hydricEdges;
let edgesHArray = [];
let nodesHArray = [];
let data, mapdatabasic, mapdatadetailed;

/**
 * Variables que nos indican el actual estado de la red mostrada.
 */
let currentTopologyType = TOPOLOGY_TYPES.ELECTRIC;
let currentNetwork;
let currentContainer;
let currentNodes;
let currentEdges;

/**
 * Variables relacionadas con las hidrologías y resultados.
 */
let chosenTime = 0;
let chosenHydrology;
let hydrologyList;

/**
 * Variables adicionales.
 */
let maxid = 0;
let escala = -500;
let canvas;
let visjsctx;
let options;
let lastUpdateTime;
let defaultPhysicsOptions;

/**
 * Retorna un png que contiene la actual red mostrada.
 */
function canvasToPNG() {
  return currentContainer.firstChild.firstChild.toDataURL();
}

/**
 * Función que retorna verdadero si la variable es 0 o undefined.
 */
let zero = function(x){
  if(typeof x == 'undefined'){
    return true;
  }
  return -0.01<x && x<0.01;
};

/**
 * Cambia los archivos a buscar dependiendo de la hidrología elegida.
 */
function changeConfigHydrology(){
  CONFIG.BUSES_FOLDER = BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + chosenHydrology + "/Bus/";
  CONFIG.LINES_FOLDER = BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + chosenHydrology + "/Lines/";
  CONFIG.CENTRALS_FOLDER = BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + chosenHydrology + "/Centrals/";
  CONFIG.RESERVOIRS_FOLDER = BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + chosenHydrology + "/Reservoirs/";
}

/**
 *
 * Toma el tipo del elemento y una hidrología y retorna la ruta de la carpeta del tipo.
 * @param type
 * @param hydrology
 */
function getUrlByHydrology(type, hydrology){
  let urlType = {
    'buses': function (hydro) {return BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + hydro + "/Bus/"; },
    'lines' : function (hydro) {return BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + hydro + "/Lines/"; },
    'centrals': function (hydro) {return BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + hydro + "/Centrals/"; },
    'reservoirs': function (hydro) {return BASE_FOLDER_NAME + MODEL_FOLDER_NAME + "/Scenarios/" + hydro + "/Reservoirs/"; },
  };

  return urlType[type](hydrology);
}

/**
 *
 * Retorna un string el tipo de elemento a cargar.
 *
 * @param type
 */
function getTypeToFileString(type){
  let urlType = {
    'buses': function () {return "bus_"; },
    'lines' : function () {return "line_"; },
    'centrals': function () {return "central_"; },
    'reservoirs': function () {return "reservoir_"; },
  };

  return urlType[type]();
}

/**
 *
 * Retorna el nombre en español del tipo entregado.
 *
 * @param type
 */
function getTypeToString(type){
  let urlType = {
    'buses': function () {return "de la barra"; },
    'lines' : function () {return "de la línea"; },
    'centrals': function () {return "de la central"; },
    'reservoirs': function () {return "del embalse"; },
  };

  return urlType[type]();
}

/*
 * Caché de imágenes.
 */
let BusImages = {};

function fillDefaults(config) {
	let filledConfig = {};
	
	let configProperty = function (fc, c, x, defaultValue) {
		if (c.hasOwnProperty(x))
			fc[x] = c[x];
		else 
			fc[x] = defaultValue;
	}
	
	configProperty(filledConfig, config, 'hasGenerators', false);
	configProperty(filledConfig, config, 'hasLoad', false);
	configProperty(filledConfig, config, 'selected', false);
	configProperty(filledConfig, config, 'label', "");
	configProperty(filledConfig, config, 'quantile', -1);
	
	return filledConfig;
}


logTime("utils-visjs.js");

async function createBusImage(barra, swap = false){
	console.log("Function: createBusImage");
	// if ($("#marginal-cost-toggle").is(":checked") && barra.id === 1){
	// 	console.log("testeando altonorte: ",barra);
	// 	return
	// }
	let io_val;
    switch (barra.hasGenerators){
      case true:
        switch (barra.hasLoad){
          case true:
            io_val = "_io"
            break
          default:
            io_val = "_i"
        }
        break
      default:
        switch (barra.hasLoad){
          case true:
            io_val = "_o"
            break
          default:
            io_val = ""
        }
    }

	if (swap){
		console.log(barra);
		let objective;
		switch (barra.type){
			case "bus_v":
				objective = "bus_dot"
				break
			case "bus_dot":
				objective = "bus_h"
				break
			default:
				objective = "bus_v"
		}
		barra.type = objective;
	}

	switch (barra.type){
		case "bus_v":
			//barra.size = 40;
			barra.maxSize = 100;
			break
		case "bus_dot":
			//barra.size = 40;
			barra.maxSize = 120;
			break
		default:
			//barra.size = 40;
			barra.maxSize = 40;
	}

	if (!barra.type){
		// console.log("La barra de a continuacion no tiene type: ",barra);
		barra.type = "bus_h";
	}


	function changeSvgFillColor(svgString, fillColor) {
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
		const rectElement = svgDoc.querySelector('rect');
		rectElement.setAttribute('fill', fillColor);
		return new XMLSerializer().serializeToString(svgDoc.documentElement);
	  }

	async function getSvgAndChangeFillColor(svgPath, fillColor) {
		return new Promise(async (resolve, reject) => {
		  try {
			const response = await fetch(svgPath);
			const svgText = await response.text();
			const modifiedSvgText = changeSvgFillColor(svgText, fillColor);
			resolve(modifiedSvgText);
		  } catch (error) {
			reject(error);
		  }
		});
	  }
	
	// Si el slide marginal-cost está encendido
	if ($("#marginal-cost-toggle").is(":checked")) {
		try {
			let val = barra.marginal_cost
			let numberOfQuantiles = CONFIG.NUMBER_OF_QUANTILES;
			let range;
			let step;
			// if (!val){
			// 	console.log("La barra de acontinuacion no tiene costos marginales: ",barra);
			// }
			// -1 es el cuantil por defecto, con negro.
			let quantile = -1;
			if (val <= CONFIG.FAILURE_THRESHOLD){
				if (val < CONFIG.LOW_MARGINAL_COST) {
					quantile = 0;
				}
				else if (val >= CONFIG.HIGH_MARGINAL_COST) {
					quantile = numberOfQuantiles;
				}
				else {
					range = CONFIG.HIGH_MARGINAL_COST - CONFIG.LOW_MARGINAL_COST;
					step = range/numberOfQuantiles;
					for (let i = 1; i <= numberOfQuantiles; i++) {
						if (val < (CONFIG.LOW_MARGINAL_COST + i*step)) {
							quantile = i;
							break;
						}
					}
				}
			}
			else {
				quantile = numberOfQuantiles+1;
			}
			// if ( barra.id === 1){
			// 	console.log("testeando altonorte dentro de costos marginales: ",barra);
			// }
			let svgPath;
			switch (barra.type){
				case "bus_v":
					svgPath = "./resources/network/icons/bus/highlighted/v/"+barra.type + io_val +"_"+quantile+ ".svg";
					break
				case "bus_dot":
					svgPath = "./resources/network/icons/bus/highlighted/dot/"+barra.type + io_val +"_"+quantile+ ".svg";
					break
				default:
					svgPath = "./resources/network/icons/bus/highlighted/h/"+barra.type + io_val +"_"+quantile+ ".svg";
			}
			if(swap){
				console.log("dentro del if marginal, val: ",val,quantile)
				console.log("ssss: svg", svgPath)
			}
			
			if (quantile ===-1){
				console.log("Se viene cuantil -1: ",barra);
			}
			barra.image = {
			selected: svgPath,
			unselected: svgPath
			};
	
		} catch (error) {
			console.error("Error al cargar y modificar el SVG:", error);
		}

	}   
	else {
		// Usar la imagen predeterminada
		// console.log("imagen predeterminada");
		barra.image = {
			selected: "./resources/network/icons/bus/selected/" + barra.type + io_val + ".svg",
			unselected: "./resources/network/icons/bus/selected/" + barra.type + io_val + ".svg"
		};
		
	}
	// console.log("BARRA tras cambio figura: ",barra);

}