"use strict";

document.forms['loginForm'].addEventListener('submit', function(evt) {
	evt.preventDefault();
	var emailElem = document.getElementById('email');
	var passwordElem = document.getElementById('password');
	
	var params = {
		email: emailElem.value,
		password: passwordElem.value
	};
	
	login(params).then(function(result) {
		if(result.status === 200) {
			setCookie('token', result.body.data[0].token, 2);
			window.location.href = 'https://runscape.internet-box.ch/admin';
			return;
		}
		var errorMessageElem = document.getElementById('errorMessage');
		errorMessage.innerText = 'Identifiant ou mot de passe invalide';
	}).catch(function() {
		var errorMessageElem = document.getElementById('errorMessage');
		errorMessage.innerText = 'Un problème est survenu avec la requête';
	});;
});

function login(params) {
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		
		request.open('POST', 'https://runscape.internet-box.ch/api/token', true);
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
		
		var body = JSON.stringify(params);
		request.send(body);
	});
}


/*
 *	Create and store a new cookie
 *
 *	@days		number of days the cookie stays valid
 *	@return		true if succeeded, false otherwise
 *
*/
function setCookie(name, value, days) {
	var date = new Date(Date.now() + 24*60*60*1000*days);
	document.cookie = name + "=" + value + ";path=/;expires=" + date.toGMTString();
}