"use strict";

// Dado un gráfico de visjs y un menubarupdateHydrology
// Cuando se hace click en "Guardar vista" en el menubar
// Entonces se descarga un json con las posiciones actuales de las barras

/**
 *
 * @param network
 * @param nodes
 * @param edges
 * @param output
 */
function storeElectricNetwork(network,nodes,edges,output){
    console.log("Funcion: storeElectricNetwork");
    let network_positions = network.getPositions();
    let buses = nodes.get({
        filter: function (item) {
            return (item.category === 'bus');
        }
    });
    console.log(buses);
    let bus_ids = []
    for(let j = 0; j < buses.length; j++) {

        let id = buses[j].id;
        //Guardamos la posicion de la barra en un JSON
        bus_ids.push(id);


        let node_x = network_positions[id].x;
        let node_y = network_positions[id].y;
        output.buses[id] = {
            position : {x: node_x, y: node_y},
            displaying : buses[j].displaying,
            type: buses[j].type,
            maxSize: buses[j].maxSize,
            image: buses[j].image
        }
    }

    //Escondo los generadores para que se actualicen las posiciones y referencias
    toggleGeneratorsOff(bus_ids,network,nodes,edges);
    bus_ids = [];
    for(let j=0; j<buses.length; j++){
        let id = buses[j].id;
        buses[j].generadores.map(function(gen){
            //Guardo las coordenadas relativas del generador (respecto a su barra)
            output.generators[gen.id] = {x:gen.x,y:gen.y,xref:gen.reference.x,yref:gen.reference.y}
        });
        //Vuelvo al estado anterior
        if(output.buses[id].displaying) bus_ids.push(id);
    }
    toggleGeneratorsOn(bus_ids,network,nodes,edges);
}

/**
 *
 * @param network
 * @param nodes
 * @param edges
 * @param input
 */
function loadElectricNetwork(network,nodes,edges,input,view=false){
    console.log("Funcion: loadElectricNetwork");
    // console.log(input);
    let buses = input.buses;
    let centrals = input.generators;
    // Obtengo las barras y las guardo en un objeto con su ID como llave
    let bus_ids = {};
    nodes.get({
        filter: function (item) {
            return (item.category === 'bus');
        }
    }).map(bus => bus_ids[bus.id] = bus);
    // Obtengo las centrales y las guardo en un objeto con su ID como llave
    let central_ids = {};
    nodes.get({
        filter: function (item) {
            return (item.category === 'central');
        }
    }).map(central => central_ids[central.id] = central);

    // Escondo los generadores
    toggleGeneratorsOff(bus_ids,network,nodes,edges);
    // Para los que corresponden a barras actualizo posiciones
    
    nodes.update(Object.keys(buses).filter(id => id in bus_ids).map( id => ({
        id : id,
        x : buses[id].position.x,
        y : buses[id].position.y,
        type : buses[id].type,
        maxSize: buses[id].maxSize,
        image: buses[id].image
        })));

    
    // Para los que corresponden a centrales actualizo posiciones y referencia
    nodes.update(Object.keys(centrals).filter(id => id in central_ids).map( id => ({
                                                    id : id,
                                                    x : centrals[id].x,
                                                    y : centrals[id].y,
                                                    reference : {
                                                        barra : nodes.get(id).reference.barra,
                                                        x : centrals[id].xref,
                                                        y : centrals[id].yref
                                                    }
                                                    })));
    // Muestro los generadores que estaban visibles
    toggleGeneratorsOn(Object.keys(buses).filter(id => id in bus_ids && buses[id] && buses[id].displaying),network,nodes,edges);

    if($("#marginal-cost-toggle").is(":checked") && electricNodes && currentNodes){
        // Actualizamos electricTopology con los datos más actualizados de electricNodes
        for (let i = 0; i < electricTopology.buses.length; i++){
          let id = electricTopology.buses[i].id;
          electricTopology.buses[i] = electricNodes._data[id];
        }
      }
}

/**
 *
 * @param output
 */
function storeHydricNetwork(output){
    if(hydricNetwork){
        var positions = hydricNetwork.getPositions();
        output.node_pos = Object.keys(positions).map(id => ({id: id, x: positions[id].x, y: positions[id].y}));
    }
}

/**
 *
 * @param input
 */
function loadHydricNetwork(input){
    if(hydricNetwork){
        var positions = hydricNetwork.getPositions();
        hydricNodes.update(input.node_pos.filter(upd8 => upd8.id in positions));
    }
}

/**
 *
 */
function saveView() {
    var networkName = MODEL_FOLDER_NAME;
    var output = {
        network_name : networkName,
        electricNetwork : {
            buses : {},
            generators : {}
        },
        hydricNetwork : {
            node_pos : []
        },
        geoNetwork : {
            buses : {},
            generators : {}
        },
    };
    // Red electrica basica
    storeElectricNetwork(electricNetwork,electricNodes,electricEdges,output.electricNetwork);
    // Red electrica georeferenciada
    // storeElectricNetwork(geoNetwork,geoNodes,geoEdges,output.geoNetwork);
    // Red hidrica
    storeHydricNetwork(output.hydricNetwork);

    var expvals = JSON.stringify(output);
    //Genero el archivo ft. _Hackerman_	
	var a = window.document.createElement('a');
	var blob = new Blob([expvals], {type: "text/plain;charset=utf-8"});
	a.href = window.URL.createObjectURL(blob);
	a.download = 'view.json';

	// Append anchor to body.
	document.body.appendChild(a);
	a.click();

	// Remove anchor from body
	document.body.removeChild(a);

	//Marco que ya no hay cambios sin guardar
	unsavedChanges = false;
	
}


// Dado un gráfico de visjs y un menubar
// Cuando se hace click en "Cargar vista" en el menubar
// Entonces se abre un dialog para subir un json de posiciones, y se modifica el visjs la vista con las posiciones del json
/**
 *
 * @param forced
 */
function loadView(forced) {
    //Leo el archivo
    var myFile = $('#fileinput').prop('files')[0];
    if(typeof myFile === 'undefined') return;
    let fr = new FileReader();
    fr.readAsText(myFile);
    
    //Cuando leo el archivo
    fr.onload = function() {
        var loaded_data = JSON.parse(fr.result);
        // Pongo las barras en las posiciones guardadas
        // Reviso cuales son las vistas que el usuario desea cargar
        if(forced || $("#loadTopoView").is(':checked')) loadElectricNetwork(electricNetwork,electricNodes,electricEdges,loaded_data.electricNetwork);
        // if(forced || $("#loadGeoView").is(':checked')) loadElectricNetwork(geoNetwork,geoNodes,geoEdges,loaded_data.geoNetwork);
        if(forced || $("#loadHydricView").is(':checked')) loadHydricNetwork(loaded_data.hydricNetwork);
        // Vuelvo a seleccionar las checkboxes
        $(".viewLoadSelector").prop('checked', true);
        //Si la red es incorrecta entonces muestro un error, de lo contrario cierro el modal
        if(!forced && loaded_data.network_name !== MODEL_FOLDER_NAME){
            $("#valid_file").text("Archivo de vista invalido. El archivo de vista corresponde a la red {network}. Si desea volver a la posicion inicial de las barras presione F5.".formatUnicorn({network : loaded_data.network_name}));
        } else {
            $('#loadJSONView').modal('toggle');
        }
    }
}

function loadAutoView(forced,inicio=false) {
    // Obtener el archivo JSON desde la URL especificada
    let url_view = CONFIG.URL_VIEW;
    if(inicio){
        
        url_view = CONFIG.URL_VIEW_INICIO;
        console.log("Se esta cargando correctamente la vista");
    }
    
    fetch(url_view)
        .then(response => response.json())
        .then(loaded_data => {
            // Pongo las barras en las posiciones guardadas
            // Reviso cuales son las vistas que el usuario desea cargar
            if(forced || $("#loadTopoView").is(':checked')) loadElectricNetwork(electricNetwork,electricNodes,electricEdges,loaded_data.electricNetwork,true);
            if(forced || $("#loadHydricView").is(':checked')) loadHydricNetwork(loaded_data.hydricNetwork);
            // Vuelvo a seleccionar las checkboxes
            $(".viewLoadSelector").prop('checked', true);
            // Desmarco el slider de color de costos marginales si es que está activo
            if ($("#marginal-cost-toggle").is(":checked")) {
                $("#marginal-cost-toggle").prop("checked", false);
              }
            //Si la red es incorrecta entonces muestro un error, de lo contrario cierro el modal
            if(!forced && loaded_data.network_name !== MODEL_FOLDER_NAME){
                $("#valid_file").text("Archivo de vista invalido. El archivo de vista corresponde a la red {network}. Si desea volver a la posicion inicial de las barras presione F5.".formatUnicorn({network : loaded_data.network_name}));
            }
        })
        .catch(error => {
            console.log("Error: ",error);
            createLog("El archivo view.json no se encuentra disponible",LOG_TYPE.ERROR);
        });
}


/**
 *
 * @param view_object
 */
function loadViewFromObject(view_object){
    loadElectricNetwork(electricNetwork,electricNodes,electricEdges,view_object.electricNetwork);
    loadElectricNetwork(geoNetwork,geoNodes,geoEdges,view_object.geoNetwork);
    loadHydricNetwork(view_object.hydricNetwork);
}

logTime("action-save.js");