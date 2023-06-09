"use strict";

/**
 * Métodos relacionados con el mapa (geografía).
 */

/**
 * Metodo auxiliar que dibuja las líneas de un polígono.
 */
function drawPolygon(ctx, coordinates){
  ctx.beginPath();
  ctx.moveTo(coordinates[0][0] * -escala, coordinates[0][1] * escala);
  /* Recorremos las coordenadas para ir dibujando línea a línea. */
  for (var j = 1; j < coordinates.length; j++) {
    ctx.lineTo(coordinates[j][0] * -escala, coordinates[j][1] * escala)
  }
  ctx.closePath();
  /* Propiedades de la línea a dibujar del mapa. */
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/**
 * Este método se encarga de dibujar el mapa que está definido en un geojson dado.
 */
function drawMap(ctx, geojson) {

  /* Aquí vemos si es que esta bien formado el json, es decir, que tenga el arreglo features. */
  if (typeof geojson.features === 'undefined'){
    return;
  }
  var features = geojson.features;
  /* Recorremos todas las figuras a dibujar. Estas pueden ser Polygon o Multipolygon. */
  for (var k = 0; k < features.length; k++) {
    var polygonArray = geojson.features[k].geometry.coordinates;
    /* Caso en el que es un poligono, se recorre el poligono y se dibuja. */
    if (geojson.features[k].geometry.type === "Polygon") {
      drawPolygon(ctx, polygonArray[0]);
      continue;
    }

    /* Caso Multipolygon, se van recorriendo poligono a poligono usando los mismos casos que en el paso anterior. */
    for (var i = 0; i < polygonArray.length; i++) {
      drawPolygon(ctx, polygonArray[i][0]);
    }
  }
}

/**
 * Desactiva las fisicas de visjs antes de agregar los nodos, para la georeferenciación.
 */
function physicsMap() {
  var pO = {
      stabilization: {
        iterations: 0
      }
    };
  return pO;
}

/**
 * Carga datos geográficos (con latitud y longitud)
 */
function loadGeoData(network){
  console.log("pasando por loadGeoData")
  var geoReq = new XMLHttpRequest();
  var geoReq2 = new XMLHttpRequest();
  geoReq.onreadystatechange = function () {
    if (this.readyState === 4){
      mapdatabasic = JSON.parse(this.responseText);
      geoReq2.open("GET", CONFIG.URL_SHAPE_DETAILED, false);
      geoReq2.send();
    }
  };

  geoReq2.onreadystatechange = function () {
    if (this.readyState === 4){
      mapdatadetailed = JSON.parse(this.responseText);
      network.on("beforeDrawing", function(ctx) {
        var map_select_status = $("#map-select :selected").index();
        switch(map_select_status){
          case 2:
            drawMap(ctx,mapdatabasic);
            break;
          case 3:
            drawMap(ctx,mapdatadetailed);
            break;
        }
      });
    }
  };

  try {
    geoReq.open("GET", CONFIG.URL_SHAPE_BASIC, false);
    geoReq.send();
  } catch (err){
    createLog("El archivo con el mapa básico no esta disponible", LOG_TYPE.WARNING);
  }
}

logTime("map-visjs.js");