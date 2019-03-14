"use strict";

document.forms['loginForm'].addEventListener('submit', function(evt) {
	evt.preventDefault();
	var email = document.getElementById('email').value;
	var password = document.getElementById('password').value;
	
	if(typeof email === 'undefined') {
		console.log("email vide");
		return;
	}
	if(typeof password === 'undefined') {
		console.log("password vide");
		return;
	}
	
	var params = {
		email: email,
		password: password
	};
	
	login(params).then(function(result) {
		console.log(result);
	});
});

function login(params) {
	return new Promise(function(resolve, reject) {
		const request = new XMLHttpRequest();
		
		request.open('GET', 'http://runscape.internet-box.ch/api/token', true);
		request.setRequestHeader('Content-Type', 'application/json');
		
		request.onload = function(evt) {
			if(this.readyState === XMLHttpRequest.DONE) {
				switch(this.status) {
					case 200:
						resolve(req.responseText);
						break;
					default:
						reject(req.responseText);
						break;
				}
			}
		}
		
		var body = JSON.stringify(params);
		request.send(body);
	});
}