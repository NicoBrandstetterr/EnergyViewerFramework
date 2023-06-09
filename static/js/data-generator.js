"use strict";


var tiempos = 10;
var bReq = new XMLHttpRequest();

/**
 * Configuración de información mostrada en los nodos de generadores
 */
bReq.onreadystatechange = function () {
  if (this.readyState === 4) {
    var buses = JSON.parse(this.responseText);
    for (var i = 0; i < buses.length; i++) {
      var times = [];

      for (var j = 0; j < tiempos; j++) {
        var barRepRandom = 5000 * Math.random();
        var marginal_cost_Random = 8 * Math.random();

        var new_time = {
          "marginal_cost": marginal_cost_Random,
          "BarRetP": barRepRandom,
          "id": buses[i].id,
          "name": buses[i].name,
          "time": j
        };

        times.push(new_time);
      }
    }
  }
};

bReq.open("GET", CONFIG.URL_BUSES, false);
bReq.send();


logTime("data-generator.js");