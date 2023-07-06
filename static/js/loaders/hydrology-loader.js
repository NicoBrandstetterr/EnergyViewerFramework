"use strict";

/**
 * En este archivo se encuentran todos los métodos en relación a la carga de resultados.
 */



let hydrologyTimes = {};
console.log(window.location.href);


/**
 * Carga la lista de hidrologías disponibles.
 */



/**
 * Función que carga todos los archivos de resultado de las líneas de la actual hidrología.
 */
async function loadLinesFiles(lines){
  console.log("function: loadlinesfiles");
  if(typeof lines === 'undefined') {
    console.log("WARNING: Archivo lines no esta definido");
    return;
  }

  // Esto solo revisa si la estructura fue creada.
  checkHydrologyTimes(chosenHydrology);

  let noLineResultsLog = [];
  let promises = [];
  
  for (let i = 0; i < lines.length; i++) {
      let lineID = lines[i].id;

      if (!(lineID in hydrologyTimes[chosenHydrology].lines)) {
        console.log("loadlinefiles linea no guardada");
        promises.push(
          (async () => {
            try {
              let response = await fetch(getUrlByHydrology('lines', chosenHydrology) + getTypeToFileString('lines') + lineID + ".json");
              if (response.ok) {
                let lineData = await response.json();
                hydrologyTimes[chosenHydrology].lines[lineID] = lineData;
              } else {
                if (noLineResultsLog.length === 0) {
                  noLineResultsLog.push(createLog('Hay líneas sin archivo de resultados', LOG_TYPE.ERROR));
                }
                addDetailsToLog(noLineResultsLog[0], "Línea ID: "+lineID);
              }
            } catch (err) {
              if (noLineResultsLog.length === 0) {
                noLineResultsLog.push(createLog('Hay líneas sin archivo de resultados', LOG_TYPE.ERROR));
              }
              addDetailsToLog(noLineResultsLog[0], "Línea ID: "+lineID);
            }
          })()
        );
      }
  }

  await Promise.all(promises);
}

async function loadHydrologies(){
  console.log("pasando por loadHydrologies");
  
  try {
    const response = await fetch(CONFIG.URL_HYDROLOGIES);
    hydrologyList = await response.json();
    if (hydrologyList.length > 0) {
      chosenHydrology = hydrologyList[0];
      CONFIG.BUSES_FOLDER = CONFIG.BUSES_FOLDER.formatUnicorn({hydrology:chosenHydrology});
      CONFIG.CENTRALS_FOLDER = CONFIG.CENTRALS_FOLDER.formatUnicorn({hydrology:chosenHydrology});
      CONFIG.LINES_FOLDER = CONFIG.LINES_FOLDER.formatUnicorn({hydrology:chosenHydrology});
      CONFIG.RESERVOIRS_FOLDER = CONFIG.RESERVOIRS_FOLDER.formatUnicorn({hydrology:chosenHydrology});
      if(!CONFIG.RESULTS_DISABLED){
        await loadLinesFiles();
      }
      buildDropdownHydrology();
    } else {
      createLog('El archivo de hidrologías no tiene datos.', LOG_TYPE.ERROR);
    }
  } catch (err) {
    createLog('No esta el archivo de hidrologías.', LOG_TYPE.ERROR);
  }
}
// loadHydrologies();

/**
 * Carga el resultado de la línea si es necesario. Guarda en la estructura hydrologyTimes los resultados
 * obtenidos del archivo leído.
 * @param lineID identificador de la línea.
 * @param hydro hidrología del resultado a leer.
 */


/**
 *
 * Se encarga de cargar datos de una barra y ejecutar la acción pedida con los datos cargados.
 *
 * @param busId identificador de la barra
 * @param noLoadAction función que se ejecuta si los datos estan ya cargados en el cache. Debe recibir un json con los resultados de esa barra.
 * @param loadAction función que se ejecuta al cargar correctamente los datos. Debe recibir el xmlhttprequest por parámetro.
 * @param hydro
 *
 */


async function loadBusFile(busId, noLoadAction , hydro) {
  if(typeof hydro === 'undefined') hydro = chosenHydrology;
  console.log("Function: loadBusFile");
  // Verifica si esta la estructura de datos necesaria.
  checkHydrologyTimes(hydro);

  // verifico si los resultado ya fueron cargados.
  if(busId in hydrologyTimes[hydro].buses) {
    // console.log("preload loadbusfile");
    noLoadAction(hydrologyTimes[hydro].buses[busId]);
  } else {
    // cargo los datos que no fueron cargados previamente.
    // console.log("primer callback");
    try {
      
      const response = await fetch(getUrlByHydrology('buses', hydro) + getTypeToFileString('buses') + busId + ".json");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const busData = await response.json();
      // console.log("callback loadbusfile");
      if(!(busId in hydrologyTimes[chosenHydrology]['buses'])) {
        
        hydrologyTimes[chosenHydrology]['buses'][busId] = busData;
      }
      noLoadAction(hydrologyTimes[hydro].buses[busId]);

    } catch (err) {
      createLog('El archivo de resultados de la barra ' + busId + " no existe", LOG_TYPE.ERROR);
    }
  }
}

/**
 *
 * Se encarga de cargar datos de una barra y ejecutar la acción pedida con los datos cargados.
 *
 * @param cenId identificador de la barra
 * @param noLoadAction función que se ejecuta si los datos estan ya cargados en el cache. Debe recibir un json con los resultados de esa barra.
 * @param loadAction función que se ejecuta al cargar correctamente los datos. Debe recibir el xmlhttprequest por parámetro.
 * @param hydro
 *
 */
function loadCenFile(cenId, noLoadAction , loadAction, hydro) {

  if(typeof hydro === 'undefined') hydro = chosenHydrology;

  // Verifica si esta la estructura de datos necesaria.
  checkHydrologyTimes(hydro);

  // verifico si los resultado ya fueron cargados.
  if(cenId in hydrologyTimes[hydro].centrals) {
    console.log("preload loadcenfile");
    noLoadAction(hydrologyTimes[hydro].centrals[cenId]);
  } else {
    // cargo los datos que no fueron cargados previamente.
    console.log("callback loadcenfile");
    let chartReq = new XMLHttpRequest();
    chartReq.onreadystatechange = loadAction(chartReq, hydro,cenId);
    try {
      chartReq.open("GET", getUrlByHydrology('centrals', hydro) + getTypeToFileString('centrals') + cenId + ".json", false);
      chartReq.send();
    } catch (err) {
      createLog('El archivo de resultados de la central ' + cenId + " no existe", LOG_TYPE.ERROR);
    }
  }
}


/**
 *
 * Se encarga de cargar datos de un elemento y ejecutar la acción pedida con los datos cargados.
 *
 * @param elementId id del elemento a cargar
 * @param noLoadAction función que se ejecuta si los datos ya estan cargados, toma como parámetro un json con los datos.
 * @param loadAction función que se ejecuta si los datos no estan cargados, requiere como primer parámetro un XMLHTTPRequest y el segundo la hidrología a cargar.
 * @param hydro hidrología a cargar, en caso de no estar definida se usa la que esta en el momento.
 * @param typeId tipo de dato a cargar ('buses', 'lines', 'centrals', 'reservoirs')
 */
function loadTypeFile(elementId, noLoadAction, loadAction, hydro, typeId,a=2){
  console.log("function: LoadTypeFile");
  if(typeof hydro === 'undefined') hydro = chosenHydrology;
  // Verifica si esta la estructura de datos necesaria.
  checkHydrologyTimes(hydro);
  // verifico si los resultado ya fueron cargados.
  if(elementId in hydrologyTimes[hydro][typeId]) {
    noLoadAction(hydrologyTimes[hydro][typeId][elementId]);
  } 
  else {
    // cargo los datos que no fueron cargados previamente.
    let chartReq = new XMLHttpRequest();
    chartReq.onreadystatechange = loadAction(chartReq, hydro);
    try {
      // Se ejecuta un get pidiendo los datos de un archivo.
      chartReq.open("GET", getUrlByHydrology(typeId, hydro) + getTypeToFileString(typeId) + elementId + ".json", false);
      chartReq.send();
    } catch (err) {
      // Se muestra en pantalla si existió algún tipo de error.
      createLog('El archivo de resultados ' + getTypeToString(typeId) + ' ' + elementId + " no existe", LOG_TYPE.ERROR);
    }
  }
}

/**
 * Construye la estructura si es necesario.
 *
 * Esta estructura nos sirve para guardar en memoria los datos ya cargados,
 * así no tenemos que volver a gastar recursos en descargar archivos.
 */
function checkHydrologyTimes(hydro){

  if (!(hydro in hydrologyTimes)){
    hydrologyTimes[hydro] = {
      lines: {},
      buses: {},
      centrals: {},
      reservoirs: {}
    };
  }
}

