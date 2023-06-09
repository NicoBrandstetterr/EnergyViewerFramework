/**
Esta funcion lo que hace es tomar un string y un objeto y reemplazar todas las ocurrencias de
{key} en el string por obj[key]. Ejemplo:
"Mi nombre es {name} y tengo {age} años".formatUnicorn({age: 23,name: "Joaquin"}) retorna
"Mi nombre es Joaquin y tengo 23 años"
*/
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
  function () {
    "use strict";
    let str = this.toString();
    if (arguments.length) {
      let t = typeof arguments[0];
      let key;
      let args = ("string" === t || "number" === t) ?
        Array.prototype.slice.call(arguments)
        : arguments[0];

      for (key in args) {
        str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
      }
    }

    return str;
  };

/**
 * Esta funcion extrae los parametros del GET de una URL
 * @param name nombre a acceder
 * @param url URL con el GET
 */
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Esta funcion accede a un nodo por nombre. No usar, bastante ineficiente.
 * @param {String} name nombre del nodo a buscar
 * @param {Object} nodes objeto de javascript con los nodos
 */
function getNodeByName(name,nodes){
  if(!nodes) nodes = currentNodes;
  var res = nodes.get().filter(n => n.label && n.label===name);
  return res[0];
}

/**
 * Esta funcion busca todas las aristas cuyo label contenga el nombre especificado (incluso si buscamos por costo marginal, ojo!)
 * @param {String} name nombre de la arista a buscar
 * @param {Object} edges objeto de javascript con las aristas
 * @returns lista de aristas que matchean.
 */
function getEdgesByName(name,edges){
  if(!edges) edges = currentEdges;
  var res = edges.get().filter(e => e.title && e.title.textContent && e.title.textContent.indexOf(name)!== -1);
  return res;
}