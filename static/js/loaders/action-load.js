'use strict';

/**
 *List files from path
 */
function getFiles(){
    var inp = document.getElementById("folder-input");
// Access and handle the files
    var i;
    for (i = 0; i < inp.files.length; i++) {
        var file = inp.files[i];
        // do things with file
    }
}

/**
 * Muestra archivos
 */
function showFiles(){
    // console.log(getFiles("./data/CHL"));
}

/**
 * Actualiza los datos en el network (grafo) según la hidrología elegida en el select.
 */
async function updateHydrology() {
  console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||")
  console.log("Pasando por UpdateHydrology")
  let t0 = performance.now();
  hydrologyTimes = {};

  
  var select = document.getElementById("hydrology-picker");
  
  // Tomamos el valor del select.
  chosenHydrology = parseInt(select.options[select.selectedIndex].value);

//   console.log("Tiempo en obtener valores del select: ",time-getCurrentTime(),"ms")

  // Cargamos los archivos necesarios
  let t1 = performance.now();
  console.log("updateHydrology chosenHydrology = parseInt(select.options[select.selectedIndex].value); tardó " + (t1-t0) + " milisegundos.")
  await loadLinesFiles();
  let t2 = performance.now();
  console.log("updateHydrology loadLinesFiles tardó " + (t2-t1) + " milisegundos.")
  
  // Actualizamos los datos en los tooltip

  updateLines(currentEdges);
  let t3 = performance.now();
  console.log("updateHydrology updateLines tardó " + (t3-t2) + " milisegundos.")

  // console.log("hidrotimes 3: ",hydrologyTimes)
  await updateBuses(currentNodes);
  let t4 = performance.now();
  console.log("updateHydrology updateBuses tardó " + (t4-t3) + " milisegundos.")
  // console.log("hidrotimes 4: ",hydrologyTimes)

  // updateCentrals(currentNodes); 
  let t5 = performance.now();
  // console.log("updateHydrology updateCentrals tardó " + (t5-t4) + " milisegundos.")


  // Cambiamos la ruta de los archivos.
  changeConfigHydrology();

  let t6 = performance.now();
  console.log("updateHydrology En TOTAL tardó " + (t6-t0) + " milisegundos.")
  console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||")
}

logTime("action-load.js");
