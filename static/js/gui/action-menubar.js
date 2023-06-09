"use strict";

/**
 *
 */
$(function() {
    $(".nav li").on("click", function() {
        $(".nav li").removeClass("active");
        $(this).addClass("active");
    });
});

/**
 *
 */
function downloadVis(){
	var link = document.getElementById('dlink');
	link.href = canvasToPNG();
	link.download = "mapa.png";
}

logTime("action-menubar.js");