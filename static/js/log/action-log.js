"use strict";

var LOG_TYPE = {
	ERROR: 1,
	WARNING: 2,
	SUCCESS: 3,
	DEFAULT: 4
};

var logs = [];

/**
 *headerString es un string
 * headerArgs es un arreglo de strings
 * logType es un parámetro de LOG_TYPE definido arriba
 *
 * el log tendrá como cabecera headerString
 * 
 * devuelve el número de log que se está creando (índice en logs[]) 
 * para ser usado en:
 * addDetailsToLog(logNumber, details)
 * editLogHeader(logNumber, edits)
 */
function createLog(headerString, logType) {

	if (typeof logType === 'undefined') logType = LOG_TYPE.DEFAULT;
	
	var logNumber = logs.length;
	
		var newLogEntry = {
		id: logNumber,
		headerString: headerString,
		details: [],
		type: logType
	};
	logs.push(newLogEntry);
	
	createLogElements(logNumber);
	updateLog(logNumber);
	
	return logNumber;
	
}

/**
 * Crea los elementos HTML sin contenido, con las ids correspondientes a logNumber
 * en log-area
 * @param logNumber Número de mensaje en LOG
 */
function createLogElements(logNumber) {
	
	var logArea = document.getElementById('log-area');
	
	var logDiv = document.createElement('div');
	logDiv.id = 'log-' + logNumber;
	
	var button = document.createElement('button');
	button.id = 'button-log-' + logNumber;
	button.setAttribute('class', 'accordion');
	button.classList.add(logNumber%2===1? 'even':'odd');
	
	logDiv.appendChild(button);
	
	var panel = document.createElement('div');
	panel.id = 'panel-log-' + logNumber;
	panel.setAttribute('class', 'panel hidden');
	panel.setAttribute('style', 'display: block');
	logDiv.appendChild(panel);
	
	button.onclick = function() {
		this.classList.toggle("active");
		panel.classList.toggle("hidden");
	}
	
	logArea.appendChild(logDiv);
}

/**
 * Actualiza el contenido mostrado con lo que está en el objeto
 * logs[logNumber]
 */
function updateLog(logNumber) {
	
	var headerString = logs[logNumber].headerString;
	var headerArgs = logs[logNumber].headerArgs;
	var logType = logs[logNumber].type;
	
	var button = document.getElementById('button-log-' + logNumber);
	
	// FIXME
	// se escribe todo de nuevo
	while (button.firstChild) 
		button.removeChild(button.firstChild);
	
	var buttonImage = document.createElement('img');
	var src = "";
	switch (logType) {
		case LOG_TYPE.ERROR:
			src = './resources/log/error.png';
			break;
		case LOG_TYPE.WARNING:
			src = './resources/log/warning.png';
			break;
		case LOG_TYPE.SUCCESS:
			src = './resources/log/success.png';
			break;
		default:
			src = './resources/log/entry.png';
	}
	buttonImage.setAttribute('style', 'display: inline-block; float: left;');
	buttonImage.setAttribute('src', src);
	button.appendChild(buttonImage);
	
	var headerElement = document.createElement('span');
	headerElement.setAttribute('style', 'display: inline-block; padding-left: 2px;');
	headerElement.innerHTML = headerString;
	button.appendChild(headerElement);
	
	var panel = document.getElementById('panel-log-' + logNumber);
	
	// FIXME
	// se escribe todo de nuevo
	while (panel.firstChild) 
		panel.removeChild(panel.firstChild);
	
	var i = logs[logNumber].details.length;
	
	if (i > 0) {
		var quantityDisplayer = document.createElement('span');
		// FIXME meterle css para que se vea a la derecha
		quantityDisplayer.setAttribute('style', 
			"float: right; " +
			"display: inline-block; " + 
			"padding-right: 2px;"
		);
		quantityDisplayer.innerHTML = i;
		button.appendChild(quantityDisplayer);
	}
	
	while (i--) {
		var detail = logs[logNumber].details[i];
		var newDetail = document.createElement('p');
		var message;
		if (typeof detail === 'string') {
			message = detail;
		} else {
			message = detail.message;
			newDetail.addEventListener('click', detail.fun);
			newDetail.classList.add('clickable');
			// FIXME cualquier cosa que indique intuitivamente que esto es clickeable
			//((i%2===1)?'rgba(0,0,0,1)':'rgba(255,255,255,1)') 
		}
		newDetail.classList.add('logSubEntry');
		newDetail.classList.add((i%2===1)?'even':'odd');
		newDetail.innerHTML = '<span>' + message + '</span>';
		panel.appendChild(newDetail);
	}	
	
}

/**
 * detail puede ser un string o un objeto con atributos (message, fun)
 * fun es una función se ejecutará al clickear el texto de message
 * @param logNumber número de mensaje de log
 * @param detail Mensaje (string) con detalle de acción
 */
function addDetailsToLog(logNumber, detail) {
	logs[logNumber].details.push(detail);
	updateLog(logNumber)
}

logTime("action-log.js");