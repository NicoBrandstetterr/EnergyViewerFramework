"use strict";

function generateLLNetwork(container, nodesArray) {
    console.log("function: generateLLNetwork");
    let ctx = container;

    const initialZoom = 5;

    let map = L.map(ctx, {
        center: [-33.187388, -70.24362],
        zoomControl: false,
        zoom: initialZoom,
        minZoom: 4,
        maxZoom: 16
    });

    let openStreetMap = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 1.0
    });

    openStreetMap.addTo(map);
    map.addLayer(openStreetMap);

    map.on('click', event => {
        $("#context-menu").addClass('hidden');
    });

    map.createPane('nodes');
    map.getPane('nodes').style.zIndex = 408;
    map.getPane('nodes').style['mix-blend-mode'] = 'normal';

    let nodesGeoJson = {
        "type": "FeatureCollection",
        "name": "Master",
        "crs": {
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            },
            "type": "name"
        },
        "features": []
    };

    nodesArray.forEach(node => {
        if (node.category === "bus"){
            let lat = parseFloat(node.latitude);
            let lng = parseFloat(node.longitude);
            nodesGeoJson.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "properties": node,
            });
        }
    });


    let addNodeListeners = (feature, layer) => {
        layer.bindTooltip(feature.properties.label);
        layer.on('contextmenu', event => {
            let busName = feature.properties.label;
            if (CONFIG.RESULTS_DISABLED) return;
            var coordX = event.originalEvent.pageX - window.outerWidth / 6 - 30;
            var coordY = event.originalEvent.pageY - 30;
            $("#context-menu").toggleClass('hidden');
            $("#context-menu").css({
                top: coordY + "px",
                left: coordX + "px"
            });
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
            var clickedElementID = feature.properties.id;
            var clickedElementObject = feature.properties;
            var datatype_dict = {};

            datatype_dict = bus_datatype_dict

            $("#context-menu").children(".list").empty();
            for (let datatype in datatype_dict) {
                let datatype_option = document.createElement('li');
                datatype_option.innerHTML = datatype;
                datatype_option.addEventListener("click", wrapper_drawGraph(clickedElementID, clickedElementObject, datatype_dict[datatype]));
                $("#context-menu").children(".list").append(datatype_option);
            }
        });
    };

    let nodesLayer = L.geoJson(nodesGeoJson, {
        attribution: '',
        pane: 'nodes',
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng)
        },
        onEachFeature: addNodeListeners
    });

    map.addLayer(nodesLayer);
    nodesLayer.addTo(map);
    return map;
}

function makeLLdropdown(nodes){
    console.log("function: makeLLdropdown");
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