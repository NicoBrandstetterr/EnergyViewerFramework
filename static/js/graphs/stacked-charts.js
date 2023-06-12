"use strict";

/**
 * Configura gráfico apilado
 * @param canvas Objeto HTML donde se dibuja gráfico
 * @param xlabel Llave para obtener valores asociados a puntos en eje  X desde dataset.
 * @param type Tipo de gráfico
 * @param dataset Datos como diccionario de donde se obtienen valores a graficar
 * @param chartName Nombre de gráfico
 * @param lblStrX Etiqueta de nombre de eje X
 * @param lblStrY Etiqueta de nombre de eje Y
 * @param selectedElement Elemento seleccionado del cual se genera este gráfico apilado
 * @param PDTO Estructura de datos abstracta que representa
 */
function setUpChart(canvas, xlabel, type, dataset, chartName, lblStrX, lblStrY, selectedElement, PDTO,stacked=false) {
    console.log("Function: SetUpChart")
    const ctx = canvas[0].getContext('2d');
    let indhor;
    let requestindhor = new XMLHttpRequest();
    requestindhor.open('GET', CONFIG.URL_INDHOR, false);
    requestindhor.onreadystatechange = function() {
        if (this.readyState === 4){
            // console.log("Pasando por indhor");
            indhor = JSON.parse(this.responseText);
            for (var i = 0; i < indhor.length; i++) {
                indhor[i][0] = parseInt(indhor[i][0]);
                indhor[i][1] = parseInt(indhor[i][1]);
            }
        }
    }
requestindhor.send();
// console.log("indhor: ",indhor);
    let config = {
        type: type, // Charts de tipo 'line' solo usan un color
        data: {
            labels: xlabel,
            datasets: dataset
        },
        options: {
            plugins: {
                title: {
                  display: true,
                  text: chartName
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
                    text: lblStrY
                  },
                  ...(stacked && { stacked: true })
                },
                x: {
                  title: {
                    display: true,
                    text: lblStrX
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
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5
          }
    };

  let myChart = new Chart(ctx, config);
  let hydrolist = $("#" + (PDTO.print()).replace(/ /gi,"_").normalize() + "-" + selectedElement);
  hydrolist.prop('disabled', true).trigger("chosen:updated");


  // Se agregan eventos con respecto al grafico creado.
  addGraphEvents(myChart, PDTO, selectedElement);
}

/**
 * Agrega datos a gráfico
 * @param allData Conjunto de datos como diccionario
 * @param xAxis Llave identificadora de valores para eje X
 * @param yAxis Llave identificadora de valores para eje y
 * @param setDeDatos Arreglo vacío que recibe datos procesados
 * @param xlabel Etiqueta del eje X en gráfico
 */
function addDataSets(allData, xAxis, yAxis, setDeDatos, xlabel) {
    console.log("Pasando por addDataSets")
    let color = 0;
    for (const key in allData) {
        // check if the property/key is defined in the object itself, not in parent
        // console.log("en AddDataSets, usando la llave: ",key)
        if (allData.hasOwnProperty(key)) {
            const data = allData[key];
            if (data.length > 0) {
                let ylabel = [];
                let title = key;

                for (let i = 0; i < data.length; i++) {
                    ylabel.push(parseFloat(data[i][yAxis]).toFixed(1));
   
                }

                if (color === 0){
                    for (let i = 0; i < data.length; i++) {
                        // console.log("pasandole data[i][xaxis]: ", data[i])
                        xlabel.push(data[i][xAxis]);
       
                    }
                }

                // Colores respecto a CONFIG
                let colorBkg;
                switch(title) {
                    case "hidraulica_serie":
                        colorBkg = CONFIG.COLOR_SERIE;
                        break;
                    case "hidraulica_embalse":
                        colorBkg = CONFIG.COLOR_EMBALSE;
                        break;
                    case "Pasada":
                        colorBkg = CONFIG.COLOR_PASADA;
                        break;
                    case "Minihidro":
                        colorBkg = CONFIG.COLOR_MINIHIDRO;
                        break;
                    case "solar_fv":
                        colorBkg = CONFIG.COLOR_SOLAR;
                        break;
                    case "eolica":
                        colorBkg = CONFIG.COLOR_EOLICA;
                        break;
                    case "carbon":
                        colorBkg = CONFIG.COLOR_CARBON;
                        break;
                    case "diesel":
                        colorBkg = CONFIG.COLOR_DIESEL;
                        break;
                    case "GNL":
                        colorBkg = CONFIG.COLOR_GNL;
                        break;
                    case "biomasa":
                        colorBkg = CONFIG.COLOR_BIOMASA;
                        break;
                    case "Cogeneracion":
                        colorBkg = CONFIG.COLOR_COGENERACION;
                        break;
                    default:
                        colorBkg = randomColor();
                }
                if(title == "null") title = "H1";
                const dataset = {
                  label: title,
                  data: ylabel,
                  borderWidth: 1,
                  lineTension: 0,
                  backgroundColor: colorBkg.replace(/1(?=[^,\d])/, '0.3'),
                  borderColor: colorBkg,
                  fill: true
                };
                color += 1;
                setDeDatos.push(dataset);
            }
        }
    }
}


/**
 * Agrega datos al dictionario centralsData, esto es para dar formato al dataset para un gráfico apilado.
 * @param data Datos
 * @param tipo Tipo de generador
 * @param centralsData Arreglo de datos de generadores
 * @param yAxis Llave de valores de eje Y
 */
function addCentralData(data, tipo, centralsData, yAxis) {
    // console.log("pasando por addCentralData, ejemplo data[1][yAxis]: ",parseFloat(data[1][yAxis]).toFixed(1))
    console.log("Pasando por addCentralData")
    if (!(tipo in centralsData)){
        centralsData[tipo] = [];
    }
    
    // Caso en el que ya hay datos
    if (centralsData[tipo].length > 0) {
        for(let i = 0; i < data.length; i++){
            centralsData[tipo][i][yAxis] += parseFloat(data[i][yAxis]).toFixed(1);
            // centralsData[tipo][i][yAxis] += data[i][yAxis];
        }
    } else { // Datos nuevos agregados completamente, solo interesa time y generación.
      for(let i = 0; i < data.length; i++){
        centralsData[tipo][i] = { time : i+1,  [yAxis] : parseFloat(data[i][yAxis]).toFixed(1)};
        // centralsData[tipo][i] = { time : i+1,  [yAxis] : data[i][yAxis]};
        // console.log(yAxis, centralsData[tipo][i]);
      }
    }
}


/**
 * Funcion para cargar datos de las centrales (generadores)
 * @param x
 * @param m
 * @param centralsData Arreglo con los datos de los generadores
 * @param yAxis Llave para acceder a valores de eje Y
 * @returns {Function}
 */
function createCallback(x, m, centralsData, yAxis) {
    // console.log("Pasando por modulo stacked-charts función createCallBack")
    return function() {
        if (x.readyState === 4){
            addCentralData(JSON.parse(this.responseText), m, centralsData, yAxis);
        }
    };
}
