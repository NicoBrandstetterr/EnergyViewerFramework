"use strict";

var initial_time, lastEventTime;

/**
 * Devuelve la hora actual
 * @returns {number}
 */
function getCurrentTime(){
	var d = new Date();
    return d.getTime();
}

initial_time = getCurrentTime();
lastEventTime = getCurrentTime();

/**
 *
 * @param message
 */
function logTime(message){
	if(CONFIG.ENABLE_TIME_LOG){
		var time = getCurrentTime();
		console.log(message);
		console.log("Time elapsed:",time-initial_time,"\nTime since last update:",time-lastEventTime);
		lastEventTime = time;
	}
}

if(CONFIG.ENABLE_TIME_LOG){
	console.log("Started time");
}