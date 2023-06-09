"use strict";

// Diccionario de colores para rectángulos (redundante por uso de id en el app.html)
var dictColorsRect =
{
    'linecolorgreen' : 'rgba(0, 250, 0, 1)',
    'linecolorred' : 'rgba(250, 0, 0, 1)',
    'linecolororange' : 'rgba(250, 170, 0, 1)',
    'linecolorblue' : 'rgba(0, 0, 250, 1)',
    'linecolorblack' : 'rgba(0, 0, 0, 1)',

    'buscolorgreen' : 'rgba(0, 250, 0, 1)',
    'buscoloryellow' : 'rgba(250, 250, 0, 1)',
    'buscolororange' : 'rgba(250, 170, 0, 1)',
    'buscolorred' : 'rgba(250, 0, 0, 1)',

    'hydrocolorgreen' : 'rgba(0, 250, 0, 1)',
    'hydrocolorred' : 'rgba(250, 0, 0, 1)',
    'hydrocolororange' : 'rgba(250, 170, 0, 1)',
    'hydrocolorblue' : 'rgba(0, 0, 250, 1)',
    'hydrocolorblack' : 'rgba(0, 0, 0, 1)'
}

// Diccionario de colores para círculos (redundante por uso de id en el app.html)
var dictColorsCircle =
{
    'circlecolorgreen' : 'rgba(0, 250, 0, 1)',
    'circlecoloryellow' : 'rgba(250, 250, 0, 1)',
    'circlecolororange' : 'rgba(250, 170, 0, 1)',
    'circlecolorred' : 'rgba(250, 0, 0, 1)'
}

/**
 * Función que crea un rectángulo de color @color. Se usa para la leyenda.
 * @param color Color del rectángulo.
 * @return data Imagen creada en SVG.
 */
function createColoredRectangle(color) {
    var width = 80;
    var height = 10;

    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
    data += '<rect x="' + height + '" y="' + (height*.15) + '" width="' + (width-2*height) + '" height="70%" fill=" ';
    data += color;
    data += '" stroke-width="1" stroke="#060606">'
    data += '</rect>';
    data += '</svg>';

    return data;
}

/**
 * Función que crea un círculo de color @color. Se usa para la leyenda.
 * @param color Color del círculo.
 * @return data Imagen creada en SVG.
 */
function createColoredCircle(color) {
    var width = 22;
    var height = 22;
    var radius = 10;

    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
    data += '<circle cx="' + width/2 + '" cy="' + height/2 + '" r="' + radius + '" fill="';
    data += color;
    data += '" stroke-width="1" stroke="#060606">'
    data += '</rect>';
    data += '</svg>';

    return data;
}

for (var key in dictColorsRect)
{
    document.getElementById(key).innerHTML += createColoredRectangle(dictColorsRect[key]);
}

for (var key in dictColorsCircle)
{
    document.getElementById(key).innerHTML += createColoredCircle(dictColorsCircle[key]);
}

// Genera los colores para mostrar los costos marginales de las barras
// quantile: el cuantil al que pertenece el valor
// numberOfQuantiles: cuántos cuantiles hay en total
// casos especiales:
// si quantile es -1, devuelve negro (caso en que no se quieren mostrar los colores)
// si quantile es 0, devuelve azul, color para mostrar underflow respecto a cierto valor
// si quantile es mayor que el número de cuantiles, devuelve rojo, color para mostrar costo de falla

function getQuantileColor(quantile, numberOfQuantiles) {
	switch (quantile) {
		case -1:
			return "10,10,10";
		case 0:
			return "0,0,255";
		case (numberOfQuantiles + 1):
			return "255,0,0";			
	}
	let yellow = Math.floor(numberOfQuantiles * .66);
	let r = 255;
	let g = 255;
	let b = 0;
	if (quantile < yellow) {
		r = Math.floor(255*(quantile/yellow));
	} else if (quantile > yellow) {
		g = Math.floor(255-(79*(quantile-yellow)/(numberOfQuantiles-yellow)));
	}
	return r + "," + g + "," + b;
}

function createMarginalCostLegend() {
	let div = document.getElementById("marginal-cost-legend");
	
	let unicorn = {
		width: 200,
		height: 30,
	};
	
	let svgComponents = [];
	
	svgComponents.push('<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">');
	
	//svgComponents.push('<rect x="0" y="0" height="100%" width="100%" fill="#FF00FF"> </rect>');
	
	svgComponents.push('<rect x="0%" y="0%" height="50%" width="20%" fill="#0000FF"> </rect>');
	svgComponents.push('<text x="10%" y="47%" text-anchor="middle" fill="#FFFFFF">~0</text>');
	
	svgComponents.push('<rect x="80%" y="0%" height="50%" width="20%" fill="#FF0000"> </rect>');
	svgComponents.push('<text x="90%" y="47%" text-anchor="middle" fill="#000000">&gt;');
	svgComponents.push(CONFIG.FAILURE_THRESHOLD);
	svgComponents.push('</text>');
	
	svgComponents.push('<text x="20%" y="99%" text-anchor="start" fill="#00FF00">');
	svgComponents.push(CONFIG.LOW_MARGINAL_COST);
	svgComponents.push('</text>');
	
	let quantileWidth = (unicorn.width*0.6)/CONFIG.NUMBER_OF_QUANTILES;
	let startPosition = unicorn.width*0.2;
	
	for (let i = 0; i < CONFIG.NUMBER_OF_QUANTILES; i++) {
		svgComponents.push('<rect x="');
		svgComponents.push(startPosition + quantileWidth*i);
		svgComponents.push('" y="0" height="50%" width="');
		svgComponents.push(quantileWidth);
		svgComponents.push('" fill="rgb(');
		svgComponents.push(getQuantileColor(i+1, CONFIG.NUMBER_OF_QUANTILES));
		svgComponents.push(')"></rect>');		
	}
	
	svgComponents.push('<text x="80%" y="99%" text-anchor="end" fill="#FFAA00">');
	svgComponents.push(CONFIG.HIGH_MARGINAL_COST);
	svgComponents.push('</text>');	
	
	svgComponents.push('</svg>');
	
	div.innerHTML = svgComponents.join('').formatUnicorn(unicorn);	
}

function createFluxLegend() {
	let div = document.getElementById("flux-legend");
	
	let unicorn = {
		svgWidth: 200,
		width: 150,
		height: 27,
		circleRadius: 7,
		barHeight: 3
	};	
	
	unicorn.barWidth = (unicorn.width - unicorn.circleRadius*4);
	
	let svgComponents = [];
		
	svgComponents.push('<svg xmlns="http://www.w3.org/2000/svg" width="{svgWidth}" height="{height}">');
	
	//svgComponents.push('<rect x="0" y="0" height="100%" width="100%" fill="#FF00FF"> </rect>');
	
	svgComponents.push('<circle cx="');
	svgComponents.push(unicorn.circleRadius);
	svgComponents.push('" cy="');
	svgComponents.push(unicorn.circleRadius);
	svgComponents.push('" r="{circleRadius}" fill="#00FF00" stroke="none"></circle>');
	
	svgComponents.push('<defs>');
	svgComponents.push('<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">');
    svgComponents.push('<stop offset="0%" style="stop-color:rgb(0,255,0);stop-opacity:1" />');
    svgComponents.push('<stop offset="100%" style="stop-color:rgb(255,255,0);stop-opacity:1" />');
    svgComponents.push('</linearGradient>');

	svgComponents.push('<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">');
    svgComponents.push('<stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />');
    svgComponents.push('<stop offset="100%" style="stop-color:rgb(255,170,0);stop-opacity:1" />');
    svgComponents.push('</linearGradient>');
  	svgComponents.push('</defs>');
	
	svgComponents.push('<rect x="');
	svgComponents.push(unicorn.circleRadius*2)
	svgComponents.push('" y="');
	svgComponents.push(unicorn.circleRadius - unicorn.barHeight/2);
	svgComponents.push('" height="');
	svgComponents.push(unicorn.barHeight);
	svgComponents.push('" width="');
	svgComponents.push(unicorn.barWidth*0.66);
	svgComponents.push('" fill="url(#grad1)"></rect>');
	
	svgComponents.push('<rect x="');
	svgComponents.push(unicorn.circleRadius*2 + unicorn.barWidth*0.66)
	svgComponents.push('" y="');
	svgComponents.push(unicorn.circleRadius - unicorn.barHeight/2);
	svgComponents.push('" height="');
	svgComponents.push(unicorn.barHeight);
	svgComponents.push('" width="');
	svgComponents.push(unicorn.barWidth*0.34);
	svgComponents.push('" fill="url(#grad2)"></rect>');
	
	svgComponents.push('<circle cx="');
	svgComponents.push(unicorn.width - unicorn.circleRadius);
	svgComponents.push('" cy="');
	svgComponents.push(unicorn.circleRadius);
	svgComponents.push('" r="{circleRadius}" fill="#FFAA00" stroke="none"></circle>');
	
	svgComponents.push('<circle cx="');
	svgComponents.push(unicorn.width + unicorn.circleRadius + 1);
	svgComponents.push('" cy="');
	svgComponents.push(unicorn.circleRadius);
	svgComponents.push('" r="{circleRadius}" fill="#FF0000" stroke="none"></circle>');
	
	svgComponents.push('<text x="');
	svgComponents.push(unicorn.width + unicorn.circleRadius + 1);
	svgComponents.push('" y="');
	svgComponents.push(unicorn.height);
	svgComponents.push('" fill="#FF0000" text-anchor="middle">Saturación</text>');
	
	svgComponents.push('<text x="');
	svgComponents.push(unicorn.width/2);
	svgComponents.push('" y="');
	svgComponents.push(unicorn.height);
	svgComponents.push('" fill="#00FF00" text-anchor="end">Menos &lt;</text>');
	
	svgComponents.push('<text x="');
	svgComponents.push(unicorn.width/2);
	svgComponents.push('" y="');
	svgComponents.push(unicorn.height);
	svgComponents.push('" fill="#FFAA00"> &gt; Más</text>');
	
	svgComponents.push('</svg>');
	
	div.innerHTML = svgComponents.join('').formatUnicorn(unicorn);	
}

createMarginalCostLegend();
createFluxLegend();

