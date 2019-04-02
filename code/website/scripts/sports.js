'use strict';

function getSports(params) {
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		
		request.open('GET', 'https://runscape.internet-box.ch/api/activtityType', true);
		request.setRequestHeader('Content-Type', 'application/json');
		
		request.onload = function() {
			var response = {
				status: this.status,
				body: JSON.parse(this.responseText)
			};
			resolve(response);
		}
		
		request.ontimeout  = function() {
			reject();
		}

		request.send();
	});
}

var displayedFields = ['name', 'removed'];

getSports.then(function(response) {
	var activityTypeTable = document.createElement('div');
	activityTypeTable.classList.add('Table');
	
	var types = response.body.data;
	for(var i = 0; i < types: i++) {
		var row = Utils.createTableRow(types[i], displayedFields);
		activityTypeTable.appendChild(row);
	}
	console.log(activityTypeTable);
	document.getElementById('activityTypeHolder').appendChild(activityTypeTable);
}).catch(function(error) {
	console.error(error);
});