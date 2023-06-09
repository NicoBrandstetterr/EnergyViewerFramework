"use strict";

/**
 * Todos los métodos que afecten directamente a los embalses (Reservoirs).
 */

function parseReservoirs(reservoirs, hydricTopology){
	/*
	 * Estructura de un embalse (reservoir):
	 {
		"hyd_independent": 1,
		"name": "LMAULE",
		"junction_id": 1,
		"future_cost": null,
		"min_vol": 0,
		"end_vol": 351.5262,
		"start_vol": 351.5262,
		"active": 1,
		"max_vol": 1453.4093,
		"type": "Embalse",
		"id": 1
	 }
	*/
	
	for (var i = 0; i < reservoirs.length; i++) {
		if (typeof reservoirs[i].junction_id ==='undefined') continue;
		let junction = junctionIdToIndice[reservoirs[i].junction_id];
		hydricTopology.junctions[junction].shape = 'image';
		hydricTopology.junctions[junction].category = 'reservoir';
		hydricTopology.junctions[junction].reservoirId = reservoirs[i].id;
		hydricTopology.junctions[junction].nodeName = reservoirs[i].name.replace(/_/gi," ");
		hydricTopology.junctions[junction].image = {
		  selected: "./resources/network/icons/reservoir/selected/reservoir.png",
		  unselected: "./resources/network/icons/reservoir/normal/reservoir.png"
		};
		hydricTopology.junctions[junction].size = 40;
	}
}


function addReservoirsToNetwork(reservoirs){

}