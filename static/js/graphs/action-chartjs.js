"use strict";

// colores sacados de chart.
/**
 *
 * Genera un gráfico Chartjs contra el tiempo, este gráfico se llama al cliquear la opción en una barra de la topología..
 *
 * @param canvas Donde se dibujara el gráfico. HTML object.
 * @param selectedElement
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Abstracción de los datos de etiquetado del gráfico del nodo cliqueado.
 * @param nodeName Nombre del nodo (elemento de grafo) desde el cual se obtendran los dato a graficar. En este caso es una barra.
 */
function generateBusChart(canvas, selectedElement, type, PDTO, nodeName) {  // PDTO === Plotable DataType Object Esta función recibe datos y genera un grafico con ellos en el canvas
  console.log("pasando por generateBusChart")
  // console.log("presentando canvas: ", canvas)
  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;
	let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;
  // console.log("containerID: ",containerID)
	canvas.attr("id","canvas_" + containerID);
  let row = canvas.parent().parent();
  // console.log("row: ",row)
  canvas.attr("id", "row_" + containerID);
  // console.log("presentando canvas: ", canvas)
  let title = "H1"; // Título en negritas del gráfico.
  let newColor = randomColor();
  let bkgCol= newColor; // Color de la línea,
  let bdrCol= newColor; // Color del borde de la línea,
  let lblStrX= PDTO.labelX + " " + PDTO.unitX; // Etiqueta del eje x
  let lblStrY= PDTO.labelY + " " + PDTO.unitY; // Etiqueta del eje y
  let txt = PDTO.title + " en la barra " + nodeName; // Título del dataset correspondiente.

  let result = loadFunctions(canvas, title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, 'bus', 'buses');

  /* se cargan los datos y si existen se crea el gráfico. */
  loadTypeFile(selectedElement, result.pl , result.cb, chosenHydrology, 'buses');
}

/**
 *
 * Genera un gráfico Chartjs de línea, según los parametros entregados.
 * En esta función especificamente se genera el gráfico de los flujos en el tiempo de una línea de transmisión.
 *
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param elementObj Objeto sobre el cual se busca
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Datos asociados con el gráfico
 * @param fromName Nodo de inicio de la línea (referencia)
 * @param toName Nodo final de la línea (referencia)
 * @param hydroNum Numero de la hidrologia desde donde se agregaran datos

 */
function generateFlowLineChart(canvas, elementObj, type, PDTO, fromName, toName, hydroNum) {
  console.log("pasando por generateLineChart")
  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;
  var containerID = 'chart' + elementObj.lineNumber + '-' + xAxis + '-' + yAxis;

  canvas.id = "canvas_" + containerID;
  var row = canvas.parent().parent();
  row.id = "row_" + containerID;

  if( chosenHydrology == null) chosenHydrology = 1;
  var title = "Flujo Linea H" + chosenHydrology;
  var bkgCol = 'rgb(255, 99, 132)';
  var bdrCol = 'rgb(255, 99, 132)';
  var lblStrX = 'Tiempo [bloques]';
  var lblStrY= 'Flujo [MW]';
  var txt='Flujo en la línea ' + fromName + "->" + toName;

  let result = loadFunctions(canvas, title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, elementObj.id, PDTO, 'line', 'lines',elementObj);

  /* se cargan los datos y si existen se crea el gráfico. */
  loadTypeFile(elementObj.lineNumber, result.pl , result.cb, chosenHydrology, 'lines');
}


/**
 * Aquí se crean las dos funciones que se ejecutaran en caso de leer de un archivo o que los datos esten previamente cargados.
 * @param canvas Donde se dibujara el gráfico. HTML object.
 * @param title Título del gráfico
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param bkgCol Color de fondo del gráfico
 * @param bdrCol Color de borde del gráfico
 * @param txt Texto descriptivo del gráfico sirve como subtítulo y entrega detalle de lo graficado
 * @param lblStrX Etiqueta del eje X
 * @param lblStrY Etiqueta del eje Y
 * @param xAxis Llave de los datos del eje X en los datos (diccionario)
 * @param yAxis Llave de los datos del eje Y en los datos (diccionario)
 * @param selectedElement Elemento seleccionado
 * @param PDTO Abstracción de los datos de etiquetado del gráfico
 * @param category categoría del objeto a graficar (barra, linea)
 * @param kind El tipo de elemento a graficar (por ejemplo, buses o lineas)
 * @returns {{cb: callBack, pl: preLoad}}
 */
function loadFunctions(canvas,title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, category, kind,elementO=null){
  console.log("pasando por loadFunctions")

  /* Se cargan los datos de la barra seleccionada. */
  let callBack = function (x) {
    return function() {
      if (x.readyState === 4){
        let busData = JSON.parse(x.responseText);

        if(!(selectedElement in hydrologyTimes[chosenHydrology][kind])) {
          hydrologyTimes[chosenHydrology][kind][selectedElement] = busData;
        }

        setUpData(busData, canvas,title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, category,elementO);
      }
    };
  };

  /* Si los datos estan cargados se ejecuta este método. */
  let preLoad = function (data) {
    setUpData(data, canvas,title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, category,elementO);
  };

  return {cb: callBack, pl: preLoad}
}

/**
 *
 * @param canvas Donde se dibujara el gráfico. HTML object.
 * @param selectedElement Elemento seleccionado.
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Abstracción de los datos de etiquetado en el gráfico generado.
 * @param centralName Nombre del generador
 * @param centralType Tipo de generador
 * @param hydro Número de la hidrología
 */
function generateGenerationChart(canvas, selectedElement, type, PDTO, centralName, centralType, hydro) {
	console.log("pasando por generateGenerationChart");
	console.log("selected element: ",selectedElement);
  console.log("pdto: ",PDTO);
  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;
  let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;

  canvas.id = "canvas_" + containerID;
  let row = canvas.parent().parent();
  row.id = "row_" + containerID;

  if( chosenHydrology == null) chosenHydrology = 1;
  console.log("hidrologia actual: ",chosenHydrology); 
  let title = "H" + chosenHydrology;
  let colorBkg;
  
  switch(centralType) {
	case "Serie":
		colorBkg = CONFIG.COLOR_SERIE;
		break;
	case "Embalse":
		colorBkg = CONFIG.COLOR_EMBALSE;
		break;
	case "Pasada":
		colorBkg = CONFIG.COLOR_PASADA;
		break;
	case "Minihidro":
		colorBkg = CONFIG.COLOR_MINIHIDRO;
		break;
	case "Solar":
		colorBkg = CONFIG.COLOR_SOLAR;
		break;
	case "Eolica":
		colorBkg = CONFIG.COLOR_EOLICA;
		break;
	case "Carbon":
		colorBkg = CONFIG.COLOR_CARBON;
		break;
	case "Diesel":
		colorBkg = CONFIG.COLOR_DIESEL;
		break;
	case "GNL":
		colorBkg = CONFIG.COLOR_GNL;
		break;
	case "Biomasa":
		colorBkg = CONFIG.COLOR_BIOMASA;
		break;
	case "Cogeneracion":
		colorBkg = CONFIG.COLOR_COGENERACION;
		break;
	default:
    colorBkg = randomColor();
  }
  
  
  
  let colorBrd = colorBkg;
  var lblStrX = 'Tiempo [horas]';
  var lblStrY= 'Generación [MW]';
  var txt='Generación en la central: ' + centralName;


  var node = electricNodes.get(selectedElement);
  let result = loadFunctions(canvas, title, type, colorBkg, colorBrd, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, 'central', 'centrals');

  /* se cargan los datos y si existen se crea el gráfico. */
  loadTypeFile(node.centralId, result.pl , result.cb, hydro, 'centrals');
}


/**
 *
 * Este método genera un gŕafico apilado de las generaciones en las centrales de una barra seleccionada.
 *
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param selectedElement Elemento seleccionado (objeto) desde el gráfico
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param xAxis Llave de los valores del eje X desde datos (diccionario).
 * @param yAxis Llave de los valores del eje Y desde datos (diccionario).
 * @param centrals Arreglo de generadores asociados a una barra
 * @param busName Nombre de la barra de la cual se graficaran los datos de generacion de energia
 * @param hydroNum Numero de la hidrologia desde donde se agregaran datos
 */
function generatePiledGraph(canvas, selectedElement, type, PDTO, centrals, busName) {
  console.log("pasando por generatePiledGraph")
  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;
  var containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;

  canvas.id = "canvas_" + containerID;
  var row = canvas.parent().parent();
  row.id = "row_" + containerID;

  var  lblStrX="Tiempo [hora]";
  var  lblStrY="Generación [MW]";
  var centralsData = {};

  var setDeDatos = [];
  var xlabel = [];

  for (var i = 0; i < centrals.length; i++) {
  	try {
      var chartReq = new XMLHttpRequest();
      chartReq.onreadystatechange = createCallback(chartReq, centrals[i].tipo, centralsData, yAxis);
      chartReq.open("GET", CONFIG.CENTRALS_FOLDER +
          "central_" + centrals[i].centralId + ".json", false);
      chartReq.send();
    } catch (e) {
      createLog("El generador " +  centrals[i].centralId + " no tiene archivo de resultados.", LOG_TYPE.ERROR)
		}
	}
    //addDataSets(centralsData);
    addDataSets(centralsData, xAxis, yAxis, setDeDatos, xlabel);
    setUpChart(canvas, xlabel, type, setDeDatos, 'Generación en la barra ' + busName, lblStrX, lblStrY, selectedElement, PDTO);
}


/**
 *
 * Este método genera un gŕafico apilado de las generaciones de todo el sistema.
 *
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Datos asociados con el gráfico
 * @param hydroNum Numero de la hidrologia desde donde se agregaran datos
 */
function generateSystemPiledGraph(canvas, type, PDTO, hydroNum) {
  console.log("pasando por generateSystemPiledGraph en modulo action-chartjs")
  let jsonUrl=CONFIG.PILED_GENERATION_GRAPH_FOLDER+'generation_system_'+hydroNum.toString()+'.json';
  console.log("jsonURL: ",jsonUrl)
  let request = new XMLHttpRequest();
  request.open('GET', jsonUrl, false);
  request.onreadystatechange = function(){
    if (this.readyState === 4){
      let xAxis = PDTO.idX;
      let yAxis = PDTO.idY;
      let containerID = 'chart' + '-Sistema' + '-' + xAxis + '-' + yAxis;
      canvas.id = "canvas_" + containerID;
      let row = canvas.parent().parent();
      row.id = "row_" + containerID;
      let  lblStrX="Tiempo [bloques]";
      let  lblStrY="Generación [MW]";
      let centralsData = JSON.parse(this.responseText);
      let setDeDatos = [];
      let xlabel = [];
      addDataSets(centralsData, xAxis, yAxis, setDeDatos, xlabel);
      setUpChart(canvas, xlabel, type, setDeDatos, 'Generación del sistema', lblStrX, lblStrY, 'Sistema', PDTO,true);
    }
  }
  request.send();

}


/**
 *
 * Genera un gráfico Chartjs de línea, este método genera un gráfico de línea de los niveles de un embalse en los tiempos dados.
 *
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param selectedElement Elemento seleccionado (objeto) desde el gráfico.
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Datos asociados con el gráfico
 * @param reservoirName Nombre de embalse al cual se quiere graficar nivel
 * @param reservoirId ID del embalse
 */
function generateLevelChart(canvas, selectedElement, type, PDTO, reservoirName, reservoirId) {
  console.log("pasando por generateLevelChart")

  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;
  let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;

  canvas.id = "canvas_" + containerID;
  let row = canvas.parent().parent();
  row.id = "row_" + containerID;

  let title = "H" + chosenHydrology;
  let bkgCol = 'rgba(75, 192, 192, 1)';
  let bdrCol = 'rgba(75, 192, 192, 1)';
  let lblStrX="Tiempo [bloques]";
  let lblStrY="Volumen [hm3]";
  let txt = "Cota en el embalse " + reservoirName;

  /* se cargan los datos y si existen se crea el gráfico. */
  var node = hydricNodes.get(selectedElement);

  let result = loadFunctions(canvas, title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY, xAxis, yAxis, selectedElement, PDTO, 'reservoir', 'reservoirs');

  /* se cargan los datos y si existen se crea el gráfico. */
  loadTypeFile(node.reservoirId, result.pl , result.cb, chosenHydrology, 'reservoirs');

}

/**
 *
 * Este método genera un gráfico Chartjs de línea. Genera un gráfico agregado de los flujos que llegan a una barra dada.
 *
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param selectedElement Elemento seleccionado desde
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param xAxis Llave de los valores del eje X desde datos (diccionario).
 * @param yAxis Llave de los valores del eje Y desde datos (diccionario).
 * @param edges Aristas desde la barra hacia los generadores a los que está conectada.
 * @param busName Nombre de la barra de la cula se grafican los flujos.
 * @param busId Identificador de la barra a graficar
 */
function generateFlowBusChart(canvas, selectedElement, type, PDTO, edges, busName, busId) {
  console.log("pasando por generateFlowBusChart")
  let xAxis = PDTO.idX;
  let yAxis = PDTO.idY;

  let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;

  canvas.id = "canvas_" + containerID;
  let row = canvas.parent().parent();
  row.id = "row_" + containerID;

  let title = 'H' + chosenHydrology;
  let bkgCol = 'rgb(255, 99, 132)';
  let bdrCol = 'rgb(255, 99, 132)';
  let lblStrX="Tiempo [bloques]";
  let lblStrY="Flujo [MW]";
  let txt = "Flujos hacia la barra " + busName ;

  setUpData(setUpFlowData(edges, busId, chosenHydrology), canvas, title, type, bkgCol, bdrCol, txt, lblStrX, lblStrY,
    xAxis, yAxis, busId, PDTO, 'bus-flow');

}


/**
 * 
 * @param canvas Elemento HTML donde se dibujara el gráfico. HTML object.
 * @param selectedElement Elemento seleccionado (objeto) desde el gráfico. Se refiere al ID.
 * @param type tipo string que identifica estilo de gráfico (line, pie, etc.)
 * @param PDTO Datos asociados con el gráfico
 * @param {*} elementObject Objeto que contiene información de la barra
 */

function percentilGraph(canvas,selectedElement,type,PDTO,elementObject) {
  console.log("pasando por function percentilll")
  let indhor;
  let requestindhor = new XMLHttpRequest();
  requestindhor.open('GET', CONFIG.URL_INDHOR, false);
  requestindhor.onreadystatechange = function() {
    if (this.readyState === 4){
      console.log("Pasando por indhor");
      indhor = JSON.parse(this.responseText);
      for (var i = 0; i < indhor.length; i++) {
        indhor[i][0] = parseInt(indhor[i][0]);
        indhor[i][1] = parseInt(indhor[i][1]);
      }
    }
  }
  requestindhor.send();
  if (elementObject.category === "bus-to-bus"){
    console.log("Percentil Lineas");
    // console.log("Mostrando objeto",elementObject);
    // console.log("Mostrando ID y numberID: ",elementObject.lineNumber,selectedElement);
    let jsonUrl = CONFIG.PERCENTIL_FLOW_LINE_FOLDER+'line_'+elementObject.lineNumber.toString()+'.json';
    let request = new XMLHttpRequest();
    let xAxis = PDTO.idX;
    let yAxis = PDTO.idY;
    request.open('GET', jsonUrl, false);
    request.onreadystatechange = function() {
        if (this.readyState === 4) {
          // console.log("Se entro al readystate===4")
          let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;
          canvas.attr("id","canvas_" + containerID);
          let title = "Percentil_FL"; // Título en negritas del gráfico.
          let newColor = randomColor();
          let bkgCol= newColor; // Color de la línea,
          let bdrCol= newColor; // Color del borde de la línea,
          let labelStrX= PDTO.labelX + " " + PDTO.unitX; // Etiqueta del eje x
          let labelStrY= PDTO.labelY + " " + PDTO.unitY; // Etiqueta del eje y
          
      
          let perc_data = JSON.parse(this.responseText);
          // console.log("perc_Data: ",perc_data)
          // console.log("perc_Data type: ",typeof perc_data)
          let txt = PDTO.title + " en " + perc_data[0].LinName; // Título del dataset correspondiente.
  
          // Inicia simil con setUpSingleDATA
          let perc0 = [], perc20 = [], perc80 = [], perc100 = [], Min = [], Max =[]
            let time = []
          perc_data.forEach(element => {
            perc0.push(parseFloat(element.perc0.toFixed(1)) ) // toFixed para 1 decimal y parseFloat para volver a pasar de str a float.
            perc20.push(parseFloat(element.perc20.toFixed(1)))
            perc80.push(parseFloat(element.perc80.toFixed(1)))
            perc100.push(parseFloat(element.perc100.toFixed(1)))
            Min.push(parseFloat(element.Min.toFixed(1)))
            Max.push(parseFloat(element.Max.toFixed(1)))
            time.push(element.time)
          });

          // Canvas donde se dibujará el gráfico.
          const ctx = canvas[0].getContext('2d');
          
          let chartData = {
            labels: time,
            datasets: [
              {
                  label: "Perc0",
                  data: perc0,
                  borderColor: 'rgba(33, 33, 33, 1)',
                  backgroundColor: 'rgba(33, 33, 33, 0.3)',
                  pointBackgroundColor: 'rgba(33, 33, 33, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc20",
                  data: perc20,
                  borderColor: 'rgba(255, 0, 0, 1)',
                  backgroundColor: 'rgba(255, 0, 0, 0.3)',
                  pointBackgroundColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc80",
                  data: perc80,
                  borderColor: 'rgba(0, 255, 0, 1)',
                  backgroundColor: 'rgba(0, 255, 0, 0.3)',
                  pointBackgroundColor: 'rgba(0, 255, 0, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc100",
                  data: perc100,
                  borderColor: 'rgba(0, 0, 255, 1)',
                  backgroundColor: 'rgba(0, 0, 255, 0.3)',
                  pointBackgroundColor: 'rgba(0, 0, 255, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                label: "Min",
                data: Min,
                borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0)',
              pointBackgroundColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 0,
           
            },
            {
              label: "Max",
              data: Max,
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0)',
              pointBackgroundColor: 'rgba(255, 0, 0, 1)',
              borderWidth: 1,
              pointRadius: 0,
        
          }
          ]
          };
          
          let config = {
            type: 'line',
            data: chartData,
            options: {
              plugins: {
                title: {
                  display: true,
                  text: txt
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
      
                  callbacks: {
                    beforeTitle: function(tooltipItem){
      
                      return 'Bloque: '+tooltipItem[0].label
                    },
                    title: function(tooltipItem){
                      // console.log("title: ",typeof tooltipItem[0].label)
                      for (var i = 0; i < indhor.length; i++) {
                        if (tooltipItem[0].label >= indhor[i][0] && tooltipItem[0].label <= indhor[i][1]) {
                            return indhor[i][2];
                        }
                    }
                      return "";
                    },
                      label: function(tooltipItem) {
                          var datasetLabel = config.data.datasets[tooltipItem.datasetIndex].label || '';
                          var label = datasetLabel + ': ' + tooltipItem.formattedValue;
                          return label;
                      }
                  },
                },
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true
                    },
                    // drag: {
                    //   enabled: true
                    // },
                    mode: 'xy',
                  }
                }
      
              },
              hover: {
                mode: 'index',
                intersect: false
              },
              elements: {
                point: {
                  radius: 0
                }
              },
              scales: {
                y: {
                  ticks: {
                    beginAtZero: true
                  },
                  title: {
                    display: true,
                    text: labelStrY
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: labelStrX
                  },
                  ticks: {
                    beginAtZero: true,
                    callback: function(index) {
                      for (var i = 0; i < indhor.length; i++) {
                          if (index >= indhor[i][0] && index <= indhor[i][1]) {
                              return indhor[i][2];
                          }
                      }
                      return "";
                  }
                  }
                }
              },
              responsive: true

            }
        };

        let myChart = new Chart(ctx, config);
        console.log("viendo mychart: ",myChart);
        // Se corrige la responsiveness de los gráficos
        $(window).resize(function() {
          myChart.resize();
        });

        // Se agregan eventos con respecto al grafico creado.
        addGraphEvents(myChart, PDTO, selectedElement);

          }
      }
      request.send();
    }
  else if (elementObject.category === "bus"){
    console.log("Percentil bus")
    // console.log("Mostrando objeto",elementObject);
    // console.log("Mostrando ID y numberID: ",elementObject.lineNumber,selectedElement);
    let jsonUrl=CONFIG.PERCENTIL_MARGINAL_COST_FOLDER+'bus_'+selectedElement.toString()+'.json';
    console.log("jsonURL: ",jsonUrl)
    let request = new XMLHttpRequest();
    let xAxis = PDTO.idX;
    let yAxis = PDTO.idY;
    request.open('GET', jsonUrl, false);
    request.onreadystatechange = function() {
        if (this.readyState === 4) {
          // console.log("Se entro al readystate===4")
          let containerID = 'chart' + selectedElement + '-' + xAxis + '-' + yAxis;
          canvas.attr("id","canvas_" + containerID);
          
          let title = "Percentil_MC"; // Título en negritas del gráfico.
          let newColor = randomColor();
          let bkgCol= newColor; // Color de la línea,
          let bdrCol= newColor; // Color del borde de la línea,
          let labelStrX= PDTO.labelX + " " + PDTO.unitX; // Etiqueta del eje x
          let labelStrY= PDTO.labelY + " " + PDTO.unitY; // Etiqueta del eje y
          let txt = PDTO.title + " en la barra " + elementObject.nodeName; // Título del dataset correspondiente.
          let perc_data = JSON.parse(this.responseText);
          // console.log("perc_Data: ",perc_data)
          // console.log("perc_Data type: ",typeof perc_data)
          // Inicia simil con setUpSingleDATA
          let perc0 = [], perc20 = [], perc80 = [], perc100 = [], promedio = []
            let time = []
          perc_data.forEach(element => {
            perc0.push(parseFloat(element.perc0.toFixed(1)) ) // toFixed para 1 decimal y parseFloat para volver a pasar de str a float.
            perc20.push(parseFloat(element.perc20.toFixed(1)))
            perc80.push(parseFloat(element.perc80.toFixed(1)))
            perc100.push(parseFloat(element.perc100.toFixed(1)))
            promedio.push(parseFloat(element.promedio.toFixed(1)))
            time.push(element.time)
          });

          // Canvas donde se dibujará el gráfico.
          const ctx = canvas[0].getContext('2d');
          
          let chartData = {
            labels: time,
            datasets: [
              {
                  label: "Perc0",
                  data: perc0,
                  borderColor: 'rgba(33, 33, 33, 1)',
                  backgroundColor: 'rgba(33, 33, 33, 0.3)',
                  pointBackgroundColor: 'rgba(33, 33, 33, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc20",
                  data: perc20,
                  borderColor: 'rgba(255, 0, 0, 1)',
                  backgroundColor: 'rgba(255, 0, 0, 0.3)',
                  pointBackgroundColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc80",
                  data: perc80,
                  borderColor: 'rgba(0, 255, 0, 1)',
                  backgroundColor: 'rgba(0, 255, 0, 0.3)',
                  pointBackgroundColor: 'rgba(0, 255, 0, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Perc100",
                  data: perc100,
                  borderColor: 'rgba(0, 0, 255, 1)',
                  backgroundColor: 'rgba(0, 0, 255, 0.3)',
                  pointBackgroundColor: 'rgba(0, 0, 255, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              },
              {
                  label: "Promedio",
                  data: promedio,
                  borderColor: 'rgba(255, 193, 7, 1)',
                  backgroundColor: 'rgba(255, 193, 7, 0.3)',
                  pointBackgroundColor: 'rgba(255, 193, 7, 1)',
                  borderWidth: 1,
                  pointRadius: 0,
                  fill: false
              }
          ]
          };
          
          let config = {
            type: 'line',
            data: chartData,
            options: {
              plugins: {
                title: {
                  display: true,
                  text: txt
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,

                  callbacks: {
                    beforeTitle: function(tooltipItem){

                      return 'Bloque: '+tooltipItem[0].label
                    },
                    title: function(tooltipItem){
                      // console.log("title: ",typeof tooltipItem[0].label)
                      for (var i = 0; i < indhor.length; i++) {
                        if (tooltipItem[0].label >= indhor[i][0] && tooltipItem[0].label <= indhor[i][1]) {
                            return indhor[i][2];
                        }
                    }
                      return "";
                    },
                      label: function(tooltipItem) {
                          var datasetLabel = config.data.datasets[tooltipItem.datasetIndex].label || '';
                          var label = datasetLabel + ': ' + tooltipItem.formattedValue;
                          return label;
                      }
                  },
                },
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true
                    },
                    // drag: {
                    //   enabled: true
                    // },
                    mode: 'xy',
                  }
                }

              },
              
              hover: {
                mode: 'index',
                intersect: false
              },
              elements: {
                point: {
                  radius: 0
                }
              },
              scales: {
                y: {
                  ticks: {
                    beginAtZero: true
                  },

                  title: {
                    display: true,
                    text: labelStrY
                  },
                },
                x: {

                  title: {
                    display: true,
                    text: labelStrX
                  },
                  ticks: {
                    beginAtZero: true,
                    callback: function(index) {
                      for (var i = 0; i < indhor.length; i++) {
                          if (index >= indhor[i][0] && index <= indhor[i][1]) {
                              return indhor[i][2];
                          }
                      }
                      return "";
                  }
                  }
                }
              },
              responsive: true

            }
        };
        let myChart = new Chart(ctx, config);
        console.log("viendo mychart: ",myChart);
        // Se corrige la responsiveness de los gráficos
        $(window).resize(function() {
          myChart.resize();
        });

        // Se agregan eventos con respecto al grafico creado.
        addGraphEvents(myChart, PDTO, selectedElement);

          }
      }
      request.send();
    }
  }

/**
 * Setea los datos necesarios para que se grafiquen los flujos hacia una barra dada una hidrología.
 * @param edges aristas del grafo actual
 * @param busId identificador del bus
 * @param currentHydrology  hidrología de donde se obtendrán los datos.
 * @returns {Array} arreglo con el dataset
 */
function setUpFlowData(edges, busId, currentHydrology){
 console.log("pasando por setUpFlowData")
  let flowData = [];
  busId = parseInt(busId);

  let lines = edges.get({
    filter: function (item) {
      return ((item.to === busId || item.from === busId) && item.category === 'bus-to-bus');
    }
  });

  function lineTimeCallback(x, id) {
    return function() {
      if (x.readyState === 4){
        hydrologyTimes[currentHydrology].lines[id] = JSON.parse(x.responseText);
      }
    };
  }


  for (let i = 0; i < lines.length; i++) {
    checkHydrologyTimes(currentHydrology);
    if(!(lines[i].lineNumber in hydrologyTimes[currentHydrology].lines)) {
      try {
        let chartReq = new XMLHttpRequest();
        chartReq.onreadystatechange = lineTimeCallback(chartReq, lines[i].lineNumber);
        chartReq.open("GET", CONFIG.LINES_FOLDER + "line_" + lines[i].lineNumber + ".json", false);
        chartReq.send();
      } catch (e) {
        console.log("La línea: " + lines[i].lineNumber + " no tiene archivo de resultados.")
      }
    }

    let currentFlowData = hydrologyTimes[currentHydrology].lines[lines[i].lineNumber];

    if (flowData.length <= 0) {
      // console.log(currentFlowData);
      for (let j = 0; j < currentFlowData.length; j++){
        flowData[j] = {time: j + 1, flow: currentFlowData[j].flow};
      }
    } else {
      for (let j = 0; j < currentFlowData.length; j++){
        flowData[j].flow += currentFlowData[j].flow; // Flujo agregado.
      }
    }

    // console.log(flowData[0].flow);
  }

  return flowData;
}


/**
 * Crea el canvas de dibujo de los gráficos
 * @param elementID identificador del elemento de la topología que se quiere graficar
 * @param PDTO objeto que representa los tipos de dato graficables
 * @returns {DOM} canvas HTML para dibujar el gráfico
 */
function createCanvas(elementID, PDTO) { // PDTO === Plotable DataType Object
	// Esta función crea un nuevo div row para poner el nuevo gráfico y lo inserta en la pantalla
	// Retorna el canvas

	let charts = $('#charts');
	

  let chartRowDiv = $('<div>');

  let chartGraphDiv = $('<div>');

  let chartCanvas = $('<canvas>')
                       .addClass("mychart");

  chartGraphDiv.append(chartCanvas);
  chartRowDiv.append(chartGraphDiv);
  createChartMenu(chartRowDiv, elementID, PDTO);

  charts.prepend(chartRowDiv);

  return chartCanvas;

}

/**
 * Crea menu de cada grafico (boton de eliminacion, exportacion en PNG..)
 * @param row Fila en elemento HTML donde se ubicara el grafico generado
 * @param elementID ID del elemento a graficar
 * @param PDTO Abstracción de los datos de etiquetado del gráfico
 */
function createChartMenu(row, elementID, PDTO) {
  var chartMenu = $('<div>').addClass("chart-menu");

  let tsel = $('<div>')
              .addClass("time-select");
  chartMenu.append(tsel);
  
  /*Start selector*/
  let tsel_start = $('<select>')
                    .attr("data-placeholder", "Tiempo inicial")
                    .addClass("chosen")
                    .addClass("hydro-select")
                    .attr("width","50%")
                    .attr("id", (PDTO.print()).replace(/ /gi,"-").normalize() + "-" + elementID + "-start");
  tsel.append(tsel_start);

  /*End selector*/
  let tsel_end = $('<select>')
                  .attr("data-placeholder", "Tiempo final")
                  .addClass("chosen")
                    .addClass("hydro-select")
                  .attr("width","50%")
                  .attr("id", (PDTO.print()).replace(/ /gi,"-").normalize() + "-" + elementID + "-end");
  tsel.append(tsel_end);

  // Selector de hidrología
  let hsel = $('<select>')
              .attr("data-placeholder", "Hidrologías")
              .attr("multiple", true)
              .addClass("chosen")
              .addClass("hydro-select")
              .attr("tabindex", "4")
              .attr("id", (PDTO.print()).replace(/ /gi,"-").normalize() + "-" + elementID);

  var opt = $('<option>');
  opt.val("");
  hsel.append(opt);

  for (var i = 0; i < hydrologyList.length; i++) {
    var opt = $('<option>').attr("value", hydrologyList[i]);
    if(hydrologyList[i] === chosenHydrology)
      opt.attr("selected", true);
    opt.html(hydrologyList[i]);
    hsel.append(opt);
  }
  chartMenu.append(hsel);

  hsel.chosen({ disable_search_threshold: 10, width: "25%"});

  //Botones
  var buttons = $('<span>');
  chartMenu.append(buttons);

  // Boton de exportar csv
  var csv = $('<a>')
            .addClass("chartmenu-button")
            .addClass("exp-button")
            .attr("style", "cursor: pointer;")
            .attr("id", (PDTO.print()).replace(/ /gi,"-").normalize() + "-" + elementID + "-csv");

  var csv_img = $('<img>')
                .attr("src", "resources/chart/menu/export-csv.svg")
                .attr("height", 14)
                .attr("width", 14);
  csv.append(csv_img);
  buttons.append(csv);
  
   // Boton de exportar grafico
  var exp = $('<a>')
            .addClass("chartmenu-button")
            .addClass("exp-button")
            .attr("style", "cursor: pointer;")
            .attr("download", "chart.png");
  exp.click(function() {
  	let containerID = row.id.substring(4);
    let mycanvas = document.getElementById('canvas_' + containerID);
    let url = mycanvas.toDataURL();
    this.attr(href,url);
  });
  var exp_img = $('<img>')
                .attr("src", "resources/chart/menu/export.svg")
                .attr("height", 14)
                .attr("width", 14);
  exp.append(exp_img);
  buttons.append(exp);

  // Boton de arrastrar grafico
  var move = $('<span>').append(
              $('<img>').addClass("chartmenu-button") 
              .attr("src", "resources/chart/menu/move.svg")
              .attr("height", 14)
              .attr("width", 14))
            .addClass("move-button");
  buttons.append(move);

  // Boton de eliminar grafico
  var quit = $('<img>') 
            .addClass("chartmenu-button")
            .addClass("quit-button")
            .attr("src", "resources/chart/menu/remove.svg")
            .attr("height", 14)
            .attr("width", 14);
  quit.click(function(){
    let row = quit.parent().parent().parent();
    row.remove();
  });
  buttons.append(quit);

  row.prepend(chartMenu);
}


/**
 * Esto es para la biblioteca Chartjs no dibuje fuera de los ejes.
 */
console.log("Viendo version: ",Chart.version);
// Chart.plugins.register({
//   beforeDatasetsDraw: function(chartInstance) {
//     var ctx = chartInstance.chart.ctx;
//     var chartArea = chartInstance.chartArea;
//     ctx.save();
//     ctx.beginPath();

//     ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
//     ctx.clip();
//   },
//   afterDatasetsDraw: function(chartInstance) {
//     chartInstance.chart.ctx.restore();
//   },
// });



/**
 * Genera gráfico apilado de generación del sistema.
 */
function showSystemStackedChart(){
  console.log("function: showSystemStackedChart");
  const pdto = new PlotableDataType(
    "Generación de la barra",
    "Tiempo",
    "Generación",
    "[hora]",
    "[MW]",
    "time",
    "CenPgen"
  );

  let mycanvas = createCanvas('Sistema', pdto);
  generateSystemPiledGraph(mycanvas, 'line', pdto, chosenHydrology);

}

/**
 * Cambia el numero de columnas donde se visualizan los gráficos con tal de aumentar la cantidad de estos
 * en la ventana de programa.
 */
function changeChartNumberOfColumns() {
    let charts = $("#charts");
    let select = $("#chart-column-number");
    let value = select.val();
    console.log(charts.attr("class"));
    for (var i = 1; i <= 3; i++) {
        charts.removeClass("columns-" + i);
    }
    
    charts.addClass("columns-" + value);
    
    $(window).trigger('resize');

}

$(() => {
  // selecciona el elemento HTML con un id de "charts" y lo asigna a una variable llamada "charts".
  var charts = $("#charts")
  // Hace editable la lista de graficos
  var SortableList = charts.sortable( {
    handle: '.move-button'
  });
  console.log("Sortabled");
})

jQuery("#chart-column-number").chosen({ disable_search_threshold: 10, width: "100%" });

logTime("action-chartjs.js");
