"use strict";

// var buses = [];
// var lines = [];
// var generators = [];
// var busInfo;

async function loadElectricData() {
  try {
    const [bResponse, lResponse, gResponse] = await Promise.all([
      fetch(CONFIG.URL_BUSES),
      fetch(CONFIG.URL_LINES),
      fetch(CONFIG.URL_CENTRALS)
    ]);
    
    if (!bResponse.ok) {
      createLog("No está el archivo de buses (buses.json)", LOG_TYPE.ERROR);
      return;
    }
    if (!lResponse.ok) {
      createLog("No está el archivo de líneas (lines.json)", LOG_TYPE.ERROR);
      return;
    }
    if (!gResponse.ok) {
      createLog("No está el archivo de generadores (centrals.json)", LOG_TYPE.ERROR);
      return;
    }
    
    const [buses, lines, generators] = await Promise.all([
      bResponse.json(),
      lResponse.json(),
      gResponse.json()
    ]);

    createLog('Archivo de buses leído', LOG_TYPE.SUCCESS);
    createLog('Archivo de líneas leído', LOG_TYPE.SUCCESS);
    createLog('Archivo de generadores leído', LOG_TYPE.SUCCESS);
    if(!CONFIG.RESULTS_DISABLED) await loadLinesFiles(lines);
    await loadElectricTopology(buses, lines, generators);
    parseElectricTopologyToNetwork();
    addDataToMapNetwork();
    const result = await generateNetwork(electricContainer, nodesArray, edgesArray, TOPOLOGY_TYPES.ELECTRIC);
    createLog('Red eléctrica generada correctamente!', LOG_TYPE.SUCCESS);
    electricNetwork = result.network;
    electricNodes = result.nodes;
    electricEdges = result.edges;
    geoNetwork = generateLLNetwork(geoContainer, nodesMArray);
    toElectricView();
    enableDrag(electricNetwork, $('#my-electric-network'), electricNodes);
  } catch (error) {
    console.error(error);
  }
}

// loadElectricData();


function loadFile() {
  console.log("pasando por loadFile");
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('json-input');

  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
    alert("file selected");
    console.log(input.value)
    fr.onloadend = function(event){
      var img = document.getElementById("yourImgTag");
      img.src = event.target.result;
    }

  }

  function receivedText(e) {
    lines = e.target.result;
    var newArr = JSON.parse(lines);
  }

}

logTime("electric-topology-loader.js");