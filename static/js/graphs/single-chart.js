"use strict";

/**
 * Selecciona color aleatoriamente para gráficos
 * @param seed Valor inicial con el que se ejecuta la aleatorización
 * @returns {string} Configuración de arreglo RGB codificado como string
 */
function randomColor(seed = null) {
  console.log("pasando por randomColor")
  if (seed === null) seed = Math.floor(Math.random()*3);
  var rgb = [];
  rgb[seed%3] = Math.floor(Math.random()*255);
  rgb[(seed+1)%3] = Math.floor(Math.random()*255);
  rgb[(seed+2)%3] = 0;

  return 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] +','+'1'+ ')';
}

/**
 * Actualiza rango de valores en el eje x
 * @param myChart Objeto que representa la configuración de un gráfico
 * @param start Valor inicial del rango de x
 * @param end Valor final del rango de x
 */
function chartUpdateXAxis(myChart, start, end) {
  console.log("Pasando por ChartUpdateXAxis")
  // Se obtienen los valores que contienen los selects.
  let start_val = parseInt(start.find(":selected").val());
  let end_val = parseInt(end.find(":selected").val());

  // Se revisa si el tiempo final es mayor al inicial.
  if (end_val <= start_val) {
    start.parent().addClass('wrong-interval');
    return;
  }

  start.parent().removeClass('wrong-interval');
  if (!myChart.config.options.scales.y.stacked) {

    const data = myChart.config.data.datasets;
    let min_y = 0, max_y = 0;

    for (let i = 0; i < data.length; i++) {
      for (let j = start_val - 1; j < end_val; j++) {
        let val = data[i].data[j];
        min_y = min_y > val ? val : min_y;
        max_y = max_y < val ? val : max_y;
      }
    }

  // Se guarda en cada uno de los ejes el cambio de eje.
  myChart.config.options.scales.y.min = min_y*1.05;
  myChart.config.options.scales.y.max = max_y*1.05;
}

// Se guarda en cada uno de los ejes el cambio de eje.
myChart.config.options.scales.x.min = start_val;
myChart.config.options.scales.x.max = end_val;

// Se actualiza el gráfico.
myChart.update();
}

/**
 * Aquí se setean todos los eventos con respecto a algún cambio en el gráfico Chartjs (Cambios en el zoom)
 * @param myChart Objeto chart de Chartjs, gráfico al que se agregarán eventos.
 * @param PDTO Objeto con los elementos del gráfico
 * @param selectedElement identificador del objeto del que se esta sacando información (barra, línea, etc.; es un número.)
 */
function addGraphEvents(myChart, PDTO, selectedElement) {
	console.log("pasando addGraphEvents")
	let csvButton = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" + selectedElement + "-csv");
  
	  csvButton.click( () => {	  

		let dataObj = myChart.config.data; 
		let header = ["Tiempo"];
		for (let i = 0; i < dataObj.datasets.length; i++) {
			header.push(dataObj.datasets[i].label);
		}
		
		
		let data = [];
		for (let i = 0; i < dataObj.labels.length; i++) {
			data.push([dataObj.labels[i]]);
		}
		
		for (let i = 0; i < dataObj.datasets.length; i++) {
			for (let j = 0; j < dataObj.labels.length; j++) {
				data[j].push([dataObj.datasets[i].data[j]]);
			}
		}
		data = data.map(x => x.join(','));
		
		let csvString = header.join(',') + '\n' + data.join('\n');	
		
		// _Hackerman_
		var a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(new Blob([csvString], {type: 'text/csv'}));
		a.download = 'chart.csv';

		// Append anchor to body.
		document.body.appendChild(a);
		a.click();

		// Remove anchor from body
		document.body.removeChild(a);
	  });

  // Objeto HTML que contiene el tiempo inicial.
  let start = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
    selectedElement+ "-start");
  // Objeto HTML que contiene el tiempo final. Se agregarán eventos para que se actualicen los tiempos.
  let end = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
    selectedElement+ "-end");

    /**
     * Agrega valores y etiquetas (correspondiente a los valores de estos) al eje x
     * @param start Valor inicial del rango de eje x
     * @param end Valor final del ranfo de eje X
     * @param myChart Objeto que representa la configuración de un gráfico
     */
  function addElementsToChoseChart(start, end, myChart) {

    // tomamos los valores existentes en el eje X
    const xAxis = myChart.config.data.labels;

    // Iteramos agregando al select todos los elementos existentes.
    for (let i = 0; i < xAxis.length; i++){
      start.append($('<option>', {
        value: xAxis[i],
        text: xAxis[i]
      }));
      end.append($('<option>', {
        value: xAxis[i],
        text: xAxis[i],
        selected: xAxis.length === i + 1
      }));
    }

  }

  // Se agregan elementos al selector
  addElementsToChoseChart(start, end, myChart);
  start.val($("#start_time").val());
  end.val($("#end_time").val());
  chartUpdateXAxis(myChart, start, end);
  // Se configura el responsiveness
  start.chosen({ disable_search_threshold: 10, width: "33%"});
  end.chosen({ disable_search_threshold: 10, width: "33%"});


  // Se agrega el evento para el start select
  start.on('change',function () {
    chartUpdateXAxis(myChart, start, end);
  });

  // Se agrega el evento para el end select
  end.on('change',function () {
   chartUpdateXAxis(myChart, start, end);
  });
}

/**
 * Configura gráficos de un sólo elemento
 * @param data Datos de entrada para el dibujo dle gráfico
 * @param canvas Elemento HTML sobre el cual se dibuja gráfico
 * @param title Título del gráfico
 * @param type tipo de gráfico (barra, línea, etc)
 * @param bkgCol Color de fondo del gráfico
 * @param brdCol Color de borde
 * @param txt Texto usado como subtítulo del gráfico (especificación del elemento graficado)
 * @param labelStrX  Etiqueta descriptiva de valores correspondientes al eje X
 * @param labelStrY Etiqueta descriptiva de valores correspondientes al eje Y
 * @param xAxis Llave de valor del eje x en diccionario (JSON) data
 * @param yAxis Llave de valor del eje y en diccionario (JSON) data
 * @param selectedElement ID del elemento seleccionado
 * @param PDTO Objeto de abstracción de elementos del gráfico.
 * @returns {{chart: *, config: {type: *, data: {labels: Array,
 * datasets: [null]}, options: {title: {display: boolean, text: *},
 * tooltips: {mode: string, intersect: boolean},
 * hover: {mode: string, intersect: boolean},
 * elements: {point: {radius: number}},
 * scales: {yAxes: [null], xAxes: [null]},
 * responsive: boolean}}}}
 */
function setUpSingleData(data,canvas, title, type, bkgCol, brdCol, txt,
                         labelStrX, labelStrY, xAxis, yAxis, selectedElement, PDTO,elementO=null) {
  console.log("pasando por SetUpSingleData")
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
// console.log("indhor: ",indhor);
  if(elementO===null ) {

    let xlabel = [];
    let ylabel = [];
    
    // Genera título en caso de no tener
    if(chosenHydrology == null) chosenHydrology = 1; 
    if (title == null)
      title = "H" + chosenHydrology;
    
    
    // Guardamos los datos en nuevos arreglos.
    for (let i = 0; i < data.length; i++) {
  
      let xAxisData = data[i][xAxis];
      let yAxisData = data[i][yAxis];
      
      xlabel.push(xAxisData);
      ylabel.push(yAxisData);
    }
  
    // Canvas donde se dibujará el gráfico.
    const ctx = canvas[0].getContext('2d');
  
    // Configuraciones del gráfico.
    let config = {
      type: type, // Charts de tipo 'line' solo usan un color
      data: {
        labels: xlabel,
        datasets: [{
          label: title,
          data: ylabel,
          borderWidth: 2,
          lineTension: 0,
          fill: false,
          backgroundColor: bkgCol,//fillcolor,
          borderColor: brdCol//linecolor,
        }
        ]
      },
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
            }
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
  
    // Se genera el gráfico ChartJS.
    console.log(ctx);
    console.log(config);
    let myChart = new Chart(ctx, config);
    console.log(myChart);
    
    // Se corrige la responsiveness de los gráficos
    $(window).resize(function() {
      myChart.resize();
    });
    // console.log("configsss: ",config.data.datasets, typeof config.data.datasets, config.data.datasets.length)
    
    // Se agregan eventos con respecto al grafico creado.
    addGraphEvents(myChart, PDTO, selectedElement);
  
    return {chart: myChart, config: config}
    }                        
  else if (elementO.category === "bus-to-bus"){
    console.log("Entrando al edit lineas")
    let xlabel = [];
    let flujo = [];
    let maximoflujo=[];
    let maxcolor=randomColor();
    let minimoflujo=[];
    let mincolor=randomColor();
    
    // Genera título en caso de no tener
    if(chosenHydrology == null) chosenHydrology = 1; 
    if (title == null)
      title = "H" + chosenHydrology;
    
    
    // Guardamos los datos en nuevos arreglos.
    for (let i = 0; i < data.length; i++) {
  
      let xAxisData = data[i][xAxis];
      xlabel.push(xAxisData);
      flujo.push( data[i][yAxis]);
      maximoflujo.push(data[i].capacity)
      minimoflujo.push(-data[i].capacity)
    }
  
    // Canvas donde se dibujará el gráfico.
    const ctx = canvas[0].getContext('2d');
    let chartData={
      labels: xlabel,
      datasets: [{
        label: title,
        data: flujo,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        backgroundColor: bkgCol,//fillcolor,
        borderColor: brdCol//linecolor,
      },
      {
        label: "Capacidad Máxima",
        data: maximoflujo,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        backgroundColor: maxcolor,//fillcolor,
        borderColor: maxcolor//linecolor,
      },
      {
        label: "Capacidad Minima",
        data: minimoflujo,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        backgroundColor: mincolor,//fillcolor,
        borderColor: mincolor//linecolor,
      }

      ]
    }
    // Configuraciones del gráfico.
    let config = {
      type: type, // Charts de tipo 'line' solo usan un color
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
  
    // Se genera el gráfico ChartJS.
    let myChart = new Chart(ctx, config);
    
    // Se corrige la responsiveness de los gráficos
    $(window).resize(function() {
      myChart.resize();
    });
    // console.log("configsss: ",config.data.datasets)
    // Se agregan eventos con respecto al grafico creado.
    addGraphEvents(myChart, PDTO, selectedElement);
  
    return {chart: myChart, config: config}

  }
  else{
    console.log("No existe elementO.category para este caso")
  }

  
}

/**
 *
 * Se generan las configuraciones necesarias para poder graficar distintas hidrologías.
 *
 * @param data Datos que serán graficados.
 * @param canvas Donde se dibujara el gráfico. HTML object.
 * @param title Título del gráfico.
 * @param type tipo de gráfico que se dibujará (solo línea usa este método)
 * @param bkgCol color de relleno de las líneas
 * @param brdCol color de borde de las líneas
 * @param txt label del primer gráfico.
 * @param labelStrX label del ejeX
 * @param labelStrY label del eje Y
 * @param xAxis llave asociada al dato en el ejeX (por ejemplo 'time')
 * @param yAxis llave asociada al dato en el ejeY (por ejemplo 'flow')
 * @param selectedElement Id del nodo o arista asociada al gráfico
 * @param PDTO Datos asociados con el gráfico
 * @param category tipo de dato ('bus', 'line', etc.)
 */
function setUpData(data,canvas, title, type, bkgCol, brdCol, txt, labelStrX, labelStrY, xAxis, yAxis, selectedElement, PDTO, category,elementO=null) {
  console.log("pasando por modulo single-chart funcion setUpData")
  let result = setUpSingleData(data, canvas, title, type, bkgCol, brdCol, txt, labelStrX, labelStrY, xAxis, yAxis, selectedElement, PDTO,elementO);
  let hydrolist = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" + selectedElement);
  

  // Recibe un titulo y un color, y genera un set de datos vacíos con esas opciones.
  function getDashedDataSet(title, randomColor2) {
    return {
      label: title,
      backgroundColor: randomColor2,
      borderColor: randomColor2,
      //borderDash: [5, 5], // Líneas punteadas.
      hidden: true, // parte oculto.
      data:[],
      fill: false
    };
  }

  // Evaluar en qué casos nos interesa mostrar o no mostrar una cota
  // if (yAxis === 'marginal_cost'){

  // } else if (yAxis === 'flow' && category === 'line') {
  //   const edge = currentEdges.get(selectedElement);
  //   // Creamos el set de datos
  //   let dataSetMax = getDashedDataSet('Máximo flujo', randomColor());
  //   let dataSetMin = getDashedDataSet('Mínimo flujo', randomColor());
  //   // Y dejamos como flujo máximo el tope de los datos.
  //   console.log("Ahora, veamos type de edge.max_flow_positive: ", edge.max_flow_positive)
  //   updateChart(getConstantData(data, edge.max_flow_positive, 'max_flow_positive'), dataSetMax, 'max_flow_positive');
  //   updateChart(getConstantData(data, edge.max_flow_negative, 'max_flow_negative'), dataSetMin, 'max_flow_negative');
  // }

  /**
   * Entrega un set de datos de largo igual al arreglo data entregado, y rellena en el lugar name con valores constant.
   * @param data arreglo para saber el largo.
   * @param constant constante que se usa para llenar los lugares
   * @param name Parámetro a rellenar
   */
  function getConstantData(data, constant, name){
    let fixedData = [];
    for (let i = 0; i < data.length; ++i) {
      fixedData[i] = {};
      fixedData[i][name] = constant;
    }
    return fixedData;
  }

  /**
   * Actualiza el gráfico actual con el nuevo set de datos entregado.
   * @param data Los datos a graficar
   * @param newDataset características del dataset.
   * @param yAxis eje y que se toman los datos
   */
  function updateChart(data, newDataset, yAxis){
    console.log("pasando por updateChart");
    for (let i = 0; i < data.length; ++i) {
      newDataset.data.push(data[i][yAxis]);
    }
    console.log("result.blabla. datasets: ",result.config.data.datasets);
    console.log("newdataset: ",newDataset);
    console.log("viendo dataset config: ",result.config.data.datasets)
    result.config.data.datasets.push(newDataset);
    result.chart.update();

  }

    /**
     * Configura gráfico de acuerdo a tipo.
     * @param params Parámetros de configuración
     * @param selectedElement Elemento seleccionado desde donde se extraeran datos.
     * @param newDataset
     * @param result
     * @param yAxis
     * @param typeId id del tipo de elemento seleccionado del grafo
     */

  function chartType(params, selectedElement, newDataset, result, yAxis, typeId) {
    console.log("pasando por chartType")
    /* Se cargan los datos de la barra seleccionada. */
    let callBack = function (x, hydrology) {
      return function() {
        if (x.readyState === 4){
          let data = JSON.parse(x.responseText);

          if(!(selectedElement in hydrologyTimes[hydrology][typeId])) {
            hydrologyTimes[hydrology][typeId][selectedElement] = data;
          }

          updateChart(data, newDataset, yAxis);
        }
      };
    };

    /* Si los datos estan cargados se ejecuta este método. */
    let preLoad = function (data) {
      // Cada dataset del gráfico a dibujar se agrega aquí
      updateChart(data, newDataset, yAxis);
    };

    /* se cargan los datos y si existen se crea el gráfico. */
    loadTypeFile(selectedElement, preLoad , callBack, parseInt(params.selected), typeId);
  }


  hydrolist.on('change', function (evt, params) {
    // En caso de que deseleccionen una opción, quiten hidrología del select.
    if (typeof params.deselected !== 'undefined'){
      let datasets = result.config.data.datasets;
      let index = 0;
      let selectedLabel = 'H' + params.deselected;

      // Aquí se busca en que índice esta el dataset dentro del arreglo de datos.
      for(let i = 0; i < datasets.length; i++){
        if(selectedLabel === datasets[i].label) {
          index = i;
          break;
        }
      }
      // Con esto se elimina el dataset del indice = index.
      if (category === 'line'){
        console.log("index datasetes")
        result.config.data.datasets.splice(index, 1);
        result.chart.update();
      }
      else {
        result.config.data.datasets.splice(index, 1);
        result.chart.update();
      }
      
      // Objeto HTML que contiene el tiempo inicial.
      let start = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
        selectedElement+ "-start");
      // Objeto HTML que contiene el tiempo final. Se agregarán eventos para que se actualicen los tiempos.
      let end = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
        selectedElement+ "-end");
      chartUpdateXAxis(result.chart, start, end);
    }

    if (typeof params.selected !== 'undefined'){
      // Guardo un color para el nuevo gráfico.
      let aColor = randomColor(params.selected);
      // Creo el dataset a agregar.
      let newDataset = {
        label: 'H' +  params.selected,
        backgroundColor: aColor,
        borderColor: aColor,
        lineTension: 0,
        data: [],
        fill: false
      };

      // Ahora veo que tipo de gráfico se agrega, aquí tener cuidado con el segundo parámetro, depende del id del archivo.
      if (category === 'bus'){
        chartType(params, selectedElement, newDataset, result, yAxis, 'buses');
      } else if (category === 'line'){
        console.log("Entrando a Linea setUpData")
        let edge = currentEdges.get(selectedElement); // Para obtener id de la arista.
        chartType(params, edge.lineNumber, newDataset, result, yAxis, 'lines');
      } else if (category === 'reservoir'){
        let node = hydricNodes.get(selectedElement); // Para obtener id del embalse
        chartType(params, node.reservoirId, newDataset, result, yAxis, 'reservoirs');
      } else if (category === 'central'){
        let node = electricNodes.get(selectedElement); // Para obtener id de la central.
        chartType(params, node.centralId, newDataset, result, yAxis, 'centrals');
      } else if (category === 'bus-flow'){
        updateChart(setUpFlowData(currentEdges, selectedElement, parseInt(params.selected)), newDataset, yAxis);
      }

      // Objeto HTML que contiene el tiempo inicial.
      let start = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
        selectedElement+ "-start");
      // Objeto HTML que contiene el tiempo final. Se agregarán eventos para que se actualicen los tiempos.
      let end = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" +
        selectedElement+ "-end");
      chartUpdateXAxis(result.chart, start, end);

    }
  });


}

