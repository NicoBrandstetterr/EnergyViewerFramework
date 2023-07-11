"use strict";

let currentJsonProject;
let currentProjectName;
let project_name_regex = /^[a-z0-9À-ÿ\u00F1\u00D1][a-z0-9À-ÿ\u00F1\u00D1 _-]*[a-z0-9À-ÿ\u00F1\u00D1]$/i;

/**
 * Verifica estructura de path de acuerdo a sistema operativo
 * @param simplePath path entregado como ubicación de proyecto
 * @returns {boolean} true si corresponde a estructura soportada por sistema operativo, false si no.
 */
function verifyPathAccordingToOS(simplePath){
    if(isValidUrl(simplePath)) return true;
    var platform = navigator.platform;

    switch(platform) {
      case "Linux x86_64":
        return verLinuxPath(simplePath);
      case "Win32":
        return verWinPath(simplePath);
      case "Macintosh":
        return true;
      default:
        return true;
    }
}

/**
 * Verifica si el path entregado corresponde a una URL HTTP o HTTPS valida
 * @param simplePath Path entregado como string
 * @returns {boolean} true si el path es una URL valida, false si no.
 */
function isValidUrl(path){
  var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return path.length < 2083 && url.test(path);
}
/**
 * Verifica si el path entregado posee estructura soportada por Linux
 * @param simplePath Path entregado como string
 * @returns {boolean} true si corresponde a estructura soportada por sistema operativo, false si no.
 */
function verLinuxPath(simplePath){

    var linRegex = "^(/[^/]*)";


    if(simplePath.search(linRegex)>=0)
        return true;
    else
		return false;
}

/**
 * Verifica si el path entregado como parámetro corresponde al soportado por MacOS
 * @param simplePath Path entregado como string
 * @returns {boolean} true si corresponde a estructura soportada por sistema operativo, false si no.
 */
function verMacPath(simplePath){
    /**/
 return true;
}

/**
 * Verifica si el path entregado corresponde a uno soportado por Windows
 * @param simplePath Path entregado como string
 * @returns {boolean} true si corresponde a estructura soportada por sistema operativo, false si no.
 */
function verWinPath(simplePath){

    var winRegex = "/^[a-z]:((\\\\|\\/)[a-z0-9\\s_@\\-^!#$%&+={}\\[\\]]+)";

    if(simplePath.search(winRegex)>=0)
        return true;
    else
		return true;
}

function mostrarDescripcion(descripcion) {
  // Crear un div para la ventana emergente
  console.log("func ",descripcion)
  var ventanaEmergente = document.createElement("div");
  
  // Establecer el estilo del div
  ventanaEmergente.style.position = "fixed";
  ventanaEmergente.style.top = "50%";
  ventanaEmergente.style.left = "50%";
  ventanaEmergente.style.width = "50%";
  ventanaEmergente.style.height = "auto";
  ventanaEmergente.style.minWidth = "300px";
  ventanaEmergente.style.maxWidth = "600px";
  ventanaEmergente.style.transform = "translate(-50%, -50%)";
  ventanaEmergente.style.backgroundColor = "#fff";
  ventanaEmergente.style.borderRadius = "10px";
  ventanaEmergente.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  ventanaEmergente.style.zIndex = "9999";
  
  // Crear un elemento para el texto "Hola mundo"
  var mensaje = document.createElement("p");
  mensaje.innerText = descripcion;
  mensaje.style.color = "#333";
  mensaje.style.fontSize = "24px";
  mensaje.style.textAlign = "center";
  mensaje.style.padding = "20px";
  
  // Agregar el elemento de texto al div de la ventana emergente
  ventanaEmergente.appendChild(mensaje);
  
  // Crear un botón para cerrar la ventana emergente
  var botonCerrar = document.createElement("button");
  botonCerrar.innerText = "Cerrar";
  botonCerrar.style.display = "block";
  botonCerrar.style.margin = "20px auto";
  botonCerrar.style.padding = "10px 20px";
  botonCerrar.style.fontSize = "18px";
  botonCerrar.style.borderRadius = "5px";
  botonCerrar.style.backgroundColor = "#333";
  botonCerrar.style.color = "#fff";
  botonCerrar.style.border = "none";
  botonCerrar.style.cursor = "pointer";
  
  // Agregar un evento de clic al botón de cerrar
  botonCerrar.addEventListener("click", function() {
    ventanaEmergente.remove();
  });
  
  // Agregar el botón de cerrar al div de la ventana emergente
  ventanaEmergente.appendChild(botonCerrar);
  
  // Agregar el div de la ventana emergente al cuerpo del documento
  document.body.appendChild(ventanaEmergente);
}

/**
 * Parsea una fila de la tabla con proyecto, retorna html para la fila.
 * @param fileName Nombre del archivo como string
 * @param category Nombre de la categoría del proyecto como string
 */

function addProjectRow(fileName, category, description,nombre,aux=false){
  let category_index = CATEGORIES.indexOf(category);
  let category_container;
  let projects_div;
  if (category_index >= 0) {
    category_container = $("#category-container-{id}".formatUnicorn({id: category_index}));
    projects_div = $("#category-{id}".formatUnicorn({id: category_index}));
  }
  else {
    category_container = $("#category-container-no-category");
    projects_div = $("#category-no-category");
  }

  category_container.css("display", "block");
  if (aux){
    projects_div.append(("<div class='project-container' id='{project}'>" + 
    "<hr class='hr-primary' style='color: white; width: 100%'/>" +
    "<table style='width:100%'><tr>" +
    "<td><label class='project-name'>{nombre}</label></td>" +
    "<td style='width: 60%; text-align: justify; text-justify: inter-word'><div>{desc}</div></td>" +
    "<td style='width: 120px'>" +
    "<div class='buttons-container'>" +
    // "<img class=\"new-project-image pull-right\" onclick=\"mostrarDescripcion('{desc}')\" id=\"info\" src=\"resources/home/info.svg\" alt=\"Icono de información\" title=\"Más información sobre {name}\" />"+
    "<img class=\"new-project-image pull-right\" onclick=\"startProjectAuto('{project}')\" id=\"plus\" src=\"resources/home/start.png\" />" +
    "</div>" +
    "</td>" +
    "</tr></table>" +
    "</div>").formatUnicorn({ project: fileName, desc: description,nombre:nombre }));
  }

  else{
    projects_div.append(("<div class='project-container' id='{name}'>" + 
        "<hr class='hr-primary' style='color: white; width: 100%'/>" +
        "<table style='width:100%'><tr>" +
        "<td><label class='project-name'>{name}</label></td>" +
        "<td style='width: 60%; text-align: justify; text-justify: inter-word'><div>{desc}</div></td>" +
        "<td style='width: 120px'>" +
        "<div class='buttons-container'>" +
        "<img class=\"new-project-image pull-right\" onclick=\"openConfiguration('{name}')\" id=\"settings\" src=\"resources/home/settings.png\" />" +
        "<img class=\"new-project-image pull-right\" onclick=\"openRemove('{name}')\" id=\"minus\" src=\"resources/home/minus.png\" />" +
        "<img class=\"new-project-image pull-right\" onclick=\"startProject('{name}')\" id=\"plus\" src=\"resources/home/start.png\" />" +
        "</div>" +
        "</td>" +
        "</tr></table>" +
        "</div>").formatUnicorn({ name: fileName, desc: description }));

  }
  
}

/**
 * Lee las propiedades de los proyectos almacenados y delega acciones acorde a cada caso
 * @param fileName Nombre del proyecto en una variable de tipo string
 */
function readProperties(fileName) {
  console.log("´pasando por readProperties");
  fileSystem.getFolder(fileSystem.projects, fileName, project =>
    fileSystem.getFile(project, "config.json", configFile =>
      fileSystem.readFromFile(configFile, text => {
        currentJsonProject = JSON.parse(text);

        let category = currentJsonProject.CATEGORY;
        let user_name = currentJsonProject.USER;
        let description = currentJsonProject.DESCRIPTION;
        if (user_name == $("#user-input")[0].value || user_name == ""){
          addProjectRow(fileName, category, description);
        }
        //addProjectRow(fileName, category);
      })));
}

/**
 * Carga la lista de proyectos una vez que el modulo de filesystem este cargado.
 */

function onFSReady() {
  console.log("pasando por onFSready")
  let projectsDiv = $("#existing-projects");
  projectsDiv.empty();
  
  categories_setup(CATEGORIES);


  if (fileSystem.projects && typeof fileSystem.projects === "object") {
    fileSystem.ls(fileSystem.projects, (entries, error) => {
      if (error) {
        console.error(error);
        return;
      }
      entries.sort((f1, f2) => f1.name.localeCompare(f2.name));
      entries.forEach(entry => {
        if (entry.isDirectory) {
          readProperties(entry.name);
        }
      });
    });
  } else {
    console.error("fileSystem.projects is not defined or is not an object");
  }
}


/**
 * Elimina el proyecto seleccionado.
 * @param name nombre de la carpeta.
 * @param action
 */
function removeAction(name){
  // fileSystem.getFolder(fileSystem.projects,name,project => {fileSystem.remove(project,onFSReady);});
  fileSystem.getFolder(fileSystem.projects,name,project => {fileSystem.remove(project,removeRow);});
}

function removeRow(){
  $("#{project}".formatUnicorn({project: currentProjectName})).remove();

}

/**
 * Abre la ventana de configuración.
 * @param name nombre del proyecto
 */
function openConfiguration(name){
  $('#configModal').modal();
  currentProjectName = name;
  fileSystem.getFolder(fileSystem.projects, name, project =>
      fileSystem.getFile(project, "config.json", configFile =>
        fileSystem.readFromFile(configFile, text => {

              currentJsonProject = JSON.parse(text);
              
              $('#results-on').prop('checked', !currentJsonProject.RESULTS_DISABLED);
              //$('#generadores-agregados').prop('checked', currentJsonProject.AGGREGATE_GENERATORS_ENABLED);
              $('#debug-mode').prop('checked', currentJsonProject.ENABLE_TIME_LOG);
              $('#ruta-proyecto').val(currentJsonProject.BASE_FOLDER_NAME + currentJsonProject.MODEL_FOLDER_NAME);
              $('#ruta-topologia').val(currentJsonProject.TOPOLOGY_FOLDER);
              $('#ruta-resultados').val(currentJsonProject.RESULTS_FOLDER);
        })));
  $('#projectConfigName').text(name);
}


/**
 * Abre la ventana de confirmacion de eliminar proyecto.
 * @param name nombre del proyecto
 */
function openRemove(name){
  $('#removeModal').modal();
  currentProjectName = name;
  $('#projectRName').text(name);
}

/**
 * Abre la ventana para agregar archivos.
 * @param name
 */
function openFilesWindow(name){
  $('#filesModal').modal();


  $('#projectFName').text(name);
}

/**
 * Redirige la apliacion al visualizador.
 * @param name Nombre del proyecto
 */
// function startProject(name){
//   console.log("Se entro en startProject");
//   fileSystem.getFolder(fileSystem.projects, name, project =>
//     fileSystem.getFile(project, "config.json", configFile =>
//       fileSystem.readFromFile(configFile, text => {
//         var cfg = JSON.parse(text);
//         cfg.RESULTS_ENABLED = !(cfg.RESULTS_DISABLED)
//         var url = "app.html?base_uri={BASE_FOLDER_NAME}&"+
//                                         "model={MODEL_FOLDER_NAME}&"+
//                                         "debug={ENABLE_TIME_LOG}&"+
//                                         "results={RESULTS_ENABLED}&"+
//                                         "standalone=true";
//         url = url.formatUnicorn(cfg);
//         window.location.href = url
//       })));
// }

/**
 * Guarda el archivo de configuración.
 */
function saveConfig(){

  var rutaProyecto = $("#ruta-proyecto").val();

  if(rutaProyecto!=="" && verifyPathAccordingToOS(rutaProyecto) ){
      savePath(rutaProyecto, 'proyecto');

      currentJsonProject.RESULTS_DISABLED = !$('#results-on').is(':checked');
      currentJsonProject.ENABLE_TIME_LOG = $('#debug-mode').is(':checked');
      fileSystem.getFolder(fileSystem.projects, currentProjectName, project =>
          fileSystem.getFile(project, "config.json", configFile =>
              fileSystem.writeToFile(configFile, JSON.stringify(currentJsonProject), () => {
              })));

      $('#configModal').modal('toggle');
  }
}

/**
 * Se guarda el path en el currentJsonProject
 * @param path
 */
function savePath(path) {
  // Guardamos el path con el proyecto.
  var baseIdx = path.lastIndexOf("/");
  var modelIdx = path.length;
  if (baseIdx == modelIdx - 1)
  {
      baseIdx = path.substring(0, baseIdx - 1).lastIndexOf("/");
      modelIdx = path.length - 1;
  }
  
  currentJsonProject.BASE_FOLDER_NAME = path.substring(0, baseIdx + 1); // Path sin nombre del modelo, pero con el "/" final
  currentJsonProject.MODEL_FOLDER_NAME = path.substring(baseIdx + 1, modelIdx); // Modelo (Ej. "CHL")
}

/**
 * Función de conveniencia que cierra el modal dado por modalID
 * @param modalID Nombre (string) del modal a cerrar
 */
function closeModal(modalID) {
    $('#' + modalID).modal('toggle');
}

/**
 * Función que permite crear un nuevo proyecto, dado el nombre que el usuario escribe en el text-box
 */
function createNewProject() {
  // Apretando la tecla enter.

  let project = $('#inputName').val();

  let name = $("#user-input")[0].value;
  let selected_value = $("#category-selector")[0].value;
  let description = $("#project-description")[0].value;
  let registry_category = CATEGORIES[selected_value];
  if (project_name_regex.test(project)) {
    $('#valid p').text("");
    $('#inputName').removeClass("input-error")

    let json = {
      "BASE_FOLDER_NAME": "",
      "MODEL_FOLDER_NAME": "",
      "SIMULATION_FOLDER_NAME": "",
      "AGGREGATE_GENERATORS_ENABLED": false,
      "ENABLE_TIME_LOG": false,
      "RESULTS_DISABLED": false,
      "CATEGORY": registry_category,
      "USER": name,
      "DESCRIPTION": description
    };

    fileSystem.createFolder(fileSystem.projects, project, project =>
      fileSystem.createFile(project, "config.json", configFile =>
        fileSystem.writeToFile(configFile, JSON.stringify(json), () => {})
        ));

    addProjectRow(project, registry_category, description);
    $('#inputName').val('');
    $('#newProjectModal').modal('toggle');
  }
  else{
    $('#inputName').addClass("input-error")
  }
}

$(document).on('shown.bs.modal', '#newProjectModal', function () {
  categories_setup(CATEGORIES);
});


function startProjectAuto(name){

  fileSystem.getFolder(fileSystem.projects,name, project =>
    fileSystem.getFile(project, "config.json", configFile =>
      fileSystem.readFromFile(configFile, text => {
        var cfg = JSON.parse(text);
        cfg.RESULTS_ENABLED = !(cfg.RESULTS_DISABLED)
        var url = "app.html?base_uri={BASE_FOLDER_NAME}&"+
                                        "model="+name+"&"+
                                        "debug={ENABLE_TIME_LOG}&"+
                                        "results={RESULTS_ENABLED}&"+
                                        "standalone=true";
        url = url.formatUnicorn(cfg);

        window.location.href = url
      })));
}


function automaticAddProjects() {
  // Definir una lista vacía para almacenar los nombres de los proyectos
  let actuales_proyectos = [];

  // Obtener los elementos dentro de la carpeta "projects"
  fileSystem.ls(fileSystem.projects, function(files) {
    // Iterar sobre los elementos y agregar los nombres de los proyectos a la lista
    for(let i=0; i<files.length; i++){
      let file=files[i];
      if(file.isDirectory){
        actuales_proyectos.push(file.name);
      }
    }
    console.log(actuales_proyectos); // Imprimir la lista de proyectos

    let projectDict = {
      "PLP20230104": {"name":"PLP-20230104","categoria": "daily", "descripcion": "Caso Diario del dia 04-01-2023. Extraído del Coordinador Electrico Nacional"},
      "caso_8": {"name":"PET2022 Escenario A","categoria": "PLP", "descripcion": "Escenario A de la planificación de la transmisión 2022 elaborado por el Coordinador Eléctrico"},
      "PLP20230325": {"name": "PLP-20230325","categoria": "daily", "descripcion": "Caso Diario del dia 25-03-2023. Extraído del Coordinador Electrico Nacional"},
      "Pet23_escenario_d":{"name":"PET2023 Escenario D","categoria": "PLP", "descripcion": "Escenario D de la planificación de la transmisión 2023 elaborado por el Coordinador Eléctrico"},
      "PLP20230520":{"name": "PLP-20230520", "categoria":"daily","descripcion":"Caso Diario del dia 20-05-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230527":{"name": "PLP-20230527", "categoria":"daily","descripcion":"Caso Diario del dia 27-05-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230606":{"name": "PLP-20230606", "categoria":"daily","descripcion":"Caso Diario del dia 06-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230610":{"name": "PLP-20230610", "categoria":"daily","descripcion":"Caso Diario del dia 10-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230613":{"name": "PLP-20230613", "categoria":"daily","descripcion":"Caso Diario del dia 13-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230617":{"name": "PLP-20230617", "categoria":"daily","descripcion":"Caso Diario del dia 17-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230620":{"name": "PLP-20230620", "categoria":"daily","descripcion":"Caso Diario del dia 20-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230624":{"name": "PLP-20230624", "categoria":"daily","descripcion":"Caso Diario del dia 24-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230628":{"name": "PLP-20230628", "categoria":"daily","descripcion":"Caso Diario del dia 28-06-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230701":{"name": "PLP-20230701", "categoria":"daily","descripcion":"Caso Diario del dia 01-07-2023. Extraído del Coordinador Electrico Nacional"},
      "PLP20230704":{"name": "PLP-20230704", "categoria":"daily","descripcion":"Caso Diario del dia 04-07-2023. Extraído del Coordinador Electrico Nacional"},
      "CASOPLEXO":{"name": "PD-20230618", "categoria":"plexo","descripcion":"Caso Diario del día 18-06-18 Extraído del Coordinador Eléctrico Nacional"},
    };
    
    
    for (let projectName in projectDict) {
      let project = projectDict[projectName];
      let registry_category;
      
      if (project.categoria === "PLP") {
        registry_category = CATEGORIES[0];
      }
      if (project.categoria === "daily") {
        registry_category = CATEGORIES[1];
      }
      if (project.categoria === "plexo"){
        registry_category = CATEGORIES[2];
      }


      if (actuales_proyectos.includes(projectName)){
      
      }
      else{
        if (project_name_regex.test(projectName)) {
          let json = {
            BASE_FOLDER_NAME: "",
            MODEL_FOLDER_NAME: "",
            SIMULATION_FOLDER_NAME: "",
            AGGREGATE_GENERATORS_ENABLED: false,
            ENABLE_TIME_LOG: false,
            RESULTS_DISABLED: false,
            CATEGORY: registry_category,
            USER: "Publico",
            DESCRIPTION: project.descripcion,
            NAME: project.name,
          };
          currentProjectName = projectName;

          fileSystem.createFolder(fileSystem.projects,projectName, (project) =>
            fileSystem.createFile(project, "config.json", (configFile) =>
              fileSystem.writeToFile(configFile, JSON.stringify(json), () => {
                fileSystem.getFolder(fileSystem.projects, project.name, (project) =>
                  fileSystem.getFile(project, "config.json", (configFile) =>
                    fileSystem.readFromFile(configFile, (text) => {

                      currentJsonProject = JSON.parse(text);
                      $('#ruta-proyecto').val(currentJsonProject.BASE_FOLDER_NAME + currentJsonProject.MODEL_FOLDER_NAME);
                      let rutaProyecto = project.name;
                      if (
                        rutaProyecto !== "" &&
                        verifyPathAccordingToOS(rutaProyecto)
                      ) {

                        savePath(rutaProyecto, "proyecto");

                        currentJsonProject.RESULTS_DISABLED = false;
                        currentJsonProject.ENABLE_TIME_LOG = false;

                        fileSystem.getFolder(
                          fileSystem.projects,
                          currentProjectName,
                          (project) =>
                            fileSystem.getFile(project, "config.json", (configFile) =>
                              fileSystem.writeToFile(
                                configFile,
                                JSON.stringify(currentJsonProject),
                                () => {}
                              )
                            )
                        );
                      }
                    })
                  )
                );
              })
            )
          );

          addProjectRow(projectName, registry_category, project.descripcion,project.name,true);

        } else {
          $("#inputName").addClass("input-error");
        }
      }
    }
  });
}
//--------------------------------------------------------------------------------------------------------------------------------------------------
$(function(e){
  // Al apretar una tecla en la ventana emergente se ejecuta esta acción.
  $('#aboutModal').keypress(function(e) {
      if (e.which === 13) {
          createNewProject();
    }
  })
});
window.addEventListener('beforeunload', function() {
	fileSystem.ls(fileSystem.projects, function(files) {
	  for (let i = 0; i < files.length; i++) {
		fileSystem.remove(files[i], function() {
		  console.log("Se ha eliminado el archivo " + files[i].name);
		});
	  }
	});
  });
$('#inputName').on("input",(event) =>
  {
    var input_content = event.target.value;
    if(!project_name_regex.test(input_content)){
      $('#valid p').text("Nombre de proyecto inválido. Se permiten caracteres alfanumericos [0-9a-zA-Z] con guiones (-) y espacios ( ) entre medio.");
    } else {
       $('#valid p').text("");
    }
  });

$('#ruta-proyecto').on("input",(event) =>
  {
    var rutaProyecto = event.target.value;
    if(rutaProyecto==="" || !verifyPathAccordingToOS(rutaProyecto) ){
      $('#valid-path p').text("Ruta inválida");
    } else {
       $('#valid-path p').text("");
    }
  });

let CATEGORIES = ["Caso Planificación de la Transmisión", "Casos Programación Diaria Con Modelo PLP", "Casos Programación Diaria Con Modelo PLEXOS", "Category 4", "Category 5", "Category 6", "Category 7", "Category 8", "Category 9"]; // Casos Programación Diaria Con Modelo PLP
let CATEGORIES_COLORS = [];

function categories_setup(categories){
  CATEGORIES = categories;
  let step = 100 / (categories.length - 1)
  function format(str) {
    return (str.length < 2) ? "0"+str : str;
  }
  for (let i = 0; i < categories.length; i++) {
    let r = format(parseInt(52 - step * i * 0.52).toString(16));
    let g = format(parseInt(123 - step * i * 1.23).toString(16));
    let b = format(parseInt(183 - step * i * 0.25).toString(16))
    CATEGORIES_COLORS.push("#" + r + g + b)
  }
  let projects_div = $('#existing-projects');
  for (let i = 0; i < categories.length; i++) {
    projects_div.append($(("<div class='category-container' id='category-container-{id}' style='display: None'>" +
      "<hr class='hr-primary' style='background-color:{color}; height: 3px'/>" +
      "<div class='my-label' style='background-color:{color}; color: white;'>{cat}</div>" +
      "<div class='projects-container' id='category-{id}'></div>" +
      "</div>")
      .formatUnicorn({ cat: categories[i], color: CATEGORIES_COLORS[i], id: i })));
  }
  projects_div.append($("<div class='category-container' id='category-container-no-category' style='display: None'>" +
    "<hr class='hr-primary' style='background-color:#000000; height: 3px'/>" +
    "<div class='my-label' style='background-color:#000000; color: white;'>Sin Categoría</div>" +
    "<div class='project-container' id='category-no-category'></div>" +
    "</div>"));
  let labels_div = $('#labels');
  labels_div.empty();
  let html_selector_categories = "";
  for (let i = 0; i < categories.length; i++){
    let option = ("<option value='{id}'>{category}" +
    "</option>").formatUnicorn({id: i, category: categories[i]});
    html_selector_categories =  html_selector_categories.concat(option);
  }
  let selector = $('<select class="form-control" name="category-selector" id="category-selector">{html}</select>'.formatUnicorn({html: html_selector_categories}));
  labels_div.append(selector);
}



