'use strict';

function Utils() {
	
}

/*
 *	Static method to create a table row 
*/
Utils.createTableRow = function(userObject, columns) {
	var rowElement = document.createElement('div');
	rowElement.classList.add('tableRow');
	
	//Append the cells in correct order
	for(var i = 0; i < columns.length; i++) {
		var cellElem = document.createElement('div');
		if(typeof userObject[columns[i]] !== 'undefined') {
			cellElem.innerText = userObject[columns[i]];
		}
		rowElement.appendChild(cellElem);
	}
	
	return rowElement;
}