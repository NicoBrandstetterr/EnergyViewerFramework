"use strict";

/**
 *
 * @returns {{}}
 */
function createUnionFind(){
	return {};
}

/**
 *
 * @param UF
 * @param x
 */
function add(UF,x){
	UF[x] = {
		parent : x,
		rank : 0
	};
}

/**
 *
 * @param UF
 * @param x
 */
function find(UF,x){
	if(UF[x].parent !== x) {
		UF[x].parent = find(UF,UF[x].parent);
	}
	return UF[x].parent;
}

/**
 *
 * @param UF
 * @param x
 * @param y
 */
function union(UF,x,y){
	var xroot = find(UF,x);
	var yroot = find(UF,y);
	if(xroot === yroot){
		return;
	}

	if(UF[xroot].rank < UF[yroot].rank){
		UF[xroot].parent = yroot;
	} else if(UF[xroot].rank > UF[yroot].rank){
		UF[yroot].parent = xroot;
	} else {
		UF[yroot].parent = xroot;
		UF[xroot].rank += 1;
	}
}

//bars son ids, barEdges son [id1,id2]
/**
 *
 * @param bars
 * @param barEdges
 * @returns {Object[]|Array|*|{applyDefaultStyles,
 * childOptions, initChildLayout,
 * destroyChildLayout, resizeChildLayout,
 * resizeNestedLayout, resizeWhileDragging,
 * resizeContentWhileDragging,
 * triggerEventsWhileDragging, maskIframesOnResize,
 * useStateCookie, [cookie.autoLoad], [cookie.autoSave],
 * [cookie.keys], [cookie.name], [cookie.domain], [cookie.path],
 * [cookie.expires], [cookie.secure], noRoomToOpenTip,
 * togglerTip_open, togglerTip_closed, resizerTip, sliderTip}}
 */
function connexComponents(bars,barEdges){
	let UF = createUnionFind();
	bars.map(bar => add(UF,bar));
	barEdges.map(edge => union(UF,edge[0],edge[1]));
	return bars.map(bar => find(UF,bar));
}